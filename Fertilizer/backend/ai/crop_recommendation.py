import os
import joblib
import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Tuple

# ML Libraries
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

# Models
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

logger = logging.getLogger("bhoomi_bloom_crop_ml")

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "crop_recommendation_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "crop_scaler.joblib")
ENCODER_PATH = os.path.join(MODEL_DIR, "crop_encoder.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")
DEFAULT_CSV_PATH = os.path.join(os.path.dirname(MODEL_DIR), "data", "Crop_recommendation.csv")

# Metadata mapping for crops
CROP_METADATA = {
    "rice": {
        "description": "Rice is the primary staple food crop, requiring standing water and high clayey/loamy soil nutrient content.",
        "season": "Kharif (June - October)",
        "expected_yield": "2.5 - 3.5 Tons per Acre",
        "suitable_soils": "Clayey, Clayey-Loam, Alluvial",
        "nutrient_status": "High Nitrogen & Potassium consumption; requires constant replenishment."
    },
    "maize": {
        "description": "Maize (Corn) is a high-yield cereal crop used for food, fodder, and industrial feed, preferring well-drained loams.",
        "season": "Kharif / Rabi (Year-round)",
        "expected_yield": "2.0 - 3.2 Tons per Acre",
        "suitable_soils": "Sandy-Loam, Alluvial, Loam",
        "nutrient_status": "Heavy feeder crop; requires high Nitrogen and moderate Zinc."
    },
    "chickpea": {
        "description": "Chickpea is a major winter pulse crop that naturally fixes atmospheric nitrogen through root nodules.",
        "season": "Rabi (October - March)",
        "expected_yield": "0.8 - 1.2 Tons per Acre",
        "suitable_soils": "Well-drained Sandy-Loam, Clay-Loam",
        "nutrient_status": "Nitrogen self-fixing; needs Phosphorous and Calcium for root growth."
    },
    "kidneybeans": {
        "description": "Kidney beans (Rajma) are highly nutritious pulses requiring moderate weather conditions and fertile soil.",
        "season": "Rabi / Spring",
        "expected_yield": "0.6 - 1.0 Tons per Acre",
        "suitable_soils": "Deep fertile loams, Rich in organic humus",
        "nutrient_status": "Moderate Nitrogen and Potassium requirement."
    },
    "pigeonpeas": {
        "description": "Pigeonpea (Arhar) is a highly drought-tolerant, long-duration pulse crop grown under rainfed conditions.",
        "season": "Kharif (June - December)",
        "expected_yield": "0.7 - 1.2 Tons per Acre",
        "suitable_soils": "Sandy-Loam to Clayey, tolerates low fertility",
        "nutrient_status": "Fixes nitrogen; requires low additional chemical or organic nitrogen."
    },
    "mothbeans": {
        "description": "Moth bean is an exceptionally drought-hardy pulse crop grown in extremely arid and semi-arid desert zones.",
        "season": "Kharif (Monsoon)",
        "expected_yield": "0.3 - 0.6 Tons per Acre",
        "suitable_soils": "Light Sandy Soils, desert loams",
        "nutrient_status": "Extremely low nutrient requirements; responsive to small compost additions."
    },
    "mungbean": {
        "description": "Mungbean (Green Gram) is a short-duration pulse crop that fits perfectly in crop rotation cycles, boosting soil health.",
        "season": "Summer / Kharif",
        "expected_yield": "0.4 - 0.8 Tons per Acre",
        "suitable_soils": "Sandy-Loam, fertile loamy soil",
        "nutrient_status": "High nitrogen fixation; requires basaltic minerals and bone meal."
    },
    "blackgram": {
        "description": "Blackgram (Urad) is a key Indian pulse crop rich in proteins, widely used in multi-cropping systems.",
        "season": "Kharif / Rabi",
        "expected_yield": "0.4 - 0.8 Tons per Acre",
        "suitable_soils": "Heavy Clayey Soils, Alluvial",
        "nutrient_status": "Fixes nitrogen; responsive to phosphorus and biofertilizers."
    },
    "lentil": {
        "description": "Lentils (Masoor) are cool-season, nutrient-dense pulses requiring cold vegetative phase and dry ripening stage.",
        "season": "Rabi (Winter)",
        "expected_yield": "0.5 - 0.9 Tons per Acre",
        "suitable_soils": "Light loamy or clayey soils, neutral pH",
        "nutrient_status": "Fixes nitrogen; benefits from Phosphate Rich Organic Manure."
    },
    "pomegranate": {
        "description": "Pomegranate is a high-value perennial fruit crop known for drought tolerance and adaptability to dry climates.",
        "season": "Perennial (Ambe/Mrig Bahar)",
        "expected_yield": "4.0 - 6.0 Tons per Acre",
        "suitable_soils": "Silt-Loam, Clay-Loam, tolerates mild alkalinity",
        "nutrient_status": "High Potassium demand during fruit sizing and sweetening."
    },
    "banana": {
        "description": "Banana is a giant herbaceous tropical plant requiring high moisture, warmth, and heavy nutrient inputs.",
        "season": "Year-round planting",
        "expected_yield": "15.0 - 25.0 Tons per Acre",
        "suitable_soils": "Deep, well-drained alluvial soil rich in humus",
        "nutrient_status": "Extremely heavy feeder; requires continuous Vermicompost and Seaweed application."
    },
    "mango": {
        "description": "Mango, the king of fruits, is a deep-rooted perennial tree crop thriving in tropical and subtropical climates.",
        "season": "Perennial (Harvest: March - July)",
        "expected_yield": "6.0 - 10.0 Tons per Acre",
        "suitable_soils": "Deep well-drained loamy soil, slightly acidic",
        "nutrient_status": "Requires organic compost, Neem cake, and humic acid during vegetative phase."
    },
    "grapes": {
        "description": "Grapes are high-value commercial vine crops cultivated under trellis systems for table fruit or winemaking.",
        "season": "Perennial (Harvest: Feb - April)",
        "expected_yield": "8.0 - 12.0 Tons per Acre",
        "suitable_soils": "Sandy-Loam to Gravelly soil with excellent drainage",
        "nutrient_status": "High requirement for Potassium and Calcium to maintain berry firmness."
    },
    "watermelon": {
        "description": "Watermelon is a warm-season vining fruit crop requiring sandier soils, high heat, and controlled watering.",
        "season": "Summer (January - May)",
        "expected_yield": "12.0 - 18.0 Tons per Acre",
        "suitable_soils": "Sandy, sandy loam, river bed soils",
        "nutrient_status": "Needs organic nitrogen during early growth and high potassium for sugar accumulation."
    },
    "muskmelon": {
        "description": "Muskmelon is a sweet summer crop grown under high temperatures, dry weather, and bright sunshine.",
        "season": "Summer (January - April)",
        "expected_yield": "8.0 - 12.0 Tons per Acre",
        "suitable_soils": "Sandy loam and well-aerated light soils",
        "nutrient_status": "Requires well-composted organic matter and phosphorus."
    },
    "apple": {
        "description": "Apple is a temperate perennial fruit crop grown in high altitude hilly zones under chilling temperatures.",
        "season": "Perennial (Harvest: August - October)",
        "expected_yield": "8.0 - 12.0 Tons per Acre",
        "suitable_soils": "Rich clayey-loam soils, high in organic humus",
        "nutrient_status": "Demands nitrogen for vegetative growth and calcium for shelf life."
    },
    "orange": {
        "description": "Oranges (Citrus fruits) thrive in subtropical regions with moderate rainfall, requiring nutrient-dense soil.",
        "season": "Perennial (Ambe/Mrig Bahar)",
        "expected_yield": "6.0 - 9.0 Tons per Acre",
        "suitable_soils": "Deep loam, well-drained, light clay",
        "nutrient_status": "Susceptible to micro-nutrient deficiencies (Zinc/Iron). Needs biofertilizers."
    },
    "papaya": {
        "description": "Papaya is a fast-growing, shallow-rooted tropical fruit tree that yields harvest within a year of planting.",
        "season": "Year-round sowing",
        "expected_yield": "20.0 - 30.0 Tons per Acre",
        "suitable_soils": "Sandy-Loam, extremely sensitive to water stagnation",
        "nutrient_status": "Requires regular split doses of Vermicompost, Neem cake and bone meal."
    },
    "coconut": {
        "description": "Coconut palm is a perennial plantation crop thriving in tropical coastal belts with high salt tolerance.",
        "season": "Perennial (Year-round harvest)",
        "expected_yield": "8,000 - 12,000 Nuts per Acre",
        "suitable_soils": "Sandy to alluvial loams, coastal sandy belts",
        "nutrient_status": "High demand for Potassium, Sodium, and Chlorine. Responsive to sea-salt and seaweed."
    },
    "cotton": {
        "description": "Cotton is a key commercial fiber cash crop requiring warm conditions and deep soils for boll development.",
        "season": "Kharif (May - December)",
        "expected_yield": "1.0 - 1.5 Tons per Acre",
        "suitable_soils": "Deep Black Cotton Soils (Regur), Alluvial loam",
        "nutrient_status": "Needs balanced NPK. High nitrogen during square formation."
    },
    "jute": {
        "description": "Jute (The Golden Fiber) is a highly water-retentive bast fiber crop cultivated in hot and humid monsoon climates.",
        "season": "Kharif (March - August)",
        "expected_yield": "1.2 - 1.8 Tons per Acre",
        "suitable_soils": "New fertile alluvial soils, clayey loams",
        "nutrient_status": "Responsive to rich nitrogenous organic manure and moist soil beds."
    },
    "coffee": {
        "description": "Coffee is a perennial beverage crop grown under shade trees in high altitude tropical forest zones.",
        "season": "Perennial (Harvest: November - January)",
        "expected_yield": "0.8 - 1.5 Tons per Acre",
        "suitable_soils": "Deep, friable loamy soil rich in forest organic humus",
        "nutrient_status": "Prefers acidic pH; benefits from high organic mulch, potassium, and magnesium."
    }
}

class CropRecommender:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoder = None
        self.metrics = {}
        self.load_model()

    def load_model(self):
        """Loads the trained model and preprocessing pipelines if they exist."""
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH) and os.path.exists(ENCODER_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                self.encoder = joblib.load(ENCODER_PATH)
                
                if os.path.exists(METRICS_PATH):
                    import json
                    with open(METRICS_PATH, "r") as f:
                        self.metrics = json.load(f)
                logger.info("Crop recommendation model loaded successfully!")
            except Exception as e:
                logger.error(f"Error loading model files: {e}. Retraining will be triggered.")
                self.model = None

        if not self.model or not self.scaler or not self.encoder:
            if os.path.exists(DEFAULT_CSV_PATH):
                try:
                    self.train(DEFAULT_CSV_PATH)
                    logger.info("Crop recommendation model retrained from bundled dataset.")
                except Exception as e:
                    logger.error(f"Model retraining failed: {e}")

    def train(self, csv_path: str = DEFAULT_CSV_PATH) -> Dict[str, Any]:
        """Reads CSV, cleans data, trains RF, DT, GB, XGB, picks the best, saves it."""
        logger.info(f"Starting model training from: {csv_path}")
        
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Crop dataset not found at {csv_path}")

        # 1. Load and Clean Data
        df = pd.read_csv(csv_path)
        df.dropna(inplace=True)
        df.drop_duplicates(inplace=True)
        
        X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        y = df['label']

        # Preprocessing
        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(y)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # 80-20 Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )

        # Models to evaluate
        models = {
            "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
            "DecisionTree": DecisionTreeClassifier(random_state=42),
            "GradientBoosting": GradientBoostingClassifier(random_state=42)
        }

        if HAS_XGBOOST:
            models["XGBoost"] = XGBClassifier(
                random_state=42, use_label_encoder=False, eval_metric='mlogloss'
            )

        best_model_name = ""
        best_accuracy = -1.0
        best_model = None
        all_results = {}

        # 2. Train and Compare Models
        for name, clf in models.items():
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            acc = accuracy_score(y_test, y_pred)
            
            # Get metrics
            precision, recall, f1, _ = precision_recall_fscore_support(
                y_test, y_pred, average='weighted'
            )
            
            cm = confusion_matrix(y_test, y_pred).tolist()
            
            all_results[name] = {
                "accuracy": float(acc),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
                "confusion_matrix": cm
            }
            
            logger.info(f"{name} accuracy: {acc:.5f}")
            if acc > best_accuracy:
                best_accuracy = acc
                best_model_name = name
                best_model = clf

        # 3. Save the best model
        logger.info(f"Selected best model: {best_model_name} with accuracy {best_accuracy:.5f}")
        
        joblib.dump(best_model, MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)
        joblib.dump(encoder, ENCODER_PATH)

        self.model = best_model
        self.scaler = scaler
        self.encoder = encoder
        
        # Save metrics
        self.metrics = {
            "selected_model": best_model_name,
            "accuracy": all_results[best_model_name]["accuracy"],
            "precision": all_results[best_model_name]["precision"],
            "recall": all_results[best_model_name]["recall"],
            "f1_score": all_results[best_model_name]["f1_score"],
            "confusion_matrix": all_results[best_model_name]["confusion_matrix"],
            "all_models_evaluated": {k: {"accuracy": v["accuracy"]} for k, v in all_results.items()}
        }
        
        import json
        with open(METRICS_PATH, "w") as f:
            json.dump(self.metrics, f)
            
        return self.metrics

    def predict(self, N: float, P: float, K: float, temp: float, humidity: float, ph: float, rainfall: float) -> Dict[str, Any]:
        """Generate prediction and confidence score."""
        if not self.model or not self.scaler or not self.encoder:
            # Auto-train if missing
            self.train()

        input_data = np.array([[N, P, K, temp, humidity, ph, rainfall]])
        input_scaled = self.scaler.transform(input_data)
        
        # Predict label
        pred_encoded = self.model.predict(input_scaled)[0]
        crop_name = self.encoder.inverse_transform([pred_encoded])[0]

        # Get confidence score
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(input_scaled)[0]
            confidence = float(np.max(probs))
        else:
            confidence = 1.0  # fallback

        # Construct Analysis Metrics
        npk_analysis = self._analyze_npk(N, P, K, crop_name)
        ph_analysis = self._analyze_ph(ph)
        soil_health = self._calculate_soil_health(N, P, K, ph)
        
        meta = CROP_METADATA.get(crop_name, {
            "description": f"An organic crop suitable for local conditions.",
            "season": "Kharif / Rabi",
            "expected_yield": "1.5 - 2.5 Tons per Acre",
            "suitable_soils": "Loamy, Alluvial",
            "nutrient_status": "Requires standard organic farming inputs."
        })

        return {
            "recommendedCrop": crop_name.capitalize(),
            "confidence": f"{confidence * 100:.1f}%",
            "weatherSummary": f"Temperature is {temp}°C with {humidity}% relative humidity and annual estimated rainfall of {rainfall:.1f}mm.",
            "soilHealth": f"{soil_health}/100 - {self._get_soil_health_rating(soil_health)}",
            "npkAnalysis": npk_analysis,
            "phAnalysis": ph_analysis,
            "suitableSeason": meta["season"],
            "cropDescription": meta["description"],
            "expectedYield": meta["expected_yield"],
            "raw_crop_key": crop_name
        }

    def _analyze_npk(self, N: float, P: float, K: float, crop: str) -> str:
        # Generic ranges: nitrogen, phosphorus, potassium
        # In a real organic farm, N: 40-100, P: 30-70, K: 30-70 are optimal
        issues = []
        if N < 40: issues.append("Low Nitrogen (N)")
        elif N > 120: issues.append("Excessive Nitrogen (N)")
        else: issues.append("Optimal Nitrogen (N)")

        if P < 30: issues.append("Low Phosphorus (P)")
        elif P > 80: issues.append("Excessive Phosphorus (P)")
        else: issues.append("Optimal Phosphorus (P)")

        if K < 30: issues.append("Low Potassium (K)")
        elif K > 80: issues.append("Excessive Potassium (K)")
        else: issues.append("Optimal Potassium (K)")

        return ", ".join(issues) + ". Recommended to apply NPK balancing compost."

    def _analyze_ph(self, ph: float) -> str:
        if ph < 5.5:
            return f"Highly Acidic (pH {ph:.2f}). Requires lime/dolomite amendment."
        elif ph < 6.5:
            return f"Slightly Acidic (pH {ph:.2f}). Ideal for acid-loving crops."
        elif ph <= 7.5:
            return f"Neutral (pH {ph:.2f}). Optimal microbial and nutrient availability."
        elif ph <= 8.5:
            return f"Slightly Alkaline (pH {ph:.2f}). Requires gypsum or sulfur."
        else:
            return f"Highly Alkaline (pH {ph:.2f}). High salt hazard. Apply organic mulches."

    def _calculate_soil_health(self, N: float, P: float, K: float, ph: float) -> int:
        # Score calculation out of 100
        score = 100
        # pH penalty
        if ph < 5.0 or ph > 8.5: score -= 20
        elif ph < 6.0 or ph > 7.8: score -= 10
        
        # NPK deficiency penalty
        if N < 30: score -= 10
        if P < 20: score -= 10
        if K < 20: score -= 10
        
        # NPK excessive penalty
        if N > 140: score -= 8
        if P > 100: score -= 8
        if K > 100: score -= 8
        
        return max(40, score)

    def _get_soil_health_rating(self, score: int) -> str:
        if score >= 85: return "Excellent Soil Vigour"
        elif score >= 70: return "Healthy Soil Structure"
        elif score >= 55: return "Moderately Depleted"
        return "Critically Depleted"

crop_recommender = CropRecommender()
