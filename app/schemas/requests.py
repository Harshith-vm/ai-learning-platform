from pydantic import BaseModel, Field


class TextInput(BaseModel):
    """Schema for text input requests."""
    text: str = Field(..., min_length=10, description="The input text to process")


class ConceptRequest(BaseModel):
    """Schema for concept explanation requests."""
    concept: str = Field(..., min_length=1, description="The concept to explain")
