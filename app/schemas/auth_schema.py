"""
Authentication schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Schema for user registration request."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")
    persona: str = Field(default="student", description="User persona type (beginner, student, senior_dev)")


class LoginRequest(BaseModel):
    """Schema for user login request."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class AuthResponse(BaseModel):
    """Schema for authentication response."""
    message: str = Field(..., description="Response message")
    email: str = Field(..., description="User email address")
    persona: str = Field(..., description="User persona type")


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")


class UserResponse(BaseModel):
    """Schema for user information response."""
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    persona: str = Field(..., description="User persona type")
    created_at: str = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """Schema for user profile information."""
    email: str = Field(..., description="User email address")
    persona: str = Field(..., description="User persona type")
    learning_style: str = Field(..., description="User's preferred learning style")
    preferred_language: str = Field(..., description="User's preferred programming language")

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    """Schema for updating user profile."""
    persona: str | None = Field(None, description="User persona type (beginner, student, senior_dev)")
    learning_style: str | None = Field(None, description="User's preferred learning style")
    preferred_language: str | None = Field(None, description="User's preferred programming language")

    class Config:
        from_attributes = True
