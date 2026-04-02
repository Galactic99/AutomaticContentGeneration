import json
import os
from typing import Dict, Optional
from pathlib import Path

STORAGE_FILE = Path("campaign_data.json")

class CampaignStorage:
    """
    Persistent, file-based store for campaign data during development.
    Prevents 404 errors when FastAPI reloads (wiping in-memory dicts).
    """
    
    _data: Dict[str, Dict] = {}

    @classmethod
    def _load(cls):
        if STORAGE_FILE.exists():
            try:
                with open(STORAGE_FILE, "r") as f:
                    cls._data = json.load(f)
            except:
                cls._data = {}

    @classmethod
    def _save(cls):
        with open(STORAGE_FILE, "w") as f:
            json.dump(cls._data, f, indent=2, default=str)

    @classmethod
    def save_campaign(cls, campaign_id: str, source_text: str):
        cls._load()
        cls._data[campaign_id] = {
            "source_text": source_text,
            "status": "processing",
            "fact_sheet": None,
            "drafts": {}
        }
        cls._save()

    @classmethod
    def save_results(cls, campaign_id: str, fact_sheet: any, drafts: dict):
        cls._load()
        if campaign_id in cls._data:
            # Handle Pydantic model conversion to serializable dict
            if hasattr(fact_sheet, "model_dump"):
                fact_sheet_dict = fact_sheet.model_dump()
            elif hasattr(fact_sheet, "dict"):
                fact_sheet_dict = fact_sheet.dict()
            else:
                fact_sheet_dict = fact_sheet

            cls._data[campaign_id]["fact_sheet"] = fact_sheet_dict
            cls._data[campaign_id]["drafts"] = drafts
            cls._data[campaign_id]["status"] = "completed"
            
            # Initialize approvals dictionary if not exists
            if "approvals" not in cls._data[campaign_id]:
                cls._data[campaign_id]["approvals"] = {}
                
            cls._save()

    @classmethod
    def save_error(cls, campaign_id: str, error_msg: str):
        cls._load()
        if campaign_id in cls._data:
            cls._data[campaign_id]["status"] = "failed"
            cls._data[campaign_id]["error"] = error_msg
            cls._save()

    @classmethod
    def get_campaign(cls, campaign_id: str) -> Optional[Dict]:
        cls._load()
        return cls._data.get(campaign_id)

    @classmethod
    def toggle_approval(cls, campaign_id: str, platform: str):
        cls._load()
        if campaign_id in cls._data:
            if "approvals" not in cls._data[campaign_id]:
                cls._data[campaign_id]["approvals"] = {}
            
            if platform in cls._data[campaign_id]["approvals"]:
                # If already approved, unverify it
                del cls._data[campaign_id]["approvals"][platform]
                is_approved = False
            else:
                # If not approved, verify it
                from datetime import datetime, timezone
                cls._data[campaign_id]["approvals"][platform] = datetime.now(timezone.utc).isoformat()
                is_approved = True
            
            cls._save()
            return True, is_approved
        return False, False

    @classmethod
    def delete_campaign(cls, campaign_id: str):
        cls._load()
        if campaign_id in cls._data:
            del cls._data[campaign_id]
        cls._save()
