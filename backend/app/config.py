from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application settings for the Autonomous Content Factory Backend.
    Uses pydantic-settings to handle environment variables and validation.
    """
    APP_NAME: str = "Autonomous Content Factory"
    GOOGLE_API_KEY: str
    ENVIRONMENT: str = "development"
    
    # Supabase Cloud Persistence
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Internal Storage Settings (Deprecated but keeping for legacy compatibility)
    STORAGE_PATH: str = "app_data/uploads"
    
    # SSE / Real-time Configuration
    RETRY_TIMEOUT: int = 15000  # milliseconds
    
    # Pydantic Config for .env loading
    # Set extra="ignore" to prevent crashes from unknown .env variables
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache()
def get_settings():
    """Returns a cached instance of the settings object."""
    return Settings()
