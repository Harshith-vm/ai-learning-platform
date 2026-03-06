"""
JWT Token Service for authentication.
Task 69: JWT Token Authentication
"""
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# JWT Configuration
SECRET_KEY = "supersecretkey123"  # TODO: Move to environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing user data to encode in token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
        
    Example:
        token = create_access_token({"user_id": 1, "email": "user@example.com"})
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    # Add expiration to payload
    to_encode.update({"exp": expire})
    
    # Encode JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Decoded payload dictionary if valid, None if invalid or expired
        
    Example:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("user_id")
            email = payload.get("email")
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # Token is invalid, expired, or malformed
        print(f"JWT decode error: {e}")
        return None


def verify_token(token: str) -> bool:
    """
    Verify if a token is valid without decoding.
    
    Args:
        token: JWT token string to verify
        
    Returns:
        True if token is valid, False otherwise
    """
    payload = decode_access_token(token)
    return payload is not None


def get_token_expiration(token: str) -> Optional[datetime]:
    """
    Get the expiration time of a token.
    
    Args:
        token: JWT token string
        
    Returns:
        Expiration datetime if valid, None otherwise
    """
    payload = decode_access_token(token)
    if payload and "exp" in payload:
        return datetime.fromtimestamp(payload["exp"])
    return None
