from pydantic import BaseModel


class CodeQualityResponse(BaseModel):
    """Response model for code quality score."""
    readability: int
    efficiency: int
    maintainability: int
    overall: int
    summary: str
