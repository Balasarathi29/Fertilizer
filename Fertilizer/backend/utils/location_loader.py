import json
import os
import logging

logger = logging.getLogger("bhoomi_bloom_location")

DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "india_states_districts.json"
)

# In-memory cached lookup structures
LOCATION_DATA = {}
STATES_LIST = []
DISTRICTS_BY_STATE = {}

def _init_location_data():
    global LOCATION_DATA, STATES_LIST, DISTRICTS_BY_STATE
    if LOCATION_DATA:
        return

    logger.info("Initializing India Location Dataset from india_states_districts.json...")
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                LOCATION_DATA = json.load(f)
        else:
            logger.warning(f"File {DATA_FILE} not found!")
            LOCATION_DATA = {}

        state_names = list(LOCATION_DATA.keys())
        STATES_LIST = sorted(state_names)

        for s_name, dists in LOCATION_DATA.items():
            DISTRICTS_BY_STATE[s_name.strip().lower()] = sorted(list(set(dists)))

        logger.info(f"Loaded {len(STATES_LIST)} Indian States & Union Territories successfully.")
    except Exception as e:
        logger.error(f"Error loading location dataset: {e}")
        LOCATION_DATA = {}
        STATES_LIST = []
        DISTRICTS_BY_STATE = {}

# Pre-load on module import
_init_location_data()


def get_states():
    """Returns sorted list of all 28 Indian States & 8 Union Territories."""
    if not STATES_LIST:
        _init_location_data()
    return STATES_LIST


def get_districts(state_name: str):
    """
    Returns sorted list of official districts for the specified state_name.
    If state is invalid or missing, returns an empty array []. Never crashes.
    """
    if not state_name or not isinstance(state_name, str):
        return []
    
    clean_state = state_name.strip().lower()
    
    # Exact match lookup
    if clean_state in DISTRICTS_BY_STATE:
        return DISTRICTS_BY_STATE[clean_state]
    
    # Partial match fallback
    for s_key, dists in DISTRICTS_BY_STATE.items():
        if clean_state in s_key or s_key in clean_state:
            return dists
            
    return []


def get_coordinates(state_name: str, district_name: str = None):
    """
    Returns dict {"lat": float, "lon": float} for weather resolution.
    Never crashes.
    """
    # Standard India geo center default
    return {"lat": 20.5937, "lon": 78.9629}