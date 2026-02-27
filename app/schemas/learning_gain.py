from pydantic import BaseModel


class LearningGainResponse(BaseModel):
    """Response model for learning gain calculation."""
    pre_score: float
    post_score: float
    learning_gain_percentage: float
    concept_performance: dict | None = None
    learning_insight: str | None = None
