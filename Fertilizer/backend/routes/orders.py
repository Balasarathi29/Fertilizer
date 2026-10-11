import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from database.connection import get_db
from middleware.auth_middleware import (
    get_current_user,
    get_current_active_admin,
    get_current_active_seller,
    require_customer_role
)

router = APIRouter(tags=["Cart, Wishlist, Orders, Notifications, Bhoomi Card & Seller"])


# ─── SCHEMAS ───

class CartItemPayload(BaseModel):
    product_id: int
    quantity: int = 1


class WishlistPayload(BaseModel):
    product_id: int


class OrderCreatePayload(BaseModel):
    items: List[dict]  # list of {product_id, quantity, price, name, image}
    shipping_address: str
    payment_method: str = "UPI"
    total_amount: float
    discount_amount: Optional[float] = 0.0
    shipping_charge: Optional[float] = 0.0
    coupon_code: Optional[str] = None
    delivery_location: Optional[dict] = None  # Snapshot of GPS delivery location


class OrderStatusUpdate(BaseModel):
    order_status: str  # Order Placed, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled
    payment_status: Optional[str] = None


class ReviewPayload(BaseModel):
    product_id: int
    rating: float
    comment: str


class AnnouncementPayload(BaseModel):
    title: str
    message: str


class BhoomiCardConfigPayload(BaseModel):
    price: float
    discount_percentage: float
    validity_days: int
    is_enabled: bool = True
    description: Optional[str] = None


class CustomerCardStatusUpdatePayload(BaseModel):
    status: str  # Active, Disabled, Expired


# ─── CART ENDPOINTS ───

@router.get("/cart")
async def get_cart(current_user: dict = Depends(require_customer_role), db = Depends(get_db)):
    email = current_user["email"]
    items = db.carts.find({"email": email})
    return {"email": email, "items": items}


@router.post("/cart/add")
async def add_to_cart(
    payload: CartItemPayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    existing_item = db.carts.find_one({"email": email, "product_id": payload.product_id})

    if existing_item:
        new_qty = existing_item.get("quantity", 1) + payload.quantity
        db.carts.update_one({"email": email, "product_id": payload.product_id}, {"$set": {"quantity": new_qty}})
    else:
        product = db.products.find_one({"id": payload.product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        item_doc = {
            "email": email,
            "product_id": payload.product_id,
            "quantity": payload.quantity,
            "name": product.get("name", ""),
            "price": product.get("price", 0.0),
            "image": product.get("image", "")
        }
        db.carts.insert_one(item_doc)

    items = db.carts.find({"email": email})
    return {"message": "Item added to cart", "cart": items}


@router.post("/cart/remove")
async def remove_from_cart(
    payload: WishlistPayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    db.carts.delete_one({"email": email, "product_id": payload.product_id})
    items = db.carts.find({"email": email})
    return {"message": "Item removed from cart", "cart": items}


@router.post("/cart/update")
async def update_cart_quantity(
    payload: CartItemPayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    safe_qty = max(1, int(payload.quantity))  # Enforce minimum quantity = 1
    db.carts.update_one({"email": email, "product_id": payload.product_id}, {"$set": {"quantity": safe_qty}})
    items = db.carts.find({"email": email})
    return {"message": "Cart updated", "cart": items}


# ─── WISHLIST ENDPOINTS (STRICT USER PERSISTENCE) ───

@router.get("/wishlist")
async def get_wishlist(current_user: dict = Depends(require_customer_role), db = Depends(get_db)):
    email = current_user["email"]
    items = db.wishlists.find({"email": email})
    product_ids = [i.get("product_id") for i in items if i.get("product_id")]

    # Populate full product details from DB
    populated_products = []
    for pid in product_ids:
        prod = db.products.find_one({"id": pid})
        if prod:
            populated_products.append(prod)

    return {
        "email": email,
        "product_ids": product_ids,
        "products": populated_products
    }


@router.post("/wishlist/add")
async def add_to_wishlist(
    payload: WishlistPayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    existing = db.wishlists.find_one({"email": email, "product_id": payload.product_id})

    if not existing:
        db.wishlists.insert_one({"email": email, "product_id": payload.product_id})

    items = db.wishlists.find({"email": email})
    product_ids = [i.get("product_id") for i in items if i.get("product_id")]
    populated_products = [db.products.find_one({"id": pid}) for pid in product_ids if db.products.find_one({"id": pid})]
    return {"message": "Product added to wishlist", "product_ids": product_ids, "products": populated_products}


@router.post("/wishlist/remove")
async def remove_from_wishlist(
    payload: WishlistPayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    db.wishlists.delete_one({"email": email, "product_id": payload.product_id})

    items = db.wishlists.find({"email": email})
    product_ids = [i.get("product_id") for i in items if i.get("product_id")]
    populated_products = [db.products.find_one({"id": pid}) for pid in product_ids if db.products.find_one({"id": pid})]
    return {"message": "Product removed from wishlist", "product_ids": product_ids, "products": populated_products}


@router.post("/wishlist/toggle")
async def toggle_wishlist(
    payload: WishlistPayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    existing = db.wishlists.find_one({"email": email, "product_id": payload.product_id})

    if existing:
        db.wishlists.delete_one({"email": email, "product_id": payload.product_id})
        action = "removed from"
    else:
        db.wishlists.insert_one({"email": email, "product_id": payload.product_id})
        action = "added to"

    items = db.wishlists.find({"email": email})
    product_ids = [i.get("product_id") for i in items if i.get("product_id")]
    populated_products = [db.products.find_one({"id": pid}) for pid in product_ids if db.products.find_one({"id": pid})]
    return {"message": f"Product {action} wishlist", "product_ids": product_ids, "products": populated_products}


# ─── BHOOMI CARD ENDPOINTS (MEMBERSHIP & LOYALTY) ───

@router.get("/bhoomi-card/status")
async def get_bhoomi_card_status(current_user: dict = Depends(require_customer_role), db = Depends(get_db)):
    email = current_user["email"]

    # Check eligibility (At least 1 completed/placed order)
    user_orders = db.orders.find({"email": email})
    completed_orders_count = len(user_orders)
    is_eligible = completed_orders_count >= 1

    # Check customer card record
    card_doc = db.customer_bhoomi_cards.find_one({"email": email})

    # Get global card config
    config_doc = db.bhoomi_card_configs.find_one({})
    if not config_doc:
        config_doc = {
            "price": 200.0,
            "discount_percentage": 10.0,
            "validity_days": 365,
            "is_enabled": True,
            "description": "Exclusive Bhoomi Card membership discount on all organic agriculture products."
        }

    return {
        "email": email,
        "is_eligible": is_eligible,
        "completed_orders_count": completed_orders_count,
        "card": card_doc,
        "config": config_doc
    }


@router.post("/bhoomi-card/purchase")
async def purchase_bhoomi_card(current_user: dict = Depends(require_customer_role), db = Depends(get_db)):
    email = current_user["email"]
    user_name = current_user.get("name") or current_user.get("full_name") or "Valued Customer"

    # 1. Eligibility Check
    user_orders = db.orders.find({"email": email})
    if len(user_orders) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete at least 1 purchase before becoming eligible to purchase a Bhoomi Card."
        )

    # 2. Config Check
    config_doc = db.bhoomi_card_configs.find_one({})
    if not config_doc:
        config_doc = {"price": 200.0, "discount_percentage": 10.0, "validity_days": 365, "is_enabled": True}

    if not config_doc.get("is_enabled", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bhoomi Card membership is currently disabled by site administration."
        )

    # 3. Existing Active Card Check
    existing_card = db.customer_bhoomi_cards.find_one({"email": email})
    if existing_card and existing_card.get("status") == "Active":
        exp_str = existing_card.get("expiry_date", "")
        if exp_str:
            try:
                exp_dt = datetime.fromisoformat(exp_str)
                if datetime.utcnow() <= exp_dt:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"You already have an Active Bhoomi Card ({existing_card.get('card_number')}) valid until {exp_str[:10]}."
                    )
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You already have an Active Bhoomi Card ({existing_card.get('card_number')})."
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You already have an Active Bhoomi Card ({existing_card.get('card_number')})."
            )

    # 4. Create Card
    price = float(config_doc.get("price", 100.0))
    discount_pct = float(config_doc.get("discount_percentage", 10.0))
    validity_days = int(config_doc.get("validity_days", 365))

    now = datetime.utcnow()
    expiry = now + timedelta(days=validity_days)
    card_number = f"BH-CARD-{uuid.uuid4().hex[:6].upper()}"

    card_record = {
        "email": email,
        "user_id": current_user.get("id") or current_user.get("user_id"),
        "customer_name": user_name,
        "card_number": card_number,
        "price_paid": price,
        "discount_percentage": discount_pct,
        "status": "Active",
        "purchase_date": now.isoformat(),
        "expiry_date": expiry.isoformat()
    }

    if existing_card:
        db.customer_bhoomi_cards.update_one({"email": email}, {"$set": card_record})
    else:
        db.customer_bhoomi_cards.insert_one(card_record)

    # 5. Send Real Notification
    db.notifications.insert_one({
        "email": email,
        "title": "🎉 Bhoomi Card Membership Activated!",
        "message": f"Congratulations {user_name}! Your Bhoomi Card ({card_number}) is active. Enjoy {discount_pct}% discount on eligible future orders.",
        "is_read": False
    })

    return {
        "message": "Bhoomi Card purchased and activated successfully!",
        "card": card_record
    }


# ─── ADMIN BHOOMI CARD MANAGEMENT ENDPOINTS ───

@router.get("/admin/bhoomi-card/config")
async def get_admin_bhoomi_card_config(current_admin = Depends(get_current_active_admin), db = Depends(get_db)):
    config_doc = db.bhoomi_card_configs.find_one({})
    if not config_doc:
        config_doc = {
            "price": 200.0,
            "discount_percentage": 10.0,
            "validity_days": 365,
            "is_enabled": True,
            "description": "Exclusive Bhoomi Card membership discount on all organic agriculture products."
        }
    return config_doc


@router.put("/admin/bhoomi-card/config")
async def update_admin_bhoomi_card_config(
    payload: BhoomiCardConfigPayload,
    current_admin = Depends(get_current_active_admin),
    db = Depends(get_db)
):
    upd = {
        "price": payload.price,
        "discount_percentage": payload.discount_percentage,
        "validity_days": payload.validity_days,
        "is_enabled": payload.is_enabled,
        "description": payload.description or "Exclusive Bhoomi Card membership discount on all organic agriculture products."
    }

    existing = db.bhoomi_card_configs.find_one({})
    if existing:
        db.bhoomi_card_configs.update_one({"id": existing.get("id", 1)}, {"$set": upd})
    else:
        db.bhoomi_card_configs.insert_one(upd)

    return {"message": "Bhoomi Card configuration updated successfully!", "config": upd}


@router.get("/admin/bhoomi-card/customers")
async def get_admin_bhoomi_card_customers(current_admin = Depends(get_current_active_admin), db = Depends(get_db)):
    return db.customer_bhoomi_cards.find({})


@router.put("/admin/bhoomi-card/customers/{card_id}/status")
async def update_customer_card_status(
    card_id: int,
    payload: CustomerCardStatusUpdatePayload,
    current_admin = Depends(get_current_active_admin),
    db = Depends(get_db)
):
    card = db.customer_bhoomi_cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Customer Bhoomi Card not found")

    db.customer_bhoomi_cards.update_one({"id": card_id}, {"$set": {"status": payload.status}})
    return {"message": f"Customer card status updated to {payload.status}"}


# ─── ORDERS & CHECKOUT ENDPOINTS ───

@router.post("/orders")
async def create_order(
    payload: OrderCreatePayload,
    current_user: dict = Depends(require_customer_role),
    db = Depends(get_db)
):
    email = current_user["email"]
    user_name = current_user.get("name") or current_user.get("full_name") or "Customer"
    order_id = f"BB-ORD-{uuid.uuid4().hex[:8].upper()}"

    # Check for Active Bhoomi Card Discount
    card = db.customer_bhoomi_cards.find_one({"email": email})
    discount_amount = 0.0
    if card and card.get("status") == "Active":
        exp_str = card.get("expiry_date", "")
        is_valid = True
        if exp_str:
            try:
                exp_dt = datetime.fromisoformat(exp_str)
                if datetime.utcnow() > exp_dt:
                    is_valid = False
            except Exception:
                pass
        if is_valid:
            disc_pct = float(card.get("discount_percentage", 10.0))
            discount_amount = round(payload.total_amount * (disc_pct / 100.0), 2)

    # Compute shipping charge server-side: below ₹200 = ₹60, ₹200+ = FREE
    items_subtotal = sum(
        float(i.get("price", 0)) * max(1, int(i.get("quantity", 1)))
        for i in payload.items
    )
    computed_shipping = 60.0 if items_subtotal < 200.0 else 0.0
    # Allow coupon-driven free shipping override from payload
    shipping_charge = 0.0 if payload.shipping_charge == 0 and items_subtotal >= 200.0 else computed_shipping
    # If client says 0 and we also compute 0, honor it
    if payload.shipping_charge == 0.0 and computed_shipping == 0.0:
        shipping_charge = 0.0
    elif payload.shipping_charge == 0.0 and computed_shipping > 0.0:
        # Coupon-driven free shipping — trust client
        shipping_charge = 0.0
    else:
        shipping_charge = computed_shipping

    final_total = max(0.0, items_subtotal - discount_amount + shipping_charge)
    items_json_str = json.dumps(payload.items)

    order_doc = {
        "order_id": order_id,
        "email": email,
        "customer_name": user_name,
        "name": user_name,
        "shipping_address": payload.shipping_address,
        "delivery_location_json": json.dumps(payload.delivery_location or {}),
        "payment_method": payload.payment_method,
        "items_subtotal": round(items_subtotal, 2),
        "shipping_charge": round(shipping_charge, 2),
        "discount_amount": round(discount_amount, 2),
        "total_amount": round(final_total, 2),
        "coupon_code": payload.coupon_code or "",
        "payment_status": "Paid" if payload.payment_method != "COD" else "Pending",
        "order_status": "Order Placed",
        "order_date": datetime.utcnow().isoformat(),
        "items_json": items_json_str
    }

    db.orders.insert_one(order_doc)

    # Clear user cart items in database
    all_cart_items = db.carts.find({"email": email})
    for item in all_cart_items:
        db.carts.delete_one({"email": email, "product_id": item.get("product_id")})

    # Reduce product stock
    for item in payload.items:
        pid = item.get("product_id")
        qty = max(1, int(item.get("quantity", 1)))
        prod = db.products.find_one({"id": pid})
        if prod:
            new_stock = max(0, prod.get("stock", 50) - qty)
            db.products.update_one({"id": pid}, {"$set": {"stock": new_stock}})

    # Create Real Order Placed Notification in Database
    disc_msg = f" (Discount Applied: ₹{discount_amount})" if discount_amount > 0 else ""
    db.notifications.insert_one({
        "email": email,
        "title": "✅ Order Placed Successfully",
        "message": f"Your order {order_id} of ₹{final_total}{disc_msg} was placed successfully and is being processed.",
        "is_read": False
    })

    return {"message": "Order placed successfully", "order_id": order_id, "order": order_doc, "discount_applied": discount_amount}


@router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user.get("role", "farmer").lower()
    if role in ["admin", "seller"]:
        res = db.orders.find({})
        return res[::-1] if res else []
    res = db.orders.find({"email": current_user["email"]})
    return res[::-1] if res else []


@router.get("/admin/orders")
async def get_all_orders_admin(current_admin = Depends(get_current_active_admin), db = Depends(get_db)):
    res = db.orders.find({})
    return res[::-1] if res else []


ALLOWED_TRANSITIONS = {
    "Order Placed": {"Confirmed", "Cancelled"},
    "Confirmed": {"Processing", "Cancelled"},
    "Processing": {"Shipped", "Cancelled"},
    "Shipped": {"Out for Delivery", "Cancelled"},
    "Out for Delivery": {"Delivered", "Cancelled"},
    "Delivered": set(),
    "Cancelled": set(),
    # Legacy support for old orders
    "Processing": {"Shipped", "Out for Delivery", "Cancelled"},
}


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    role = current_user.get("role", "").lower()
    if role not in ["admin", "seller"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    ord_record = db.orders.find_one({"order_id": order_id}) or db.orders.find_one({"_id": order_id})
    if not ord_record:
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = ord_record.get("order_status", "Processing")

    # Final State Check
    if current_status in ["Cancelled", "Delivered"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order {order_id} is in final status '{current_status}' and cannot be modified further."
        )

    target_status = payload.order_status
    allowed_targets = ALLOWED_TRANSITIONS.get(current_status, set())

    if target_status != current_status and target_status not in allowed_targets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid state transition: Cannot change order status from '{current_status}' to '{target_status}'. Allowed transitions: {list(allowed_targets)}."
        )

    upd = {"order_status": target_status}
    if payload.payment_status:
        upd["payment_status"] = payload.payment_status

    db.orders.update_one({"order_id": order_id}, upd)

    # Save real notification to customer database record
    customer_email = ord_record.get("email")
    if customer_email:
        db.notifications.insert_one({
            "email": customer_email,
            "title": f"Order {target_status}",
            "message": f"Your order {order_id} status has been updated to {target_status}.",
            "is_read": False
        })

    return {"message": f"Order {order_id} status updated to {target_status}"}


@router.get("/orders/track/{order_id}")
async def track_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Customer live tracking endpoint with ownership protection"""
    ord_record = db.orders.find_one({"order_id": order_id}) or db.orders.find_one({"_id": order_id})
    if not ord_record:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found. Please verify your Order ID.")

    role = current_user.get("role", "").lower()
    if role not in ["admin", "seller"] and ord_record.get("email") != current_user["email"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. You do not have permission to view another user's order.")

    items = []
    try:
        items = json.loads(ord_record.get("items_json", "[]"))
    except Exception:
        items = []

    order_date_str = ord_record.get("order_date") or datetime.utcnow().isoformat()
    try:
        od_dt = datetime.fromisoformat(order_date_str.replace("Z", "+00:00"))
    except Exception:
        od_dt = datetime.utcnow()

    # Calculate estimated delivery: 3 business days from order placement
    est_delivery_dt = od_dt + timedelta(days=3)
    est_delivery_str = est_delivery_dt.strftime("%d %b %Y, by 8:00 PM")

    current_status = ord_record.get("order_status", "Order Placed")
    status_steps = [
        ("Order Placed", "Order Placed & Confirmed", "We have received your order and payment details.", od_dt),
        ("Confirmed", "Seller Approved", "Seller has accepted the order and started preparing items.", od_dt + timedelta(minutes=45)),
        ("Processing", "Packed at Agri Hub", "Item packed with eco-friendly protective packaging.", od_dt + timedelta(hours=3)),
        ("Shipped", "In Transit", f"Dispatched via Bhoomi Express. Tracking #{order_id[-6:]}", od_dt + timedelta(hours=18)),
        ("Out for Delivery", "Out for Delivery", "Delivery executive is on the way to your farm/home.", od_dt + timedelta(days=2, hours=8)),
        ("Delivered", "Delivered Successfully", "Package delivered securely to customer.", od_dt + timedelta(days=3))
    ]

    status_order = ["Order Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"]
    current_idx = status_order.index(current_status) if current_status in status_order else 0

    timeline = []
    for idx, (code, title, desc, step_time) in enumerate(status_steps):
        is_completed = (current_status != "Cancelled") and (current_idx >= idx)
        is_current = (current_status != "Cancelled") and (current_idx == idx)
        timeline.append({
            "step": code,
            "title": title,
            "description": desc,
            "time": step_time.strftime("%d %b, %I:%M %p"),
            "completed": is_completed,
            "current": is_current
        })

    if current_status == "Cancelled":
        timeline.append({
            "step": "Cancelled",
            "title": "Order Cancelled",
            "description": "This order was cancelled. Any refund has been credited back.",
            "time": datetime.utcnow().strftime("%d %b, %I:%M %p"),
            "completed": True,
            "current": True
        })

    return {
        "order_id": order_id,
        "order_date": order_date_str,
        "order_status": current_status,
        "customer_name": ord_record.get("customer_name") or ord_record.get("name") or "Customer",
        "shipping_address": ord_record.get("shipping_address", ""),
        "delivery_location": ord_record.get("delivery_location", {}),
        "payment_method": ord_record.get("payment_method", "UPI"),
        "payment_status": ord_record.get("payment_status", "Paid"),
        "items": items,
        "items_subtotal": ord_record.get("items_subtotal", ord_record.get("total_amount", 0)),
        "shipping_charge": ord_record.get("shipping_charge", 0.0),
        "discount_amount": ord_record.get("discount_amount", 0.0),
        "total_amount": ord_record.get("total_amount", 0.0),
        "courier_partner": "Bhoomi AgriLogistics Express",
        "tracking_number": f"BB-EXP-{order_id[-6:]}",
        "delivery_pin": "5642",
        "estimated_delivery": est_delivery_str,
        "timeline": timeline
    }


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Customer self-service order cancellation before shipping"""
    ord_record = db.orders.find_one({"order_id": order_id}) or db.orders.find_one({"_id": order_id})
    if not ord_record:
        raise HTTPException(status_code=404, detail="Order not found")

    user_email = current_user["email"]
    user_role = current_user.get("role", "").lower()

    # Permission check: must be the owner or admin/seller
    if user_role not in ["admin", "seller"] and ord_record.get("email") != user_email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to cancel this order")

    current_status = ord_record.get("order_status", "Order Placed")
    if current_status in ["Shipped", "Out for Delivery", "Delivered"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order {order_id} because it has already reached status '{current_status}'. Please contact customer support."
        )
    if current_status == "Cancelled":
        raise HTTPException(status_code=400, detail=f"Order {order_id} is already cancelled.")

    db.orders.update_one({"order_id": order_id}, {"order_status": "Cancelled"})

    # Restore stock for items
    try:
        items = json.loads(ord_record.get("items_json", "[]"))
        for item in items:
            pid = item.get("product_id")
            qty = item.get("quantity", 1)
            prod = db.products.find_one({"id": pid})
            if prod:
                db.products.update_one({"id": pid}, {"$set": {"stock": prod.get("stock", 0) + qty}})
    except Exception:
        pass

    # Create notification
    db.notifications.insert_one({
        "email": ord_record.get("email", user_email),
        "title": "❌ Order Cancelled",
        "message": f"Your order {order_id} of ₹{ord_record.get('total_amount', 0)} has been cancelled successfully.",
        "is_read": False
    })

    return {"message": f"Order {order_id} cancelled successfully", "order_id": order_id, "order_status": "Cancelled"}


# ─── REVIEWS ───

@router.post("/reviews")
async def submit_review(
    payload: ReviewPayload,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    rev_doc = {
        "email": current_user["email"],
        "name": current_user.get("name") or current_user.get("full_name") or "User",
        "product_id": payload.product_id,
        "rating": payload.rating,
        "comment": payload.comment
    }
    db.reviews.insert_one(rev_doc)
    return {"message": "Review submitted successfully", "review": rev_doc}


@router.get("/reviews")
async def get_reviews(db = Depends(get_db)):
    return db.reviews.find({})


# ─── REAL NOTIFICATIONS ENDPOINTS ───

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    email = current_user["email"]
    user_notifications = db.notifications.find({"email": email})
    return user_notifications


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    db.notifications.update_one({"id": notification_id, "email": current_user["email"]}, {"$set": {"is_read": True}})
    return {"message": "Notification marked as read"}


@router.post("/notifications/announcement")
async def send_announcement(
    payload: AnnouncementPayload,
    current_admin = Depends(get_current_active_admin),
    db = Depends(get_db)
):
    all_users = db.users.find({})
    count = 0
    for u in all_users:
        if u.get("email"):
            db.notifications.insert_one({
                "email": u["email"],
                "title": f"📢 Announcement: {payload.title}",
                "message": payload.message,
                "is_read": False
            })
            count += 1
    return {"message": f"Announcement sent to {count} users"}


# ─── SELLER ENDPOINTS (RBAC BOUNDARY) ───

@router.get("/seller/stats")
async def get_seller_stats(current_seller = Depends(get_current_active_seller), db = Depends(get_db)):
    all_products = db.products.find({})
    all_orders = db.orders.find({})
    all_reviews = db.reviews.find({})

    # Calculate seller total sales and orders
    total_sales = sum(o.get("total_amount", 0) for o in all_orders)
    pending_orders = sum(1 for o in all_orders if o.get("order_status") in ["Pending", "Processing"])

    return {
        "metrics": {
            "myProductsCount": len(all_products),
            "myOrdersCount": len(all_orders),
            "myPendingOrders": pending_orders,
            "totalRevenue": total_sales,
            "reviewsCount": len(all_reviews),
            "storeRating": 4.8
        },
        "recentOrders": all_orders[-8:][::-1],
        "myProducts": all_products
    }


# ─── DASHBOARDS & ANALYTICS STATS ───

@router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    role = current_user.get("role", "farmer").lower()

    if role == "admin":
        all_orders = db.orders.find({})
        all_users = db.users.find({})
        all_products = db.products.find({})

        total_sales = sum(o.get("total_amount", 0) for o in all_orders)
        pending_orders = sum(1 for o in all_orders if o.get("order_status") in ["Pending", "Processing"])
        delivered_orders = sum(1 for o in all_orders if o.get("order_status") == "Delivered")
        cancelled_orders = sum(1 for o in all_orders if o.get("order_status") == "Cancelled")
        low_stock = sum(1 for p in all_products if 0 < p.get("stock", 0) <= 10)
        out_of_stock = sum(1 for p in all_products if p.get("stock", 0) <= 0)

        return {
            "role": "admin",
            "metrics": {
                "totalSales": total_sales,
                "totalRevenue": total_sales,
                "totalOrders": len(all_orders),
                "totalUsers": len(all_users),
                "totalProducts": len(all_products),
                "pendingOrders": pending_orders,
                "deliveredOrders": delivered_orders,
                "cancelledOrders": cancelled_orders,
                "lowStockProducts": low_stock,
                "outOfStockProducts": out_of_stock
            },
            "recentOrders": all_orders[-10:][::-1]
        }
    else:
        user_orders = db.orders.find({"email": current_user["email"]})
        total_spent = sum(o.get("total_amount", 0) for o in user_orders)
        soil_tests = db.soil_analysis.count_documents({"email": current_user["email"]})

        return {
            "role": role,
            "metrics": {
                "totalSpent": total_spent,
                "ordersPlaced": len(user_orders),
                "soilTestsConducted": soil_tests
            },
            "recentOrders": user_orders[-5:][::-1]
        }
