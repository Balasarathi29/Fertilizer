import logging
from authentication.auth_handler import hash_password

logger = logging.getLogger("bhoomi_bloom_seed")

MOCK_PRODUCTS = [
    # Seeds
    {"id": 101, "name": "Premium Tomato Seeds", "category": "Seeds", "price": 150, "rating": 4.8, "reviews": 512, "isOrganic": True, "image": "seed_tomato.jpg", "placeholder": "🍅", "description": "High-yield hybrid tomato seeds perfect for organic farming. Disease-resistant and produces large, juicy fruits.", "stock": 45},
    {"id": 102, "name": "Cherry Tomato Seeds", "category": "Seeds", "price": 180, "rating": 4.7, "reviews": 320, "isOrganic": True, "image": "seed_cherry_tomato.jpg", "placeholder": "🍅", "description": "Sweet and prolific cherry tomato seeds. Ideal for greenhouse or open field cultivation.", "stock": 30},
    {"id": 103, "name": "Brinjal (Eggplant) Seeds", "category": "Seeds", "price": 120, "rating": 4.5, "reviews": 215, "isOrganic": True, "image": "seed_brinjal.jpg", "placeholder": "🍆", "description": "Dark purple, long brinjal seeds. High resistance to fruit and shoot borer.", "stock": 50},
    {"id": 104, "name": "Green Chilli Seeds", "category": "Seeds", "price": 140, "rating": 4.6, "reviews": 410, "isOrganic": True, "image": "seed_green_chilli.jpg", "placeholder": "🌶️", "description": "Spicy, high-yield green chilli seeds. Fast growing and drought tolerant.", "stock": 60},
    {"id": 105, "name": "Red Chilli Seeds (Guntur)", "category": "Seeds", "price": 160, "rating": 4.9, "reviews": 650, "isOrganic": True, "image": "seed_red_chilli.jpg", "placeholder": "🌶️", "description": "Famous Guntur variety red chilli seeds known for their extreme pungency and vibrant color.", "stock": 40},
    {"id": 106, "name": "Red Onion Seeds", "category": "Seeds", "price": 200, "rating": 4.4, "reviews": 180, "isOrganic": True, "image": "seed_onion.jpg", "placeholder": "🧅", "description": "Large, uniform red onion seeds with excellent storage quality.", "stock": 25},
    {"id": 107, "name": "Carrot Seeds (Nantes)", "category": "Seeds", "price": 130, "rating": 4.7, "reviews": 290, "isOrganic": True, "image": "seed_carrot.jpg", "placeholder": "🥕", "description": "Sweet, bright orange cylindrical carrot seeds. Matures quickly.", "stock": 35},
    {"id": 108, "name": "White Radish Seeds", "category": "Seeds", "price": 110, "rating": 4.3, "reviews": 150, "isOrganic": True, "image": "seed_radish.jpg", "placeholder": "🌱", "description": "Long, crisp white radish seeds suitable for year-round planting.", "stock": 55},
    {"id": 109, "name": "Cabbage Seeds", "category": "Seeds", "price": 170, "rating": 4.5, "reviews": 220, "isOrganic": True, "image": "seed_cabbage.jpg", "placeholder": "🥬", "description": "Compact, round cabbage seeds with strong wrapper leaves.", "stock": 20},
    {"id": 110, "name": "Cauliflower Seeds", "category": "Seeds", "price": 190, "rating": 4.6, "reviews": 310, "isOrganic": True, "image": "seed_cauliflower.jpg", "placeholder": "🥦", "description": "Pure white, dome-shaped curd cauliflower seeds.", "stock": 15},
    {"id": 111, "name": "Okra (Bhindi) Seeds", "category": "Seeds", "price": 150, "rating": 4.8, "reviews": 440, "isOrganic": True, "image": "seed_okra.jpg", "placeholder": "🌱", "description": "Dark green, tender okra seeds. Highly resistant to yellow vein mosaic virus.", "stock": 70},
    {"id": 112, "name": "Spinach Seeds", "category": "Seeds", "price": 100, "rating": 4.7, "reviews": 520, "isOrganic": True, "image": "seed_spinach.jpg", "placeholder": "🥬", "description": "Fast-growing, broad-leaved spinach seeds rich in iron.", "stock": 80},
    {"id": 113, "name": "French Beans Seeds", "category": "Seeds", "price": 160, "rating": 4.5, "reviews": 280, "isOrganic": True, "image": "seed_beans.jpg", "placeholder": "🫘", "description": "Stringless, prolific French bean seeds.", "stock": 40},
    {"id": 114, "name": "Cucumber Seeds", "category": "Seeds", "price": 140, "rating": 4.6, "reviews": 360, "isOrganic": True, "image": "seed_cucumber.jpg", "placeholder": "🥒", "description": "Crisp, slicing cucumber seeds ideal for salads.", "stock": 50},
    {"id": 115, "name": "Pumpkin Seeds", "category": "Seeds", "price": 180, "rating": 4.4, "reviews": 190, "isOrganic": True, "image": "seed_pumpkin.jpg", "placeholder": "🎃", "description": "Large, sweet pumpkin seeds excellent for both cooking and carving.", "stock": 30},
    {"id": 116, "name": "Premium Paddy Seeds (Basmati)", "category": "Seeds", "price": 850, "rating": 4.9, "reviews": 1240, "isOrganic": True, "image": "seed_paddy.jpg", "placeholder": "🌾", "description": "Aromatic, long-grain Basmati paddy seeds.", "stock": 100},
    {"id": 117, "name": "Hybrid Paddy Seeds", "category": "Seeds", "price": 700, "rating": 4.8, "reviews": 980, "isOrganic": False, "image": "seed_hybrid_paddy.jpg", "placeholder": "🌾", "description": "High-yielding hybrid paddy seeds for commercial farming.", "stock": 90},
    {"id": 118, "name": "High-Yield Wheat Seeds", "category": "Seeds", "price": 600, "rating": 4.7, "reviews": 850, "isOrganic": True, "image": "seed_wheat.jpg", "placeholder": "🌾", "description": "Disease-resistant wheat seeds for maximum yield.", "stock": 110},
    {"id": 119, "name": "Maize Seeds", "category": "Seeds", "price": 550, "rating": 4.6, "reviews": 720, "isOrganic": False, "image": "seed_maize.jpg", "placeholder": "🌽", "description": "Sweet and field maize seeds suitable for various climates.", "stock": 65},
    {"id": 120, "name": "Bt Cotton Seeds", "category": "Seeds", "price": 1200, "rating": 4.8, "reviews": 1500, "isOrganic": False, "image": "seed_cotton.jpg", "placeholder": "☁️", "description": "Bollworm resistant Bt Cotton seeds for high commercial yield.", "stock": 40},
    
    # Machinery
    {"id": 401, "name": "Bhoomi Mini Tractor 4WD", "category": "Machinery", "price": 450000, "rating": 4.9, "reviews": 145, "isOrganic": False, "image": "mach_tractor.jpg", "placeholder": "🚜", "description": "Compact 4WD mini tractor ideal for orchards and small farms.", "stock": 5},
    {"id": 402, "name": "Heavy Duty Power Tiller", "category": "Machinery", "price": 180000, "rating": 4.7, "reviews": 210, "isOrganic": False, "image": "mach_tiller.jpg", "placeholder": "🚜", "description": "15HP power tiller for deep ploughing in wet and dry lands.", "stock": 8},
    {"id": 403, "name": "Rotavator (6 Feet)", "category": "Machinery", "price": 95000, "rating": 4.8, "reviews": 320, "isOrganic": False, "image": "mach_rotavator.jpg", "placeholder": "⚙️", "description": "High-quality rotary tiller for seedbed preparation.", "stock": 12},
    {"id": 405, "name": "Petrol Brush Cutter", "category": "Machinery", "price": 12500, "rating": 4.5, "reviews": 450, "isOrganic": False, "image": "mach_brushcutter.jpg", "placeholder": "✂️", "description": "2-stroke petrol brush cutter for weed clearing.", "stock": 25},
    {"id": 406, "name": "16L Battery Knapsack Sprayer", "category": "Machinery", "price": 3500, "rating": 4.8, "reviews": 890, "isOrganic": False, "image": "mach_batt_sprayer.jpg", "placeholder": "🎒", "description": "Rechargeable battery-operated sprayer for uniform chemical/fertilizer application.", "stock": 35},
    {"id": 409, "name": "Centrifugal Water Pump (5HP)", "category": "Machinery", "price": 18000, "rating": 4.8, "reviews": 670, "isOrganic": False, "image": "mach_water_pump.jpg", "placeholder": "🚰", "description": "High-discharge electric water pump for irrigation.", "stock": 18},
    
    # Irrigation
    {"id": 501, "name": "Complete Drip Irrigation Kit (1 Acre)", "category": "Irrigation", "price": 15000, "rating": 4.8, "reviews": 540, "isOrganic": False, "image": "irrig_drip_kit.jpg", "placeholder": "💧", "description": "All-in-one drip kit for 1 acre farm.", "stock": 14},
    {"id": 502, "name": "Drip Irrigation Pipe Roll (1000m)", "category": "Irrigation", "price": 8500, "rating": 4.7, "reviews": 890, "isOrganic": False, "image": "irrig_drip_pipe.jpg", "placeholder": "🚰", "description": "16mm inline drip lateral pipe.", "stock": 30},
    {"id": 503, "name": "Micro Sprinkler System", "category": "Irrigation", "price": 12000, "rating": 4.6, "reviews": 420, "isOrganic": False, "image": "irrig_sprinkler.jpg", "placeholder": "💦", "description": "Overhead micro sprinklers for nurseries and vegetables.", "stock": 22},
    {"id": 504, "name": "Solar Submersible Pump (3HP)", "category": "Irrigation", "price": 65000, "rating": 4.9, "reviews": 180, "isOrganic": False, "image": "irrig_solar_pump.jpg", "placeholder": "☀️", "description": "Eco-friendly solar powered submersible borewell pump.", "stock": 7},
    {"id": 506, "name": "Smart IoT Irrigation Controller", "category": "Irrigation", "price": 18500, "rating": 4.8, "reviews": 210, "isOrganic": False, "image": "irrig_smart_controller.jpg", "placeholder": "📱", "description": "Control your farm irrigation from your smartphone.", "stock": 10},
    
    # Tools
    {"id": 301, "name": "Heavy Duty Mammoty (Hoe)", "category": "Tools", "price": 450, "rating": 4.7, "reviews": 1250, "isOrganic": False, "image": "tool_mammoty.jpg", "placeholder": "⛏️", "description": "Forged steel mammoty with wooden handle for digging.", "stock": 60},
    {"id": 302, "name": "Square Point Spade", "category": "Tools", "price": 550, "rating": 4.6, "reviews": 840, "isOrganic": False, "image": "tool_spade.jpg", "placeholder": "⛏️", "description": "Durable spade for moving soil and compost.", "stock": 45},
    {"id": 303, "name": "Round Point Shovel", "category": "Tools", "price": 600, "rating": 4.8, "reviews": 920, "isOrganic": False, "image": "tool_shovel.jpg", "placeholder": "⛏️", "description": "High carbon steel shovel for tough digging.", "stock": 50},
    {"id": 308, "name": "Professional Pruning Shears", "category": "Tools", "price": 800, "rating": 4.9, "reviews": 2100, "isOrganic": False, "image": "tool_pruning.jpg", "placeholder": "✂️", "description": "Bypass pruning shears for clean cuts on branches.", "stock": 40},
    {"id": 313, "name": "Complete Garden Tool Kit", "category": "Tools", "price": 2500, "rating": 4.9, "reviews": 1500, "isOrganic": False, "image": "tool_kit.jpg", "placeholder": "🧰", "description": "10-piece professional farming and gardening hand tool set.", "stock": 25},
    
    # Fertilizers
    {"id": 201, "name": "Premium Vermicompost (50kg)", "category": "Fertilizers", "price": 1200, "rating": 4.9, "reviews": 3240, "isOrganic": True, "image": "fert_vermi.jpg", "placeholder": "🌱", "description": "100% organic earthworm compost rich in NPK.", "stock": 100},
    {"id": 202, "name": "Neem Cake Powder (10kg)", "category": "Fertilizers", "price": 450, "rating": 4.8, "reviews": 1890, "isOrganic": True, "image": "fert_neem.jpg", "placeholder": "🌿", "description": "Organic fertilizer and natural pest repellent.", "stock": 75},
    {"id": 203, "name": "Organic Cow Dung Manure (20kg)", "category": "Fertilizers", "price": 300, "rating": 4.7, "reviews": 2100, "isOrganic": True, "image": "fert_manure.jpg", "placeholder": "💩", "description": "Fully decomposed, weed-free cow dung manure.", "stock": 120},
    {"id": 204, "name": "Liquid Bio Fertilizer (1L)", "category": "Fertilizers", "price": 550, "rating": 4.6, "reviews": 950, "isOrganic": True, "image": "fert_bio.jpg", "placeholder": "🧪", "description": "Contains nitrogen-fixing bacteria for root growth.", "stock": 80},
    {"id": 205, "name": "Liquid Seaweed Extract (500ml)", "category": "Fertilizers", "price": 350, "rating": 4.9, "reviews": 1420, "isOrganic": True, "image": "fert_seaweed.jpg", "placeholder": "🌊", "description": "Organic plant growth promoter extracted from red seaweed.", "stock": 90},
    {"id": 206, "name": "Cocopeat Block (5kg)", "category": "Fertilizers", "price": 250, "rating": 4.8, "reviews": 2800, "isOrganic": True, "image": "fert_cocopeat.jpg", "placeholder": "🥥", "description": "Expands up to 75 liters. Excellent soil conditioner.", "stock": 150},
    {"id": 207, "name": "Organic Soil Conditioner (10kg)", "category": "Fertilizers", "price": 800, "rating": 4.7, "reviews": 670, "isOrganic": True, "image": "fert_soil_conditioner.jpg", "placeholder": "🟤", "description": "Improves soil structure and water retention capacity.", "stock": 40},
    {"id": 208, "name": "Organic Neem Oil Pesticide (1L)", "category": "Fertilizers", "price": 650, "rating": 4.8, "reviews": 1750, "isOrganic": True, "image": "fert_neem_oil.jpg", "placeholder": "💧", "description": "10000 PPM cold-pressed neem oil for insect control.", "stock": 65},
    {"id": 209, "name": "Amino Acid Plant Booster", "category": "Fertilizers", "price": 950, "rating": 4.6, "reviews": 540, "isOrganic": True, "image": "fert_plant_booster.jpg", "placeholder": "✨", "description": "Enhances flowering and fruit setting naturally.", "stock": 30}
]

def seed_database(db):
    """Populates database with initial products, categories, admin user, seller user, and sample orders if empty."""
    # Seed Products
    if db.products.count_documents({}) == 0:
        logger.info("Seeding products to database...")
        for product in MOCK_PRODUCTS:
            db.products.insert_one(product)
            
    # Seed Categories
    if db.categories.count_documents({}) == 0:
        logger.info("Seeding categories to database...")
        categories = [
            {"id_slug": "seeds", "name": "Seeds", "description": "High yield vegetable, fruit, flower, and crop seeds"},
            {"id_slug": "fertilizers", "name": "Fertilizers", "description": "Premium organic fertilizers, composts, and boosters"},
            {"id_slug": "tools", "name": "Tools", "description": "Durable farm hand tools and accessories"},
            {"id_slug": "machinery", "name": "Machinery", "description": "Heavy-duty power machines and farm equipment"},
            {"id_slug": "irrigation", "name": "Irrigation", "description": "Water-saving drip and sprinkler irrigation components"}
        ]
        for cat in categories:
            db.categories.insert_one(cat)
            
    # Seed Admin User
    if not db.users.find_one({"email": "admin@bhoomibloom.com"}):
        logger.info("Seeding default administrator user...")
        admin_pwd = hash_password("admin123")
        db.users.insert_one({
            "full_name": "Bhoomi Admin",
            "username": "admin",
            "email": "admin@bhoomibloom.com",
            "password_hash": admin_pwd,
            "role": "admin",
            "mobile": "+919988776655",
            "location": "Mohali, Punjab"
        })

    # Seed Seller User
    if not db.users.find_one({"email": "seller@bhoomibloom.com"}):
        logger.info("Seeding default seller user...")
        seller_pwd = hash_password("seller123")
        db.users.insert_one({
            "full_name": "Agri Supplier Co",
            "username": "seller_agri",
            "email": "seller@bhoomibloom.com",
            "password_hash": seller_pwd,
            "role": "seller",
            "mobile": "+919123456789",
            "location": "Ludhiana, Punjab"
        })

    # Seed Farmer User
    if not db.users.find_one({"email": "farmer@bhoomibloom.com"}):
        logger.info("Seeding default farmer user...")
        farmer_pwd = hash_password("farmer123")
        db.users.insert_one({
            "full_name": "Ramesh Kumar",
            "username": "farmer_ramesh",
            "email": "farmer@bhoomibloom.com",
            "password_hash": farmer_pwd,
            "role": "farmer",
            "mobile": "+919876543210",
            "location": "Bathinda, Punjab"
        })

    # Seed initial orders for Admin Analytics
    if db.orders.count_documents({}) == 0:
        logger.info("Seeding initial orders...")
        sample_orders = [
            {
                "order_id": "BB-ORD-1001",
                "email": "farmer@bhoomibloom.com",
                "customer_name": "Ramesh Kumar",
                "name": "Ramesh Kumar",
                "shipping_address": "Farm House #12, Village Road, Bathinda, Punjab - 151001",
                "payment_method": "UPI",
                "payment_status": "Paid",
                "order_status": "Delivered",
                "total_amount": 1350.0,
                "discount_amount": 0.0,
                "items_json": '[{"product_id": 101, "name": "Premium Tomato Seeds", "price": 150, "quantity": 1}, {"product_id": 201, "name": "Premium Vermicompost (50kg)", "price": 1200, "quantity": 1}]'
            }
        ]
        for order in sample_orders:
            db.orders.insert_one(order)

    # Seed Bhoomi Card Config
    if db.bhoomi_card_configs.count_documents({}) == 0:
        logger.info("Seeding default Bhoomi Card configuration...")
        db.bhoomi_card_configs.insert_one({
            "price": 100.0,
            "discount_percentage": 10.0,
            "validity_days": 365,
            "is_enabled": True,
            "description": "Exclusive Bhoomi Card membership discount on all organic agriculture products."
        })
