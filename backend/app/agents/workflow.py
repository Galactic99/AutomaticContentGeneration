from langgraph.graph import StateGraph, END
from app.agents.state import CampaignState
from app.agents.nodes import research_node, copywriter_node, editor_node
from app.core.schemas import FactSheet, AgentLogEntry, FactItem

def should_start_creative(state: CampaignState):
    """Safety check: Stop if research failed or produced no facts."""
    if not state.get("fact_sheet"):
        return END
    return "copywriter"

def should_continue(state: CampaignState):
    """
    Conditional logic to decide if the draft needs revision.
    Circuit Breaker: Limit to 3 rounds of debate to prevent infinite loops.
    """
    if state["is_approved"]:
        return END
    
    if state.get("loop_count", 0) >= 3:
        # Stop at 3 iterations to avoid quota drain
        return END
        
    return "copywriter"

def create_assembly_line_graph():
    """
    Orchestrates the 'Autonomous Content Factory' using LangGraph.
    Defines the nodes (agents) and the directed edges (flow) between them.
    """
    
    # 1. Initialize State Graph
    builder = StateGraph(CampaignState)
    builder.add_node("researcher", research_node)
    builder.add_node("copywriter", copywriter_node)
    builder.add_node("editor", editor_node)

    # 2. Define the Entry Point
    builder.set_entry_point("researcher")
    
    # 3. Dynamic Edges (Safety Checks)
    
    # Researcher -> Copywriter (ONLY if research succeeded)
    builder.add_conditional_edges(
        "researcher",
        should_start_creative,
        {
            "copywriter": "copywriter",
            END: END
        }
    )

    # Copywriter -> Editor
    builder.add_edge("copywriter", "editor")

    # Editor -> Copywriter (The Feedback Loop with Circuit Breaker)
    builder.add_conditional_edges(
        "editor",
        should_continue,
        {
            "copywriter": "copywriter",
            END: END
        }
    )

    # 4. Compile with state persistence (Checkpointer)
    from langgraph.checkpoint.memory import MemorySaver
    checkpointer = MemorySaver()
    
    return builder.compile(checkpointer=checkpointer)
