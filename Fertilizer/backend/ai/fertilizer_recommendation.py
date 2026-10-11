import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("bhoomi_bloom_fertilizers")

FERTILIZER_DATABASE = {
    "Vermicompost": {
        "name": "Premium Vermicompost (50kg)",
        "id": 201,
        "price": 1200,
        "rating": 4.9,
        "reviews": 3240,
        "image": "fert_vermi.jpg",
        "placeholder": "🌱",
        "isOrganic": True,
        "explanation": "Provides a comprehensive spectrum of organic NPK, humic acids, and live micro-flora to improve soil aeration, water-holding capacity, and plant root-zone vigor."
    },
    "Neem Cake": {
        "name": "Neem Cake Powder (10kg)",
        "id": 202,
        "price": 450,
        "rating": 4.8,
        "reviews": 1890,
        "image": "fert_neem.jpg",
        "placeholder": "🌿",
        "isOrganic": True,
        "explanation": "Acts as a slow-release organic nitrogen fertilizer and a natural pesticide/nematocide, protecting roots from soil-borne pathogens."
    },
    "Organic Compost": {
        "name": "Organic Cow Dung Manure (20kg)",
        "id": 203,
        "price": 300,
        "rating": 4.7,
        "reviews": 2100,
        "image": "fert_manure.jpg",
        "placeholder": "💩",
        "isOrganic": True,
        "explanation": "Fully decomposed, high-humus soil amendment that restores organic carbon, feeds beneficial earthworms, and maintains long-term soil structure."
    },
    "Bio Fertilizer": {
        "name": "Liquid Bio Fertilizer (1L)",
        "id": 204,
        "price": 550,
        "rating": 4.6,
        "reviews": 950,
        "image": "fert_bio.jpg",
        "placeholder": "🧪",
        "isOrganic": True,
        "explanation": "Inoculates the soil with Azotobacter (nitrogen fixing) and Phosphobacteria (phosphorus solubilizing) to convert atmospheric and locked minerals into bioavailable forms."
    },
    "Seaweed Extract": {
        "name": "Liquid Seaweed Extract (500ml)",
        "id": 205,
        "price": 350,
        "rating": 4.9,
        "reviews": 1420,
        "image": "fert_seaweed.jpg",
        "placeholder": "🌊",
        "isOrganic": True,
        "explanation": "Rich in natural hormones (auxins, cytokinins), alginates, and over 60 trace elements, stimulating cell division, root expansion, and drought resistance."
    },
    "Soil Conditioner": {
        "name": "Organic Soil Conditioner (10kg)",
        "id": 207,
        "price": 800,
        "rating": 4.7,
        "reviews": 670,
        "image": "fert_soil_conditioner.jpg",
        "placeholder": "🟤",
        "isOrganic": True,
        "explanation": "Corrects clay compaction and sand porousness, regulating moisture exchange and ensuring nutrients are not leached during irrigation."
    },
    "Neem Oil": {
        "name": "Organic Neem Oil Pesticide (1L)",
        "id": 208,
        "price": 650,
        "rating": 4.8,
        "reviews": 1750,
        "image": "fert_neem_oil.jpg",
        "placeholder": "💧",
        "isOrganic": True,
        "explanation": "Deters sucking pests, caterpillars, and leaf miners, acting as a crucial foliar-sprayed organic crop protection shield."
    },
    "Amino Acid Booster": {
        "name": "Amino Acid Plant Booster",
        "id": 209,
        "price": 950,
        "rating": 4.6,
        "reviews": 540,
        "image": "fert_plant_booster.jpg",
        "placeholder": "✨",
        "isOrganic": True,
        "explanation": "A natural plant growth booster that enhances enzymatic activity, chlorophyll synthesis, and increases the rate of flowering and fruit setting."
    },
    "Jeevamrutham": {
        "name": "Jeevamrutham Bio-Culture (5L)",
        "id": 210,
        "price": 400,
        "rating": 4.8,
        "reviews": 320,
        "image": "fert_jeevamrutham.jpg",
        "placeholder": "🏺",
        "isOrganic": True,
        "explanation": "A fermented microbial culture that multiplies local soil microorganisms, accelerating nutrient recycling and enhancing defense systems against soil fungi."
    },
    "Panchagavya": {
        "name": "Premium Panchagavya (1L)",
        "id": 211,
        "price": 500,
        "rating": 4.9,
        "reviews": 850,
        "image": "fert_panchagavya.jpg",
        "placeholder": "🥛",
        "isOrganic": True,
        "explanation": "A traditional organic growth promoter made from five cow products. Acts as a brilliant immune booster, growth stimulant, and yield enhancer."
    },
    "Bone Meal": {
        "name": "Steamed Bone Meal (5kg)",
        "id": 212,
        "price": 380,
        "rating": 4.7,
        "reviews": 920,
        "image": "fert_bonemeal.jpg",
        "placeholder": "🦴",
        "isOrganic": True,
        "explanation": "An organic source of slow-release phosphorus and calcium, vital for root development, seedling establishment, and flowering."
    },
    "Humic Acid": {
        "name": "Humic Acid Concentrated Granules (1kg)",
        "id": 213,
        "price": 600,
        "rating": 4.8,
        "reviews": 460,
        "image": "fert_humic.jpg",
        "placeholder": "🧪",
        "isOrganic": True,
        "explanation": "Highly concentrated humic substances that chelate nutrients in the soil, unlocking them for root absorption and boosting root elongation."
    },
    "Fish Amino Acid": {
        "name": "Fish Amino Acid Liquid (500ml)",
        "id": 214,
        "price": 450,
        "rating": 4.7,
        "reviews": 290,
        "image": "fert_fish_amino.jpg",
        "placeholder": "🐟",
        "isOrganic": True,
        "explanation": "Rich in organic nitrogen and amino acids, stimulating vegetative growth and enhancing crop resistance against pests and climate stress."
    }
}

def recommend_fertilizers_for_crop(crop_name: str, N: Optional[float] = None, P: Optional[float] = None, K: Optional[float] = None, ph: Optional[float] = None) -> List[Dict[str, Any]]:
    """
    Suggests organic fertilizers based on crop type, NPK levels, and pH.
    Includes e-commerce catalog attributes for direct UI rendering.
    """
    crop = crop_name.lower().strip()
    recommendations = []

    def add_rec(key: str, custom_reason: str):
        if key in FERTILIZER_DATABASE:
            item = FERTILIZER_DATABASE[key].copy()
            item["explanation"] = f"{item['explanation']} Specifically for {crop_name.capitalize()}: {custom_reason}"
            item["why_recommended"] = custom_reason
            recommendations.append(item)

    # NPK & pH specific dynamic additions
    if N is not None and N < 40:
        add_rec("Fish Amino Acid", f"Soil Nitrogen (N={N}) is low. Fish Amino Acid provides rapid bio-nitrogen.")
    if P is not None and P < 30:
        add_rec("Bone Meal", f"Soil Phosphorus (P={P}) is low. Bone Meal provides slow-release phosphate.")
    if K is not None and K < 30:
        add_rec("Seaweed Extract", f"Soil Potassium (K={K}) is low. Seaweed extract replenishes potassium and trace minerals.")
    if ph is not None and (ph < 6.0 or ph > 7.5):
        add_rec("Soil Conditioner", f"Soil pH is {ph}. Organic soil conditioner helps neutralize soil pH and improve buffering.")

    # Crop-specific recommendations
    if crop in ["rice", "jute", "cotton", "maize"]:
        add_rec("Vermicompost", "Supplies basal nitrogen and carbon needed for early leaf expansion.")
        add_rec("Bio Fertilizer", "Enriches rhizosphere with Azotobacter to continually fix nitrogen in wet paddy/monsoon soil.")
        add_rec("Neem Cake", "Acts as a soil conditioner and guards roots from nematode infestation.")

    elif crop in ["chickpea", "kidneybeans", "pigeonpeas", "mothbeans", "mungbean", "blackgram", "lentil"]:
        add_rec("Bone Meal", "Critical slow-release Phosphorus source for root nodule formation and nitrogen-fixing efficiency.")
        add_rec("Humic Acid", "Chelates phosphorus in the soil, preventing fixed mineral locks.")
        add_rec("Jeevamrutham", "Inoculates root zone with beneficial fungi for efficient phosphate transport.")

    elif crop in ["pomegranate", "banana", "mango", "grapes", "apple", "orange", "papaya"]:
        add_rec("Seaweed Extract", "Provides potassium and cytokinins to maximize fruit sizing and sugar brix level.")
        add_rec("Panchagavya", "Acts as a natural growth hormone, triggering heavy flowering and reducing fruit drop.")
        add_rec("Organic Compost", "Provides a heavy base humus layer to sustain perennial deep tree roots.")

    elif crop in ["coconut"]:
        add_rec("Organic Compost", "Supplies a bulky humus base to support the heavy moisture demand of mature palms.")
        add_rec("Seaweed Extract", "Supplies micronutrients and salt minerals mimicking coastal soils.")

    else:
        add_rec("Vermicompost", "Enriches soil organic matter and provides macro-nutrients.")
        add_rec("Neem Cake", "Keeps soil pathogens away and releases nitrogen slowly.")
        add_rec("Panchagavya", "Boosts overall plant immunity and leaf growth.")

    # Deduplicate while preserving order
    seen_ids = set()
    unique_recs = []
    for r in recommendations:
        if r["id"] not in seen_ids:
            seen_ids.add(r["id"])
            unique_recs.append(r)

    # Ensure at least 3 recommendations
    if len(unique_recs) < 3:
        for k in ["Vermicompost", "Neem Cake", "Panchagavya"]:
            if FERTILIZER_DATABASE[k]["id"] not in seen_ids:
                add_rec(k, "Provides balanced organic nutrients and natural immunity.")
                seen_ids.add(FERTILIZER_DATABASE[k]["id"])

    return unique_recs[:4]
