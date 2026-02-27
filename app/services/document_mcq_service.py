import json
import re
from typing import Optional
from fastapi import HTTPException
from app.core.llm import call_llm
from app.schemas.document_mcq import MCQResponse
from app.services.document_service import DOCUMENT_STORE
from app.services.document_summary_service import summarize_document


async def generate_mcqs(document_id: str) -> MCQResponse:
    """
    Generate multiple choice questions from a document using its summary.
    
    Args:
        document_id: The document ID to generate MCQs from
        
    Returns:
        MCQResponse with 5-10 multiple choice questions
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    from app.services.session_helpers import store_mcqs_in_session, get_mcqs_from_session
    
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if MCQs already exist using helper
    stored_mcqs = get_mcqs_from_session(document_id)
    if stored_mcqs is not None:
        return stored_mcqs
    
    # Check if summary already exists
    summary_response = DOCUMENT_STORE[document_id].get("summary")
    
    # Generate summary if not cached
    if summary_response is None:
        try:
            summary_response = await summarize_document(document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary for MCQ generation."
            )
    
    # Extract summary text
    summary_text = summary_response.summary
    
    # Generate MCQs from summary
    try:
        mcqs = await _generate_mcqs_from_summary(summary_text)
        
        # Store MCQs in session using helper
        store_mcqs_in_session(document_id, mcqs)
        
        return mcqs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate MCQs."
        )


async def _generate_mcqs_from_summary(summary: str, difficulty_override: Optional[str] = None) -> MCQResponse:
    """
    Generate MCQs from a summary text.
    
    Args:
        summary: The summary text to generate MCQs from
        difficulty_override: Optional difficulty level to force (easy, medium, hard)
        
    Returns:
        Validated MCQResponse
        
    Raises:
        Exception: If generation or parsing fails
    """
    # Build difficulty instruction based on override
    if difficulty_override:
        difficulty_instruction = f"""Generate ONLY {difficulty_override} difficulty questions.
Every MCQ must have difficulty exactly '{difficulty_override}'.
Do NOT mix difficulty levels."""
    else:
        difficulty_instruction = """Generate mixed difficulty questions (easy, medium, hard)."""
    
    prompt = f"""Using the following summary, generate 5–10 high-quality multiple choice questions.

{difficulty_instruction}

Each MCQ must:
- Test conceptual understanding
- Have exactly 4 options
- Exactly 1 correct option
- 3 plausible but incorrect distractors
- Include difficulty label (easy, medium, hard)
- Include short explanation
- Include 1-3 concept tags representing the core idea being tested

Concept tags should be:
- Short (2-4 words)
- Concept-level (e.g., "nested loops", "time complexity", "data structures")
- Not full sentences

IMPORTANT:
- Each option must contain the full answer text
- Do NOT use placeholders like "Option A", "Option B", etc.
- Do NOT label options as A/B/C/D
- The "option" field must contain the actual answer sentence
- Do NOT repeat the same option text

Return strictly JSON format with no additional text:

{{
  "mcqs": [
    {{
      "question": "What is machine learning?",
      "options": [
        {{"option": "A subset of artificial intelligence that enables computers to learn from data", "is_correct": true}},
        {{"option": "A type of computer hardware used for processing", "is_correct": false}},
        {{"option": "A programming language designed for data analysis", "is_correct": false}},
        {{"option": "A database management system for storing information", "is_correct": false}}
      ],
      "difficulty": "medium",
      "explanation": "Machine learning is indeed a subset of AI that allows systems to learn and improve from experience without being explicitly programmed.",
      "concept_tags": ["artificial intelligence", "machine learning basics"]
    }}
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
        validated_mcqs = MCQResponse(**parsed_data)
    except Exception as e:
        raise Exception(f"Schema validation failed: {str(e)}")
    
    # Additional structural validation guardrails
    _validate_mcq_structure(validated_mcqs)
    
    # Validate difficulty override if provided
    if difficulty_override:
        for idx, mcq in enumerate(validated_mcqs.mcqs, 1):
            if mcq.difficulty.lower() != difficulty_override.lower():
                raise HTTPException(
                    status_code=500,
                    detail=f"Generated MCQs do not match requested difficulty. MCQ {idx} has difficulty '{mcq.difficulty}' but '{difficulty_override}' was requested."
                )
    
    return validated_mcqs


def _validate_mcq_structure(mcq_response: MCQResponse) -> None:
    """
    Validate MCQ structural requirements beyond Pydantic validation.
    
    Args:
        mcq_response: The validated MCQResponse to check
        
    Raises:
        HTTPException: If any structural validation fails
    """
    # Track questions to detect duplicates
    seen_questions = set()
    
    for idx, mcq in enumerate(mcq_response.mcqs, 1):
        # TASK 21 - Basic Structural Validation
        
        # 1. Ensure exactly 4 options
        if len(mcq.options) != 4:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has {len(mcq.options)} options, expected exactly 4."
            )
        
        # 2. Ensure exactly 1 correct option
        correct_count = sum(1 for opt in mcq.options if opt.is_correct)
        if correct_count != 1:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has {correct_count} correct options, expected exactly 1."
            )
        
        # 3. Ensure all option texts are unique (case-insensitive)
        option_texts_lower = [opt.option.lower().strip() for opt in mcq.options]
        if len(option_texts_lower) != len(set(option_texts_lower)):
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has duplicate options (case-insensitive check failed)."
            )
        
        # TASK 22 - Difficulty Enforcement
        
        # Normalize difficulty to lowercase
        difficulty_lower = mcq.difficulty.lower().strip()
        valid_difficulties = {"easy", "medium", "hard"}
        
        if difficulty_lower not in valid_difficulties:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has invalid difficulty '{mcq.difficulty}'. Must be one of: easy, medium, hard."
            )
        
        # TASK 23 - Explanation Enforcement
        
        # Check explanation is not empty
        if not mcq.explanation or not mcq.explanation.strip():
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has empty explanation."
            )
        
        # Check minimum length
        if len(mcq.explanation.strip()) < 15:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has explanation too short (minimum 15 characters required)."
            )
        
        # Check for placeholder text
        placeholder_texts = {"n/a", "none", "not applicable", "na", "no explanation"}
        if mcq.explanation.lower().strip() in placeholder_texts:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has placeholder explanation text."
            )
        
        # TASK 24 - Schema Guardrails
        
        # 1. Question validation
        if not mcq.question or not mcq.question.strip():
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has empty question."
            )
        
        if len(mcq.question.strip()) < 10:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has question too short (minimum 10 characters required)."
            )
        
        # 2. Option text validation
        for opt_idx, option in enumerate(mcq.options, 1):
            if not option.option or not option.option.strip():
                raise HTTPException(
                    status_code=500,
                    detail=f"MCQ {idx}, option {opt_idx} has empty text."
                )
            
            if len(option.option.strip()) < 3:
                raise HTTPException(
                    status_code=500,
                    detail=f"MCQ {idx}, option {opt_idx} is too short (minimum 3 characters required)."
                )
        
        # 3. No duplicate questions
        question_normalized = mcq.question.lower().strip()
        if question_normalized in seen_questions:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} has duplicate question text."
            )
        seen_questions.add(question_normalized)
        
        # TASK 31A - Concept Tags Validation
        
        # 1. Ensure concept_tags exists and is a list
        if not hasattr(mcq, 'concept_tags') or not isinstance(mcq.concept_tags, list):
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} missing or invalid concept_tags field."
            )
        
        # 2. Ensure at least 1 concept tag
        if len(mcq.concept_tags) < 1:
            raise HTTPException(
                status_code=500,
                detail=f"MCQ {idx} must have at least 1 concept tag."
            )
