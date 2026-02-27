from pydantic import BaseModel


class CodeRefactorResponse(BaseModel):
    """Response model for code refactoring."""
    refactored_code: str
