from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings

def get_gemini_model(model_name: str = "models/gemini-2.5-flash", temperature: float = 0.1):
    """
    Dependency to provide a configured Google Gemini Chat Model instance.
    Utilizes Gemini Flash Latest (Stable) from the verified model list.
    This model offers robust 1M token context and stable free-tier quotas.
    """
    settings = get_settings()
    
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=temperature,
        convert_system_message_to_human=True, 
    )
