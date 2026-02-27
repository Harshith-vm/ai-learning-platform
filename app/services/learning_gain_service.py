from fastapi import HTTPException
from app.schemas.document_mcq import MCQResponse
from app.schemas.mcq_session import MCQSessionRequest, MCQSessionResponse
from app.schemas.learning_gain import LearningGainResponse
from app.services.document_service import DOCUMENT_STORE
from app.services.document_mcq_service import _generate_mcqs_from_summary
from app.services.document_summary_service import summarize_document
from app.services.mcq_session_service import evaluate_mcq_session


async def generate_pre_test(document_id: str) -> MCQResponse:
    """
    Generate fresh MCQs for pre-test.
    
    Args:
        document_id: The document ID to generate pre-test from
        
    Returns:
        MCQResponse with fresh MCQs
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Get or generate summary
    summary_response = DOCUMENT_STORE[document_id].get("summary")
    
    if summary_response is None:
        try:
            summary_response = await summarize_document(document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary for pre-test."
            )
    
    # Generate fresh MCQs
    try:
        pre_test_mcqs = await _generate_mcqs_from_summary(summary_response.summary)
        
        # Store in learning_session
        DOCUMENT_STORE[document_id]["learning_session"]["pre_test_mcqs"] = pre_test_mcqs
        
        return pre_test_mcqs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate pre-test MCQs."
        )


async def submit_pre_test(document_id: str, request: MCQSessionRequest) -> MCQSessionResponse:
    """
    Submit and evaluate pre-test answers.
    
    Args:
        document_id: The document ID
        request: MCQSessionRequest with answers
        
    Returns:
        MCQSessionResponse with score
        
    Raises:
        HTTPException: If document not found or pre-test not generated
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if pre-test MCQs exist
    pre_test_mcqs = DOCUMENT_STORE[document_id]["learning_session"].get("pre_test_mcqs")
    if pre_test_mcqs is None:
        raise HTTPException(
            status_code=400,
            detail="Pre-test not generated. Generate pre-test first."
        )
    
    # Temporarily store pre-test MCQs in main mcqs field for evaluation
    original_mcqs = DOCUMENT_STORE[document_id].get("mcqs")
    DOCUMENT_STORE[document_id]["mcqs"] = pre_test_mcqs
    
    try:
        # Evaluate using existing scoring logic
        score_result = await evaluate_mcq_session(document_id, request)
        
        # Store pre-test score
        DOCUMENT_STORE[document_id]["learning_session"]["pre_test_score"] = score_result.score_percentage
        
        # Compute concept-level performance
        concept_performance = _compute_concept_performance(pre_test_mcqs, request)
        
        # Store concept performance
        DOCUMENT_STORE[document_id]["learning_session"]["concept_performance"] = concept_performance
        
        return score_result
    finally:
        # Restore original mcqs
        DOCUMENT_STORE[document_id]["mcqs"] = original_mcqs


def _compute_concept_performance(mcqs_response, answers_request) -> dict:
    """
    Compute concept-level performance from MCQ answers.
    
    Args:
        mcqs_response: MCQResponse with MCQs
        answers_request: MCQSessionRequest with user answers
        
    Returns:
        Dictionary with weak concepts, strong concepts, and accuracy map
    """
    from collections import defaultdict
    
    # Track performance per concept
    total_per_concept = defaultdict(int)
    correct_per_concept = defaultdict(int)
    
    # Create answer lookup map
    answer_map = {answer.question_index: answer.selected_option_index for answer in answers_request.answers}
    
    # Process each answered MCQ
    for answer in answers_request.answers:
        question_index = answer.question_index
        
        # Skip if question index out of range
        if question_index < 0 or question_index >= len(mcqs_response.mcqs):
            continue
        
        mcq = mcqs_response.mcqs[question_index]
        
        # Get concept tags (safe handling if missing)
        concept_tags = getattr(mcq, 'concept_tags', [])
        if not concept_tags:
            continue
        
        # Determine if answer is correct
        correct_option_index = None
        for idx, option in enumerate(mcq.options):
            if option.is_correct:
                correct_option_index = idx
                break
        
        is_correct = answer.selected_option_index == correct_option_index
        
        # Update concept statistics
        for concept in concept_tags:
            total_per_concept[concept] += 1
            if is_correct:
                correct_per_concept[concept] += 1
    
    # Compute accuracy per concept
    accuracy_map = {}
    for concept in total_per_concept:
        accuracy = correct_per_concept[concept] / total_per_concept[concept]
        accuracy_map[concept] = round(accuracy, 2)
    
    # Identify weak and strong concepts
    weak_concepts = [concept for concept, accuracy in accuracy_map.items() if accuracy < 0.5]
    strong_concepts = [concept for concept, accuracy in accuracy_map.items() if accuracy > 0.8]
    
    return {
        "weak": weak_concepts,
        "strong": strong_concepts,
        "accuracy_map": accuracy_map
    }


async def generate_post_test(document_id: str) -> MCQResponse:
    """
    Generate fresh MCQs for post-test with adaptive difficulty based on pre-test score.
    
    Args:
        document_id: The document ID to generate post-test from
        
    Returns:
        MCQResponse with fresh MCQs at adaptive difficulty
        
    Raises:
        HTTPException: If document not found, pre-test not completed, or generation fails
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if pre-test was completed
    pre_test_score = DOCUMENT_STORE[document_id]["learning_session"].get("pre_test_score")
    if pre_test_score is None:
        raise HTTPException(
            status_code=400,
            detail="Pre-test must be completed first."
        )
    
    # Determine adaptive difficulty based on pre-test score
    if pre_test_score < 50:
        difficulty_override = "easy"
    elif pre_test_score > 80:
        difficulty_override = "hard"
    else:
        difficulty_override = "medium"
    
    # Get or generate summary
    summary_response = DOCUMENT_STORE[document_id].get("summary")
    
    if summary_response is None:
        try:
            summary_response = await summarize_document(document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary for post-test."
            )
    
    # Generate fresh MCQs with adaptive difficulty
    try:
        post_test_mcqs = await _generate_mcqs_from_summary(
            summary_response.summary,
            difficulty_override=difficulty_override
        )
        
        # Store in learning_session
        DOCUMENT_STORE[document_id]["learning_session"]["post_test_mcqs"] = post_test_mcqs
        
        return post_test_mcqs
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate post-test MCQs."
        )


async def submit_post_test(document_id: str, request: MCQSessionRequest) -> LearningGainResponse:
    """
    Submit and evaluate post-test answers, compute learning gain.
    
    Args:
        document_id: The document ID
        request: MCQSessionRequest with answers
        
    Returns:
        LearningGainResponse with pre-score, post-score, and learning gain
        
    Raises:
        HTTPException: If document not found, post-test not generated, or pre-test not completed
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Check if post-test MCQs exist
    post_test_mcqs = DOCUMENT_STORE[document_id]["learning_session"].get("post_test_mcqs")
    if post_test_mcqs is None:
        raise HTTPException(
            status_code=400,
            detail="Post-test not generated. Generate post-test first."
        )
    
    # Check if pre-test was completed
    pre_test_score = DOCUMENT_STORE[document_id]["learning_session"].get("pre_test_score")
    if pre_test_score is None:
        raise HTTPException(
            status_code=400,
            detail="Pre-test not completed. Complete pre-test first."
        )
    
    # Temporarily store post-test MCQs in main mcqs field for evaluation
    original_mcqs = DOCUMENT_STORE[document_id].get("mcqs")
    DOCUMENT_STORE[document_id]["mcqs"] = post_test_mcqs
    
    try:
        # Evaluate using existing scoring logic
        score_result = await evaluate_mcq_session(document_id, request)
        
        # Store post-test score
        post_test_score = score_result.score_percentage
        DOCUMENT_STORE[document_id]["learning_session"]["post_test_score"] = post_test_score
        
        # Compute learning gain percentage
        learning_gain_percentage = ((post_test_score - pre_test_score) / 100) * 100
        DOCUMENT_STORE[document_id]["learning_session"]["learning_gain_percentage"] = learning_gain_percentage
        
        # Generate learning trajectory summary
        concept_performance = DOCUMENT_STORE[document_id]["learning_session"].get("concept_performance", {})
        learning_insight = await _generate_learning_insight(
            pre_test_score,
            post_test_score,
            concept_performance
        )
        
        # Store learning insight
        DOCUMENT_STORE[document_id]["learning_session"]["learning_insight"] = learning_insight
        
        return LearningGainResponse(
            pre_score=pre_test_score,
            post_score=post_test_score,
            learning_gain_percentage=round(learning_gain_percentage, 2),
            concept_performance=DOCUMENT_STORE[document_id]["learning_session"].get("concept_performance"),
            learning_insight=DOCUMENT_STORE[document_id]["learning_session"].get("learning_insight")
)
        
    finally:
        # Restore original mcqs
        DOCUMENT_STORE[document_id]["mcqs"] = original_mcqs


async def _generate_learning_insight(pre_score: float, post_score: float, concept_performance: dict) -> str:
    """
    Generate AI-powered learning trajectory summary.
    
    Args:
        pre_score: Pre-test score percentage
        post_score: Post-test score percentage
        concept_performance: Dictionary with weak/strong concepts and accuracy map
        
    Returns:
        Learning insight text
    """
    from app.core.llm import call_llm
    
    # Extract weak and strong concepts
    weak_concepts = concept_performance.get("weak", [])
    strong_concepts = concept_performance.get("strong", [])
    
    # Format concepts for prompt
    weak_str = ", ".join(weak_concepts) if weak_concepts else "None identified"
    strong_str = ", ".join(strong_concepts) if strong_concepts else "None identified"
    
    # Build prompt
    prompt = f"""Generate a short professional learning insight based on:

Pre-test score: {pre_score}%
Post-test score: {post_score}%
Weak concepts: {weak_str}
Strong concepts: {strong_str}

Explain improvement trajectory in 3-4 sentences.
Be encouraging but honest.
No markdown.
Plain text only."""
    
    try:
        learning_insight = await call_llm(prompt)
        return learning_insight.strip()
    except Exception:
        # Fallback if LLM fails
        delta = post_score - pre_score
        if delta > 0:
            return f"You improved from {pre_score}% to {post_score}%, showing {delta}% growth. Continue focusing on your weak areas to further strengthen your understanding."
        elif delta < 0:
            return f"Your score decreased from {pre_score}% to {post_score}%. Review the material and focus on the concepts you found challenging."
        else:
            return f"Your score remained at {pre_score}%. Consider reviewing the material more thoroughly to improve your understanding."
