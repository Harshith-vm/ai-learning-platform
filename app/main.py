from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Query, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
from sqlalchemy.orm import Session
from app.core.llm import call_llm
from app.schemas.requests import TextInput, ConceptRequest
from app.schemas.summary import SummaryResponse
from app.schemas.mcq import MCQResponse
from app.schemas.document_summary import DocumentSummaryResponse
from app.schemas.key_points import KeyPointsResponse
from app.schemas.flashcard import FlashcardResponse
from app.schemas.document_mcq import MCQResponse as DocumentMCQResponse
from app.schemas.mcq_feedback import MCQFeedbackRequest, MCQFeedbackResponse
from app.schemas.mcq_session import MCQSessionRequest, MCQSessionResponse
from app.schemas.learning_gain import LearningGainResponse
from app.schemas.code_submission import CodeSubmissionRequest
from app.schemas.code_explanation import CodeExplanationResponse
from app.schemas.code_improvement import CodeImprovementResponse
from app.schemas.code_complexity import ComplexityResponse
from app.schemas.code_generation import CodeGenerationRequest, CodeGenerationResponse
from app.schemas.code_refactor import CodeRefactorResponse
from app.schemas.code_stepwise import CodeStepwiseResponse
from app.schemas.code_architecture import CodeArchitectureResponse
from app.schemas.code_refactor_impact import RefactorImpactResponse
from app.schemas.code_quality import CodeQualityResponse
from app.schemas.code_detect_blocks import DetectBlocksRequest, DetectBlocksResponse
from app.schemas.code_pr_review import PRReviewRequest, PRReviewResponse
from app.schemas.code_inline_explain import InlineExplainRequest, InlineExplainResponse
from app.schemas.code_convert import CodeConvertRequest, CodeConvertResponse
from app.services.summary_service import generate_summary
from app.services.mcq_service import generate_mcqs as generate_text_mcqs
from pydantic import BaseModel
from typing import Optional
from app.services.document_service import (
    extract_text_from_file, 
    validate_file_type, 
    validate_file_size,
    store_document,
    get_document,
    DOCUMENT_STORE
)
from app.services.document_summary_service import summarize_document
from app.services.key_points_service import extract_key_points
from app.services.flashcard_service import generate_flashcards
from app.services.document_mcq_service import generate_mcqs as generate_document_mcqs
from app.services.mcq_feedback_service import get_mcq_feedback
from app.services.mcq_session_service import evaluate_mcq_session
from app.services.learning_gain_service import (
    generate_pre_test,
    submit_pre_test,
    generate_post_test,
    submit_post_test
)
from app.services.code_session_service import store_code_session, explain_code, improve_code, analyze_complexity, refactor_code, explain_code_stepwise, analyze_architecture, compare_refactor_impact, evaluate_code_quality
from app.services.code_generation_service import generate_code
from app.services.code_tools_service import detect_code_blocks, review_pull_request, explain_code_inline, convert_code
from app.services.history_service import (
    save_summary_history,
    save_document_summary_history,
    save_mcq_history,
    save_mcq_session_history
)
from app.routers.auth_router import router as auth_router
from app.routers.history_router import router as history_router
from app.database import engine, Base, get_db
from app.services.auth_dependency import get_current_user
from app.models import User, SummaryHistory, MCQSessionHistory, DocumentSummaryHistory, KeyPointsHistory, FlashcardHistory, LearningGainHistory, CodeAnalysisHistory, MCQHistory
import asyncio
from fastapi.middleware.cors import CORSMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Learning Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.8:3000",  # your frontend network IP
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(history_router)

# Global Exception Handlers

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with structured JSON response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "type": "HTTPException",
                "message": exc.detail
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors with structured JSON response."""
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "type": "ValidationError",
                "message": "Invalid request format"
            }
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions with structured JSON response."""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "type": "ServerError",
                "message": "An unexpected error occurred."
            }
        }
    )


@app.get("/")
async def root():
    return {"message": "AI Learning Platform API"}


@app.get("/test-llm")
async def test_llm():
    response = await call_llm("Say hello in one short sentence.")
    return {"response": response}


@app.post("/generate-summary", response_model=SummaryResponse)
async def create_summary(
    request: TextInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a structured summary from input text and save to user's history.
    
    Args:
        request: TextInput containing the text to summarize
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        SummaryResponse with title, summary, and key points
        
    Raises:
        HTTPException: If summary generation fails
        HTTPException 401: If authentication fails
    """
    try:
        # Generate summary
        summary = await generate_summary(request.text)
        
        # Save to database using history service
        save_summary_history(
            db=db,
            user_id=current_user.id,
            original_text=request.text,
            summary_text=summary.summary
        )
        
        return summary
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-mcqs", response_model=MCQResponse)
async def create_mcqs(request: TextInput):
    """
    Generate 5 multiple choice questions from input text.
    
    Args:
        request: TextInput containing the text to generate questions from
        
    Returns:
        MCQResponse containing exactly 5 MCQs
        
    Raises:
        HTTPException: If MCQ generation fails
    """
    try:
        mcqs = await generate_text_mcqs(request.text)
        return mcqs
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/concept/explain")
async def explain_concept(
    request: ConceptRequest,
    persona: Optional[str] = Query(None, description="Persona type: beginner, student, or senior_dev")
):
    """
    Explain a concept with persona-aware framing and structured educational breakdown.
    
    Supports persona adaptation via query parameter: ?persona=beginner
    
    Args:
        request: ConceptRequest containing the concept to explain
        persona: Optional persona type for adaptive explanation (beginner, student, senior_dev)
        
    Returns:
        JSON with concept, explanation, key_ideas, examples, common_mistakes, and prerequisites
        
    Raises:
        HTTPException: If concept is empty or explanation fails
    """
    from app.core.prompts import build_task_prompt
    import re
    
    # Validate concept is not empty
    if not request.concept or not request.concept.strip():
        raise HTTPException(
            status_code=422,
            detail="Concept cannot be empty"
        )
    
    try:
        # Build persona-aware task prompt
        prompt = build_task_prompt(
            task_type="concept_explain",
            content=request.concept,
            persona=persona
        )
        
        # Call LLM with persona
        response = await call_llm(prompt, persona=persona)
        
        # Parse structured response
        concept_name = request.concept
        explanation_text = ""
        key_ideas = []
        examples = []
        common_mistakes = []
        prerequisites = []
        
        # Extract EXPLANATION section
        if "EXPLANATION:" in response:
            explanation_match = re.search(r'EXPLANATION:\s*(.*?)(?=KEY_IDEAS:|EXAMPLES:|COMMON_MISTAKES:|PREREQUISITES:|$)', response, re.DOTALL)
            if explanation_match:
                explanation_text = explanation_match.group(1).strip()
        
        # Extract KEY_IDEAS section
        if "KEY_IDEAS:" in response:
            key_ideas_match = re.search(r'KEY_IDEAS:\s*(.*?)(?=EXAMPLES:|COMMON_MISTAKES:|PREREQUISITES:|$)', response, re.DOTALL)
            if key_ideas_match:
                key_ideas_text = key_ideas_match.group(1).strip()
                # Parse bullet points or lines
                key_ideas = [
                    line.strip().lstrip('-').lstrip('•').strip()
                    for line in key_ideas_text.split('\n')
                    if line.strip() and not line.strip().startswith('EXAMPLES:')
                ]
        
        # Extract EXAMPLES section
        if "EXAMPLES:" in response:
            examples_match = re.search(r'EXAMPLES:\s*(.*?)(?=COMMON_MISTAKES:|PREREQUISITES:|$)', response, re.DOTALL)
            if examples_match:
                examples_text = examples_match.group(1).strip()
                # Parse bullet points or lines
                examples = [
                    line.strip().lstrip('-').lstrip('•').strip()
                    for line in examples_text.split('\n')
                    if line.strip() and not line.strip().startswith('COMMON_MISTAKES:')
                ]
        
        # Extract COMMON_MISTAKES section
        if "COMMON_MISTAKES:" in response:
            mistakes_match = re.search(r'COMMON_MISTAKES:\s*(.*?)(?=PREREQUISITES:|$)', response, re.DOTALL)
            if mistakes_match:
                mistakes_text = mistakes_match.group(1).strip()
                # Parse Mistake/Correction pairs
                mistake_pattern = r'Mistake:\s*(.*?)\s*Correction:\s*(.*?)(?=Mistake:|$)'
                mistake_matches = re.finditer(mistake_pattern, mistakes_text, re.DOTALL)
                for match in mistake_matches:
                    mistake = match.group(1).strip()
                    correction = match.group(2).strip()
                    if mistake and correction:
                        common_mistakes.append({
                            "mistake": mistake,
                            "correction": correction
                        })
        
        # Extract PREREQUISITES section
        if "PREREQUISITES:" in response:
            prereq_match = re.search(r'PREREQUISITES:\s*(.*?)$', response, re.DOTALL)
            if prereq_match:
                prerequisites_text = prereq_match.group(1).strip()
                # Convert comma-separated string to list
                prerequisites = [
                    prereq.strip()
                    for prereq in prerequisites_text.split(',')
                    if prereq.strip()
                ]
        
        # Fallback: if explanation is empty, use entire response
        if not explanation_text:
            explanation_text = response.strip()
        
        return {
            "concept": concept_name,
            "explanation": explanation_text,
            "key_ideas": key_ideas,
            "examples": examples,
            "common_mistakes": common_mistakes,
            "prerequisites": prerequisites
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )


@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and extract text from a document file.
    
    Supported formats: .txt, .pdf, .docx
    Maximum file size: 5MB
    
    Args:
        file: The uploaded document file
        
    Returns:
        JSON with document_id, filename, and chunk count
        
    Raises:
        HTTPException: If file type is unsupported, file is too large, or extraction fails
    """
    # Validate file type
    validate_file_type(file)
    
    # Validate file size
    await validate_file_size(file)
    
    # Extract text and generate chunks
    result = await extract_text_from_file(file)
    
    # Store document in memory
    document_id = store_document(
        filename=result["filename"],
        text=result["text"],
        chunks=result["chunks"]
    )
    
    return {
        "document_id": document_id,
        "filename": result["filename"],
        "chunk_count": result["chunk_count"]
    }


@app.get("/document/{document_id}")
async def retrieve_document(document_id: str):
    """
    Retrieve a processed document by ID.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        JSON with document details
        
    Raises:
        HTTPException: If document not found
    """
    return get_document(document_id)


@app.post("/summarize/{document_id}", response_model=DocumentSummaryResponse)
async def create_document_summary(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a structured summary for a stored document and save to user's history.
    
    Args:
        document_id: The unique document identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        DocumentSummaryResponse with title, summary, and main themes
        
    Raises:
        HTTPException: If document not found or summarization fails
        HTTPException 401: If authentication fails
    """
    # Generate summary
    summary = await summarize_document(document_id)
    
    # Save to database using history service
    import json
    save_document_summary_history(
        db=db,
        user_id=current_user.id,
        document_id=document_id,
        title=summary.title,
        summary_text=summary.summary,
        main_themes=json.dumps(summary.main_themes) if hasattr(summary, 'main_themes') and summary.main_themes else None
    )
    
    return summary


@app.post("/key-points/{document_id}", response_model=KeyPointsResponse)
async def create_key_points(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extract key points from a stored document and save to user's history.
    
    Args:
        document_id: The unique document identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        KeyPointsResponse with 5-10 clear key points
        
    Raises:
        HTTPException: If document not found or extraction fails
        HTTPException 401: If authentication fails
    """
    # Extract key points
    key_points = await extract_key_points(document_id)
    
    # Save to database
    import json
    history_entry = KeyPointsHistory(
        user_id=current_user.id,
        document_id=document_id,
        key_points=json.dumps(key_points.key_points)
    )
    db.add(history_entry)
    db.commit()
    
    return key_points


@app.post("/flashcards/{document_id}", response_model=FlashcardResponse)
async def create_flashcards(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate flashcards from a stored document and save to user's history.
    
    Args:
        document_id: The unique document identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        FlashcardResponse with 5-10 high-quality flashcards
        
    Raises:
        HTTPException: If document not found or generation fails
        HTTPException 401: If authentication fails
    """
    # Generate flashcards
    flashcards = await generate_flashcards(document_id)
    
    # Save to database
    import json
    # Convert flashcards to dict format for JSON serialization
    flashcards_data = [
        {
            "question": fc.question,
            "answer": fc.answer
        }
        for fc in flashcards.flashcards
    ]
    
    history_entry = FlashcardHistory(
        user_id=current_user.id,
        document_id=document_id,
        flashcards=json.dumps(flashcards_data)
    )
    db.add(history_entry)
    db.commit()
    
    return flashcards


@app.get("/summarize-stream/{document_id}")
async def stream_document_summary(document_id: str):
    """
    Stream the summary of a stored document word by word.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        StreamingResponse with summary text streamed word by word
        
    Raises:
        HTTPException: If document not found or summarization fails
    """
    # Fetch document from store
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    # Get stored summary
    summary_response = DOCUMENT_STORE[document_id].get("summary")
    
    # Generate summary if not cached
    if summary_response is None:
        try:
            summary_response = await summarize_document(document_id)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate summary."
            )
    
    # Stream the summary text
    async def summary_generator(summary_text: str):
        """Generate summary text word by word with delay."""
        words = summary_text.split()
        for word in words:
            yield word + " "
            await asyncio.sleep(0.05)
    
    return StreamingResponse(
        summary_generator(summary_response.summary),
        media_type="text/plain"
    )


@app.post("/mcqs/{document_id}", response_model=DocumentMCQResponse)
async def create_document_mcqs(document_id: str):
    """
    Generate multiple choice questions from a stored document.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        MCQResponse with 5-10 multiple choice questions
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    mcqs = await generate_document_mcqs(document_id)
    return mcqs


@app.post("/mcq-feedback/{document_id}", response_model=MCQFeedbackResponse)
async def create_mcq_feedback(document_id: str, request: MCQFeedbackRequest):
    """
    Provide instant feedback for a user's MCQ answer.
    
    Args:
        document_id: The unique document identifier
        request: MCQFeedbackRequest with question and selected option indices
        
    Returns:
        MCQFeedbackResponse with correctness, explanation, and feedback message
        
    Raises:
        HTTPException: If document not found, MCQs not generated, or invalid indices
    """
    feedback = await get_mcq_feedback(document_id, request)
    return feedback


@app.post("/mcq-session/{document_id}", response_model=MCQSessionResponse)
async def create_mcq_session(
    document_id: str,
    request: MCQSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluate a complete MCQ session, provide scoring, and save to user's history.
    
    Args:
        document_id: The unique document identifier
        request: MCQSessionRequest with list of answers
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        MCQSessionResponse with total questions, correct answers, score percentage, and detailed results
        
    Raises:
        HTTPException: If document not found, MCQs not generated, or invalid indices
        HTTPException 401: If authentication fails
    """
    # Evaluate the MCQ session
    session_result = await evaluate_mcq_session(document_id, request)
    
    # Save to database using history service
    import json
    save_mcq_session_history(
        db=db,
        user_id=current_user.id,
        document_id=document_id,
        total_questions=session_result.total_questions,
        correct_answers=session_result.correct_answers,
        score_percentage=session_result.score_percentage,
        detailed_results=json.dumps(session_result.detailed_results)
    )
    
    return session_result
    return session_result


@app.post("/learning/pre-test/{document_id}", response_model=DocumentMCQResponse)
async def create_pre_test(document_id: str):
    """
    Generate fresh MCQs for pre-test.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        MCQResponse with fresh pre-test MCQs
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    pre_test = await generate_pre_test(document_id)
    return pre_test


@app.post("/learning/pre-test/submit/{document_id}", response_model=MCQSessionResponse)
async def submit_pre_test_answers(
    document_id: str,
    request: MCQSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit and evaluate pre-test answers and save to user's history.
    
    Args:
        document_id: The unique document identifier
        request: MCQSessionRequest with answers
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        MCQSessionResponse with score
        
    Raises:
        HTTPException: If document not found or pre-test not generated
        HTTPException 401: If authentication fails
    """
    # Evaluate the test
    result = await submit_pre_test(document_id, request)
    
    # Save to database using history service
    save_mcq_history(
        db=db,
        user_id=current_user.id,
        document_id=document_id,
        test_type="pre_test",
        score=result.correct_answers,
        total_questions=result.total_questions
    )
    
    return result


@app.post("/learning/post-test/{document_id}", response_model=DocumentMCQResponse)
async def create_post_test(document_id: str):
    """
    Generate fresh MCQs for post-test.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        MCQResponse with fresh post-test MCQs
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    post_test = await generate_post_test(document_id)
    return post_test


@app.post("/learning/post-test/submit/{document_id}", response_model=LearningGainResponse)
async def submit_post_test_answers(
    document_id: str,
    request: MCQSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit and evaluate post-test answers, compute learning gain, and save to user's history.
    
    Args:
        document_id: The unique document identifier
        request: MCQSessionRequest with answers
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        LearningGainResponse with pre-score, post-score, and learning gain percentage
        
    Raises:
        HTTPException: If document not found, post-test not generated, or pre-test not completed
        HTTPException 401: If authentication fails
    """
    # Submit post-test and calculate learning gain
    result = await submit_post_test(document_id, request)
    
    # Get the post-test MCQs to determine total questions
    from app.services.document_service import DOCUMENT_STORE
    post_test_mcqs = DOCUMENT_STORE[document_id]["learning_session"].get("post_test_mcqs", [])
    total_questions = len(post_test_mcqs)
    
    # Save MCQ history for post-test using history service
    save_mcq_history(
        db=db,
        user_id=current_user.id,
        document_id=document_id,
        test_type="post_test",
        score=int(result.post_score * total_questions / 100),
        total_questions=total_questions
    )
    
    # Save learning gain history
    from app.models.learning_gain_history import LearningGainHistory
    try:
        history_entry = LearningGainHistory(
            user_id=current_user.id,
            document_id=document_id,
            pre_test_score=result.pre_score,
            post_test_score=result.post_score,
            learning_gain=result.learning_gain_percentage
        )
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        print(f"[HISTORY] Learning gain saved with id {history_entry.id}")
    except Exception as e:
        db.rollback()
        print(f"[HISTORY ERROR] Failed to save learning gain history: {e}")
    
    return result


from fastapi import UploadFile, File, Form
from typing import Optional

class CodeInput(BaseModel):
    code: str
    language: Optional[str] = None
    context: Optional[str] = None

@app.post("/code")
async def submit_code(data: CodeInput):
    code = data.code
    language = data.language
    context = data.context

    if not code or code.strip() == "":
        raise HTTPException(status_code=400, detail="No code provided")

    result = await store_code_session(
        code=code,
        language=language,
        file=None,
        context=context,
    )

    return result

@app.post("/code/explain/{session_id}")
async def explain_code_session(
    session_id: str,
    stream: bool = Query(False),
    persona: Optional[str] = Query(None, description="Persona type: beginner, student, or senior_dev"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate structured explanation for stored code and save to user's history.

    Supports streaming via query parameter: ?stream=true
    Supports persona adaptation via query parameter: ?persona=beginner

    Args:
        session_id: The code session identifier
        stream: If True, stream the explanation progressively (default: False)
        persona: Optional persona type for adaptive explanation (beginner, student, senior_dev)
        current_user: Current authenticated user (from JWT token)
        db: Database session

    Returns:
        If stream=False: CodeExplanationResponse with explanation text (JSON)
        If stream=True: StreamingResponse with text/plain content

    Raises:
        HTTPException: If session not found or explanation fails
        HTTPException 401: If authentication fails
    """
    if stream:
        # Return streaming response with persona
        return StreamingResponse(
            stream_explain_code(session_id, persona=persona),
            media_type="text/plain"
        )
    else:
        # Return normal JSON response with persona
        result = await explain_code(session_id, persona=persona)
        
        # Get code from session for history
        from app.services.code_session_service import get_code_session
        session = get_code_session(session_id)
        
        # Save to database
        import json
        history_entry = CodeAnalysisHistory(
            user_id=current_user.id,
            analysis_type="explain_code",
            input_code=session.get("code", ""),
            result_output=result.get("explanation", ""),
            language=session.get("language"),
            session_id=session_id
        )
        db.add(history_entry)
        db.commit()
        
        return result



@app.post("/code/improve/{session_id}", response_model=CodeImprovementResponse)
async def improve_code_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate improvement suggestions for stored code and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        CodeImprovementResponse with improvement suggestions
        
    Raises:
        HTTPException: If session not found or improvement generation fails
        HTTPException 401: If authentication fails
    """
    result = await improve_code(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="improve_code",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/complexity/{session_id}", response_model=ComplexityResponse)
async def analyze_code_complexity(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze time and space complexity of stored code and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        ComplexityResponse with time complexity, space complexity, and justification
        
    Raises:
        HTTPException: If session not found or complexity analysis fails
        HTTPException 401: If authentication fails
    """
    result = await analyze_complexity(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="complexity_analysis",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/generate", response_model=CodeGenerationResponse)
async def generate_code_from_description(request: CodeGenerationRequest):
    """
    Generate code based on problem description.
    
    Args:
        request: CodeGenerationRequest with problem description, language, and optional constraints
        
    Returns:
        CodeGenerationResponse with generated code
        
    Raises:
        HTTPException: If validation fails or code generation fails
    """
    result = await generate_code(request)
    return result


@app.post("/code/refactor/{session_id}", response_model=CodeRefactorResponse)
async def refactor_code_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refactor and improve stored code and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        CodeRefactorResponse with refactored code
        
    Raises:
        HTTPException: If session not found or refactoring fails
        HTTPException 401: If authentication fails
    """
    result = await refactor_code(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="refactor_code",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/stepwise/{session_id}", response_model=CodeStepwiseResponse)
async def explain_code_stepwise_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate step-by-step explanation for stored code and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        CodeStepwiseResponse with step-by-step explanation
        
    Raises:
        HTTPException: If session not found or explanation fails
        HTTPException 401: If authentication fails
    """
    result = await explain_code_stepwise(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="stepwise_explanation",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/architecture/{session_id}", response_model=CodeArchitectureResponse)
async def analyze_code_architecture(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform high-level architectural analysis of stored code and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        CodeArchitectureResponse with architecture analysis
        
    Raises:
        HTTPException: If session not found or analysis fails
        HTTPException 401: If authentication fails
    """
    result = await analyze_architecture(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="architecture_analysis",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/refactor-impact/{session_id}", response_model=RefactorImpactResponse)
async def compare_refactor_impact_endpoint(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare complexity between original and refactored code and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        RefactorImpactResponse with complexity comparison and improvement summary
        
    Raises:
        HTTPException: If session not found, refactored code not available, or analysis fails
        HTTPException 401: If authentication fails
    """
    result = await compare_refactor_impact(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="refactor_impact",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/quality/{session_id}", response_model=CodeQualityResponse)
async def evaluate_code_quality_endpoint(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluate code quality with scores for readability, efficiency, and maintainability and save to user's history.
    
    Args:
        session_id: The code session identifier
        current_user: Current authenticated user (from JWT token)
        db: Database session
        
    Returns:
        CodeQualityResponse with quality scores and summary
        
    Raises:
        HTTPException: If session not found or evaluation fails
        HTTPException 401: If authentication fails
    """
    result = await evaluate_code_quality(session_id)
    
    # Get code from session for history
    from app.services.code_session_service import get_code_session
    session = get_code_session(session_id)
    
    # Save to database
    import json
    history_entry = CodeAnalysisHistory(
        user_id=current_user.id,
        analysis_type="quality_check",
        input_code=session.get("code", ""),
        result_output=json.dumps(result.dict() if hasattr(result, 'dict') else result),
        language=session.get("language"),
        session_id=session_id
    )
    db.add(history_entry)
    db.commit()
    
    return result


@app.post("/code/detect-blocks", response_model=DetectBlocksResponse)
async def detect_code_blocks_endpoint(request: DetectBlocksRequest):
    """
    Detect and extract code blocks from webpage content.
    
    Args:
        request: DetectBlocksRequest with page content
        
    Returns:
        DetectBlocksResponse with list of detected code blocks
        
    Raises:
        HTTPException: If detection fails
    """
    result = await detect_code_blocks(request.page_content)
    return result


@app.post("/code/pr-review", response_model=PRReviewResponse)
async def review_pull_request_endpoint(request: PRReviewRequest):
    """
    Analyze a pull request diff and provide review feedback.
    
    Args:
        request: PRReviewRequest with code diff and language
        
    Returns:
        PRReviewResponse with summary, issues, and suggestions
        
    Raises:
        HTTPException: If review fails
    """
    result = await review_pull_request(request.code_diff, request.language)
    return result


@app.post("/code/inline-explain", response_model=InlineExplainResponse)
async def explain_code_inline_endpoint(request: InlineExplainRequest):
    """
    Generate line-by-line explanation of code.
    
    Args:
        request: InlineExplainRequest with code and language
        
    Returns:
        InlineExplainResponse with line-by-line explanations
        
    Raises:
        HTTPException: If explanation fails
    """
    result = await explain_code_inline(request.code, request.language)
    return result


@app.post("/code/convert", response_model=CodeConvertResponse)
async def convert_code_endpoint(request: CodeConvertRequest):
    """
    Convert code from one programming language to another.
    
    Args:
        request: CodeConvertRequest with source code, source language, and target language
        
    Returns:
        CodeConvertResponse with converted code
        
    Raises:
        HTTPException: If conversion fails
    """
    result = await convert_code(request.source_code, request.source_language, request.target_language)
    return result
