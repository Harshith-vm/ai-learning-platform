"""
MCQ History schemas for user MCQ session history.
Task 73: Save MCQ session scores per user
"""
from pydantic import BaseModel, Field


class MCQHistoryResponse(BaseModel):
    """Schema for MCQ history response."""
    id: int = Field(..., description="MCQ history entry ID")
    document_id: str = Field(..., description="Document ID")
    test_type: str = Field(..., description="Test type (pre_test or post_test)")
    score: int = Field(..., description="User's score (correct answers)")
    total_questions: int = Field(..., description="Total number of questions")
    created_at: str = Field(..., description="Timestamp of test submission")

    class Config:
        from_attributes = True
