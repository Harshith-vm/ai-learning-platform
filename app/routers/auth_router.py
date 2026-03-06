"""
Authentication router for user registration and login.
Task 68: Email/Password Login System
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import RegisterRequest, LoginRequest, AuthResponse, UserResponse, TokenResponse, UserProfile, UpdateProfileRequest
from app.services.password_service import hash_password, verify_password
from app.services.jwt_service import create_access_token
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Args:
        data: Registration request with email, password, and persona
        db: Database session
        
    Returns:
        AuthResponse with success message and user email
        
    Raises:
        HTTPException 400: If email is already registered
        HTTPException 422: If validation fails
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate persona
    valid_personas = ["beginner", "student", "senior_dev"]
    if data.persona not in valid_personas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid persona. Must be one of: {', '.join(valid_personas)}"
        )
    
    # Create new user
    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        persona=data.persona
    )
    
    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return AuthResponse(
        message="User registered successfully",
        email=new_user.email,
        persona=new_user.persona
    )


@router.post("/login", response_model=TokenResponse)
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns a JWT access token for authenticated requests.
    
    Args:
        data: Login request with email and password
        db: Database session
        
    Returns:
        TokenResponse with JWT access token
        
    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create JWT access token
    token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "persona": user.persona
        }
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer"
    )


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user information by ID.
    
    Args:
        user_id: User ID
        db: Database session
        
    Returns:
        UserResponse with user information
        
    Raises:
        HTTPException 404: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        persona=user.persona,
        created_at=user.created_at.isoformat()
    )


@router.get("/users", response_model=list[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all users (for admin purposes).
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of UserResponse objects
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            persona=user.persona,
            created_at=user.created_at.isoformat()
        )
        for user in users
    ]


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    Requires valid JWT token in Authorization header.
    
    Args:
        current_user: Current authenticated user (from JWT token)
        
    Returns:
        UserResponse with current user information
        
    Raises:
        HTTPException 401: If token is invalid or expired
        HTTPException 404: If user not found
        
    Usage:
        Authorization: Bearer <access_token>
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        persona=current_user.persona,
        created_at=current_user.created_at.isoformat()
    )


@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's detailed profile with personalization settings.
    Requires valid JWT token in Authorization header.
    
    Args:
        current_user: Current authenticated user (from JWT token)
        
    Returns:
        UserProfile with email, persona, learning_style, and preferred_language
        
    Raises:
        HTTPException 401: If token is invalid or expired
        
    Usage:
        Authorization: Bearer <access_token>
    """
    return UserProfile(
        email=current_user.email,
        persona=current_user.persona,
        learning_style=current_user.learning_style,
        preferred_language=current_user.preferred_language
    )


@router.put("/profile", response_model=dict)
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's profile settings.
    Requires valid JWT token in Authorization header.
    
    Args:
        data: Profile update request with optional fields
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        Success message with updated profile information
        
    Raises:
        HTTPException 401: If token is invalid or expired
        HTTPException 400: If invalid persona value provided
        
    Usage:
        Authorization: Bearer <access_token>
        
    Example:
        {
            "persona": "beginner",
            "learning_style": "visual",
            "preferred_language": "javascript"
        }
    """
    # Validate persona if provided
    if data.persona:
        valid_personas = ["beginner", "student", "senior_dev"]
        if data.persona not in valid_personas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid persona. Must be one of: {', '.join(valid_personas)}"
            )
        current_user.persona = data.persona
    
    # Update learning style if provided
    if data.learning_style:
        current_user.learning_style = data.learning_style
    
    # Update preferred language if provided
    if data.preferred_language:
        current_user.preferred_language = data.preferred_language
    
    # Save changes to database
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile updated successfully",
        "profile": {
            "email": current_user.email,
            "persona": current_user.persona,
            "learning_style": current_user.learning_style,
            "preferred_language": current_user.preferred_language
        }
    }

