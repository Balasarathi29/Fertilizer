import os
import logging
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

from config import settings
from database.connection import Base, engine, get_db
import database.model
from database.seed_data import seed_database
from routes import auth, products, orders, ai, weather, analytics, location, rewards, flash_sales
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("bhoomi_bloom_app")

# Create Database Tables automatically
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"Metadata create_all warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Sustainable Agriculture Backend Platform APIs",
    version="1.0.0"
)


def reset_sqlite_schema_if_needed():
    """Keep the local SQLite fallback aligned with the current SQLAlchemy models."""
    if engine.url.get_backend_name() != "sqlite":
        return

    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    if existing_tables:
        logger.info("SQLite fallback detected; resetting local schema to match current models.")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(location.router, prefix=settings.API_V1_STR)
app.include_router(rewards.router, prefix=settings.API_V1_STR)
app.include_router(flash_sales.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_event():
    logger.info("🚀 Bhoomi Bloom Backend Starting...")
    try:
        db_gen = get_db()
        db = next(db_gen)
        reset_sqlite_schema_if_needed()
        seed_database(db)
        logger.info("✅ Database seeded & initial dataset ready.")
    except Exception as e:
        logger.warning(f"Auto seed warning: {e}")


@app.get("/")
def root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "docs": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )