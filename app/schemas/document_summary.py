from typing import List
from pydantic import BaseModel, Field


class DocumentSummaryResponse(BaseModel):
    """Schema for document summary response."""
    title: str = Field(..., description="Title of the document")
    summary: str = Field(..., description="Comprehensive summary of the document")
    main_themes: List[str] = Field(..., description="List of 3-5 main themes from the document")
