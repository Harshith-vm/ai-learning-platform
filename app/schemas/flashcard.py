from typing import List
from pydantic import BaseModel, Field


class Flashcard(BaseModel):
    """Schema for a single flashcard."""
    question: str = Field(..., description="A meaningful conceptual question")
    answer: str = Field(..., description="A clear, concise answer")


class FlashcardResponse(BaseModel):
    """Schema for flashcard generation response."""
    flashcards: List[Flashcard] = Field(..., description="List of 5-10 high-quality flashcards")
