from fastapi import HTTPException
from app.schemas.mcq_feedback import MCQFeedbackRequest, MCQFeedbackResponse
from app.services.document_service import DOCUMENT_STORE


async def get_mcq_feedback(document_id: str, request: MCQFeedbackRequest) -> MCQFeedbackResponse:
    """
    Provide instant feedback for a user's MCQ answer.
    
    Args:
        document_id: The document ID containing the MCQs
        request: MCQFeedbackRequest with question and selected option indices
        
    Returns:
        MCQFeedbackResponse with correctness, explanation, and feedback message
        
    Raises:
        HTTPException: If document not found, MCQs not generated, or invalid indices
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if MCQs exist
    stored_mcqs = DOCUMENT_STORE[document_id].get("mcqs")
    if stored_mcqs is None:
        raise HTTPException(
            status_code=400,
            detail="MCQs not generated for this document. Generate MCQs first."
        )
    
    # Validate question_index range
    if request.question_index < 0 or request.question_index >= len(stored_mcqs.mcqs):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid question_index. Must be between 0 and {len(stored_mcqs.mcqs) - 1}."
        )
    
    # Retrieve the MCQ
    mcq = stored_mcqs.mcqs[request.question_index]
    
    # Validate selected_option_index range
    if request.selected_option_index < 0 or request.selected_option_index >= len(mcq.options):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid selected_option_index. Must be between 0 and {len(mcq.options) - 1}."
        )
    
    # Determine correct_option_index
    correct_option_index = None
    for idx, option in enumerate(mcq.options):
        if option.is_correct:
            correct_option_index = idx
            break
    
    # Compare with selected option
    is_correct = request.selected_option_index == correct_option_index
    
    # Update streak tracking (Task 33A)
    _update_streak(document_id, is_correct)
    
    # Generate feedback message
    if is_correct:
        feedback_message = "Correct! Well done."
    else:
        feedback_message = "Incorrect. Review the explanation and try again."
    
    return MCQFeedbackResponse(
        correct=is_correct,
        correct_option_index=correct_option_index,
        explanation=mcq.explanation,
        difficulty=mcq.difficulty,
        feedback_message=feedback_message
    )


def _update_streak(document_id: str, is_correct: bool) -> None:
    """
    Update the current streak based on answer correctness.
    
    Args:
        document_id: The document ID
        is_correct: Whether the answer was correct
    """
    # Get current streak
    current_streak = DOCUMENT_STORE[document_id]["learning_session"].get("current_streak", {"correct": 0, "wrong": 0})
    
    if is_correct:
        # Increment correct streak, reset wrong streak
        current_streak["correct"] += 1
        current_streak["wrong"] = 0
    else:
        # Increment wrong streak, reset correct streak
        current_streak["wrong"] += 1
        current_streak["correct"] = 0
    
    # Store updated streak
    DOCUMENT_STORE[document_id]["learning_session"]["current_streak"] = current_streak


def get_adaptive_difficulty(document_id: str) -> str:
    """
    Determine adaptive difficulty based on current streak.
    
    Args:
        document_id: The document ID
        
    Returns:
        Difficulty level: "easy", "medium", or "hard"
    """
    # Get current streak
    current_streak = DOCUMENT_STORE[document_id]["learning_session"].get("current_streak", {"correct": 0, "wrong": 0})
    
    correct_streak = current_streak.get("correct", 0)
    wrong_streak = current_streak.get("wrong", 0)
    
    # Apply difficulty rules
    if wrong_streak >= 2:
        return "easy"
    elif correct_streak >= 3:
        return "hard"
    else:
        return "medium"
