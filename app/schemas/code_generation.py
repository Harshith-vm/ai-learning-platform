from pydantic import BaseModel
from typing import Optional


class CodeGenerationRequest(BaseModel):
    """Request model for code generation."""
    problem_description: str
    language: str
    constraints: Optional[str] = None


class CodeGenerationResponse(BaseModel):
    """Response model for code generation."""
    generated_code: str
