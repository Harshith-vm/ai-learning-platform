from pydantic import BaseModel, Field


class TextInput(BaseModel):
    """Schema for text input requests."""
    text: str = Field(..., min_length=10, description="The input text to process")
