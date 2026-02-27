import json
import re
from fastapi import HTTPException
from app.core.llm import call_llm
from app.schemas.key_points import KeyPointsResponse
from app.services.document_service import DOCUMENT_STORE
from app.services.document_summary_service import summarize_document


async def extract_key_points(document_id: str) -> KeyPointsResponse:
    """
    Extract key points from a document using its summary.
    
    Args:
        document_id: The document ID to extract key points from
        
    Returns:
        KeyPointsResponse with 5-10 clear key points
        
    Raises:
        HTTPException: If document not found or extraction fails
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if key_points already exist
    stored_key_points = DOCUMENT_STORE[document_id].get("key_points")
    if stored_key_points is not None:
        return stored_key_points
    
    # Check if summary already exists
    summary_response = DOCUMENT_STORE[document_id].get("summary")
    
    # Generate summary if not cached
    if summary_response is None:
        try:
            summary_response = await summarize_document(document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary for key points extraction."
            )
    
    # Extract summary text
    summary_text = summary_response.summary
    
    # Extract key points from summary
    try:
        key_points = await _extract_key_points_from_summary(summary_text)
        
        # Store key_points in DOCUMENT_STORE for reuse
        DOCUMENT_STORE[document_id]["key_points"] = key_points
        
        return key_points
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to extract key points."
        )


async def _extract_key_points_from_summary(summary: str) -> KeyPointsResponse:
    """
    Extract key points from a summary text.
    
    Args:
        summary: The summary text to extract key points from
        
    Returns:
        Validated KeyPointsResponse
        
    Raises:
        Exception: If extraction or parsing fails
    """
    prompt = f"""From the following summary, extract 5–10 clear, non-redundant key points.

Each point must:
- Be one concise sentence
- Capture a core idea
- Avoid repetition
- Avoid filler phrases

Return strictly JSON format with no additional text:

{{
  "key_points": ["point1", "point2", "point3", ...]
}}

Summary:
{summary}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
    
    llm_response = await call_llm(prompt)
    
    # Extract JSON using regex (handles markdown code blocks and extra text)
    json_match = re.search(r'\{[^{{}}]*(?:\{[^{{}}]*\}[^{{}}]*)*\}', llm_response, re.DOTALL)
    
    if not json_match:
        # Fallback: try cleaning markdown code blocks
        cleaned_response = llm_response.strip()
        if cleaned_response.startswith("```"):
            lines = cleaned_response.split("\n")
            cleaned_response = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned_response
        json_text = cleaned_response
    else:
        json_text = json_match.group(0)
    
    # Parse JSON
    try:
        parsed_data = json.loads(json_text)
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid JSON response from LLM: {str(e)}")
    
    # Validate against Pydantic schema
    try:
        validated_key_points = KeyPointsResponse(**parsed_data)
        return validated_key_points
    except Exception as e:
        raise Exception(f"Schema validation failed: {str(e)}")
