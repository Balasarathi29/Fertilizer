from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from database.connection import get_db
from middleware.auth_middleware import get_current_active_admin

router = APIRouter(tags=["Flash Sales"])


class FlashSalePayload(BaseModel):
    product_id: int
    sale_price: float
    start_datetime: str  # ISO 8601 string e.g. "2026-08-18T10:00:00.000Z"
    end_datetime: str    # ISO 8601 string e.g. "2026-08-19T10:00:00.000Z"
    product_name: Optional[str] = None
    original_price: Optional[float] = None
    discount_percentage: Optional[float] = None


def parse_datetime(dt_str: str) -> datetime:
    """Robustly parse ISO 8601 datetime string to UTC aware datetime object."""
    if not dt_str:
        raise HTTPException(status_code=400, detail="Datetime string cannot be empty")
    try:
        clean_str = dt_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ISO datetime format: {dt_str}")


# ─── GET ALL FLASH SALES (Admin only) ───
@router.get("/flash-sales")
async def get_all_flash_sales(
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    items = db.flash_sales.find({})
    now = datetime.now(timezone.utc)
    results = []
    for sale in items:
        sale_dict = dict(sale)
        if sale_dict.get('is_disabled'):
            st = 'DISABLED'
        else:
            try:
                s_dt = parse_datetime(sale_dict.get('start_datetime', ''))
                e_dt = parse_datetime(sale_dict.get('end_datetime', ''))
                if now < s_dt:
                    st = 'SCHEDULED'
                elif now > e_dt:
                    st = 'EXPIRED'
                else:
                    st = 'ACTIVE'
            except Exception:
                st = 'EXPIRED'
        sale_dict['status'] = st
        results.append(sale_dict)
    return results


# ─── GET ACTIVE FLASH SALES (Public for Farmer Page) ───
@router.get("/flash-sales/active")
async def get_active_flash_sales(db=Depends(get_db)):
    now = datetime.now(timezone.utc)
    all_sales = db.flash_sales.find({})
    active = []
    for sale in all_sales:
        if sale.get('is_disabled'):
            continue
        try:
            start_dt = parse_datetime(sale.get('start_datetime', ''))
            end_dt = parse_datetime(sale.get('end_datetime', ''))
        except Exception:
            continue

        if start_dt <= now <= end_dt:
            prod = db.products.find_one({'id': sale.get('product_id')})
            sale_dict = dict(sale)
            if prod:
                sale_dict['image'] = prod.get('image', 'seed_tomato.jpg')
                sale_dict['placeholder'] = prod.get('placeholder', '🌱')
                sale_dict['category'] = prod.get('category', 'General')
                sale_dict['rating'] = prod.get('rating', 5.0)
                sale_dict['reviews'] = prod.get('reviews', 0)
                if not sale_dict.get('product_name'):
                    sale_dict['product_name'] = prod.get('name', '')
                if not sale_dict.get('original_price'):
                    sale_dict['original_price'] = float(prod.get('price', 0.0))
            sale_dict['status'] = 'ACTIVE'
            active.append(sale_dict)
    return active


# ─── GET SINGLE FLASH SALE (Admin only) ───
@router.get("/flash-sales/{sale_id}")
async def get_flash_sale(
    sale_id: int,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    sale = db.flash_sales.find_one({'id': sale_id})
    if not sale:
        raise HTTPException(status_code=404, detail='Flash sale not found')
    return sale


# ─── CREATE FLASH SALE (Admin only) ───
@router.post("/flash-sales", status_code=201)
async def create_flash_sale(
    payload: FlashSalePayload,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    start_dt = parse_datetime(payload.start_datetime)
    end_dt = parse_datetime(payload.end_datetime)

    if start_dt >= end_dt:
        raise HTTPException(status_code=400, detail="Start Date/Time must be strictly before End Date/Time")

    # 1. Fetch Product directly from Database Catalog
    prod = db.products.find_one({'id': payload.product_id})
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product with ID {payload.product_id} does not exist in database catalog")

    product_name = prod.get('name', '')
    original_price = float(prod.get('price', 0.0))

    if original_price <= 0:
        raise HTTPException(status_code=400, detail="Product original price in database must be greater than zero")

    sale_price = float(payload.sale_price)
    if sale_price <= 0:
        raise HTTPException(status_code=400, detail="Sale price must be greater than zero")

    if sale_price > original_price:
        raise HTTPException(
            status_code=400,
            detail=f"Sale price (₹{sale_price}) cannot be greater than original catalog price (₹{original_price})"
        )

    # 2. Automatic Discount Calculation: ((Original Price - Sale Price) / Original Price) * 100
    discount_percentage = round(((original_price - sale_price) / original_price) * 100, 2)
    if discount_percentage < 0:
        raise HTTPException(status_code=400, detail="Discount percentage cannot be negative")

    doc = {
        'product_id': payload.product_id,
        'product_name': product_name,
        'sale_price': sale_price,
        'original_price': original_price,
        'discount_percentage': discount_percentage,
        'start_datetime': start_dt.isoformat(),
        'end_datetime': end_dt.isoformat(),
        'is_disabled': False
    }
    created = db.flash_sales.insert_one(doc)
    return {'message': 'Flash sale created successfully', 'flash_sale': created}


# ─── UPDATE FLASH SALE (Admin only) ───
@router.put("/flash-sales/{sale_id}")
async def update_flash_sale(
    sale_id: int,
    payload: FlashSalePayload,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    existing = db.flash_sales.find_one({'id': sale_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Flash sale not found')

    start_dt = parse_datetime(payload.start_datetime)
    end_dt = parse_datetime(payload.end_datetime)

    if start_dt >= end_dt:
        raise HTTPException(status_code=400, detail="Start Date/Time must be strictly before End Date/Time")

    prod = db.products.find_one({'id': payload.product_id})
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product with ID {payload.product_id} does not exist in catalog")

    product_name = prod.get('name', '')
    original_price = float(prod.get('price', 0.0))

    sale_price = float(payload.sale_price)
    if sale_price <= 0 or sale_price > original_price:
        raise HTTPException(status_code=400, detail=f"Invalid sale price (₹{sale_price}). Must be > 0 and <= ₹{original_price}")

    discount_percentage = round(((original_price - sale_price) / original_price) * 100, 2)

    update_data = {
        'product_id': payload.product_id,
        'product_name': product_name,
        'sale_price': sale_price,
        'original_price': original_price,
        'discount_percentage': discount_percentage,
        'start_datetime': start_dt.isoformat(),
        'end_datetime': end_dt.isoformat(),
    }
    db.flash_sales.update_one({'id': sale_id}, update_data)
    return {'message': f'Flash sale {sale_id} updated'}


# ─── DISABLE FLASH SALE (Admin only) ───
@router.patch("/flash-sales/{sale_id}/disable")
async def disable_flash_sale(
    sale_id: int,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    existing = db.flash_sales.find_one({'id': sale_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Flash sale not found')
    db.flash_sales.update_one({'id': sale_id}, {'is_disabled': True})
    return {'message': f'Flash sale {sale_id} disabled'}


# ─── RE-ENABLE FLASH SALE (Admin only) ───
@router.patch("/flash-sales/{sale_id}/enable")
async def enable_flash_sale(
    sale_id: int,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    existing = db.flash_sales.find_one({'id': sale_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Flash sale not found')
    db.flash_sales.update_one({'id': sale_id}, {'is_disabled': False})
    return {'message': f'Flash sale {sale_id} enabled'}


# ─── DELETE FLASH SALE (Admin only) ───
@router.delete("/flash-sales/{sale_id}")
async def delete_flash_sale(
    sale_id: int,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    existing = db.flash_sales.find_one({'id': sale_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Flash sale not found')
    db.flash_sales.delete_one({'id': sale_id})
    return {'message': f'Flash sale {sale_id} deleted'}

