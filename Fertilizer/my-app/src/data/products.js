// Bhoomi Bloom Massive Product Catalog

export const mockProducts = [
  // ==========================================
  // CATEGORY 1: SEEDS
  // ==========================================
  
  // Vegetable Seeds
  { id: 101, name: 'Premium Tomato Seeds', category: 'Seeds', price: 150, rating: 4.8, reviews: 512, isOrganic: true, image: 'seed_tomato.jpg', placeholder: '🍅', description: 'High-yield hybrid tomato seeds perfect for organic farming. Disease-resistant and produces large, juicy fruits.' },
  { id: 102, name: 'Cherry Tomato Seeds', category: 'Seeds', price: 180, rating: 4.7, reviews: 320, isOrganic: true, image: 'seed_cherry_tomato.jpg', placeholder: '🍅', description: 'Sweet and prolific cherry tomato seeds. Ideal for greenhouse or open field cultivation.' },
  { id: 103, name: 'Brinjal (Eggplant) Seeds', category: 'Seeds', price: 120, rating: 4.5, reviews: 215, isOrganic: true, image: 'seed_brinjal.jpg', placeholder: '🍆', description: 'Dark purple, long brinjal seeds. High resistance to fruit and shoot borer.' },
  { id: 104, name: 'Green Chilli Seeds', category: 'Seeds', price: 140, rating: 4.6, reviews: 410, isOrganic: true, image: 'seed_green_chilli.jpg', placeholder: '🌶️', description: 'Spicy, high-yield green chilli seeds. Fast growing and drought tolerant.' },
  { id: 105, name: 'Red Chilli Seeds (Guntur)', category: 'Seeds', price: 160, rating: 4.9, reviews: 650, isOrganic: true, image: 'seed_red_chilli.jpg', placeholder: '🌶️', description: 'Famous Guntur variety red chilli seeds known for their extreme pungency and vibrant color.' },
  { id: 106, name: 'Red Onion Seeds', category: 'Seeds', price: 200, rating: 4.4, reviews: 180, isOrganic: true, image: 'seed_onion.jpg', placeholder: '🧅', description: 'Large, uniform red onion seeds with excellent storage quality.' },
  { id: 107, name: 'Carrot Seeds (Nantes)', category: 'Seeds', price: 130, rating: 4.7, reviews: 290, isOrganic: true, image: 'seed_carrot.jpg', placeholder: '🥕', description: 'Sweet, bright orange cylindrical carrot seeds. Matures quickly.' },
  { id: 108, name: 'White Radish Seeds', category: 'Seeds', price: 110, rating: 4.3, reviews: 150, isOrganic: true, image: 'seed_radish.jpg', placeholder: '🌱', description: 'Long, crisp white radish seeds suitable for year-round planting.' },
  { id: 109, name: 'Cabbage Seeds', category: 'Seeds', price: 170, rating: 4.5, reviews: 220, isOrganic: true, image: 'seed_cabbage.jpg', placeholder: '🥬', description: 'Compact, round cabbage seeds with strong wrapper leaves.' },
  { id: 110, name: 'Cauliflower Seeds', category: 'Seeds', price: 190, rating: 4.6, reviews: 310, isOrganic: true, image: 'seed_cauliflower.jpg', placeholder: '🥦', description: 'Pure white, dome-shaped curd cauliflower seeds.' },
  { id: 111, name: 'Okra (Bhindi) Seeds', category: 'Seeds', price: 150, rating: 4.8, reviews: 440, isOrganic: true, image: 'seed_okra.jpg', placeholder: '🌱', description: 'Dark green, tender okra seeds. Highly resistant to yellow vein mosaic virus.' },
  { id: 112, name: 'Spinach Seeds', category: 'Seeds', price: 100, rating: 4.7, reviews: 520, isOrganic: true, image: 'seed_spinach.jpg', placeholder: '🥬', description: 'Fast-growing, broad-leaved spinach seeds rich in iron.' },
  { id: 113, name: 'French Beans Seeds', category: 'Seeds', price: 160, rating: 4.5, reviews: 280, isOrganic: true, image: 'seed_beans.jpg', placeholder: '🫘', description: 'Stringless, prolific French bean seeds.' },
  { id: 114, name: 'Cucumber Seeds', category: 'Seeds', price: 140, rating: 4.6, reviews: 360, isOrganic: true, image: 'seed_cucumber.jpg', placeholder: '🥒', description: 'Crisp, slicing cucumber seeds ideal for salads.' },
  { id: 115, name: 'Pumpkin Seeds', category: 'Seeds', price: 180, rating: 4.4, reviews: 190, isOrganic: true, image: 'seed_pumpkin.jpg', placeholder: '🎃', description: 'Large, sweet pumpkin seeds excellent for both cooking and carving.' },

  // Crop Seeds
  { id: 116, name: 'Premium Paddy Seeds (Basmati)', category: 'Seeds', price: 850, rating: 4.9, reviews: 1240, isOrganic: true, image: 'seed_paddy.jpg', placeholder: '🌾', description: 'Aromatic, long-grain Basmati paddy seeds.' },
  { id: 117, name: 'Hybrid Paddy Seeds', category: 'Seeds', price: 700, rating: 4.8, reviews: 980, isOrganic: false, image: 'seed_hybrid_paddy.jpg', placeholder: '🌾', description: 'High-yielding hybrid paddy seeds for commercial farming.' },
  { id: 118, name: 'High-Yield Wheat Seeds', category: 'Seeds', price: 600, rating: 4.7, reviews: 850, isOrganic: true, image: 'seed_wheat.jpg', placeholder: '🌾', description: 'Disease-resistant wheat seeds for maximum yield.' },
  { id: 119, name: 'Maize Seeds', category: 'Seeds', price: 550, rating: 4.6, reviews: 720, isOrganic: false, image: 'seed_maize.jpg', placeholder: '🌽', description: 'Sweet and field maize seeds suitable for various climates.' },
  { id: 120, name: 'Bt Cotton Seeds', category: 'Seeds', price: 1200, rating: 4.8, reviews: 1500, isOrganic: false, image: 'seed_cotton.jpg', placeholder: '☁️', description: 'Bollworm resistant Bt Cotton seeds for high commercial yield.' },
  { id: 121, name: 'Sugarcane Seed Setts', category: 'Seeds', price: 2500, rating: 4.5, reviews: 430, isOrganic: true, image: 'seed_sugarcane.jpg', placeholder: '🎋', description: 'High sugar recovery sugarcane seed setts.' },
  { id: 122, name: 'Groundnut Seeds', category: 'Seeds', price: 900, rating: 4.7, reviews: 610, isOrganic: true, image: 'seed_groundnut.jpg', placeholder: '🥜', description: 'Bold, high-oil content groundnut seeds.' },
  { id: 123, name: 'Pearl Millet (Bajra) Seeds', category: 'Seeds', price: 400, rating: 4.4, reviews: 290, isOrganic: true, image: 'seed_millet.jpg', placeholder: '🌾', description: 'Drought-tolerant pearl millet seeds.' },
  { id: 124, name: 'Finger Millet (Ragi) Seeds', category: 'Seeds', price: 450, rating: 4.6, reviews: 380, isOrganic: true, image: 'seed_ragi.jpg', placeholder: '🌾', description: 'Nutrient-rich Ragi seeds, highly resilient to dry weather.' },
  { id: 125, name: 'Sorghum (Jowar) Seeds', category: 'Seeds', price: 380, rating: 4.3, reviews: 210, isOrganic: true, image: 'seed_sorghum.jpg', placeholder: '🌾', description: 'Dual-purpose sorghum seeds for grain and fodder.' },

  // Flower Seeds
  { id: 126, name: 'Rose Seeds Collection', category: 'Seeds', price: 300, rating: 4.5, reviews: 540, isOrganic: true, image: 'seed_rose.jpg', placeholder: '🌹', description: 'Mix of premium colorful rose seeds for ornamental farming.' },
  { id: 127, name: 'Jasmine Seeds', category: 'Seeds', price: 250, rating: 4.7, reviews: 420, isOrganic: true, image: 'seed_jasmine.jpg', placeholder: '🌼', description: 'Highly fragrant white jasmine seeds.' },
  { id: 128, name: 'Marigold Seeds (Orange)', category: 'Seeds', price: 150, rating: 4.8, reviews: 680, isOrganic: true, image: 'seed_marigold.jpg', placeholder: '🏵️', description: 'Large, vibrant orange marigold seeds. Excellent natural pest deterrent.' },
  { id: 129, name: 'Sunflower Seeds', category: 'Seeds', price: 180, rating: 4.6, reviews: 350, isOrganic: true, image: 'seed_sunflower.jpg', placeholder: '🌻', description: 'Giant sunflower seeds for oil extraction or ornamental use.' },
  { id: 130, name: 'Lotus Seeds', category: 'Seeds', price: 400, rating: 4.4, reviews: 190, isOrganic: true, image: 'seed_lotus.jpg', placeholder: '🪷', description: 'Aquatic lotus seeds for pond cultivation.' },

  // ==========================================
  // CATEGORY 2: AGRICULTURE MACHINERY
  // ==========================================
  { id: 401, name: 'Bhoomi Mini Tractor 4WD', category: 'Machinery', price: 450000, rating: 4.9, reviews: 145, isOrganic: false, image: 'mach_tractor.jpg', placeholder: '🚜', description: 'Compact 4WD mini tractor ideal for orchards and small farms.' },
  { id: 402, name: 'Heavy Duty Power Tiller', category: 'Machinery', price: 180000, rating: 4.7, reviews: 210, isOrganic: false, image: 'mach_tiller.jpg', placeholder: '🚜', description: '15HP power tiller for deep ploughing in wet and dry lands.' },
  { id: 403, name: 'Rotavator (6 Feet)', category: 'Machinery', price: 95000, rating: 4.8, reviews: 320, isOrganic: false, image: 'mach_rotavator.jpg', placeholder: '⚙️', description: 'High-quality rotary tiller for seedbed preparation.' },
  { id: 404, name: 'Spring Loaded Cultivator', category: 'Machinery', price: 45000, rating: 4.6, reviews: 180, isOrganic: false, image: 'mach_cultivator.jpg', placeholder: '⚙️', description: '9-tine spring loaded cultivator for tough soils.' },
  { id: 405, name: 'Petrol Brush Cutter', category: 'Machinery', price: 12500, rating: 4.5, reviews: 450, isOrganic: false, image: 'mach_brushcutter.jpg', placeholder: '✂️', description: '2-stroke petrol brush cutter for weed clearing.' },
  { id: 406, name: '16L Battery Knapsack Sprayer', category: 'Machinery', price: 3500, rating: 4.8, reviews: 890, isOrganic: false, image: 'mach_batt_sprayer.jpg', placeholder: '🎒', description: 'Rechargeable battery-operated sprayer for uniform chemical/fertilizer application.' },
  { id: 407, name: 'Petrol Power Sprayer', category: 'Machinery', price: 8500, rating: 4.7, reviews: 340, isOrganic: false, image: 'mach_petrol_sprayer.jpg', placeholder: '💨', description: 'High-pressure petrol sprayer for large orchards.' },
  { id: 408, name: 'Electric Hand Sprayer', category: 'Machinery', price: 1500, rating: 4.4, reviews: 520, isOrganic: false, image: 'mach_elec_sprayer.jpg', placeholder: '🔫', description: 'Small electric sprayer for greenhouses.' },
  { id: 409, name: 'Centrifugal Water Pump (5HP)', category: 'Machinery', price: 18000, rating: 4.8, reviews: 670, isOrganic: false, image: 'mach_water_pump.jpg', placeholder: '🚰', description: 'High-discharge electric water pump for irrigation.' },
  { id: 410, name: 'Diesel Water Pump Set', category: 'Machinery', price: 28000, rating: 4.6, reviews: 410, isOrganic: false, image: 'mach_diesel_pump.jpg', placeholder: '⛽', description: 'Portable diesel pump for remote field irrigation.' },
  { id: 411, name: 'Multi-Crop Harvesting Machine', category: 'Machinery', price: 1200000, rating: 4.9, reviews: 85, isOrganic: false, image: 'mach_harvester.jpg', placeholder: '🌾', description: 'Combine harvester for paddy, wheat, and maize.' },
  { id: 412, name: 'Thresher Machine', category: 'Machinery', price: 150000, rating: 4.7, reviews: 150, isOrganic: false, image: 'mach_thresher.jpg', placeholder: '⚙️', description: 'Efficient crop threshing machine.' },
  { id: 413, name: 'Zero Till Seed Drill', category: 'Machinery', price: 65000, rating: 4.8, reviews: 220, isOrganic: false, image: 'mach_seed_drill.jpg', placeholder: '🚜', description: 'Direct seed drilling machine to save time and fuel.' },
  { id: 414, name: 'Motorized Chaff Cutter', category: 'Machinery', price: 25000, rating: 4.5, reviews: 310, isOrganic: false, image: 'mach_chaff_cutter.jpg', placeholder: '⚙️', description: 'Fodder cutting machine for dairy farms.' },
  { id: 415, name: 'Ride-on Grass Cutter', category: 'Machinery', price: 85000, rating: 4.6, reviews: 120, isOrganic: false, image: 'mach_grass_cutter.jpg', placeholder: '🚜', description: 'Comfortable ride-on mower for large lawns and farms.' },
  { id: 416, name: 'Reversible MB Plough', category: 'Machinery', price: 55000, rating: 4.7, reviews: 280, isOrganic: false, image: 'mach_plough.jpg', placeholder: '⚙️', description: 'Hydraulic reversible mould board plough.' },

  // ==========================================
  // CATEGORY 3: IRRIGATION SYSTEM
  // ==========================================
  { id: 501, name: 'Complete Drip Irrigation Kit (1 Acre)', category: 'Irrigation', price: 15000, rating: 4.8, reviews: 540, isOrganic: false, image: 'irrig_drip_kit.jpg', placeholder: '💧', description: 'All-in-one drip kit for 1 acre farm.' },
  { id: 502, name: 'Drip Irrigation Pipe Roll (1000m)', category: 'Irrigation', price: 8500, rating: 4.7, reviews: 890, isOrganic: false, image: 'irrig_drip_pipe.jpg', placeholder: '🚰', description: '16mm inline drip lateral pipe.' },
  { id: 503, name: 'Micro Sprinkler System', category: 'Irrigation', price: 12000, rating: 4.6, reviews: 420, isOrganic: false, image: 'irrig_sprinkler.jpg', placeholder: '💦', description: 'Overhead micro sprinklers for nurseries and vegetables.' },
  { id: 504, name: 'Solar Submersible Pump (3HP)', category: 'Irrigation', price: 65000, rating: 4.9, reviews: 180, isOrganic: false, image: 'irrig_solar_pump.jpg', placeholder: '☀️', description: 'Eco-friendly solar powered submersible borewell pump.' },
  { id: 505, name: 'PVC Agriculture Pipes (20ft)', category: 'Irrigation', price: 450, rating: 4.5, reviews: 1200, isOrganic: false, image: 'irrig_pvc.jpg', placeholder: '🚰', description: 'Heavy duty 6kg/cm2 PVC pipes.' },
  { id: 506, name: 'Smart IoT Irrigation Controller', category: 'Irrigation', price: 18500, rating: 4.8, reviews: 210, isOrganic: false, image: 'irrig_smart_controller.jpg', placeholder: '📱', description: 'Control your farm irrigation from your smartphone.' },
  { id: 507, name: 'Screen Water Filter (2 inch)', category: 'Irrigation', price: 2500, rating: 4.6, reviews: 650, isOrganic: false, image: 'irrig_filter.jpg', placeholder: '🚰', description: 'Prevents clogging in drip irrigation systems.' },
  { id: 508, name: 'Greenhouse Fogger System', category: 'Irrigation', price: 5500, rating: 4.7, reviews: 340, isOrganic: false, image: 'irrig_fogger.jpg', placeholder: '🌫️', description: 'Maintains humidity and cooling in polyhouses.' },
  { id: 509, name: 'Heavy Duty Garden Hose (30m)', category: 'Irrigation', price: 1200, rating: 4.4, reviews: 890, isOrganic: false, image: 'irrig_hose.jpg', placeholder: '🐍', description: 'Flexible, kink-resistant garden hose.' },
  { id: 510, name: 'Adjustable Brass Spray Nozzle', category: 'Irrigation', price: 450, rating: 4.8, reviews: 1500, isOrganic: false, image: 'irrig_nozzle.jpg', placeholder: '🔫', description: 'High-pressure brass nozzle for manual watering.' },

  // ==========================================
  // CATEGORY 4: FARM HAND TOOLS
  // ==========================================
  { id: 301, name: 'Heavy Duty Mammoty (Hoe)', category: 'Tools', price: 450, rating: 4.7, reviews: 1250, isOrganic: false, image: 'tool_mammoty.jpg', placeholder: '⛏️', description: 'Forged steel mammoty with wooden handle for digging.' },
  { id: 302, name: 'Square Point Spade', category: 'Tools', price: 550, rating: 4.6, reviews: 840, isOrganic: false, image: 'tool_spade.jpg', placeholder: '⛏️', description: 'Durable spade for moving soil and compost.' },
  { id: 303, name: 'Round Point Shovel', category: 'Tools', price: 600, rating: 4.8, reviews: 920, isOrganic: false, image: 'tool_shovel.jpg', placeholder: '⛏️', description: 'High carbon steel shovel for tough digging.' },
  { id: 304, name: 'Harvesting Sickle', category: 'Tools', price: 250, rating: 4.5, reviews: 1800, isOrganic: false, image: 'tool_sickle.jpg', placeholder: '🔪', description: 'Serrated sickle for harvesting wheat and paddy.' },
  { id: 305, name: 'Farm Knife (Machete)', category: 'Tools', price: 350, rating: 4.6, reviews: 670, isOrganic: false, image: 'tool_knife.jpg', placeholder: '🗡️', description: 'Heavy machete for clearing brush and cutting crops.' },
  { id: 306, name: 'Wood Cutting Axe', category: 'Tools', price: 850, rating: 4.7, reviews: 450, isOrganic: false, image: 'tool_axe.jpg', placeholder: '🪓', description: 'Sharp forged axe for chopping farm wood.' },
  { id: 307, name: 'Hand Cultivator (3 Prong)', category: 'Tools', price: 200, rating: 4.4, reviews: 1100, isOrganic: false, image: 'tool_hand_cultivator.jpg', placeholder: '🍴', description: 'Small cultivator for loosening soil in pots and beds.' },
  { id: 308, name: 'Professional Pruning Shears', category: 'Tools', price: 800, rating: 4.9, reviews: 2100, isOrganic: false, image: 'tool_pruning.jpg', placeholder: '✂️', description: 'Bypass pruning shears for clean cuts on branches.' },
  { id: 309, name: 'Garden Scissors', category: 'Tools', price: 300, rating: 4.5, reviews: 890, isOrganic: false, image: 'tool_garden_scissors.jpg', placeholder: '✂️', description: 'Sharp scissors for harvesting flowers and vegetables.' },
  { id: 310, name: 'Leaf Rake', category: 'Tools', price: 400, rating: 4.3, reviews: 560, isOrganic: false, image: 'tool_rake.jpg', placeholder: '🧹', description: 'Flexible steel tine rake for clearing leaves.' },
  { id: 311, name: 'Manual Seed Sower', category: 'Tools', price: 1200, rating: 4.6, reviews: 340, isOrganic: false, image: 'tool_seed_sower.jpg', placeholder: '⚙️', description: 'Push-type manual seed drill for small farms.' },
  { id: 312, name: 'Stand-up Weeding Tool', category: 'Tools', price: 950, rating: 4.8, reviews: 720, isOrganic: false, image: 'tool_weeder.jpg', placeholder: '🍴', description: 'Ergonomic weed puller saves your back.' },
  { id: 313, name: 'Complete Garden Tool Kit', category: 'Tools', price: 2500, rating: 4.9, reviews: 1500, isOrganic: false, image: 'tool_kit.jpg', placeholder: '🧰', description: '10-piece professional farming and gardening hand tool set.' },

  // ==========================================
  // CATEGORY 5: ORGANIC FERTILIZERS
  // ==========================================
  { id: 201, name: 'Premium Vermicompost (50kg)', category: 'Fertilizers', price: 1200, rating: 4.9, reviews: 3240, isOrganic: true, image: 'fert_vermi.jpg', placeholder: '🌱', description: '100% organic earthworm compost rich in NPK.' },
  { id: 202, name: 'Neem Cake Powder (10kg)', category: 'Fertilizers', price: 450, rating: 4.8, reviews: 1890, isOrganic: true, image: 'fert_neem.jpg', placeholder: '🌿', description: 'Organic fertilizer and natural pest repellent.' },
  { id: 203, name: 'Organic Cow Dung Manure (20kg)', category: 'Fertilizers', price: 300, rating: 4.7, reviews: 2100, isOrganic: true, image: 'fert_manure.jpg', placeholder: '💩', description: 'Fully decomposed, weed-free cow dung manure.' },
  { id: 204, name: 'Liquid Bio Fertilizer (1L)', category: 'Fertilizers', price: 550, rating: 4.6, reviews: 950, isOrganic: true, image: 'fert_bio.jpg', placeholder: '🧪', description: 'Contains nitrogen-fixing bacteria for root growth.' },
  { id: 205, name: 'Liquid Seaweed Extract (500ml)', category: 'Fertilizers', price: 350, rating: 4.9, reviews: 1420, isOrganic: true, image: 'fert_seaweed.jpg', placeholder: '🌊', description: 'Organic plant growth promoter extracted from red seaweed.' },
  { id: 206, name: 'Cocopeat Block (5kg)', category: 'Fertilizers', price: 250, rating: 4.8, reviews: 2800, isOrganic: true, image: 'fert_cocopeat.jpg', placeholder: '🥥', description: 'Expands up to 75 liters. Excellent soil conditioner.' },
  { id: 207, name: 'Organic Soil Conditioner (10kg)', category: 'Fertilizers', price: 800, rating: 4.7, reviews: 670, isOrganic: true, image: 'fert_soil_conditioner.jpg', placeholder: '🟤', description: 'Improves soil structure and water retention capacity.' },
  { id: 208, name: 'Organic Neem Oil Pesticide (1L)', category: 'Fertilizers', price: 650, rating: 4.8, reviews: 1750, isOrganic: true, image: 'fert_neem_oil.jpg', placeholder: '💧', description: '10000 PPM cold-pressed neem oil for insect control.' },
  { id: 209, name: 'Amino Acid Plant Booster', category: 'Fertilizers', price: 950, rating: 4.6, reviews: 540, isOrganic: true, image: 'fert_plant_booster.jpg', placeholder: '✨', description: 'Enhances flowering and fruit setting naturally.' },
];
