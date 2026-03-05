from pydantic import BaseModel, Field
from typing import List


class PRReviewRequest(BaseModel):
    """Schema for PR review request."""
    code_diff: str = Field(..., min_length=1, description="The code diff to review")
    language: str = Field(default="unknown", description="Programming language")


class PRReviewResponse(BaseModel):
    """Schema for PR review response."""
    summary: str = Field(..., description="Summary of the PR changes")
    issues: List[str] = Field(..., description="List of identified issues")
    suggestions: List[str] = Field(..., description="List of improvement suggestions")
