from pydantic import BaseModel
from typing import List


class MCQAnswer(BaseModel):
    """Single MCQ answer in a session."""
    question_index: int
    selected_option_index: int


class MCQSessionRequest(BaseModel):
    """Request model for MCQ session evaluation."""
    answers: List[MCQAnswer]


class MCQSessionResponse(BaseModel):
    """Response model for MCQ session evaluation."""
    total_questions: int
    correct_answers: int
    score_percentage: float
    detailed_results: List[dict]
