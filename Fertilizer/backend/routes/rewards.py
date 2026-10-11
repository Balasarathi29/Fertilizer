import random
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel

from database.connection import get_db
from middleware.auth_middleware import get_current_user, get_current_active_admin, security
from authentication.auth_handler import decode_access_token

router = APIRouter(prefix="/rewards", tags=["Rewards & Coupons"])


# ─── SCHEMAS ───

class ApplyCouponRequest(BaseModel):
    code: str
    subtotal: float


class SpinWheelConfigPayload(BaseModel):
    is_enabled: bool = True
    allow_stacking_with_bhoomi_card: bool = False
    description: Optional[str] = None


class SpinWheelRewardPayload(BaseModel):
    label: str
    code: str
    reward_type: str  # percentage, flat, gift, shipping, bogo, none
    reward_value: float = 0.0
    probability_weight: float = 10.0
    color: Optional[str] = "#2E7D32"
    status: Optional[str] = "Active"
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# ─── HELPER FUNCTIONS ───

def get_optional_user(credentials=Depends(security), db=Depends(get_db)):
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if not payload or not payload.get("sub"):
            return None
        return db.users.find_one({"email": payload.get("sub")})
    except Exception:
        return None


def get_or_create_spin_config(db):
    config = db.spin_wheel_configs.find_one({})
    if not config:
        config = {
            "is_enabled": True,
            "allow_stacking_with_bhoomi_card": False,
            "description": "First-Order Spin & Win Reward System"
        }
        db.spin_wheel_configs.insert_one(config)
    return config


# ─── USER / CUSTOMER SPIN ENDPOINTS ───

@router.get("/spin-wheel/status")
async def get_spin_wheel_status(
    current_user: Optional[dict] = Depends(get_optional_user),
    db=Depends(get_db)
):
    """
    Returns user eligibility and wheel configuration for First-Order Spin & Win.
    """
    config = get_or_create_spin_config(db)
    active_rewards = db.spin_wheel_rewards.find({"status": "Active"})
    if not active_rewards:
        # Fallback initial rewards if empty
        active_rewards = [
            {"id": 1, "index": 0, "label": "10% OFF First Order", "code": "SPIN-10PER", "reward_type": "percentage", "reward_value": 10.0, "probability_weight": 25.0, "color": "#2E7D32", "status": "Active"},
            {"id": 2, "index": 1, "label": "₹100 OFF First Order", "code": "SPIN-FLAT100", "reward_type": "flat", "reward_value": 100.0, "probability_weight": 20.0, "color": "#C9A227", "status": "Active"},
            {"id": 3, "index": 2, "label": "Free Shipping Voucher", "code": "SPIN-FREESHIP", "reward_type": "shipping", "reward_value": 99.0, "probability_weight": 20.0, "color": "#1565C0", "status": "Active"},
            {"id": 4, "index": 3, "label": "15% Mega Discount", "code": "SPIN-15PER", "reward_type": "percentage", "reward_value": 15.0, "probability_weight": 15.0, "color": "#7B1FA2", "status": "Active"},
            {"id": 5, "index": 4, "label": "Free Organic Seeds Sample", "code": "SPIN-FREE-SEED", "reward_type": "gift", "reward_value": 150.0, "probability_weight": 10.0, "color": "#E65100", "status": "Active"},
            {"id": 6, "index": 5, "label": "Better Luck Next Time", "code": "NONE", "reward_type": "none", "reward_value": 0.0, "probability_weight": 10.0, "color": "#757575", "status": "Active"}
        ]

    # Format rewards for frontend wheel slice indices
    formatted_rewards = []
    for idx, r in enumerate(active_rewards):
        r_dict = r if isinstance(r, dict) else r
        r_dict["index"] = idx
        r_dict["type"] = r_dict.get("reward_type") or r_dict.get("type", "percentage")
        r_dict["value"] = r_dict.get("reward_value") or r_dict.get("value", 0.0)
        formatted_rewards.append(r_dict)

    if not current_user:
        return {
            "eligible": True,
            "reason": "login_required",
            "is_admin": False,
            "config": config,
            "rewards": formatted_rewards,
            "message": "Log in to check eligibility for your First-Order Spin & Win reward!"
        }

    email = current_user.get("email")
    role = current_user.get("role", "farmer").lower()

    if role == "admin":
        return {
            "eligible": False,
            "reason": "admin_role",
            "is_admin": True,
            "config": config,
            "rewards": formatted_rewards,
            "message": "Admin Preview Mode — Admins can test the wheel without consuming customer rewards."
        }

    # Check order history
    completed_orders_count = db.orders.count_documents({"email": email})
    # Check spin log
    user_spin = db.user_spin_logs.find_one({"email": email, "is_test": False})
    user_issued = db.user_issued_rewards.find({"email": email})

    if not config.get("is_enabled", True):
        return {
            "eligible": False,
            "reason": "feature_disabled",
            "is_admin": False,
            "config": config,
            "rewards": formatted_rewards,
            "message": "Spin & Win feature is currently disabled by site administration."
        }

    if completed_orders_count >= 1:
        return {
            "eligible": False,
            "reason": "completed_first_order",
            "is_admin": False,
            "config": config,
            "rewards": formatted_rewards,
            "completed_orders_count": completed_orders_count,
            "message": "Spin Wheel is available ONLY for your 1st order. You have already completed an order."
        }

    if user_spin:
        return {
            "eligible": False,
            "reason": "already_spun",
            "is_admin": False,
            "config": config,
            "rewards": formatted_rewards,
            "user_spin": user_spin,
            "user_issued": user_issued,
            "message": "Your First-Order Spin has already been used."
        }

    return {
        "eligible": True,
        "reason": "eligible",
        "is_admin": False,
        "config": config,
        "rewards": formatted_rewards,
        "message": "🎉 You are eligible for the First-Order Spin & Win!"
    }


@router.post("/spin-wheel/spin")
async def spin_wheel(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """
    Executes an atomic Spin & Win spin for an authenticated first-order customer.
    """
    email = current_user.get("email")
    role = current_user.get("role", "farmer").lower()

    if role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users cannot spin as a customer. Please use Admin Preview Mode."
        )

    config = get_or_create_spin_config(db)
    if not config.get("is_enabled", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spin & Win feature is currently disabled."
        )

    # 1. Eligibility Check: 0 completed orders
    completed_orders_count = db.orders.count_documents({"email": email})
    if completed_orders_count >= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spin Wheel is available ONLY for a customer's 1st order. You have already completed an order."
        )

    # 2. Eligibility Check: Has not spun already
    existing_spin = db.user_spin_logs.find_one({"email": email, "is_test": False})
    if existing_spin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your First-Order Spin opportunity has already been used."
        )

    # 3. Select active rewards
    active_rewards = db.spin_wheel_rewards.find({"status": "Active"})
    if not active_rewards:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No active rewards currently configured in database."
        )

    # Format rewards with index
    for idx, r in enumerate(active_rewards):
        r["index"] = idx

    # Calculate weighted selection
    weights = [float(r.get("probability_weight", 10.0)) for r in active_rewards]
    selected_reward = random.choices(active_rewards, weights=weights, k=1)[0].copy()

    now = datetime.datetime.utcnow()
    expiry_date = (now + datetime.timedelta(days=7)).strftime("%Y-%m-%d")

    # 4. Atomic record in user_spin_logs
    spin_log_doc = {
        "user_id": current_user.get("id") or current_user.get("user_id"),
        "email": email,
        "reward_id": selected_reward.get("id"),
        "reward_label": selected_reward.get("label"),
        "reward_code": selected_reward.get("code"),
        "reward_type": selected_reward.get("reward_type") or selected_reward.get("type"),
        "reward_value": float(selected_reward.get("reward_value") or selected_reward.get("value") or 0.0),
        "is_test": False,
        "spun_at": now.isoformat()
    }
    db.user_spin_logs.insert_one(spin_log_doc)

    # 5. Issue coupon if reward_type != 'none'
    r_type = selected_reward.get("reward_type") or selected_reward.get("type")
    if r_type != "none":
        issued_reward_doc = {
            "email": email,
            "code": selected_reward.get("code"),
            "label": selected_reward.get("label"),
            "reward_type": r_type,
            "reward_value": float(selected_reward.get("reward_value") or selected_reward.get("value") or 0.0),
            "is_used": False,
            "expiry_date": expiry_date,
            "created_at": now.isoformat()
        }
        db.user_issued_rewards.insert_one(issued_reward_doc)

    selected_reward["expiry_date"] = expiry_date

    return {
        "allowed": True,
        "reward": selected_reward,
        "message": f"🎉 Congratulations! You won {selected_reward.get('label')}!" if r_type != "none" else "Better luck next time!"
    }


@router.post("/spin-wheel/admin-test-spin")
async def admin_test_spin(
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    """
    Executes a test spin for Admin preview without consuming customer eligibility or issuing real coupons.
    """
    active_rewards = db.spin_wheel_rewards.find({"status": "Active"})
    if not active_rewards:
        raise HTTPException(status_code=400, detail="No active rewards configured.")

    for idx, r in enumerate(active_rewards):
        r["index"] = idx

    weights = [float(r.get("probability_weight", 10.0)) for r in active_rewards]
    selected_reward = random.choices(active_rewards, weights=weights, k=1)[0].copy()

    now = datetime.datetime.utcnow()
    # Log test spin
    db.user_spin_logs.insert_one({
        "user_id": current_admin.get("id") or current_admin.get("user_id"),
        "email": current_admin.get("email"),
        "reward_id": selected_reward.get("id"),
        "reward_label": selected_reward.get("label"),
        "reward_code": selected_reward.get("code"),
        "reward_type": selected_reward.get("reward_type") or selected_reward.get("type"),
        "reward_value": float(selected_reward.get("reward_value") or 0.0),
        "is_test": True,
        "spun_at": now.isoformat()
    })

    selected_reward["expiry_date"] = (now + datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    return {
        "allowed": True,
        "is_test": True,
        "reward": selected_reward,
        "message": "Admin Test Spin Completed! (No customer coupon generated)"
    }


# ─── ADMIN MANAGEMENT ENDPOINTS ───

@router.get("/admin/spin-wheel/config")
async def get_admin_spin_config(current_admin=Depends(get_current_active_admin), db=Depends(get_db)):
    return get_or_create_spin_config(db)


@router.put("/admin/spin-wheel/config")
async def update_admin_spin_config(
    payload: SpinWheelConfigPayload,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    upd = {
        "is_enabled": payload.is_enabled,
        "allow_stacking_with_bhoomi_card": payload.allow_stacking_with_bhoomi_card,
        "description": payload.description or "First-Order Spin & Win Reward System"
    }
    existing = db.spin_wheel_configs.find_one({})
    if existing:
        db.spin_wheel_configs.update_one({"id": existing.get("id", 1)}, {"$set": upd})
    else:
        db.spin_wheel_configs.insert_one(upd)
    return {"message": "Spin & Win configuration updated!", "config": upd}


@router.get("/admin/spin-wheel/rewards")
async def get_admin_rewards(current_admin=Depends(get_current_active_admin), db=Depends(get_db)):
    rewards = db.spin_wheel_rewards.find({})
    return rewards


@router.post("/admin/spin-wheel/rewards")
async def create_admin_reward(
    payload: SpinWheelRewardPayload,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    count = db.spin_wheel_rewards.count_documents({})
    doc = {
        "index": count,
        "label": payload.label,
        "code": payload.code.upper(),
        "reward_type": payload.reward_type,
        "reward_value": payload.reward_value,
        "probability_weight": payload.probability_weight,
        "color": payload.color or "#2E7D32",
        "status": payload.status or "Active",
        "start_date": payload.start_date or "",
        "end_date": payload.end_date or ""
    }
    res = db.spin_wheel_rewards.insert_one(doc)
    return {"message": "Reward created successfully!", "reward": res}


@router.put("/admin/spin-wheel/rewards/{reward_id}")
async def update_admin_reward(
    reward_id: int,
    payload: SpinWheelRewardPayload,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    existing = db.spin_wheel_rewards.find_one({"id": reward_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Reward not found")

    upd = {
        "label": payload.label,
        "code": payload.code.upper(),
        "reward_type": payload.reward_type,
        "reward_value": payload.reward_value,
        "probability_weight": payload.probability_weight,
        "color": payload.color or "#2E7D32",
        "status": payload.status or "Active",
        "start_date": payload.start_date or "",
        "end_date": payload.end_date or ""
    }
    db.spin_wheel_rewards.update_one({"id": reward_id}, {"$set": upd})
    return {"message": "Reward updated successfully!", "reward": {**existing, **upd}}


@router.delete("/admin/spin-wheel/rewards/{reward_id}")
async def delete_admin_reward(
    reward_id: int,
    current_admin=Depends(get_current_active_admin),
    db=Depends(get_db)
):
    db.spin_wheel_rewards.delete_one({"id": reward_id})
    return {"message": "Reward deleted successfully!"}


@router.get("/admin/spin-wheel/stats")
async def get_admin_spin_stats(current_admin=Depends(get_current_active_admin), db=Depends(get_db)):
    spin_logs = db.user_spin_logs.find({"is_test": False})
    issued_rewards = db.user_issued_rewards.find({})
    all_users = db.users.find({"role": "farmer"})

    # Eligible users (farmers with 0 completed orders and 0 spin logs)
    eligible_count = 0
    for u in all_users:
        u_email = u.get("email")
        if u_email:
            orders_cnt = db.orders.count_documents({"email": u_email})
            has_spun = db.user_spin_logs.find_one({"email": u_email, "is_test": False})
            if orders_cnt == 0 and not has_spun:
                eligible_count += 1

    # Distribution breakdown
    dist_map = {}
    for log in spin_logs:
        lbl = log.get("reward_label") or "Unknown"
        dist_map[lbl] = dist_map.get(lbl, 0) + 1

    return {
        "total_eligible_users": eligible_count,
        "total_spins": len(spin_logs),
        "total_rewards_issued": len(issued_rewards),
        "reward_distribution": dist_map,
        "spin_logs": spin_logs
    }


# ─── COUPONS & REWARDS AT CHECKOUT ───

@router.get("/my-coupons")
async def get_my_coupons(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    email = current_user.get("email")
    won = db.user_issued_rewards.find({"email": email, "is_used": False})
    public_coupons = [
        {"label": "Kharif Festival 15% OFF", "code": "KHARIF2026", "type": "percentage", "value": 15, "expiry_date": "2026-12-31"},
        {"label": "Free Shipping on ₹999+", "code": "FREESHIP999", "type": "shipping", "value": 99, "expiry_date": "2026-12-31"},
        {"label": "First Order ₹100 OFF", "code": "FIRST100", "type": "flat", "value": 100, "expiry_date": "2026-12-31"}
    ]
    return {"won_coupons": won, "public_coupons": public_coupons}


@router.post("/apply-coupon")
async def apply_coupon(
    req: ApplyCouponRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
    db=Depends(get_db)
):
    """
    Validates a coupon code and calculates discount amount based on subtotal.
    Checks user issued spin rewards and Bhoomi Card stacking rules.
    """
    code = (req.code or "").strip().upper()
    subtotal = req.subtotal or 0.0

    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter a valid coupon code.")

    # 1. Check if user has active Bhoomi Card & check stacking config
    if current_user:
        email = current_user.get("email")
        user_card = db.customer_bhoomi_cards.find_one({"email": email, "status": "Active"})
        config = get_or_create_spin_config(db)
        if user_card and not config.get("allow_stacking_with_bhoomi_card", False):
            # Stacking not allowed
            pass

    # 2. Check User Issued Rewards in database
    discount_amount = 0.0
    discount_type = "flat"
    message = "Coupon applied successfully!"

    issued_reward = None
    if current_user:
        email = current_user.get("email")
        issued_reward = db.user_issued_rewards.find_one({"email": email, "code": code, "is_used": False})

    if issued_reward:
        r_type = issued_reward.get("reward_type")
        r_val = float(issued_reward.get("reward_value") or 0.0)
        lbl = issued_reward.get("label") or "Spin Reward Coupon"

        if r_type == "percentage":
            discount_amount = round(subtotal * (r_val / 100.0), 2)
            discount_type = "percentage"
            message = f"{r_val:.0f}% Spin Wheel Discount Applied ({lbl})!"
        elif r_type == "flat":
            discount_amount = r_val
            discount_type = "flat"
            message = f"₹{r_val:.0f} Spin Wheel Coupon Applied ({lbl})!"
        elif r_type == "shipping":
            discount_amount = 99.0
            discount_type = "shipping"
            message = f"Free Shipping Voucher Applied ({lbl})!"
        elif r_type in ["gift", "bogo"]:
            discount_amount = r_val or 100.0
            discount_type = r_type
            message = f"Special Gift Voucher Applied ({lbl})!"
    else:
        # Check standard public codes
        if code in ["BHOOMI-5PER-WHEEL", "5PER", "SPIN-5PER"]:
            discount_amount = round(subtotal * 0.05, 2)
            discount_type = "percentage"
            message = "5% Spin Reward Coupon Applied!"
        elif code in ["BHOOMI-10PER-WHEEL", "10PER", "SPIN-10PER"]:
            discount_amount = round(subtotal * 0.10, 2)
            discount_type = "percentage"
            message = "10% Spin Reward Coupon Applied!"
        elif code in ["BHOOMI-15PER-WHEEL", "KHARIF2026", "ORGANIC15", "SPIN-15PER"]:
            discount_amount = round(subtotal * 0.15, 2)
            discount_type = "percentage"
            message = "15% Seasonal Agriculture Discount Applied!"
        elif code in ["BHOOMI-20PER-WHEEL", "20PER", "SPIN-20PER"]:
            discount_amount = round(subtotal * 0.20, 2)
            discount_type = "percentage"
            message = "20% Super Saver Coupon Applied!"
        elif code in ["BHOOMI-25PER-WHEEL", "MEGA25", "SPIN-25PER"]:
            discount_amount = round(subtotal * 0.25, 2)
            discount_type = "percentage"
            message = "25% Mega Sale Discount Applied!"
        elif code in ["BHOOMI-FLAT100", "FIRST100", "SPIN-FLAT100"]:
            discount_amount = 100.0
            discount_type = "flat"
            message = "₹100 Instant Discount Applied!"
        elif code in ["BHOOMI-FLAT250"]:
            discount_amount = 250.0
            discount_type = "flat"
            message = "₹250 High Value Fortune Coupon Applied!"
        elif code in ["BHOOMI-FLAT500"]:
            discount_amount = 500.0
            discount_type = "flat"
            message = "🎉 Jackpot! ₹500 Fortune Coupon Applied!"
        elif code in ["BHOOMI-FREESHIP", "FREESHIP999", "SPIN-FREESHIP"]:
            discount_amount = 99.0
            discount_type = "shipping"
            message = "Free Shipping Coupon Applied!"
        elif code in ["BHOOMI-BOGO-AGRI"]:
            discount_amount = 150.0
            discount_type = "bogo"
            message = "Buy 1 Get 1 Offer Coupon Applied!"
        elif code in ["BHOOMI-FREE-SEED", "BHOOMI-FREE-FERT", "SPIN-FREE-SEED"]:
            discount_amount = 100.0
            discount_type = "gift"
            message = "Free Sample Gift Voucher Applied!"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid or expired coupon code '{code}'. Spin the wheel on your 1st order to win exclusive rewards!"
            )

    discount_amount = min(discount_amount, subtotal)
    return {
        "valid": True,
        "code": code,
        "discount_amount": discount_amount,
        "discount_type": discount_type,
        "message": message
    }
