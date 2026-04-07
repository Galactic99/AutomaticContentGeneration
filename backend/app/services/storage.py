import json
import os
from typing import Dict, Optional
from pathlib import Path
from supabase import create_client, Client
from ..config import get_settings

settings = get_settings()

class CampaignStorage:
    """
    Cloud-based Supabase persistence for campaign results.
    Replaces ephemeral JSON files with a production-grade database.
    Ensures that agent drafts (Blogs, Emails, Social Threads) persist permanently.
    """
    
    _client: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            cls._client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
        return cls._client

    @classmethod
    def save_campaign(cls, campaign_id: str, source_text: Optional[str] = None, correction_notes: Optional[str] = None):
        """
        Registers or updates a campaign. Handles the 'Refine' loop by resetting 
        the status and recording correction notes.
        """
        client = cls.get_client()
        update_payload = {
            "id": campaign_id,
            "status": "processing",
        }
        if source_text:
            update_payload["source_text"] = source_text
        if correction_notes:
            # We also get the current results and add the notes to them
            current = cls.get_campaign(campaign_id)
            results = current.get("results") or {}
            results["correction_notes"] = correction_notes
            update_payload["results"] = results

        client.table("campaigns").upsert(update_payload).execute()

    @classmethod
    def save_results(cls, campaign_id: str, fact_sheet: any, drafts: dict):
        """
        Performs a final update to the campaign record with the agent results.
        Encapsulates the fact-sheet and drafts into a 'results' JSONB column.
        """
        client = cls.get_client()

        # Convert Pydantic model to JSON-native types (e.g. datetimes to strings)
        if hasattr(fact_sheet, "model_dump"):
            fact_sheet_dict = fact_sheet.model_dump(mode="json")
        elif hasattr(fact_sheet, "dict"):
            fact_sheet_dict = fact_sheet.dict()
        else:
            fact_sheet_dict = fact_sheet

        current = cls.get_campaign(campaign_id)
        results_payload = current.get("results") or {}
        results_payload["fact_sheet"] = fact_sheet_dict
        results_payload["drafts"] = drafts

        update_payload = {
            "status": "completed",
            "results": results_payload
        }

        # If a blog title was generated, use it as the new campaign name for the history sidebar
        if isinstance(drafts, dict) and drafts.get("blog_title"):
            update_payload["name"] = drafts["blog_title"]

        client.table("campaigns").update(update_payload).eq("id", campaign_id).execute()

    @classmethod
    def save_error(cls, campaign_id: str, error_msg: str):
        """Records a failure in the assembly line to Supabase."""
        client = cls.get_client()
        client.table("campaigns").update({
            "status": "failed",
            "error": error_msg
        }).eq("id", campaign_id).execute()

    @classmethod
    def get_campaign(cls, campaign_id: str) -> Optional[Dict]:
        """
        Fetches a campaign from Supabase.
        Backend uses service-role so it can retrieve any ID.
        """
        client = cls.get_client()
        response = client.table("campaigns").select("*").eq("id", campaign_id).limit(1).execute()
        return response.data[0] if response.data else None

    @classmethod
    def toggle_approval(cls, campaign_id: str, platform: str):
        """
        Toggles approval status for a specific platform draft in the completions.
        """
        client = cls.get_client()
        campaign = cls.get_campaign(campaign_id)
        if not campaign:
            return False, False
            
        approvals = campaign.get("approvals") or {}
        if platform in approvals:
            del approvals[platform]
            is_approved = False
        else:
            from datetime import datetime, timezone
            approvals[platform] = datetime.now(timezone.utc).isoformat()
            is_approved = True
            
        client.table("campaigns").update({
            "approvals": approvals
        }).eq("id", campaign_id).execute()
        
        return True, is_approved

    @classmethod
    def delete_campaign(cls, campaign_id: str):
        """Removes a campaign from the persistent cloud store."""
        client = cls.get_client()
        client.table("campaigns").delete().eq("id", campaign_id).execute()
