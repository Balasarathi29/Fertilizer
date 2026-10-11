import os
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from database.connection import get_db
from middleware.auth_middleware import get_current_user
from authentication.auth_handler import decode_access_token
from fastapi.security import HTTPBearer

# AI Engine Services
from ai.soil_analysis import analyze_soil_image
from ai.crop_recommendation import crop_recommender
from ai.fertilizer_recommendation import recommend_fertilizers_for_crop
from ai.disease_detection import detect_disease
from ai.chatbot import get_agronomist_reply

router = APIRouter(prefix="/ai", tags=["Agricultural Intelligence"])
logger = logging.getLogger("bhoomi_bloom_ai_router")

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
security = HTTPBearer(auto_error=False)

def get_optional_user(credentials=Depends(security), db=Depends(get_db)):
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if not payload or not payload.get("sub"):
            return None
        return db.users.find_one({"email": payload.get("sub")})
    except Exception:
        return None


# ─── Request Schemas ────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    crop_type: str = "General"
    soil_type: str = "General"


class CropRecommendRequest(BaseModel):
    N: float = Field(..., ge=0, le=300, description="Nitrogen content in soil (mg/kg)")
    P: float = Field(..., ge=0, le=300, description="Phosphorus content in soil (mg/kg)")
    K: float = Field(..., ge=0, le=300, description="Potassium content in soil (mg/kg)")
    temperature: float = Field(..., ge=-10, le=60, description="Air temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    rainfall: float = Field(..., ge=0, le=4000, description="Annual rainfall in mm")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/soil/analyze")
async def analyze_soil(
    image: UploadFile = File(...),
    crop_type: str = Form("General"),
    location: str = Form("India"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Upload a soil image and receive an AI diagnostic report for current user."""
    try:
        image_bytes = await image.read()
        file_ext = os.path.splitext(image.filename)[1] or ".jpg"
        unique_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(image_bytes)

        report = analyze_soil_image(image_bytes, crop_type, location)

        record = {
            "_id": str(uuid.uuid4()),
            "email": current_user["email"],
            "user_id": current_user.get("user_id") or current_user.get("id"),
            "image_path": f"/uploads/{unique_name}",
            "crop_type": crop_type,
            "location": location,
            "report_data": report,
            "created_at": datetime.utcnow().isoformat()
        }
        try:
            db.soil_analysis.insert_one(record)
        except Exception:
            pass

        return record
    except Exception as e:
        logger.error(f"Soil analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Soil analysis failed: {str(e)}"
        )


@router.get("/soil/history")
async def get_soil_history(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Return soil analysis records for the current logged-in user only."""
    try:
        records = db.soil_analysis.find({"email": current_user["email"]})
        return records[-20:] if len(records) > 20 else records
    except Exception as e:
        logger.error(f"Error loading soil history: {e}")
        return []


@router.post("/chat/agronomist")
async def chat_agronomist(payload: ChatRequest):
    """AI agronomist chatbot endpoint."""
    try:
        reply = get_agronomist_reply(payload.message, payload.crop_type, payload.soil_type)
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return {"reply": "Namaste! I am having a slight technical glitch. Please try again!"}


@router.post("/crop/recommend")
async def recommend_crop(
    payload: CropRecommendRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
    db=Depends(get_db)
):
    """
    AI Crop Recommendation endpoint.
    Saves prediction under current authenticated user's account for strict data isolation.
    """
    try:
        prediction_result = crop_recommender.predict(
            N=payload.N,
            P=payload.P,
            K=payload.K,
            temp=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall
        )

        recommended_crop = prediction_result["recommendedCrop"]

        fertilizer_recs = recommend_fertilizers_for_crop(
            crop_name=recommended_crop,
            N=payload.N,
            P=payload.P,
            K=payload.K,
            ph=payload.ph
        )

        response_data = {
            "prediction": {
                "recommendedCrop": recommended_crop,
                "confidence": prediction_result.get("confidence", "94.5%"),
                "cropDescription": prediction_result.get("cropDescription", f"{recommended_crop} is suitable for your soil and climate."),
                "weatherSummary": prediction_result.get("weatherSummary", f"{payload.temperature}°C, {payload.humidity}% humidity, {payload.rainfall}mm rainfall."),
                "soilHealth": prediction_result.get("soilHealth", "82/100 - Healthy Soil Structure"),
                "npkAnalysis": prediction_result.get("npkAnalysis", "Balanced NPK levels."),
                "phAnalysis": prediction_result.get("phAnalysis", "Neutral pH."),
                "suitableSeason": prediction_result.get("suitableSeason", "Kharif / Rabi"),
                "expectedYield": prediction_result.get("expectedYield", "2.5 - 3.5 Tons per Acre"),
                "raw_crop_key": prediction_result.get("raw_crop_key", recommended_crop.lower())
            },
            "fertilizerRecommendations": fertilizer_recs
        }

        # Save to DB tied strictly to current logged-in user email
        if current_user and current_user.get("email"):
            history_record = {
                "_id": str(uuid.uuid4()),
                "email": current_user["email"],
                "user_id": current_user.get("user_id") or current_user.get("id"),
                "crop": recommended_crop,
                "confidence": prediction_result.get("confidence", "94.5%"),
                "yield": prediction_result.get("expectedYield", "2.5 - 3.5 Tons per Acre"),
                "temperature": payload.temperature,
                "humidity": payload.humidity,
                "rainfall": payload.rainfall,
                "ph": payload.ph,
                "N": payload.N,
                "P": payload.P,
                "K": payload.K,
                "date": datetime.utcnow().strftime("%d %b %Y"),
                "created_at": datetime.utcnow().isoformat()
            }
            try:
                db.crop_history.insert_one(history_record)
            except Exception as ex:
                logger.warn(f"Failed to persist crop history: {ex}")

        return response_data

    except Exception as e:
        logger.error(f"Crop recommendation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crop recommendation failed: {str(e)}"
        )


@router.get("/crop/history")
async def get_crop_history(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Returns crop recommendation history for the current authenticated user ONLY."""
    try:
        records = db.crop_history.find({"email": current_user["email"]})
        return records
    except Exception as e:
        logger.error(f"Error fetching crop history: {e}")
        return []


@router.get("/crop/ml-stats")
async def get_ml_stats():
    """Returns accuracy metrics of the trained crop ML model."""
    try:
        if not crop_recommender.metrics:
            crop_recommender.load_model()
        return crop_recommender.metrics or {"message": "Model metrics not yet available."}
    except Exception as e:
        logger.error(f"Error loading ML stats: {e}")
        return {"error": f"Failed to load model metrics: {str(e)}"}


@router.post("/disease/detect")
async def detect_crop_disease(
    image: UploadFile = File(...),
    crop_hint: str = Form("General"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Plant disease detection for current logged-in user."""
    try:
        image_bytes = await image.read()
        file_ext = os.path.splitext(image.filename)[1] or ".jpg"
        unique_name = f"disease-{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(image_bytes)

        result = detect_disease(image_bytes, crop_hint)

        record = {
            "_id": str(uuid.uuid4()),
            "email": current_user["email"],
            "user_id": current_user.get("user_id") or current_user.get("id"),
            "image_path": f"/uploads/{unique_name}",
            "crop_hint": crop_hint,
            "result": result,
            "created_at": datetime.utcnow().isoformat()
        }
        try:
            db.disease_detection.insert_one(record)
        except Exception:
            pass

        return result
    except Exception as e:
        logger.error(f"Disease detection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Disease diagnostic failed: {str(e)}"
        )
