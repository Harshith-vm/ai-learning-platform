from pydantic import BaseModel


class RefactorImpactResponse(BaseModel):
    """Response model for refactor impact comparison."""
    original_time_complexity: str
    refactored_time_complexity: str
    improvement_summary: str
