from pydantic import BaseModel
from typing import Optional


class CodeSubmissionRequest(BaseModel):
    """Request model for code submission."""
    code: Optional[str] = None
    language: Optional[str] = None
    context: Optional[str] = None
