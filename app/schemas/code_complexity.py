from pydantic import BaseModel


class ComplexityResponse(BaseModel):
    """Response model for code complexity analysis."""
    time_complexity: str
    space_complexity: str
    justification: str
