from typing import List
from pydantic import BaseModel, Field


class KeyPointsResponse(BaseModel):
    """Schema for key points extraction response."""
    key_points: List[str] = Field(..., description="List of 5-10 clear, non-redundant key points")
