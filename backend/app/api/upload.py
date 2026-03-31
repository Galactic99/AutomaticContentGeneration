from fastapi import APIRouter, UploadFile, File, Form, HTTPException
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

class LargeUploadRequest(BaseModel):
    campaign_id: str
    file_url: Optional[str] = None
    filename: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    campaign_id: str, 
    file: Optional[UploadFile] = File(None),
    file_url: Optional[str] = Form(None),
    filename: Optional[str] = Form(None)
):
    """
    Endpoint to receive source documents. Supports raw multi-part (small) 
    or file_url from Supabase (large).
    """
    if file_url:
        parsed_text = f"[FILE_URL_REFERENCE]::{file_url}::{filename or 'document'}"
        character_count = 0
        actual_filename = filename or "cloud_document"
    else:
        if not file:
            raise HTTPException(status_code=400, detail="No file or URL provided.")
            
        # Size Validation (redundancy for frontend)
        max_size = 25 * 1024 * 1024
        if file.size and file.size > max_size:
            raise HTTPException(status_code=413, detail="File too large (Max 25MB)")

        # Parse the content
        parsed_text = await ContentParser.extract_text(file)
        character_count = len(parsed_text)
        actual_filename = file.filename

    if not parsed_text or len(parsed_text.strip()) == 0:
        raise HTTPException(status_code=422, detail="Extracted document content is empty.")

    # Store for the SSE Streamer to consume
    CampaignStorage.save_campaign(campaign_id, parsed_text)

    # 4. Return the preview for confirmation (to be hidden in later phases)
    # We take the first 1000 characters for the preview
    preview = parsed_text[:1000] + ("..." if len(parsed_text) > 1000 else "")

    return UploadResponse(
        filename=actual_filename,
        campaign_id=campaign_id,
        character_count=len(parsed_text),
        raw_content_preview=preview,
        status="Document received and parsed successfully."
    )
