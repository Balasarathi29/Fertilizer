from fastapi import APIRouter, Query
from typing import Optional, List
from utils.location_loader import (
    get_states,
    get_districts,
    get_coordinates
)

router = APIRouter(
    prefix="/location",
    tags=["Location Services"]
)


@router.get("/states", response_model=List[str])
def states():
    """Returns sorted list of all 28 Indian States & 8 Union Territories."""
    try:
        return get_states()
    except Exception:
        return []


@router.get("/districts", response_model=List[str])
def districts(state: Optional[str] = Query(None)):
    """
    Returns sorted list of districts belonging ONLY to the selected state.
    If state is missing or invalid, returns an empty array [] without crashing.
    """
    if not state:
        return []
    try:
        return get_districts(state)
    except Exception:
        return []


@router.get("/coordinates")
def coordinates(state: Optional[str] = Query(None), district: Optional[str] = Query(None)):
    """Returns latitude and longitude for state and district."""
    try:
        coords = get_coordinates(state or "India", district)
        return {
            "state": state or "India",
            "district": district or "",
            "latitude": coords.get("lat", 20.5937),
            "longitude": coords.get("lon", 78.9629)
        }
    except Exception:
        return {
            "state": state or "India",
            "district": district or "",
            "latitude": 20.5937,
            "longitude": 78.9629
        }