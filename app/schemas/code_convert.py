from pydantic import BaseModel, Field


class CodeConvertRequest(BaseModel):
    """Schema for code conversion request."""
    source_code: str = Field(..., min_length=1, description="The source code to convert")
    source_language: str = Field(..., description="Source programming language")
    target_language: str = Field(..., description="Target programming language")


class CodeConvertResponse(BaseModel):
    """Schema for code conversion response."""
    converted_code: str = Field(..., description="The converted code")
