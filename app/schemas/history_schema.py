"""
History schemas for user-generated content history.
Task 72: Save summaries per user
"""
from pydantic import BaseModel, Field


class SummaryHistoryResponse(BaseModel):
    """Schema for summary history response."""
    id: int = Field(..., description="Summary history entry ID")
    original_text: str = Field(..., description="Original text that was summarized")
    summary_text: str = Field(..., description="Generated summary text")
    created_at: str = Field(..., description="Timestamp of summary generation")

    class Config:
        from_attributes = True
