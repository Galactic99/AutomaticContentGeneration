"""
Shared async message bus for streaming events between agent nodes and the SSE endpoint.
This avoids circular imports between nodes.py and stream.py.
"""
import asyncio
from typing import Dict

_queues: Dict[str, asyncio.Queue] = {}


def get_queue(campaign_id: str) -> asyncio.Queue:
    """Get or create the streaming queue for a campaign."""
    if campaign_id not in _queues:
        _queues[campaign_id] = asyncio.Queue()
    return _queues[campaign_id]


def cleanup_queue(campaign_id: str):
    """Remove the queue after the campaign stream ends."""
    _queues.pop(campaign_id, None)
