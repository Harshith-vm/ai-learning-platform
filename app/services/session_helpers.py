"""
Session helper functions for MCQ storage and retrieval.
Provides explicit helpers for managing MCQ sessions in DOCUMENT_STORE.
"""

from fastapi import HTTPException
from typing import List, Dict, Any
from app.services.document_service import DOCUMENT_STORE


def store_mcqs_in_session(document_id: str, mcqs: Any) -> None:
    """
    Save MCQs into an existing document session under key "mcqs".
    
    Args:
        document_id: The document/session identifier
        mcqs: MCQResponse object containing the generated MCQs
        
    Raises:
        HTTPException: 404 if document/session not found
    """
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail=f"Session not found for document_id: {document_id}"
        )
    
    DOCUMENT_STORE[document_id]["mcqs"] = mcqs


def get_mcqs_from_session(document_id: str) -> Any:
    """
    Retrieve MCQs from an existing document session.
    
    Args:
        document_id: The document/session identifier
        
    Returns:
        MCQResponse object or None if not generated yet
        
    Raises:
        HTTPException: 404 if document/session not found
    """
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail=f"Session not found for document_id: {document_id}"
        )
    
    return DOCUMENT_STORE[document_id].get("mcqs")


def validate_mcqs_exist(document_id: str) -> None:
    """
    Strict validation that MCQs exist in session before allowing submission.
    
    Args:
        document_id: The document/session identifier
        
    Raises:
        HTTPException: 404 if session not found, 400 if MCQs not generated
    """
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail=f"Session not found for document_id: {document_id}. Please upload a document first."
        )
    
    stored_mcqs = DOCUMENT_STORE[document_id].get("mcqs")
    if stored_mcqs is None:
        raise HTTPException(
            status_code=400,
            detail="No MCQs found in session. Please generate MCQs first using POST /mcqs/{document_id} before submitting answers."
        )


def get_session_info(document_id: str) -> Dict[str, Any]:
    """
    Get session information including what's been generated.
    
    Args:
        document_id: The document/session identifier
        
    Returns:
        Dictionary with session status information
        
    Raises:
        HTTPException: 404 if session not found
    """
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(
            status_code=404,
            detail=f"Session not found for document_id: {document_id}"
        )
    
    session = DOCUMENT_STORE[document_id]
    
    return {
        "document_id": document_id,
        "has_summary": session.get("summary") is not None,
        "has_mcqs": session.get("mcqs") is not None,
        "has_key_points": session.get("key_points") is not None,
        "has_flashcards": session.get("flashcards") is not None,
        "filename": session.get("filename"),
        "created_at": session.get("created_at")
    }
