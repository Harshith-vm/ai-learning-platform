import json
import re
from typing import List, Dict
from fastapi import HTTPException
from app.core.llm import call_llm
from app.schemas.document_summary import DocumentSummaryResponse
from app.services.document_service import DOCUMENT_STORE


async def summarize_document(document_id: str) -> DocumentSummaryResponse:
    """
    Generate a comprehensive structured summary using 2-stage grouped summarization.
    
    Stage 1: Group raw chunks (batches of 4) and summarize each group to 3 sentences
    Stage 2: Combine all group summaries into final structured JSON output
    
    Args:
        document_id: The document ID to summarize
        
    Returns:
        DocumentSummaryResponse with title, comprehensive summary, and main themes
        
    Raises:
        HTTPException: If document not found or summarization fails
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    document = DOCUMENT_STORE[document_id]
    chunks = document["chunks"]
    
    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Document has no content to summarize."
        )
    
    # STAGE 1: Group raw chunks and summarize
    try:
        group_summaries = await _summarize_grouped_chunks(chunks)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate summary."
        )
    
    if not group_summaries:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate summary."
        )
    
    # STAGE 2: Create final structured summary
    try:
        final_summary = await _create_final_structured_summary(group_summaries)
        
        # Store summary in DOCUMENT_STORE for reuse
        DOCUMENT_STORE[document_id]["summary"] = final_summary
        
        return final_summary
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate summary."
        )


async def _summarize_grouped_chunks(chunks: List[str]) -> List[str]:
    """
    Group raw chunks in batches of 4 and summarize each group.
    
    Args:
        chunks: List of document chunks
        
    Returns:
        List of group summaries (3 sentences each)
    """
    group_summaries = []
    group_size = 4
    
    for i in range(0, len(chunks), group_size):
        group = chunks[i:i + group_size]
        
        try:
            # Combine raw chunk text
            combined_text = "\n\n".join(group)
            
            # Summarize the group to exactly 3 sentences
            prompt = f"""Summarize the following content clearly.
Produce exactly 3 concise but informative sentences.
Avoid repetition.
No filler phrases.
Plain text only.

Content:
{combined_text}"""
            
            summary = await call_llm(prompt)
            if summary and summary.strip():
                group_summaries.append(summary.strip())
        except Exception:
            # If group fails, continue with others
            continue
    
    return group_summaries


async def _create_final_structured_summary(group_summaries: List[str]) -> DocumentSummaryResponse:
    """
    Create final comprehensive structured summary from group summaries.
    
    Args:
        group_summaries: List of group summaries
        
    Returns:
        Validated DocumentSummaryResponse with rich output
        
    Raises:
        Exception: If creation or parsing fails
    """
    # Combine all group summaries
    combined_summaries = "\n\n".join(group_summaries)
    
    prompt = f"""Using the following synthesized summaries, create a comprehensive final structured summary.
Return strictly JSON format with no additional text:

{{
  "title": "A strong, specific title",
  "summary": "A detailed summary of 6-8 sentences covering all key points",
  "main_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"]
}}

Rules:
- Avoid repetition
- Merge overlapping ideas
- Create a strong, specific title
- Summary must be 6-8 sentences
- Themes must be 5-7 meaningful phrases (not placeholders)
- Return valid JSON only

Synthesized summaries:
{combined_summaries}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
    
    llm_response = await call_llm(prompt)
    
    # Extract JSON using regex (handles markdown code blocks and extra text)
    json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', llm_response, re.DOTALL)
    
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
        validated_summary = DocumentSummaryResponse(**parsed_data)
        return validated_summary
    except Exception as e:
        raise Exception(f"Schema validation failed: {str(e)}")
