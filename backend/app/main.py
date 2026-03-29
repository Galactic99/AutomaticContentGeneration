from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.config import get_settings, Settings

def create_app() -> FastAPI:
    """
    FastAPI Application Factory.
    Initializes Middleware, Routes, and Exception Handlers.
    """
    settings = get_settings()
    
    app = FastAPI(
        title=settings.APP_NAME,
        description="Autonomous Content Factory Backend: AI-Driven Multi-Channel Content Repurposing",
        version="1.0.0",
    )

    # CORS Middleware: Allowing Frontend (Next.js) to communicate with Backend (FastAPI)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Next.js Default
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes: Registering Campaign & Agent Routers
    from app.api.upload import router as upload_router
    from app.api.stream import router as stream_router
    app.include_router(upload_router, prefix="/api/v1")
    app.include_router(stream_router, prefix="/api/v1")

    @app.get("/health", tags=["General"])
    async def health_check():
        """Basic Health Check Endpoint."""
        return {"status": "healthy", "service": "Autonomous Content Factory"}

    @app.get("/", tags=["General"])
    async def root():
        """Root Endpoint for Basic Server Status."""
        return {
            "message": "Welcome to the Autonomous Content Factory API.",
            "status": "online",
            "version": "1.0.0"
        }

    return app

app = create_app()

if __name__ == "__main__":
    # Development Server Startup
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
