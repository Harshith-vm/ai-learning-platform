from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
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
from app.services.summary_service import generate_summary
from app.services.mcq_service import generate_mcqs as generate_text_mcqs
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
import asyncio

app = FastAPI(title="AI Learning Platform", version="1.0.0")


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
async def create_summary(request: TextInput):
    """
    Generate a structured summary from input text.
    
    Args:
        request: TextInput containing the text to summarize
        
    Returns:
        SummaryResponse with title, summary, and key points
        
    Raises:
        HTTPException: If summary generation fails
    """
    try:
        summary = await generate_summary(request.text)
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
    Explain a concept with persona-aware framing and prerequisite extraction.
    
    Supports persona adaptation via query parameter: ?persona=beginner
    
    Args:
        request: ConceptRequest containing the concept to explain
        persona: Optional persona type for adaptive explanation (beginner, student, senior_dev)
        
    Returns:
        JSON with concept, explanation, and prerequisites
        
    Raises:
        HTTPException: If concept is empty or explanation fails
    """
    from app.core.prompts import build_task_prompt
    
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
        
        # Parse response to extract explanation and prerequisites
        if "PREREQUISITES:" in response:
            parts = response.split("PREREQUISITES:", 1)
            explanation_text = parts[0].strip()
            prerequisites_text = parts[1].strip()
            
            # Convert comma-separated string to list
            prerequisites = [
                prereq.strip() 
                for prereq in prerequisites_text.split(",") 
                if prereq.strip()
            ]
        else:
            # Fallback if PREREQUISITES section not found
            explanation_text = response.strip()
            prerequisites = []
        
        return {
            "concept": request.concept,
            "explanation": explanation_text,
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
async def create_document_summary(document_id: str):
    """
    Generate a structured summary for a stored document.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        DocumentSummaryResponse with title, summary, and main themes
        
    Raises:
        HTTPException: If document not found or summarization fails
    """
    summary = await summarize_document(document_id)
    return summary


@app.post("/key-points/{document_id}", response_model=KeyPointsResponse)
async def create_key_points(document_id: str):
    """
    Extract key points from a stored document.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        KeyPointsResponse with 5-10 clear key points
        
    Raises:
        HTTPException: If document not found or extraction fails
    """
    key_points = await extract_key_points(document_id)
    return key_points


@app.post("/flashcards/{document_id}", response_model=FlashcardResponse)
async def create_flashcards(document_id: str):
    """
    Generate flashcards from a stored document.
    
    Args:
        document_id: The unique document identifier
        
    Returns:
        FlashcardResponse with 5-10 high-quality flashcards
        
    Raises:
        HTTPException: If document not found or generation fails
    """
    flashcards = await generate_flashcards(document_id)
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
async def create_mcq_session(document_id: str, request: MCQSessionRequest):
    """
    Evaluate a complete MCQ session and provide scoring.
    
    Args:
        document_id: The unique document identifier
        request: MCQSessionRequest with list of answers
        
    Returns:
        MCQSessionResponse with total questions, correct answers, score percentage, and detailed results
        
    Raises:
        HTTPException: If document not found, MCQs not generated, or invalid indices
    """
    session_result = await evaluate_mcq_session(document_id, request)
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
async def submit_pre_test_answers(document_id: str, request: MCQSessionRequest):
    """
    Submit and evaluate pre-test answers.
    
    Args:
        document_id: The unique document identifier
        request: MCQSessionRequest with answers
        
    Returns:
        MCQSessionResponse with score
        
    Raises:
        HTTPException: If document not found or pre-test not generated
    """
    result = await submit_pre_test(document_id, request)
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
async def submit_post_test_answers(document_id: str, request: MCQSessionRequest):
    """
    Submit and evaluate post-test answers, compute learning gain.
    
    Args:
        document_id: The unique document identifier
        request: MCQSessionRequest with answers
        
    Returns:
        LearningGainResponse with pre-score, post-score, and learning gain percentage
        
    Raises:
        HTTPException: If document not found, post-test not generated, or pre-test not completed
    """
    result = await submit_post_test(document_id, request)
    return result


@app.post("/code")
async def submit_code_session(
    code: Optional[str] = None,
    language: Optional[str] = None,
    context: Optional[str] = None,
    file: UploadFile = File(None)
):
    """
    Create a code session from either raw code or file upload.
    
    Supports file extensions: .py, .cpp, .c, .java, .js, .ts, .go, .rs, .rb, .php, .swift, .kt, .cs, .html, .css, .sql, .sh, .r, .m, .scala
    
    Args:
        code: Raw code string (optional, via JSON body)
        language: Programming language (optional)
        context: Additional context about the code (optional)
        file: Uploaded code file (optional)
        
    Returns:
        JSON with session_id, language, and message
        
    Raises:
        HTTPException: If neither code nor file provided, or validation fails
    """
    # Handle both JSON body and file upload
    # If file is provided, it takes priority
    result = await store_code_session(code=code, language=language, file=file, context=context)
    return result

@app.post("/code/explain/{session_id}")
async def explain_code_session(
    session_id: str,
    stream: bool = Query(False),
    persona: Optional[str] = Query(None, description="Persona type: beginner, student, or senior_dev")
):
    """
    Generate structured explanation for stored code.

    Supports streaming via query parameter: ?stream=true
    Supports persona adaptation via query parameter: ?persona=beginner

    Args:
        session_id: The code session identifier
        stream: If True, stream the explanation progressively (default: False)
        persona: Optional persona type for adaptive explanation (beginner, student, senior_dev)

    Returns:
        If stream=False: CodeExplanationResponse with explanation text (JSON)
        If stream=True: StreamingResponse with text/plain content

    Raises:
        HTTPException: If session not found or explanation fails
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
        return result



@app.post("/code/improve/{session_id}", response_model=CodeImprovementResponse)
async def improve_code_session(session_id: str):
    """
    Generate improvement suggestions for stored code.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        CodeImprovementResponse with improvement suggestions
        
    Raises:
        HTTPException: If session not found or improvement generation fails
    """
    result = await improve_code(session_id)
    return result


@app.post("/code/complexity/{session_id}", response_model=ComplexityResponse)
async def analyze_code_complexity(session_id: str):
    """
    Analyze time and space complexity of stored code.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        ComplexityResponse with time complexity, space complexity, and justification
        
    Raises:
        HTTPException: If session not found or complexity analysis fails
    """
    result = await analyze_complexity(session_id)
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
async def refactor_code_session(session_id: str):
    """
    Refactor and improve stored code.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        CodeRefactorResponse with refactored code
        
    Raises:
        HTTPException: If session not found or refactoring fails
    """
    result = await refactor_code(session_id)
    return result


@app.post("/code/stepwise/{session_id}", response_model=CodeStepwiseResponse)
async def explain_code_stepwise_session(session_id: str):
    """
    Generate step-by-step explanation for stored code.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        CodeStepwiseResponse with step-by-step explanation
        
    Raises:
        HTTPException: If session not found or explanation fails
    """
    result = await explain_code_stepwise(session_id)
    return result


@app.post("/code/architecture/{session_id}", response_model=CodeArchitectureResponse)
async def analyze_code_architecture(session_id: str):
    """
    Perform high-level architectural analysis of stored code.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        CodeArchitectureResponse with architecture analysis
        
    Raises:
        HTTPException: If session not found or analysis fails
    """
    result = await analyze_architecture(session_id)
    return result


@app.post("/code/refactor-impact/{session_id}", response_model=RefactorImpactResponse)
async def compare_refactor_impact_endpoint(session_id: str):
    """
    Compare complexity between original and refactored code.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        RefactorImpactResponse with complexity comparison and improvement summary
        
    Raises:
        HTTPException: If session not found, refactored code not available, or analysis fails
    """
    result = await compare_refactor_impact(session_id)
    return result


@app.post("/code/quality/{session_id}", response_model=CodeQualityResponse)
async def evaluate_code_quality_endpoint(session_id: str):
    """
    Evaluate code quality with scores for readability, efficiency, and maintainability.
    
    Args:
        session_id: The code session identifier
        
    Returns:
        CodeQualityResponse with quality scores and summary
        
    Raises:
        HTTPException: If session not found or evaluation fails
    """
    result = await evaluate_code_quality(session_id)
    return result
