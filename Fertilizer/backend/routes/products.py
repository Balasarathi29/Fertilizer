from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from database.connection import get_db
from middleware.auth_middleware import get_current_active_seller, get_current_active_admin

router = APIRouter(tags=["Products"])


class ProductPayload(BaseModel):
    id: Optional[int] = None
    name: str
    category: str
    price: float
    rating: Optional[float] = 5.0
    reviews: Optional[int] = 0
    isOrganic: Optional[bool] = True
    image: Optional[str] = "seed_tomato.jpg"
    placeholder: Optional[str] = "🌱"
    description: Optional[str] = ""
    stock: Optional[int] = 50


@router.get("/products")
async def get_products(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    sort: Optional[str] = Query(None),
    db = Depends(get_db)
):
    products = db.products.find({})

    # Filter by category
    if category and category.lower() != "all":
        products = [p for p in products if p.get("category", "").lower() == category.lower()]

    # Search filter
    if q:
        query = q.lower()
        filtered = []
        for p in products:
            name = p.get("name", "").lower()
            desc = p.get("description", "").lower()
            cat = p.get("category", "").lower()
            if query in name or query in desc or query in cat:
                filtered.append(p)
        products = filtered

    # Sort logic
    if sort == "price_low":
        products.sort(key=lambda x: x.get("price", 0))
    elif sort == "price_high":
        products.sort(key=lambda x: x.get("price", 0), reverse=True)
    elif sort == "rating":
        products.sort(key=lambda x: x.get("rating", 0), reverse=True)

    return products


@router.get("/products/{product_id}")
async def get_product(product_id: int, db = Depends(get_db)):
    product = db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductPayload,
    db = Depends(get_db),
    current_seller = Depends(get_current_active_seller)
):
    # Auto-generate ID if not provided
    if not payload.id:
        existing_products = db.products.find({})
        max_id = max([p.get("id", 0) for p in existing_products] + [600])
        payload.id = max_id + 1
    else:
        if db.products.find_one({"id": payload.id}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with ID {payload.id} already exists"
            )

    new_prod = payload.dict()
    created = db.products.insert_one(new_prod)
    return {"message": "Product created successfully", "product": created or new_prod}


@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    payload: ProductPayload,
    db = Depends(get_db),
    current_seller = Depends(get_current_active_seller)
):
    existing = db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    db.products.update_one({"id": product_id}, update_data)
    
    updated = db.products.find_one({"id": product_id})
    return {"message": "Product updated successfully", "product": updated}


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db = Depends(get_db),
    current_admin = Depends(get_current_active_admin)
):
    existing = db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    db.products.delete_one({"id": product_id})
    return {"message": f"Product with ID {product_id} deleted successfully"}


@router.get("/categories")
async def get_categories(db = Depends(get_db)):
    return db.categories.find({})
