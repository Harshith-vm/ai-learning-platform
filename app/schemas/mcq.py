from typing import List, Literal
from pydantic import BaseModel, Field, field_validator


class MCQItem(BaseModel):
    """Schema for a single multiple choice question."""
    question: str = Field(..., description="The question text")
    options: List[str] = Field(..., description="List of 4 answer options")
    correct_index: int = Field(..., ge=0, le=3, description="Index of the correct answer (0-3)")
    explanation: str = Field(..., description="Explanation of why the answer is correct")
    difficulty: Literal["easy", "medium", "hard"] = Field(..., description="Question difficulty level")
    
    @field_validator("options")
    @classmethod
    def validate_options_count(cls, v):
        if len(v) != 4:
            raise ValueError("Each MCQ must have exactly 4 options")
        return v


class MCQResponse(BaseModel):
    """Schema for MCQ generation response."""
    mcqs: List[MCQItem] = Field(..., description="List of generated MCQs")
    
    @field_validator("mcqs")
    @classmethod
    def validate_mcq_count(cls, v):
        if len(v) != 5:
            raise ValueError("Must generate exactly 5 MCQs")
        return v
