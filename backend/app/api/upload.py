from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.parser import ContentParser
from app.services.storage import CampaignStorage
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/campaign", tags=["Campaign"])

class UploadResponse(BaseModel):
    """Schema for returning parsed debug information to the frontend."""
    filename: str
    campaign_id: str
    character_count: int
    raw_content_preview: Optional[str] = None
    status: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    campaign_id: str, 
    file: UploadFile = File(...)
):
    """
    Endpoint to receive source documents from the dashboard.
    For Phase 2 Debugging: Extracts & returns a preview of the parsed content.
    """
    # 1. Size Validation (redundancy for frontend)
    max_size = 25 * 1024 * 1024
    if file.size and file.size > max_size:
        raise HTTPException(status_code=413, detail="File too large (Max 25MB)")

    # 2. Parse the content
    parsed_text = await ContentParser.extract_text(file)
    
    if not parsed_text or len(parsed_text.strip()) == 0:
        raise HTTPException(status_code=422, detail="Extracted document content is empty.")

    # 3. Store for the SSE Streamer to consume
    CampaignStorage.save_campaign(campaign_id, parsed_text)

    # 4. Return the preview for confirmation (to be hidden in later phases)
    # We take the first 1000 characters for the preview
    preview = parsed_text[:1000] + ("..." if len(parsed_text) > 1000 else "")

    return UploadResponse(
        filename=file.filename,
        campaign_id=campaign_id,
        character_count=len(parsed_text),
        raw_content_preview=preview,
        status="Document received and parsed successfully."
    )
