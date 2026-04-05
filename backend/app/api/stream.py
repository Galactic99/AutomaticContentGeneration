import asyncio
import json
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agents.workflow import create_assembly_line_graph
from app.services.storage import CampaignStorage
from app.services.stream_bus import get_queue, cleanup_queue

router = APIRouter(prefix="/campaign", tags=["Real-time Stream"])


def _agent_display(node_name: str) -> str:
    return {
        "researcher": "Researcher", 
        "copywriter": "Copywriter", 
        "editor": "Editor",
        "system": "System"
    }.get(node_name, node_name.capitalize())


async def event_generator(campaign_id: str):
    """
    Runs the LangGraph assembly line in a background task and yields SSE events
    by reading from two sources:
      1. The shared async queue (typing chunks pushed by node functions)
      2. Node start/end events from astream_events (for thinking/completed states)
    """
    
    # 1. Load campaign data
    campaign = CampaignStorage.get_campaign(campaign_id)
    if not campaign:
        yield f"data: {json.dumps({'error': 'Campaign context not found. Please re-upload.'})}\n\n"
        return

    source_text = campaign["source_text"]

    # 2. Initialize the graph & state
    assembly_line = create_assembly_line_graph()
    initial_state = {
        "campaign_id": campaign_id,
        "source_text": source_text,
        "fact_sheet": campaign.get("fact_sheet"),
        "drafts": campaign.get("drafts", {}),
        "correction_notes": campaign.get("correction_notes"),
        "is_approved": False,
        "logs": []
    }
    
    # Handshake & Initialization
    q = get_queue(campaign_id)
    await q.put({
        "status": "connected", 
        "agent_id": "system",
        "agent_name": "System", 
        "message": "Assembly Line Synchronized.",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    await q.put({
        "agent_id": "system",
        "agent_name": "System",
        "message": "Campaign initialized. Waking up agents...", 
        "status": "completed",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # 4. Get the shared queue for this campaign
    q = get_queue(campaign_id)

    # 5. Run the graph in a background task
    # 5. Run the graph in a background task
    final_full_state = {}
    graph_error = None

    async def run_graph():
        nonlocal final_full_state, graph_error
        try:
            # We use ainvoke for the final state as it's the most reliable source of truth
            # but keep astream_events for the real-time logs/typing
            processed_nodes = set()
            
            async for event in assembly_line.astream_events(
                initial_state, version="v2",
                config={"configurable": {"thread_id": campaign_id}}
            ):
                kind = event["event"]
                meta = event.get("metadata", {})
                node_name = meta.get("langgraph_node") or event.get("name", "")

                if node_name not in ["researcher", "copywriter", "editor"]:
                    continue

                if kind == "on_node_start":
                    display_name = _agent_display(node_name)
                    # Use "Thinking" status but we don't need a static message here 
                    # as the nodes now push their own conversational "Waking up" messages
                    await q.put({
                        "agent_id": node_name,
                        "agent_name": display_name,
                        "status": "thinking",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    
                    if node_name == "copywriter":
                         await q.put({
                            "agent_id": "system",
                            "agent_name": "System",
                            "message": "Copywriter is running on Gemini 1.5 Pro.",
                            "status": "completed",
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })

                elif kind == "on_node_end":
                    output = event.get("data", {}).get("output")
                    if output and isinstance(output, dict):
                        # Merge output into our tracking state
                        final_full_state.update(output)
                        
                        # System milestone for revision loops
                        if node_name == "editor" and "loop_count" in output:
                            loops = output["loop_count"]
                            if not output.get("is_approved"):
                                await q.put({
                                    "agent_id": "system",
                                    "agent_name": "System",
                                    "message": f"Revision cycle {loops}/5",
                                    "status": "completed",
                                    "timestamp": datetime.now(timezone.utc).isoformat()
                                })

                        if "logs" in output:
                            for log in output.get("logs", []):
                                l_data = log.model_dump() if hasattr(log, "model_dump") else (log.dict() if hasattr(log, "dict") else log)
                                if not l_data.get("timestamp"):
                                    l_data["timestamp"] = datetime.now(timezone.utc).isoformat()
                                await q.put(l_data)

            # Signal completion
            await q.put({"__done__": True})
        except Exception as e:
            graph_error = str(e)
            import traceback
            print(f"!!! CRITICAL GRAPH ERROR: {graph_error}")
            traceback.print_exc()
            await q.put({"__error__": graph_error})

    # Start the graph
    graph_task = asyncio.create_task(run_graph())

    # 6. Stream events from the queue to SSE
    terminal_error_received = None
    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=1200)
            except asyncio.TimeoutError:
                yield f"data: {json.dumps({'error': 'Stream timeout after 1200s.'})}\n\n"
                break

            if isinstance(event, dict):
                if event.get("__done__"):
                    break
                if event.get("__error__"):
                    terminal_error_received = event["__error__"]
                    yield f"data: {json.dumps({'error': terminal_error_received})}\n\n"
                    break

            yield f"data: {json.dumps(event, default=str)}\n\n"

    finally:
        if not graph_task.done():
            graph_task.cancel()
        cleanup_queue(campaign_id)

    # 7. Final Verification & Persistence
    if terminal_error_received:
        CampaignStorage._data[campaign_id]["status"] = "error"
        CampaignStorage._save()
        return # already yielded error in the loop

    # Definitively retrieve the final state from the Memory Bank (Checkpointer)
    config = {"configurable": {"thread_id": campaign_id}}
    state_snapshot = assembly_line.get_state(config)
    final_full_state = state_snapshot.values if state_snapshot else {}
    
    # Use the tracking state built from node outputs
    has_error = False
    error_message = "Pipeline verification failed: The analysis was incomplete."
    
    # Check for error logs in the final state logs
    if "logs" in final_full_state:
        for log in final_full_state["logs"]:
            status = getattr(log, "status", "") if not isinstance(log, dict) else log.get("status", "")
            if "error" in str(status).lower():
                has_error = True
                error_message = getattr(log, "message", "Unknown node error") if not isinstance(log, dict) else log.get("message", "Unknown node error")
                break
        
    if final_full_state.get("fact_sheet") and not has_error:
        CampaignStorage.save_results(
            campaign_id,
            final_full_state["fact_sheet"],
            final_full_state.get("drafts", {})
        )
        await asyncio.sleep(0.5)
        yield f"data: {json.dumps({'status': 'completed', 'next_step': 'review'})}\n\n"
    else:
        CampaignStorage._data[campaign_id]["status"] = "error"
        CampaignStorage._save()
        await asyncio.sleep(0.5)
        yield f"data: {json.dumps({'error': error_message})}\n\n"


@router.get("/{campaign_id}/results")
async def get_campaign_results(campaign_id: str):
    """Returns the final Fact-Sheet and AI drafts."""
    campaign = CampaignStorage.get_campaign(campaign_id)
    if not campaign or campaign.get("status") != "completed":
        raise HTTPException(status_code=404, detail="Campaign results not ready.")
    
    return {
        "fact_sheet": campaign["fact_sheet"],
        "drafts": campaign["drafts"],
        "approvals": campaign.get("approvals", {}),
        "source_text": campaign.get("source_text", ""),
        "campaign_id": campaign_id
    }


@router.get("/{campaign_id}/stream")
async def stream_campaign_progress(campaign_id: str, request: Request):
    """SSE endpoint for live agent streaming."""
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


class RefineRequest(BaseModel):
    correction_notes: str


@router.post("/{campaign_id}/refine")
async def refine_campaign(campaign_id: str, request: RefineRequest):
    """Triggers a manual refinement loop."""
    campaign = CampaignStorage.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    CampaignStorage._load()
    if campaign_id in CampaignStorage._data:
        CampaignStorage._data[campaign_id]["status"] = "processing"
        CampaignStorage._data[campaign_id]["correction_notes"] = request.correction_notes
        CampaignStorage._save()
    
    return {"status": "success", "message": "Campaign queued for manual refinement."}


class ApproveRequest(BaseModel):
    platform: str # 'blog', 'email', 'social_x', 'social_linkedin', 'social_instagram'


@router.patch("/{campaign_id}/approve")
async def approve_campaign_draft(campaign_id: str, request: ApproveRequest):
    """Toggles approval status for a specific platform draft."""
    exists, is_approved = CampaignStorage.toggle_approval(campaign_id, request.platform)
    if not exists:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"status": "success", "platform": request.platform, "is_approved": is_approved}
