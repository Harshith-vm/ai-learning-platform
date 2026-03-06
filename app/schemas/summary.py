from typing import List, Dict
from pydantic import BaseModel, Field


class ConceptTag(BaseModel):
    """Schema for weighted concept tag."""
    name: str = Field(..., description="Concept name in Title Case")
    importance: int = Field(..., ge=1, le=10, description="Importance score from 1-10")


class ConceptHeatmapEntry(BaseModel):
    """Schema for concept heatmap entry."""
    importance: int = Field(..., description="Importance score from 1-10")
    weight: float = Field(..., description="Normalized weight (0-1)")


class SummaryResponse(BaseModel):
    """Schema for summary generation response."""
    title: str = Field(..., description="A concise title for the content")
    summary: str = Field(..., description="A comprehensive summary")
    key_points: List[str] = Field(..., description="List of key points extracted from the text")
    concept_tags: List[ConceptTag] = Field(..., description="List of weighted concept tags representing core semantic ideas")
    concept_heatmap: Dict[str, ConceptHeatmapEntry] = Field(..., description="Normalized concept importance heatmap")
