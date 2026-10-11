import os
import logging
from typing import Dict, Any

logger = logging.getLogger("bhoomi_bloom_chatbot")

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

RULE_RESPONSES = {
    "dap": (
        "DAP (Diammonium Phosphate) is a synthetic chemical fertilizer that feeds the plant but depletes the soil over time by acidifying it and killing off essential soil biology. "
        "For a sustainable, premium organic alternative, you should apply **PROM (Phosphate Rich Organic Manure)**, which delivers phosphorus bound with organic matter. "
        "Additionally, apply **Steamed Bone Meal** for slow-release phosphorus and inoculate the soil with **Liquid Bio Fertilizer (PSB - Phosphorus Solubilizing Bacteria)** to unlock pre-existing phosphorus locked in the soil."
    ),
    "chemical": (
        "Chemical fertilizers (like Urea, DAP, MOP) provide instant nutrients but lead to soil compaction, salinity accumulation, and run-off pollution. "
        "We recommend substituting them with organic biological inputs. Use **Premium Vermicompost** for balanced macros, **Neem Cake Powder** for root protection and slow-release nitrogen, "
        "and spray liquid **Panchagavya** or **Jeevamrutham** to feed the soil microbes. Healthy soil breeds healthy crops!"
    ),
    "tomato": (
        "For cultivating premium organic tomatoes: \n"
        "1. **Soil Preparation**: Blend **Premium Vermicompost** (2.5 Tons/acre) with **Neem Cake Powder** (250 kg/acre) to control root nematodes.\n"
        "2. **Calcium Enrichment**: Add **Bone Meal** or dolomite to prevent blossom end rot (black dry patches under the tomato fruit).\n"
        "3. **Foliar Spray**: Spray **Panchagavya** (3% solution) every 15 days from the vegetative stage to flowering. This triggers heavy flowering and builds resistance to early blight."
    ),
    "rice": (
        "For organic paddy (rice) cultivation: \n"
        "1. **Basal Application**: Add 3-5 Tons of decomposed organic manure per acre during tilling.\n"
        "2. **Microbial Inoculation**: Drench soil with **Liquid Bio Fertilizer** containing *Azotobacter* and *Blue-Green Algae* (BGA) to fix nitrogen in flooded conditions.\n"
        "3. **Pest Defense**: Spray **Organic Neem Oil Pesticide (10000 PPM)** at the first signs of leaf folder or stem borer pests."
    ),
    "improve soil": (
        "To naturally restore and improve soil fertility: \n"
        "1. **Raise Organic Carbon**: Apply organic compost or vermicompost regularly. Organic carbon is the foundation of soil health.\n"
        "2. **Green Manuring**: Grow nitrogen-fixing cover crops like Sesbania (Dhaincha) or Sunn hemp, and till them back into the soil during flowering.\n"
        "3. **Soil Conditioning**: Use **Organic Soil Conditioner** (rich in humates) to restore porous structure in clay soil or moisture retention in sandy soils.\n"
        "4. **Mulching**: Cover the soil with crop residues to protect it from heat and conserve moisture."
    )
}

def get_agronomist_reply(message: str, crop_type: str = "General", soil_type: str = "General") -> str:
    """Generates an organic farming agronomist response using Gemini API or rule-base fallback."""
    msg = message.lower().strip()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if HAS_GEMINI and api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            system_prompt = (
                "You are Bhoomi Bloom's Senior AI Agronomist and Sustainable Agriculture Specialist. "
                "You advise farmers and buyers on organic farming, biological inputs, pest control, and soil restoration. "
                "You strictly advocate against chemical pesticides or synthetic chemical fertilizers (like Urea, DAP, Endosulfan). "
                "Instead, recommend organic solutions: Vermicompost, Neem Cake, Bio Fertilizer, Seaweed Extract, Humic Acid, Bone Meal, Fish Amino Acid, Jeevamrutham, Panchagavya, Neem Oil, etc. "
                "Keep your answers concise, practical, encouraging, and highly professional. "
                f"Context: Crop being discussed is {crop_type}, and Soil type is {soil_type}."
            )
            
            response = model.generate_content(f"{system_prompt}\n\nUser Question: {message}")
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini Chatbot failed: {e}. Running fallback rule-base.")

    # FALLBACK RULE-BASE
    # Check for direct keyword matches
    for keyword, response in RULE_RESPONSES.items():
        if keyword in msg:
            return response

    # Smart default response generator
    return (
        f"For growing {crop_type} on {soil_type} soil, prioritize boosting soil organic carbon using **Premium Vermicompost** "
        f"and **Organic Cow Dung Manure**. To build crop immunity, spray **Panchagavya** (30ml per liter of water) at 15-day intervals. "
        f"If you are facing pests, use **Cold-Pressed Neem Oil (10000 PPM)** foliar sprays. "
        "Let me know if you would like specific application rates, planting tips, or watering guides for your crop!"
    )
