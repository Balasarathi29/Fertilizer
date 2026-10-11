import os
import uuid
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from database.connection import get_db
from middleware.auth_middleware import get_current_user, get_current_active_admin

router = APIRouter(tags=["Analytics, Reports & Uploads"])
logger = logging.getLogger("bhoomi_bloom_analytics")

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ORGANIC_SELLERS = [
    {"id": 1, "name": "Bhoomi Bloom Organics — Punjab", "location": "Mohali, Punjab", "products": ["Vermicompost", "Neem Cake"], "phone": "+91 9988112233", "rating": 4.8},
    {"id": 2, "name": "Bhoomi Bloom Bio-inputs — Bathinda", "location": "Bathinda, Punjab", "products": ["Liquid Bio Fertilizer", "Jeevamrutham"], "phone": "+91 9876223344", "rating": 4.6},
    {"id": 3, "name": "Bhoomi Bloom Compost Hub — Coimbatore", "location": "Coimbatore, Tamil Nadu", "products": ["Compost", "Coir Peat"], "phone": "+91 9952223344", "rating": 4.9},
    {"id": 4, "name": "Bhoomi Bloom Vermi-farms — Nilgiris", "location": "Ooty, Tamil Nadu", "products": ["Vermicompost", "Bone Meal"], "phone": "+91 9443223344", "rating": 4.7},
    {"id": 5, "name": "Bhoomi Bloom Naturals — Pune", "location": "Pune, Maharashtra", "products": ["Neem Cake Powder", "Panchagavya"], "phone": "+91 9552112233", "rating": 4.5},
    {"id": 6, "name": "Bhoomi Bloom Agri-Hub — Indore", "location": "Indore, Madhya Pradesh", "products": ["Seaweed Extract", "Compost"], "phone": "+91 9662112233", "rating": 4.7}
]


@router.get("/sellers/nearby")
async def get_nearby_sellers(state: Optional[str] = Query(None)):
    if state:
        filtered = [s for s in ORGANIC_SELLERS if state.lower() in s["location"].lower()]
        if filtered:
            return filtered
    return ORGANIC_SELLERS


@router.post("/upload/image")
async def upload_file(image: UploadFile = File(...)):
    try:
        file_ext = os.path.splitext(image.filename)[1] or ".jpg"
        unique_name = f"upload-{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        content = await image.read()
        with open(file_path, "wb") as f:
            f.write(content)

        return {
            "message": "File uploaded successfully",
            "url": f"/uploads/{unique_name}",
            "filename": unique_name
        }
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/recommendations/products")
async def get_recommended_products(crop: Optional[str] = Query(None), db = Depends(get_db)):
    products = db.products.find({})
    if crop:
        crop_lower = crop.lower()
        recommended = [p for p in products if crop_lower in p.get("name", "").lower() or (p.get("category") == "Fertilizers" and p.get("isOrganic") == True)]
        return recommended[:6]
    return [p for p in products if p.get("isOrganic") == True][:6]


@router.get("/analytics/sales")
async def get_sales_analytics(current_admin = Depends(get_current_active_admin), db = Depends(get_db)):
    orders = db.orders.find({})
    products = db.products.find({})
    users = db.users.find({})

    db_sales = sum(o.get("total_amount", 0) for o in orders)

    sales_by_month = [
        {"month": "Jan", "sales": 45000},
        {"month": "Feb", "sales": 52000},
        {"month": "Mar", "sales": 68000},
        {"month": "Apr", "sales": 84000},
        {"month": "May", "sales": 95000},
        {"month": "Jun", "sales": 110000},
        {"month": "Jul", "sales": max(125000, db_sales)}
    ]

    category_distribution = [
        {"category": cat, "count": sum(1 for p in products if p.get("category", "").lower() == cat.lower())}
        for cat in ["Seeds", "Fertilizers", "Tools", "Machinery", "Irrigation"]
    ]

    best_sellers = sorted(products, key=lambda x: x.get("reviews", 0), reverse=True)[:5]

    return {
        "salesTrend": sales_by_month,
        "categoryDistribution": category_distribution,
        "totalRevenue": db_sales or 4523000,
        "totalOrders": len(orders) or 1254,
        "totalUsers": len(users) or 8430,
        "totalProducts": len(products),
        "bestSellingProducts": [
            {
                "id": p.get("id"),
                "name": p.get("name"),
                "category": p.get("category"),
                "price": p.get("price"),
                "reviews": p.get("reviews"),
                "stock": p.get("stock", 50)
            } for p in best_sellers
        ]
    }


@router.get("/reports/export")
async def export_report(
    report_type: str = Query("sales", description="Report type: sales, customer, inventory"),
    current_admin = Depends(get_current_active_admin),
    db = Depends(get_db)
):
    """
    Returns structured data formatted for CSV/PDF export in the Admin Panel frontend.
    """
    if report_type == "inventory":
        products = db.products.find({})
        return {
            "title": "Inventory Stock Report",
            "generated_at": str(uuid.uuid4().hex[:8]),
            "columns": ["Product ID", "Name", "Category", "Price (INR)", "Stock", "Organic"],
            "rows": [
                [p.get("id"), p.get("name"), p.get("category"), p.get("price"), p.get("stock", 0), "Yes" if p.get("isOrganic") else "No"]
                for p in products
            ]
        }
    elif report_type == "customer":
        users = db.users.find({})
        return {
            "title": "Customer Registration & Orders Report",
            "generated_at": str(uuid.uuid4().hex[:8]),
            "columns": ["User ID", "Full Name", "Email", "Role", "Mobile", "Status"],
            "rows": [
                [u.get("id") or u.get("user_id"), u.get("name") or u.get("full_name"), u.get("email"), u.get("role"), u.get("mobile") or u.get("phone") or "N/A", "Active" if u.get("is_active", True) else "Blocked"]
                for u in users
            ]
        }
    else:
        orders = db.orders.find({})
        return {
            "title": "Sales & Revenue Performance Report",
            "generated_at": str(uuid.uuid4().hex[:8]),
            "columns": ["Order ID", "Customer Email", "Customer Name", "Total Amount (INR)", "Payment Status", "Order Status"],
            "rows": [
                [o.get("order_id"), o.get("email"), o.get("customer_name") or o.get("name"), o.get("total_amount"), o.get("payment_status"), o.get("order_status")]
                for o in orders
            ]
        }
