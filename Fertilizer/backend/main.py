"""
main.py — Bhoomi Bloom Backend Entry Point
==========================================
This file is the correct entry point for:
    python -m uvicorn main:app --reload

It re-exports the fully configured FastAPI 'app' instance from app.py
so that both `uvicorn main:app` and `uvicorn app:app` work correctly.
"""

from app import app  # noqa: F401 — re-export the app instance
from config import settings

# This allows running directly as well:
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
