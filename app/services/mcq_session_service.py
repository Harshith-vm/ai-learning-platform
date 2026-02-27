from fastapi import HTTPException
from app.schemas.mcq_session import MCQSessionRequest, MCQSessionResponse
from app.services.document_service import DOCUMENT_STORE


async def evaluate_mcq_session(document_id: str, request: MCQSessionRequest) -> MCQSessionResponse:
    """
    Evaluate a complete MCQ session and provide scoring.
    
    Args:
        document_id: The document ID containing the MCQs
        request: MCQSessionRequest with list of answers
        
    Returns:
        MCQSessionResponse with total questions, correct answers, score percentage, and detailed results
        
    Raises:
        HTTPException: If document not found, MCQs not generated, or invalid indices
    """
    from app.services.session_helpers import validate_mcqs_exist, get_mcqs_from_session
    
    # Strict validation: ensure session exists and MCQs are present
    validate_mcqs_exist(document_id)
    
    # Retrieve MCQs from session
    stored_mcqs = get_mcqs_from_session(document_id)
    
    # Validate all answers before processing
    for answer in request.answers:
        # Validate question_index range
        if answer.question_index < 0 or answer.question_index >= len(stored_mcqs.mcqs):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid question_index {answer.question_index}. Must be between 0 and {len(stored_mcqs.mcqs) - 1}."
            )
        
        # Get the MCQ to validate option index
        mcq = stored_mcqs.mcqs[answer.question_index]
        
        # Validate selected_option_index range
        if answer.selected_option_index < 0 or answer.selected_option_index >= len(mcq.options):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid selected_option_index {answer.selected_option_index} for question {answer.question_index}. Must be between 0 and {len(mcq.options) - 1}."
            )
    
    # Process answers and compute results
    correct_answers = 0
    detailed_results = []
    
    for answer in request.answers:
        # Retrieve the MCQ
        mcq = stored_mcqs.mcqs[answer.question_index]
        
        # Determine correct_option_index
        correct_option_index = None
        for idx, option in enumerate(mcq.options):
            if option.is_correct:
                correct_option_index = idx
                break
        
        # Check if answer is correct
        is_correct = answer.selected_option_index == correct_option_index
        
        if is_correct:
            correct_answers += 1
        
        # Add to detailed results
        detailed_results.append({
            "question_index": answer.question_index,
            "selected_option_index": answer.selected_option_index,
            "correct_option_index": correct_option_index,
            "correct": is_correct,
            "difficulty": mcq.difficulty
        })
    
    # Compute score percentage
    total_questions = len(request.answers)
    score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0.0
    
    return MCQSessionResponse(
        total_questions=total_questions,
        correct_answers=correct_answers,
        score_percentage=round(score_percentage, 2),
        detailed_results=detailed_results
    )
