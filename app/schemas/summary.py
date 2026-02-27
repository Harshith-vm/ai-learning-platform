from typing import List
from pydantic import BaseModel, Field


class SummaryResponse(BaseModel):
    """Schema for summary generation response."""
    title: str = Field(..., description="A concise title for the content")
    summary: str = Field(..., description="A comprehensive summary")
    key_points: List[str] = Field(..., description="List of key points extracted from the text")
