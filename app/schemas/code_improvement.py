from pydantic import BaseModel


class CodeImprovementResponse(BaseModel):
    """Response model for code improvement suggestions."""
    improvements: str
