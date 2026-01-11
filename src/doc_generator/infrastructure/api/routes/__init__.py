"""API routes."""

from .generate import router as generate_router
from .health import router as health_router
from .upload import router as upload_router

__all__ = ["health_router", "upload_router", "generate_router"]
