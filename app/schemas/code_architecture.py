from pydantic import BaseModel


class CodeArchitectureResponse(BaseModel):
    """Response model for architecture-level code analysis."""
    architecture_analysis: str
