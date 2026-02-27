from pydantic import BaseModel


class CodeStepwiseResponse(BaseModel):
    """Response model for step-by-step code explanation."""
    stepwise_explanation: str
