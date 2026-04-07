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
    """Safely extracts a string from LangChain message content."""
    if not content: return ""
    if isinstance(content, str): return content
    if isinstance(content, list):
        return "".join([part.get("text", "") if (isinstance(part, dict) and part) else str(part) for part in content if part])
    return str(content)

def _get_agent_display(node_name: str) -> str:
    return {"researcher": "Researcher", "copywriter": "Copywriter", "editor": "Editor", "system": "System"}.get(node_name, node_name.capitalize())

def _clean_chunk(text: str) -> str:
    """Strip JSON artifacts from a streamed chunk."""
    text = re.sub(r'[{}\[\]"]', '', text)
    text = re.sub(r'\b(fact_sheet|core_product_features|technical_specs|target_audience|brand_voice_directives|ambiguous_statements|drafts|blog|linkedin_thread|email|subject|body|campaign_id|value_proposition|source_quote|category|created_at|fact)\b', '', text)
    text = re.sub(r'[:\\/,]', '', text)
    return text

async def _push_typing(campaign_id: str, agent_id: str, chunk_text: str):
    cleaned = _clean_chunk(chunk_text)
    if not cleaned: return
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
    if not message: return
    chunk_size = 2
    for i in range(0, len(message), chunk_size):
        chunk = message[i:i+chunk_size]
        await _push_typing(campaign_id, agent_id, chunk)
        await asyncio.sleep(0.04)
    q = get_queue(campaign_id)
    await q.put({"agent_id": agent_id, "type": "cursor_off"})

async def _push_log(campaign_id: str, agent_id: str, message: str, status: str = "completed"):
    q = get_queue(campaign_id)
    await q.put({
        "agent_id": agent_id,
        "agent_name": _get_agent_display(agent_id),
        "message": message,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

def _is_api_exhausted(e: Exception) -> bool:
    err_msg = str(e).lower()
    return "quota" in err_msg or "rate limit" in err_msg or "429" in err_msg or "exhausted" in err_msg


async def research_node(state: CampaignState) -> dict:
    campaign_id = state["campaign_id"]
    if state.get("fact_sheet"):
        return {"logs": [AgentLogEntry(agent_id="researcher", agent_name="Researcher", message="Using existing Fact-Sheet.", status="completed")]}

    await _push_log(campaign_id, "researcher", "Analyzing source material...")
    typewriter_task = asyncio.create_task(_push_typewriter_effect(campaign_id, "researcher", "Extracting ground truths..."))

    try:
        model = get_gemini_model(temperature=0.0)
        structured_model = model.with_structured_output(FactSheet)
        prompt = ChatPromptTemplate.from_messages([
            ("system", RESEARCHER_SYSTEM_PROMPT),
            ("human", "SOURCE DOCUMENT CONTENT:\n\n{text}")
        ])

        source_text = state["source_text"]
        if source_text.startswith("[FILE_URL_REFERENCE]::"):
            parts = source_text.split("::")
            if len(parts) >= 3:
                from app.core.parser import ContentParser
                source_text = await ContentParser.download_and_extract_text(parts[1], parts[2])
                
        if len(source_text) > 500000: source_text = source_text[:500000] + "\n[TRUNCATED]"
                
        chain = prompt | structured_model
        fact_sheet = await chain.ainvoke({"text": source_text})
        await typewriter_task
        
        if fact_sheet is None: raise ValueError("Model returned None.")
        await _push_log(campaign_id, "researcher", "Fact-extraction complete.")
        return {"fact_sheet": fact_sheet, "logs": [AgentLogEntry(agent_id="researcher", agent_name="Researcher", message="Facts verified.", status="completed")], "loop_count": 0}
    except Exception as e:
        typewriter_task.cancel()
        msg = "Gemini API key exhausted, try again later." if _is_api_exhausted(e) else f"Research failed: {str(e)}"
        return {"logs": [AgentLogEntry(agent_id="researcher", agent_name="Researcher", message=msg, status="error")]}


async def copywriter_node(state: CampaignState) -> dict:
    campaign_id = state["campaign_id"]
    fact_sheet = state.get("fact_sheet")
    if not fact_sheet:
         return {"logs": [AgentLogEntry(agent_id="copywriter", agent_name="Copywriter", message="Fact-Sheet missing. Research aborted.", status="error")]}
    
    notes = state.get("correction_notes") or ""
    
    target_platform = None
    if notes and "[ONLY::" in notes:
        match = re.search(r'\[ONLY::(\w+)\]', notes)
        if match:
            target_platform = match.group(1).lower()
            notes = notes.replace(match.group(0), "").strip()

    model = get_gemini_model(temperature=0.7)
    prompt = ChatPromptTemplate.from_messages([
        ("system", COPYWRITER_SYSTEM_PROMPT),
        ("human", "SOURCE DATA:\n{facts_json}\n\nFEEDBACK:\n{notes}")
    ])

    facts_json = fact_sheet.json() if hasattr(fact_sheet, 'json') else json.dumps(fact_sheet, default=str)
    
    # Extract tone / voice directives for the prompt variable
    voice_directives = "Professional, data-driven and concise"
    if hasattr(fact_sheet, "brand_voice_directives") and fact_sheet.brand_voice_directives:
        voice_directives = ", ".join(fact_sheet.brand_voice_directives)
    elif isinstance(fact_sheet, dict) and fact_sheet.get("brand_voice_directives"):
        voice_directives = ", ".join(fact_sheet["brand_voice_directives"])

    from app.core.schemas import CampaignDrafts
    chain = prompt | model.with_structured_output(CampaignDrafts)
    
    display_msg = f"Regenerating {target_platform if target_platform != 'social' else 'Social Hub'}..." if target_platform else "Drafting campaign copy..."
    await _push_log(campaign_id, "copywriter", display_msg)
    typewriter_task = asyncio.create_task(_push_typewriter_effect(campaign_id, "copywriter", "Polishing draft..."))
    
    try:
        new_obj = await chain.ainvoke({
            "facts_json": facts_json, 
            "notes": notes,
            "voice_directives": voice_directives
        })
        await typewriter_task
        if not new_obj: raise ValueError("AI Model failed to generate drafts.")
        new_drafts = new_obj.model_dump()
        final_drafts = state.get("drafts", {}).copy()

        if target_platform:
            await _push_log(campaign_id, "copywriter", f"Surgical patch for {target_platform} complete.")
            # Map platform keywords to schema fields
            if target_platform == 'blog':
                final_drafts['blog'] = new_drafts.get('blog')
                final_drafts['blog_title'] = new_drafts.get('blog_title')
            elif target_platform == 'email':
                final_drafts['email'] = new_drafts.get('email')
            elif 'instagram' in target_platform:
                final_drafts['instagram_post'] = new_drafts.get('instagram_post')
            elif 'linkedin' in target_platform or 'x' in target_platform:
                final_drafts['linkedin_thread'] = new_drafts.get('linkedin_thread')
            else:
                # Generic fallback for any other mapping
                final_drafts[target_platform] = new_drafts.get(target_platform)
        else:
            final_drafts = new_drafts

        return {"drafts": final_drafts, "logs": [AgentLogEntry(agent_id="copywriter", agent_name="Copywriter", message="Drafting complete.", status="completed")]}
    except Exception as e:
        typewriter_task.cancel()
        msg = "Gemini API key exhausted, try again later." if _is_api_exhausted(e) else f"Drafting failed: {str(e)}"
        return {"logs": [AgentLogEntry(agent_id="copywriter", agent_name="Copywriter", message=msg, status="error")]}


async def editor_node(state: CampaignState) -> dict:
    campaign_id = state["campaign_id"]
    model = get_gemini_model(temperature=0.0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", EDITOR_SYSTEM_PROMPT), ("human", "FACTS:\n{facts_json}\n\nDRAFTS:\n{drafts_json}")
    ])
    facts_json = state["fact_sheet"].json() if hasattr(state["fact_sheet"], 'json') else json.dumps(state["fact_sheet"], default=str)
    
    try:
        await _push_log(campaign_id, "editor", "Quality Control check...")
        response = await (prompt | model).ainvoke({"facts_json": facts_json, "drafts_json": json.dumps(state["drafts"])})
        content = extract_text(response.content).upper()
        is_approved = "PASSED" in content
        msg = "Quality Check PASSED." if is_approved else f"Rejected: {content[:50]}..."
        return {"is_approved": is_approved, "correction_notes": content if not is_approved else None, "loop_count": state.get("loop_count", 0) + 1, "logs": [AgentLogEntry(agent_id="editor", agent_name="Editor", message=msg, status="completed")]}
    except Exception as e:
        msg = "Gemini API key exhausted, try again later." if _is_api_exhausted(e) else f"Audit failed: {str(e)}"
        return {"is_approved": False, "logs": [AgentLogEntry(agent_id="editor", agent_name="Editor", message=msg, status="error")]}
