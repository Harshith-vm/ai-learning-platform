import json
import re
from fastapi import HTTPException
from app.core.llm import call_llm
from app.schemas.flashcard import FlashcardResponse
from app.services.document_service import DOCUMENT_STORE
from app.services.document_summary_service import summarize_document


async def generate_flashcards(document_id: str) -> FlashcardResponse:
    """
    Generate flashcards from a document using its summary.
    
    Args:
        document_id: The document ID to generate flashcards from
        
    Returns:
        FlashcardResponse with 5-10 high-quality flashcards
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if flashcards already exist
    stored_flashcards = DOCUMENT_STORE[document_id].get("flashcards")
    if stored_flashcards is not None:
        return stored_flashcards
    
    # Check if summary already exists
    summary_response = DOCUMENT_STORE[document_id].get("summary")
    
    # Generate summary if not cached
    if summary_response is None:
        try:
            summary_response = await summarize_document(document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary for flashcard generation."
            )
    
    # Extract summary text
    summary_text = summary_response.summary
    
    # Generate flashcards from summary
    try:
        flashcards = await _generate_flashcards_from_summary(summary_text)
        
        # Store flashcards in DOCUMENT_STORE for reuse
        DOCUMENT_STORE[document_id]["flashcards"] = flashcards
        
        return flashcards
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate flashcards."
        )


async def _generate_flashcards_from_summary(summary: str) -> FlashcardResponse:
    """
    Generate flashcards from a summary text.
    
    Args:
        summary: The summary text to generate flashcards from
        
    Returns:
        Validated FlashcardResponse
        
    Raises:
        Exception: If generation or parsing fails
    """
    prompt = f"""Using the following summary, generate 5–10 high-quality flashcards.

Each flashcard must:
- Ask a meaningful conceptual question
- Have a clear, concise answer
- Avoid repetition
- Avoid trivial facts
- Be suitable for learning revision

Return strictly JSON format with no additional text:

{{
  "flashcards": [
    {{"question": "Question text?", "answer": "Answer text"}},
    {{"question": "Question text?", "answer": "Answer text"}}
  ]
}}

Summary:
{summary}

Return ONLY the JSON object. No markdown, no code blocks, no explanations."""
    
    llm_response = await call_llm(prompt)
    
    # Extract JSON using regex (handles markdown code blocks and extra text)
    json_match = re.search(r'\{{[^{{}}]*(?:\{{[^{{}}]*\}}[^{{}}]*)*\}}', llm_response, re.DOTALL)
    
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
        validated_flashcards = FlashcardResponse(**parsed_data)
        return validated_flashcards
    except Exception as e:
        raise Exception(f"Schema validation failed: {str(e)}")
