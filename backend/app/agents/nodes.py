import json
import asyncio
from typing import AsyncGenerator
from app.agents.state import CampaignState
from app.core.schemas import FactSheet, AgentLogEntry
from app.dependencies import get_gemini_model
from langchain_core.prompts import ChatPromptTemplate
from app.agents.prompts import RESEARCHER_SYSTEM_PROMPT, COPYWRITER_SYSTEM_PROMPT, EDITOR_SYSTEM_PROMPT

def extract_text(content: any) -> str:
    """Safely extracts a string from LangChain message content, which can be a list of parts."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
    return str(content)

async def research_node(state: CampaignState) -> dict:
    """
    Lead Researcher Node: Simplified async state update.
    """
    await asyncio.sleep(1) # Thinking delay for realism

    # 2. Logic
    model = get_gemini_model(temperature=0.0)
    structured_model = model.with_structured_output(FactSheet)
    prompt = ChatPromptTemplate.from_messages([
        ("system", RESEARCHER_SYSTEM_PROMPT),
        ("human", "SOURCE DOCUMENT CONTENT:\n\n{text}")
    ])

    try:
        chain = prompt | structured_model
        fact_sheet: FactSheet = await chain.ainvoke({"text": state["source_text"]})
        fact_sheet.campaign_id = state["campaign_id"]
        msg = f"Fact-extraction complete: {len(fact_sheet.core_product_features)} features, {len(fact_sheet.technical_specs)} specs."
        status = "completed"
    except Exception as e:
        fact_sheet = None
        msg = f"Error during research: {str(e)}"
        status = "error"

    # 3. Final State Update
    return {
        "fact_sheet": fact_sheet,
        "logs": [AgentLogEntry(agent_id="researcher", agent_name="Lead Researcher", message=msg, status=status)],
        "loop_count": 0
    }

async def copywriter_node(state: CampaignState) -> dict:
    """
    Creative Copywriter Node: Simplified async state update.
    """
    await asyncio.sleep(1) # Thinking delay for realism

    # Model logic
    fact_sheet = state["fact_sheet"]
    model = get_gemini_model(temperature=0.7)
    
    # Isolation: Pass JSON as a variable so LangChain doesn't parse its internal {curly_braces}
    prompt = ChatPromptTemplate.from_messages([
        ("system", COPYWRITER_SYSTEM_PROMPT),
        ("human", "SOURCE DATA FOR CAMPAIGN:\n\n{facts_json}\n\n{feedback_context}")
    ])

    feedback_context = f"### PREVIOUS FEEDBACK (FIX THESE):\n{state['correction_notes']}" if state.get("correction_notes") else ""

    response = await (prompt | model).ainvoke({
        "voice_directives": ", ".join(fact_sheet.brand_voice_directives),
        "facts_json": fact_sheet.json(),
        "feedback_context": feedback_context
    })
    
    try:
        content = extract_text(response.content).strip()
        # More robust extraction of JSON block
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        drafts = json.loads(content)
        
        # Ensure it has the right keys
        if not isinstance(drafts, dict) or "blog" not in drafts:
            raise ValueError("Invalid draft structure")
    except Exception as e:
        # Fallback: Treat the whole thing as a blog if JSON fails
        full_text = extract_text(response.content)
        drafts = {
            "blog": full_text, 
            "linkedin_thread": "Could not parse thread automatically. Please check full text."
        }

    return {
        "drafts": drafts,
        "logs": [AgentLogEntry(agent_id="copywriter", agent_name="Creative Copy", message="Drafts updated and pushed to Editor-in-Chief.", status="completed")]
    }

async def editor_node(state: CampaignState) -> dict:
    """
    Editor-in-Chief Node: Performs a 'Zero-Trust' audit.
    """
    await asyncio.sleep(1) # Thinking delay for realism
    loop_num = state.get("loop_count", 0) + 1
    model = get_gemini_model(temperature=0.0)
    
    # Isolation: Use variables in template, pass JSON strings in ainvoke
    prompt = ChatPromptTemplate.from_messages([
        ("system", EDITOR_SYSTEM_PROMPT),
        ("human", "FACT-SHEET:\n{facts_json}\n\nDRAFTS TO AUDIT:\n{drafts_json}")
    ])

    response = await (prompt | model).ainvoke({
        "facts_json": state["fact_sheet"].json(),
        "drafts_json": json.dumps(state["drafts"])
    })
    
    content = extract_text(response.content).upper()
    is_approved = "PASSED" in content
    
    # THE "DEBATE" LOGIC: If unapproved, we extract full notes to pass back.
    notes = extract_text(response.content) if not is_approved else None
    msg_final = "Quality Check PASSED. Content satisfies all technical constraints." if is_approved else f"REJECTED: Drafts contained unverified claims. Sending back to Copywriter."

    return {
        "is_approved": is_approved,
        "correction_notes": notes,
        "loop_count": loop_num,
        "logs": [AgentLogEntry(agent_id="editor", agent_name="Editor-in-Chief", message=msg_final, status="completed" if is_approved else "thinking")]
    }
