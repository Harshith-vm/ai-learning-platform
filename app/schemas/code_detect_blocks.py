from pydantic import BaseModel, Field
from typing import List


class CodeBlock(BaseModel):
    """Schema for a detected code block."""
    language: str = Field(..., description="Detected programming language")
    code: str = Field(..., description="The code content")


class DetectBlocksRequest(BaseModel):
    """Schema for code block detection request."""
    page_content: str = Field(..., min_length=1, description="The webpage content to analyze")


class DetectBlocksResponse(BaseModel):
    """Schema for code block detection response."""
    code_blocks: List[CodeBlock] = Field(..., description="List of detected code blocks")
