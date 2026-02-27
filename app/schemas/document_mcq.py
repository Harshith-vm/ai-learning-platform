from typing import List, Literal
from pydantic import BaseModel, Field, field_validator


class MCQOption(BaseModel):
    """Schema for a single MCQ option."""
    option: str = Field(..., description="The option text")
    is_correct: bool = Field(..., description="Whether this option is correct")


class MCQ(BaseModel):
    """Schema for a single multiple choice question."""
    question: str = Field(..., description="The question text")
    options: List[MCQOption] = Field(..., description="List of 4 options")
    difficulty: Literal["easy", "medium", "hard"] = Field(..., description="Question difficulty level")
    explanation: str = Field(..., description="Explanation of the correct answer")
    
    @field_validator("options")
    @classmethod
    def validate_options(cls, v):
        if len(v) != 4:
            raise ValueError("Each MCQ must have exactly 4 options")
        
        correct_count = sum(1 for opt in v if opt.is_correct)
        if correct_count != 1:
            raise ValueError("Each MCQ must have exactly 1 correct option")
        
        return v


class MCQResponse(BaseModel):
    """Schema for MCQ generation response."""
    mcqs: List[MCQ] = Field(..., description="List of 5-10 multiple choice questions")
