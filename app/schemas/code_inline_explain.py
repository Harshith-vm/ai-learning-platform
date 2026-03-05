from pydantic import BaseModel, Field
from typing import List


class LineExplanation(BaseModel):
    """Schema for a single line explanation."""
    line: int = Field(..., description="Line number")
    explanation: str = Field(..., description="Explanation of what the line does")


class InlineExplainRequest(BaseModel):
    """Schema for inline code explanation request."""
    code: str = Field(..., min_length=1, description="The code to explain")
    language: str = Field(default="unknown", description="Programming language")


class InlineExplainResponse(BaseModel):
    """Schema for inline code explanation response."""
    explanations: List[LineExplanation] = Field(..., description="Line-by-line explanations")
