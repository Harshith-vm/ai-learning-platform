from pydantic import BaseModel


class MCQFeedbackRequest(BaseModel):
    """Request model for MCQ feedback."""
    question_index: int
    selected_option_index: int


class MCQFeedbackResponse(BaseModel):
    """Response model for MCQ feedback."""
    correct: bool
    correct_option_index: int
    explanation: str
    difficulty: str
    feedback_message: str
