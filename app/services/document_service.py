from fastapi import UploadFile, HTTPException
from PyPDF2 import PdfReader
from docx import Document
from app.core.config import settings
from typing import List, Dict, Any
from datetime import datetime
import io
import re
import uuid


# Allowed file types configuration
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
}

# In-memory document store
DOCUMENT_STORE: Dict[str, Dict[str, Any]] = {}


def validate_file_type(file: UploadFile) -> None:
    """
    Validate file type by checking both extension and MIME type.
    
    Args:
        file: The uploaded file to validate
        
    Raises:
        HTTPException: If file type is not supported
    """
    # Check filename extension
    filename = file.filename.lower()
    extension = None
    for ext in ALLOWED_EXTENSIONS:
        if filename.endswith(ext):
            extension = ext
            break
    
    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )


async def validate_file_size(file: UploadFile) -> None:
    """
    Validate file size does not exceed maximum allowed size.
    
    Args:
        file: The uploaded file to validate
        
    Raises:
        HTTPException: If file size exceeds MAX_FILE_SIZE
    """
    # Read file content to check size
    content = await file.read()
    file_size = len(content)
    
    # Reset file pointer to beginning for subsequent reads
    await file.seek(0)
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large."
        )


async def extract_text_from_file(file: UploadFile) -> Dict[str, Any]:
    """
    Extract text content from uploaded file and generate chunks.
    
    Supports: .txt, .pdf, .docx
    
    Args:
        file: The uploaded file
        
    Returns:
        Dictionary containing cleaned text and chunks
        
    Raises:
        HTTPException: If extraction fails
    """
    try:
        # Read file content once
        file_bytes = await file.read()
        
        # Determine file type by extension and delegate to appropriate extractor
        filename = file.filename.lower()
        
        if filename.endswith('.txt'):
            raw_text = _extract_txt(file_bytes)
        elif filename.endswith('.pdf'):
            raw_text = _extract_pdf(file_bytes)
        elif filename.endswith('.docx'):
            raw_text = _extract_docx(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type."
            )
        
        # Clean and normalize extracted text
        cleaned_text = clean_extracted_text(raw_text)
        
        # Generate chunks
        chunks = chunk_text(cleaned_text)
        
        return {
            "text": cleaned_text,
            "chunks": chunks,
            "chunk_count": len(chunks),
            "filename": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Text extraction failed."
        )


def store_document(filename: str, text: str, chunks: List[str]) -> str:
    """
    Store processed document in memory.
    
    Args:
        filename: Original filename
        text: Cleaned text content
        chunks: List of text chunks
        
    Returns:
        Generated document_id
    """
    document_id = str(uuid.uuid4())
    
    DOCUMENT_STORE[document_id] = {
        "filename": filename,
        "text": text,
        "chunks": chunks,
        "summary": None,
        "key_points": None,
        "flashcards": None,
        "mcqs": None,
        "created_at": datetime.utcnow(),
        "learning_session": {
            "pre_test_mcqs": None,
            "pre_test_score": None,
            "post_test_mcqs": None,
            "post_test_score": None,
            "learning_gain_percentage": None,
            "current_streak": {
                "correct": 0,
                "wrong": 0
            }
        }
    }
    
    return document_id


def get_document(document_id: str) -> Dict[str, Any]:
    """
    Retrieve document from memory store.
    
    Args:
        document_id: The document ID to retrieve
        
    Returns:
        Document data dictionary
        
    Raises:
        HTTPException: If document not found
    """
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )
    
    doc = DOCUMENT_STORE[document_id]
    
    return {
        "document_id": document_id,
        "filename": doc["filename"],
        "text": doc["text"],
        "chunk_count": len(doc["chunks"])
    }


def _extract_pdf(file_bytes: bytes) -> str:
    """
    Extract text from PDF file bytes.
    
    Args:
        file_bytes: Raw PDF file bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If PDF extraction fails
    """
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    
    text_parts = []
    for page in reader.pages:
        text = page.extract_text()
        # Skip pages where extraction returns None
        if text is not None:
            text_parts.append(text)
    
    return '\n'.join(text_parts)


def _extract_docx(file_bytes: bytes) -> str:
    """
    Extract text from DOCX file bytes.
    
    Args:
        file_bytes: Raw DOCX file bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If DOCX extraction fails
    """
    docx_file = io.BytesIO(file_bytes)
    doc = Document(docx_file)
    
    # Extract non-empty paragraphs
    paragraphs = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
    
    return '\n'.join(paragraphs)


def _extract_txt(file_bytes: bytes) -> str:
    """
    Extract text from TXT file bytes.
    
    Args:
        file_bytes: Raw TXT file bytes
        
    Returns:
        Extracted text as string
        
    Raises:
        Exception: If TXT extraction fails
    """
    # Decode with error handling - ignore invalid characters
    return file_bytes.decode('utf-8', errors='ignore')


def clean_extracted_text(text: str) -> str:
    """
    Clean and normalize extracted text.
    
    Cleaning operations:
    - Convert Windows newlines to Unix format
    - Replace multiple spaces with single space
    - Reduce excessive blank lines (more than 2 consecutive)
    - Strip leading/trailing whitespace
    - Preserve paragraph breaks
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned and normalized text as string
    """
    # Convert Windows newlines to Unix format
    text = text.replace('\r\n', '\n')
    
    # Replace multiple spaces with single space (but preserve newlines)
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Reduce excessive blank lines (more than 2 consecutive newlines → 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Strip leading/trailing whitespace from the entire text
    text = text.strip()
    
    return text


def chunk_text(text: str, chunk_size: int = 2000) -> List[str]:
    """
    Split text into chunks of maximum chunk_size characters.
    
    Chunking strategy:
    - If text <= chunk_size, return as single chunk
    - Prefer splitting at paragraph boundaries (\n\n)
    - If no boundary found, perform hard split
    - Strip whitespace from each chunk
    - Ensure no empty chunks
    
    Args:
        text: The text to chunk
        chunk_size: Maximum characters per chunk (default: 2000)
        
    Returns:
        List of text chunks
    """
    # If text is small enough, return as single chunk
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    current_position = 0
    text_length = len(text)
    
    while current_position < text_length:
        # Calculate end position for this chunk
        end_position = current_position + chunk_size
        
        # If this is the last chunk, take everything remaining
        if end_position >= text_length:
            chunk = text[current_position:].strip()
            if chunk:
                chunks.append(chunk)
            break
        
        # Look for paragraph boundary within the chunk
        chunk_text = text[current_position:end_position]
        
        # Try to find last paragraph break (\n\n) in the chunk
        last_paragraph_break = chunk_text.rfind('\n\n')
        
        if last_paragraph_break != -1:
            # Split at paragraph boundary
            actual_end = current_position + last_paragraph_break
            chunk = text[current_position:actual_end].strip()
            if chunk:
                chunks.append(chunk)
            # Move past the paragraph break
            current_position = actual_end + 2
        else:
            # No paragraph break found, try to split at newline
            last_newline = chunk_text.rfind('\n')
            
            if last_newline != -1:
                # Split at newline
                actual_end = current_position + last_newline
                chunk = text[current_position:actual_end].strip()
                if chunk:
                    chunks.append(chunk)
                current_position = actual_end + 1
            else:
                # No good break point, perform hard split
                chunk = text[current_position:end_position].strip()
                if chunk:
                    chunks.append(chunk)
                current_position = end_position
    
    return chunks
