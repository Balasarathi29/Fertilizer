import os
import hashlib
import binascii
from datetime import datetime, timedelta
import jwt
from typing import Dict, Any, Optional

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-bhoomi-bloom-9922883344")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2 with salt."""
    if not password:
        return ""
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('utf-8')
    pwdhash = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt, 
        100000
    )
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('utf-8')


def verify_password(stored_password: str, provided_password: str) -> bool:
    """
    Verifies a password against the stored PBKDF2 hash.
    Auto-detects parameter swap for foolproof execution.
    """
    if not stored_password or not provided_password:
        return False
    try:
        # If parameters were swapped (provided_password first, stored_hash second)
        if len(stored_password) < 64 and len(provided_password) >= 64:
            stored_password, provided_password = provided_password, stored_password

        salt = stored_password[:64].encode('utf-8')
        stored_hash = stored_password[64:]
        pwdhash = hashlib.pbkdf2_hmac(
            'sha256', 
            provided_password.encode('utf-8'), 
            salt, 
            100000
        )
        pwdhash = binascii.hexlify(pwdhash).decode('utf-8')
        return pwdhash == stored_hash
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes a JWT access token. Returns payload if valid, else None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
