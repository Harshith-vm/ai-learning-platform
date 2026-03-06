"""
Authentication dependency for protected endpoints.
Task 70: Session Handling

This module provides the get_current_user dependency that extracts
and validates the JWT token from the Authorization header.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.jwt_service import decode_access_token

# HTTP Bearer token security scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    This function:
    1. Extracts the JWT token from the Authorization header
    2. Decodes and verifies the token
    3. Retrieves the user from the database
    4. Returns the User object
    
    Args:
        credentials: HTTP Bearer credentials from Authorization header
        db: Database session
        
    Returns:
        User object of the authenticated user
        
    Raises:
        HTTPException 401: If token is invalid, expired, or malformed
        HTTPException 404: If user not found in database
        
    Usage:
        @router.get("/protected")
        def protected_endpoint(current_user: User = Depends(get_current_user)):
            return {"message": f"Hello {current_user.email}"}
    """
    # Extract token from credentials
    token = credentials.credentials
    
    # Decode and verify token
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Extract user_id from token payload
    user_id = payload.get("user_id")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Retrieve user from database
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User | None:
    """
    Optional authentication dependency.
    Returns user if authenticated, None if not.
    Does not raise exceptions for missing/invalid tokens.
    
    Args:
        credentials: HTTP Bearer credentials (optional)
        db: Database session
        
    Returns:
        User object if authenticated, None otherwise
        
    Usage:
        @router.get("/optional-auth")
        def optional_endpoint(current_user: User | None = Depends(get_current_user_optional)):
            if current_user:
                return {"message": f"Hello {current_user.email}"}
            return {"message": "Hello guest"}
    """
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None
