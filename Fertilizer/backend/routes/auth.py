import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from database.connection import get_db
from authentication.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
)
from middleware.auth_middleware import get_current_user, get_current_active_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------- Schemas ---------------------- #

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "farmer"
    mobile: Optional[str] = None
    location: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class UserStatusUpdate(BaseModel):
    is_active: bool


# ---------------------- Helper Functions ---------------------- #

def is_valid_email(email: str) -> bool:
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(regex, email.strip())) if email else False


def validate_password_complexity(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter.")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character.")


# ---------------------- Register ---------------------- #

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db = Depends(get_db)):
    # 1. Field presence validation
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not payload.email or not payload.email.strip():
        raise HTTPException(status_code=400, detail="Email address is required.")
    if not payload.password or not payload.password.strip():
        raise HTTPException(status_code=400, detail="Password is required.")

    # 2. Format validation
    clean_email = payload.email.strip().lower()
    if not is_valid_email(clean_email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    validate_password_complexity(payload.password)

    # 3. Duplicate check
    existing_user = db.users.find_one({"email": clean_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered. Please login instead."
        )

    if payload.mobile and payload.mobile.strip():
        clean_mobile = payload.mobile.strip()
        existing_mobile = db.users.find_one({"mobile": clean_mobile})
        if existing_mobile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number is already registered. Please use another mobile number."
            )

    role_clean = payload.role.strip().lower() if payload.role else "farmer"
    if role_clean not in ["farmer", "buyer", "admin", "seller"]:
        role_clean = "farmer"

    hashed_pwd = hash_password(payload.password)

    user_doc = {
        "full_name": payload.name.strip(),
        "username": clean_email.split("@")[0],
        "email": clean_email,
        "mobile": payload.mobile.strip() if payload.mobile else None,
        "password_hash": hashed_pwd,
        "role": role_clean,
        "is_active": True,
        "location": payload.location or "India"
    }

    try:
        created_user = db.users.insert_one(user_doc)
    except Exception as e:
        if "duplicate" in str(e).lower() or "1062" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account creation failed due to duplicate email or mobile number."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )
    user_id = created_user.get("user_id") or created_user.get("id") or 1

    access_token = create_access_token(
        data={
            "sub": clean_email,
            "role": role_clean,
            "name": payload.name.strip(),
            "user_id": user_id
        }
    )

    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "user_id": user_id,
            "name": payload.name.strip(),
            "email": clean_email,
            "role": role_clean,
            "mobile": payload.mobile or "",
            "location": payload.location or "India"
        }
    }


# ---------------------- Login ---------------------- #

@router.post("/login")
async def login(payload: LoginRequest, db = Depends(get_db)):
    if not payload.email or not payload.email.strip():
        raise HTTPException(status_code=400, detail="Please provide your email address.")
    if not payload.password or not payload.password.strip():
        raise HTTPException(status_code=400, detail="Please provide your password.")

    clean_email = payload.email.strip().lower()
    user = db.users.find_one({"email": clean_email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    stored_hash = user.get("password_hash") or user.get("password") or ""
    if not verify_password(stored_hash, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    user_role = user.get("role", "farmer")
    user_id = user.get("user_id") or user.get("id")
    user_name = user.get("full_name") or user.get("name") or "User"

    access_token = create_access_token(
        data={
            "sub": user["email"],
            "role": user_role,
            "name": user_name,
            "user_id": user_id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "user_id": user_id,
            "name": user_name,
            "email": user["email"],
            "role": user_role,
            "mobile": user.get("mobile") or user.get("phone") or "",
            "location": user.get("location") or ""
        }
    }


# ---------------------- Profile ---------------------- #

@router.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    return current_user


@router.put("/profile")
async def update_profile(
    payload: ProfileUpdate,
    current_user=Depends(get_current_user),
    db = Depends(get_db)
):
    update_fields = {}
    if payload.name is not None:
        update_fields["full_name"] = payload.name
    if payload.phone is not None:
        update_fields["mobile"] = payload.phone
    if payload.location is not None:
        update_fields["location"] = payload.location

    if update_fields:
        db.users.update_one({"email": current_user["email"]}, {"$set": update_fields})

    updated_user = db.users.find_one({"email": current_user["email"]})
    if "password_hash" in updated_user:
        del updated_user["password_hash"]

    return {
        "message": "Profile updated successfully",
        "user": updated_user
    }


# ---------------------- Admin User Management ---------------------- #

@router.get("/users")
async def get_all_users(current_admin = Depends(get_current_active_admin), db = Depends(get_db)):
    users = db.users.find({})
    cleaned_users = []
    for u in users:
        u_dict = dict(u) if isinstance(u, dict) else u.to_dict()
        if "password_hash" in u_dict:
            del u_dict["password_hash"]
        if "password" in u_dict:
            del u_dict["password"]
        cleaned_users.append(u_dict)
    return cleaned_users


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    current_admin = Depends(get_current_active_admin),
    db = Depends(get_db)
):
    target_user = db.users.find_one({"user_id": user_id}) or db.users.find_one({"id": user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.users.update_one({"user_id": target_user.get("user_id", user_id)}, {"$set": {"is_active": payload.is_active}})
    return {"message": f"User status updated to {'Active' if payload.is_active else 'Blocked'}"}