import asyncio
import json
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from app.agents.workflow import create_assembly_line_graph
from app.services.storage import CampaignStorage

router = APIRouter(prefix="/campaign", tags=["Real-time Stream"])

async def event_generator(campaign_id: str):
    """
    Executes the LangGraph Assembly Line and yields live agent activity log-by-log.
    """
    
    # 1. Fetch the document content we saved during upload
    campaign = CampaignStorage.get_campaign(campaign_id)
    if not campaign:
        yield f"data: {json.dumps({'error': 'Campaign context not found. Please re-upload.'})}\n\n"
        return

    source_text = campaign["source_text"]

    # 2. Initialize the Graph
    assembly_line = create_assembly_line_graph()
    
    # 3. Define the Initial State
    initial_state = {
        "campaign_id": campaign_id,
        "source_text": source_text,
        "fact_sheet": None,
        "drafts": {},
        "correction_notes": None,
        "is_approved": False,
        "logs": []
    }

    # 0. Immediate Handshake (UI Connection Confirmed)
    yield f"data: {json.dumps({'status': 'connected', 'agent_name': 'System', 'message': 'Assembly Line Synchronized. Waiting for agents...'})}\n\n"

    # 4. Stream the Graph Execution using the Events API
    final_state = initial_state.copy()
    try:
        async for event in assembly_line.astream_events(
            initial_state, 
            version="v2",
            config={"configurable": {"thread_id": campaign_id}}
        ):
            kind = event["event"]
            meta = event.get("metadata", {})
            
            # Robust node identification: Check metadata OR the event name itself
            node_name = meta.get("langgraph_node") or event.get("name", "")
            if node_name not in ["researcher", "copywriter", "editor"]:
                continue

            # --- AGENT START EVENT ---
            if kind == "on_node_start":
                agent_name = node_name.capitalize()
                if node_name == "researcher": agent_name = "Lead Researcher"
                if node_name == "copywriter": agent_name = "Creative Copy"
                if node_name == "editor": agent_name = "Editor-in-Chief"

                log_data = {
                    "agent_id": node_name,
                    "agent_name": agent_name,
                    "message": f"Analyzing campaign context and initiating {node_name} phase...",
                    "status": "thinking",
                    "timestamp": datetime.now().isoformat()
                }
                yield f"data: {json.dumps(log_data)}\n\n"

            # --- AGENT COMPLETION EVENT ---
            elif (kind == "on_chain_end" or kind == "on_node_end"):
                output = event.get("data", {}).get("output")
                if not output or not isinstance(output, dict):
                    continue
                
                # Persistence Sync
                for key, val in output.items():
                    final_state[key] = val
                
                # Stream logs out
                if "logs" in output:
                    for log in output.get("logs", []):
                        l_data = log.model_dump() if hasattr(log, "model_dump") else log.dict()
                        if not l_data.get("timestamp"):
                             l_data["timestamp"] = datetime.now().isoformat()
                        yield f"data: {json.dumps(l_data, default=str)}\n\n"
                        
    except Exception as e:
        import traceback
        error_msg = f"Assembly Line Failure: {str(e)}"
        print(f"ERROR IN STREAM: {error_msg}")
        print(traceback.format_exc())
        CampaignStorage.save_error(campaign_id, error_msg)
        yield f"data: {json.dumps({'error': error_msg})}\n\n"
        return

    # 5. Persist the real AI output for the Review Page
    if final_state.get("fact_sheet"):
        CampaignStorage.save_results(
            campaign_id, 
            final_state["fact_sheet"], 
            final_state["drafts"]
        )

    # 6. Final Completion Event (UI Trigger for navigation)
    # Add a small buffer to ensure the filesystem has finished the save
    await asyncio.sleep(1)
    yield f"data: {json.dumps({'status': 'completed', 'next_step': 'review'})}\n\n"

@router.get("/{campaign_id}/results")
async def get_campaign_results(campaign_id: str):
    """
    Returns the final Fact-Sheet and AI drafts from memory.
    Called by the Frontend Review Page.
    """
    campaign = CampaignStorage.get_campaign(campaign_id)
    if not campaign or campaign.get("status") != "completed":
        raise HTTPException(status_code=404, detail="Campaign results not ready.")
    
    return {
        "fact_sheet": campaign["fact_sheet"],
        "drafts": campaign["drafts"],
        "campaign_id": campaign_id
    }

@router.get("/{campaign_id}/stream")
async def stream_campaign_progress(campaign_id: str, request: Request):
    """
    Server-Sent Events (SSE) Endpoint.
    The Client will open this connection to receive live logs from the agents.
    """
    return StreamingResponse(
        event_generator(campaign_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )
