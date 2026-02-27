from pydantic import BaseModel


class CodeExplanationResponse(BaseModel):
    """Response model for code explanation."""
    explanation: str
