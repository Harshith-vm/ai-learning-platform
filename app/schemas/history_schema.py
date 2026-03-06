"""
History schemas for user-generated content history.
Task 72: Save summaries per user
"""
from pydantic import BaseModel, Field


class SummaryHistoryResponse(BaseModel):
    """Schema for summary history response."""
    id: int = Field(..., description="Summary history entry ID")
    original_text: str = Field(..., description="Original text that was summarized")
    summary_text: str = Field(..., description="Generated summary text")
    created_at: str = Field(..., description="Timestamp of summary generation")

    class Config:
        from_attributes = True



class MCQSessionHistoryResponse(BaseModel):
    """Schema for MCQ session history response."""
    id: int = Field(..., description="MCQ session history entry ID")
    document_id: str = Field(..., description="Document ID associated with the session")
    total_questions: int = Field(..., description="Total number of questions")
    correct_answers: int = Field(..., description="Number of correct answers")
    score_percentage: float = Field(..., description="Score as percentage (0-100)")
    created_at: str = Field(..., description="Timestamp of session completion")

    class Config:
        from_attributes = True



class DocumentSummaryHistoryResponse(BaseModel):
    """Schema for document summary history response."""
    id: int = Field(..., description="Document summary history entry ID")
    document_id: str = Field(..., description="Document ID that was summarized")
    title: str = Field(..., description="Generated summary title")
    summary_text: str = Field(..., description="Generated summary text")
    created_at: str = Field(..., description="Timestamp of summary generation")

    class Config:
        from_attributes = True


class KeyPointsHistoryResponse(BaseModel):
    """Schema for key points history response."""
    id: int = Field(..., description="Key points history entry ID")
    document_id: str = Field(..., description="Document ID from which key points were extracted")
    key_points: list = Field(..., description="List of extracted key points")
    created_at: str = Field(..., description="Timestamp of extraction")

    class Config:
        from_attributes = True


class FlashcardHistoryResponse(BaseModel):
    """Schema for flashcard history response."""
    id: int = Field(..., description="Flashcard history entry ID")
    document_id: str = Field(..., description="Document ID from which flashcards were generated")
    flashcards: list = Field(..., description="List of generated flashcards")
    created_at: str = Field(..., description="Timestamp of generation")

    class Config:
        from_attributes = True


class LearningGainHistoryResponse(BaseModel):
    """Schema for learning gain history response."""
    id: int = Field(..., description="Learning gain history entry ID")
    document_id: str = Field(..., description="Document ID for the learning gain test")
    pre_test_score: float = Field(..., description="Pre-test score percentage")
    post_test_score: float = Field(..., description="Post-test score percentage")
    learning_gain: float = Field(..., description="Calculated learning gain percentage")
    created_at: str = Field(..., description="Timestamp of post-test completion")

    class Config:
        from_attributes = True
