import json
import re
import asyncio
from datetime import datetime, timezone
from app.agents.state import CampaignState
from app.core.schemas import FactSheet, AgentLogEntry
from app.dependencies import get_gemini_model
from langchain_core.prompts import ChatPromptTemplate
from app.agents.prompts import RESEARCHER_SYSTEM_PROMPT, COPYWRITER_SYSTEM_PROMPT, EDITOR_SYSTEM_PROMPT
from app.services.stream_bus import get_queue

def extract_text(content) -> str:
    """Safely extracts a string from LangChain message content, which can be a list of parts."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    return str(content)


def _get_agent_display(node_name: str) -> str:
    """Map node name to display name consistently with stream.py."""
    return {
        "researcher": "Researcher", 
        "copywriter": "Copywriter", 
        "editor": "Editor",
        "system": "System"
    }.get(node_name, node_name.capitalize())


def _clean_chunk(text: str) -> str:
    """Strip JSON artifacts from a streamed chunk so it reads like plain English."""
    text = re.sub(r'[{}\[\]"]', '', text)
    text = re.sub(
        r'\b(fact_sheet|core_product_features|technical_specs|target_audience|'
        r'brand_voice_directives|ambiguous_statements|drafts|blog|linkedin_thread|'
        r'email|subject|body|campaign_id|value_proposition|source_quote|category|'
        r'created_at|fact)\b', '', text
    )
    # Remove hanging colons or backslashes without adding spaces
    text = re.sub(r'[:\\/,]', '', text)
    return text


async def _push_typing(campaign_id: str, agent_id: str, chunk_text: str):
    """Push a typing chunk to the stream bus for the SSE endpoint to pick up."""
    cleaned = _clean_chunk(chunk_text)
    if not cleaned:
        return
    q = get_queue(campaign_id)
    await q.put({
        "agent_id": agent_id,
        "agent_name": _get_agent_display(agent_id),
        "message": cleaned,
        "status": "typing",
        "type": "chunk",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
async def _push_typewriter_effect(campaign_id: str, agent_id: str, message: str):
    """Simulates a typewriter effect by sending the message in small chunks."""
    chunk_size = 2
    for i in range(0, len(message), chunk_size):
        chunk = message[i:i+chunk_size]
        await _push_typing(campaign_id, agent_id, chunk)
        await asyncio.sleep(0.04)
    # Signal that typing animation is done so frontend clears cursor while waiting
    q = get_queue(campaign_id)
    await q.put({
        "agent_id": agent_id,
        "type": "cursor_off"
    })


async def _push_log(campaign_id: str, agent_id: str, message: str, status: str = "completed"):
    """Push a discrete milestone log to the stream bus instantly."""
    q = get_queue(campaign_id)
    await q.put({
        "agent_id": agent_id,
        "agent_name": _get_agent_display(agent_id),
        "message": message,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

async def research_node(state: CampaignState) -> dict:
    """
    Lead Researcher Node: Extracts facts from the source document.
    Uses structured output (no streaming available for structured calls).
    """
    campaign_id = state["campaign_id"]
    q = get_queue(campaign_id)

    # Bypass if already researched (e.g. during a manual Refine loop)
    if state.get("fact_sheet"):
        return {
            "logs": [AgentLogEntry(agent_id="researcher", agent_name="Lead Researcher", message="Using existing Fact-Sheet for this revision.", status="completed")]
        }

    # Context-aware thinking message
    await _push_log(campaign_id, "researcher", "I'm on it. Analyzing source material to extract ground truths.")
    
    source_snippet = state["source_text"][:50].strip().replace("\n", " ") + "..."
    thought_msg = f"Analyzing source material now: '{source_snippet}'"
    
    typewriter_task = asyncio.create_task(_push_typewriter_effect(campaign_id, "researcher", thought_msg))

    model = get_gemini_model(temperature=0.0)
    structured_model = model.with_structured_output(FactSheet)
    prompt = ChatPromptTemplate.from_messages([
        ("system", RESEARCHER_SYSTEM_PROMPT),
        ("human", "SOURCE DOCUMENT CONTENT:\n\n{text}")
    ])

    try:
        source_text = state["source_text"]
        if source_text.startswith("[FILE_URL_REFERENCE]::"):
            parts = source_text.split("::")
            if len(parts) >= 3:
                file_url = parts[1]
                filename = parts[2]
                from app.core.parser import ContentParser
                
                # Download and extract the massive text natively from the cloud URL
                source_text = await ContentParser.download_and_extract_text(file_url, filename)
                
        # Optimization: Cap extraction to 500k chars for high-fidelity research
        # Avoids hitting TPM limits on free tier while still providing massive context.
        if len(source_text) > 500000:
            source_text = source_text[:500000] + "\n[TEXT TRUNCATED AT 500K CHARS FOR PROCESSING]"
                
        chain = prompt | structured_model
        
        # Retry logic for flaky structured outputs from preview models
        fact_sheet = None
        last_error = ""
        for attempt in range(3):
            try:
                fact_sheet = await chain.ainvoke({"text": source_text})
                if fact_sheet is not None:
                    break
                last_error = "Model returned None (failed to map to schema)."
            except Exception as inner_e:
                last_error = str(inner_e)
            await asyncio.sleep(1)
            
        await typewriter_task # ensure animation finishes
        
        if fact_sheet is None:
            raise ValueError(f"Failed to extract facts after 3 attempts. Last error: {last_error}")

        # PUSH REAL-TIME MILESTONE
        await _push_log(campaign_id, "researcher", "Done. Extracted core facts and passed them to the Copywriter.")

        fact_sheet.campaign_id = state["campaign_id"]
        specs = fact_sheet.technical_specs or []
        msg = f"Fact-extraction complete: {len(fact_sheet.core_product_features)} features & {len(specs)} technical specs verified. Passing the source context to our Creative Copywriter."
        status = "completed"
    except Exception as e:
        typewriter_task.cancel()
        fact_sheet = None
        # EXPLICIT LOGGING FOR DEBUGGING
        print(f"!!! RESEARCHER NODE FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        msg = f"Research failed: {str(e)}"
        status = "error"

    return {
        "fact_sheet": fact_sheet,
        "logs": [
            AgentLogEntry(agent_id="researcher", agent_name="Researcher", message=msg, status="completed")
        ],
        "loop_count": 0
    }


async def copywriter_node(state: CampaignState) -> dict:
    """
    Creative Copywriter Node: Uses model.astream() for real-time token streaming.
    """
    campaign_id = state["campaign_id"]
    fact_sheet = state["fact_sheet"]
    model = get_gemini_model(temperature=0.7)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", COPYWRITER_SYSTEM_PROMPT),
        ("human", "SOURCE DATA FOR CAMPAIGN:\n\n{facts_json}\n\n{feedback_context}")
    ])

    feedback_context = f"### PREVIOUS FEEDBACK (FIX THESE):\n{state['correction_notes']}" if state.get("correction_notes") else ""

    # Handle fact_sheet being either a Pydantic model or a plain dict
    if hasattr(fact_sheet, 'brand_voice_directives'):
        voice_directives = ", ".join(fact_sheet.brand_voice_directives)
        facts_json = fact_sheet.json()
    else:
        voice_directives = ", ".join(fact_sheet.get('brand_voice_directives', []))
        facts_json = json.dumps(fact_sheet, default=str)

    from app.core.schemas import CampaignDrafts
    structured_model = model.with_structured_output(CampaignDrafts)
    chain = prompt | structured_model
    
    product_hint = (fact_sheet.get('core_product_features', [])[:1] or ["your offer"])[0] if isinstance(fact_sheet, dict) else (fact_sheet.core_product_features[:1] or ["your offer"])[0]
    is_revision = bool(state.get("correction_notes"))
    
    if is_revision:
        await _push_log(campaign_id, "copywriter", "Fixing issues and rewriting now...")
    else:
        await _push_log(campaign_id, "copywriter", f"Thanks. Drafting the Blog, Social thread, and Email copy for {product_hint} now...")

    state_msg = "Generating campaign drafts..."
    typewriter_task = asyncio.create_task(_push_typewriter_effect(campaign_id, "copywriter", state_msg))
    
    try:
        drafts_obj = await chain.ainvoke({
            "voice_directives": voice_directives,
            "facts_json": facts_json,
            "feedback_context": feedback_context
        })
        await typewriter_task
        
        # PUSH REAL-TIME MILESTONE
        await _push_log(campaign_id, "copywriter", "Drafts are ready. Sending over to the Editor for review.")

        # response is already a CampaignDrafts Pydantic object
        drafts = drafts_obj.model_dump()
        if is_revision:
            msg = "Revision cycle complete. I've addressed the Editor's feedback and polished the transitions. Sending back for final Quality Control."
        else:
            msg = "Multi-platform drafts are ready. We've optimized for Blog, Email, and Social streams. Handing off to the Editor-in-Chief for a final fact-check."
        status = "completed"

    except Exception as e:
        typewriter_task.cancel()
        import traceback
        print(f"!!! COPYWRITER NODE FAILED: {str(e)}")
        traceback.print_exc()
        drafts = {}
        msg = f"Drafting failed: {str(e)}"
        status = "error"

    return {
        "drafts": drafts,
        "logs": [
            AgentLogEntry(agent_id="copywriter", agent_name="Copywriter", message=msg, status="completed")
        ]
    }


async def editor_node(state: CampaignState) -> dict:
    """
    Editor-in-Chief Node: Uses model.astream() for real-time token streaming.
    """
    campaign_id = state["campaign_id"]
    loop_num = state.get("loop_count", 0) + 1
    model = get_gemini_model(temperature=0.0)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", EDITOR_SYSTEM_PROMPT),
        ("human", "FACT-SHEET:\n{facts_json}\n\nDRAFTS TO AUDIT:\n{drafts_json}")
    ])

    fact_sheet = state["fact_sheet"]
    if hasattr(fact_sheet, 'json'):
        facts_json = fact_sheet.json()
    else:
        facts_json = json.dumps(fact_sheet, default=str)

    chain = prompt | model
    
    # Context-aware thinking message
    await _push_log(campaign_id, "editor", "Reviewing content against brand safety and strict guidelines...")
    
    state_msg = "Auditing accuracy and tone..."
    typewriter_task = asyncio.create_task(_push_typewriter_effect(campaign_id, "editor", state_msg))

    try:
        response = await chain.ainvoke({
            "facts_json": facts_json,
            "drafts_json": json.dumps(state["drafts"])
        })
        await typewriter_task
        full_content = extract_text(response.content) if hasattr(response, "content") else str(response)
        
        # PUSH REAL-TIME MILESTONE (Intermediate)
        # await _push_log(campaign_id, "editor", "Audit complete. Assessing technical compliance...")

        content = full_content.upper()
        is_approved = "PASSED" in content
        notes = full_content if not is_approved else None
        
        if is_approved:
            msg = "Quality Check PASSED. Content satisfies all technical constraints and maintains brand voice. The assembly line is now complete."
            status = "completed"
        else:
            msg = f"Rejecting drafts. Issues found: REJECT\n\n{notes}"
            status = "completed"
                                             

    except Exception as e:
        typewriter_task.cancel()
        import traceback
        print(f"!!! EDITOR NODE FAILED: {str(e)}")
        traceback.print_exc()
        is_approved = False
        notes = f"Editor error: {str(e)}"
        msg = f"Audit failed: {str(e)}"
        status = "error"

    return {
        "is_approved": is_approved,
        "correction_notes": notes,
        "loop_count": loop_num,
        "logs": [
            AgentLogEntry(agent_id="editor", agent_name="Editor", message=msg, status="completed")
        ]
    }
