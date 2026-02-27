from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from app.core.llm import call_llm
from app.schemas.requests import TextInput
from app.schemas.summary import SummaryResponse
from app.schemas.mcq import MCQResponse
from app.schemas.document_summary import DocumentSummaryResponse
from app.schemas.key_points import KeyPointsResponse
from app.schemas.flashcard import FlashcardResponse
from app.schemas.document_mcq import MCQResponse as DocumentMCQResponse
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
