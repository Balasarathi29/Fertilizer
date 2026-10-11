from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from authentication.auth_handler import decode_access_token
from database.connection import get_db

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db = Depends(get_db)):
    """FastAPI dependency to extract and verify the current logged-in user."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate token or token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing subject info",
        )
        
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in system",
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated or blocked. Please contact support.",
        )
    
    # Hide password hash
    if "password_hash" in user:
        del user["password_hash"]
    if "password" in user:
        del user["password"]
        
    return user

async def get_current_active_admin(current_user: dict = Depends(get_current_user)):
    """FastAPI dependency to verify if user has admin privileges."""
    if current_user.get("role", "").lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges",
        )
    return current_user

async def get_current_active_seller(current_user: dict = Depends(get_current_user)):
    """FastAPI dependency to verify if user has seller or admin privileges."""
    if current_user.get("role", "").lower() not in ["seller", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have seller privileges",
        )
    return current_user

async def require_customer_role(current_user: dict = Depends(get_current_user)):
    """FastAPI dependency to prevent Admin users from executing customer shopping actions."""
    if current_user.get("role", "").lower() == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins are not permitted to use customer shopping cart or place customer orders.",
        )
    return current_user

