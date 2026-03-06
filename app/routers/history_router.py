"""
History router for viewing user's content generation history.
Task 75: History Viewing API
Task 76: Allow deletion of history items
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.services.auth_dependency import get_current_user
from app.models.user import User
from app.models.summary_history import SummaryHistory
from app.models.mcq_history import MCQHistory
from app.models.mcq_session_history import MCQSessionHistory
from app.models.code_analysis_history import CodeAnalysisHistory
from app.models.document_summary_history import DocumentSummaryHistory
from app.models.key_points_history import KeyPointsHistory
from app.models.flashcard_history import FlashcardHistory
from app.models.learning_gain_history import LearningGainHistory

router = APIRouter(
    prefix="/history",
    tags=["History"]
)


@router.get("/summaries")
def get_summary_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get text summary generation history for the current user.
    
    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (1-100)
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of summary history entries
    """
    summaries = (
        db.query(SummaryHistory)
        .filter(SummaryHistory.user_id == current_user.id)
        .order_by(SummaryHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": s.id,
            "original_text": s.original_text[:200] + "..." if len(s.original_text) > 200 else s.original_text,
            "summary_text": s.summary_text[:200] + "..." if len(s.summary_text) > 200 else s.summary_text,
            "created_at": s.created_at.isoformat()
        }
        for s in summaries
    ]


@router.get("/document-summaries")
def get_document_summary_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get document summary generation history for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of document summary history entries
    """
    summaries = (
        db.query(DocumentSummaryHistory)
        .filter(DocumentSummaryHistory.user_id == current_user.id)
        .order_by(DocumentSummaryHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": s.id,
            "document_id": s.document_id,
            "title": s.title,
            "summary_text": s.summary_text[:200] + "..." if len(s.summary_text) > 200 else s.summary_text,
            "created_at": s.created_at.isoformat()
        }
        for s in summaries
    ]


@router.get("/key-points")
def get_key_points_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get key points extraction history for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of key points history entries
    """
    import json
    
    key_points = (
        db.query(KeyPointsHistory)
        .filter(KeyPointsHistory.user_id == current_user.id)
        .order_by(KeyPointsHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": kp.id,
            "document_id": kp.document_id,
            "key_points": json.loads(kp.key_points) if kp.key_points else [],
            "created_at": kp.created_at.isoformat()
        }
        for kp in key_points
    ]


@router.get("/flashcards")
def get_flashcard_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get flashcard generation history for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of flashcard history entries
    """
    import json
    
    flashcards = (
        db.query(FlashcardHistory)
        .filter(FlashcardHistory.user_id == current_user.id)
        .order_by(FlashcardHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": fc.id,
            "document_id": fc.document_id,
            "flashcards": json.loads(fc.flashcards) if fc.flashcards else [],
            "created_at": fc.created_at.isoformat()
        }
        for fc in flashcards
    ]


@router.get("/mcqs")
def get_mcq_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get MCQ test history (pre-test/post-test) for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of MCQ test history entries
    """
    mcqs = (
        db.query(MCQHistory)
        .filter(MCQHistory.user_id == current_user.id)
        .order_by(MCQHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": m.id,
            "document_id": m.document_id,
            "test_type": m.test_type,
            "score": m.score,
            "total_questions": m.total_questions,
            "created_at": m.created_at.isoformat()
        }
        for m in mcqs
    ]


@router.get("/mcq-sessions")
def get_mcq_session_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get MCQ session history for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of MCQ session history entries
    """
    sessions = (
        db.query(MCQSessionHistory)
        .filter(MCQSessionHistory.user_id == current_user.id)
        .order_by(MCQSessionHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": s.id,
            "document_id": s.document_id,
            "total_questions": s.total_questions,
            "correct_answers": s.correct_answers,
            "score_percentage": s.score_percentage,
            "created_at": s.created_at.isoformat()
        }
        for s in sessions
    ]


@router.get("/learning-gains")
def get_learning_gain_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get learning gain test history for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of learning gain history entries
    """
    learning_gains = (
        db.query(LearningGainHistory)
        .filter(LearningGainHistory.user_id == current_user.id)
        .order_by(LearningGainHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": lg.id,
            "document_id": lg.document_id,
            "pre_test_score": lg.pre_test_score,
            "post_test_score": lg.post_test_score,
            "learning_gain": lg.learning_gain,
            "created_at": lg.created_at.isoformat()
        }
        for lg in learning_gains
    ]


@router.get("/code-analyses")
def get_code_analysis_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    analysis_type: Optional[str] = Query(None, description="Filter by analysis type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get code analysis history for the current user.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        analysis_type: Optional filter by analysis type
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of code analysis history entries
    """
    query = (
        db.query(CodeAnalysisHistory)
        .filter(CodeAnalysisHistory.user_id == current_user.id)
    )
    
    if analysis_type:
        query = query.filter(CodeAnalysisHistory.analysis_type == analysis_type)
    
    history = (
        query
        .order_by(CodeAnalysisHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": h.id,
            "analysis_type": h.analysis_type,
            "language": h.language,
            "session_id": h.session_id,
            "input_code": h.input_code[:200] + "..." if len(h.input_code) > 200 else h.input_code,
            "created_at": h.created_at.isoformat()
        }
        for h in history
    ]


@router.get("/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall statistics for the current user's activity.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Dictionary with counts for each type of content
    """
    stats = {
        "summaries": db.query(SummaryHistory).filter(SummaryHistory.user_id == current_user.id).count(),
        "document_summaries": db.query(DocumentSummaryHistory).filter(DocumentSummaryHistory.user_id == current_user.id).count(),
        "key_points": db.query(KeyPointsHistory).filter(KeyPointsHistory.user_id == current_user.id).count(),
        "flashcards": db.query(FlashcardHistory).filter(FlashcardHistory.user_id == current_user.id).count(),
        "mcq_tests": db.query(MCQHistory).filter(MCQHistory.user_id == current_user.id).count(),
        "mcq_sessions": db.query(MCQSessionHistory).filter(MCQSessionHistory.user_id == current_user.id).count(),
        "learning_gains": db.query(LearningGainHistory).filter(LearningGainHistory.user_id == current_user.id).count(),
        "code_analyses": db.query(CodeAnalysisHistory).filter(CodeAnalysisHistory.user_id == current_user.id).count()
    }
    
    return stats


@router.get("/recent")
def get_recent_activity(
    limit: int = Query(10, ge=1, le=50, description="Number of recent items to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent activity across all content types for the current user.
    
    Args:
        limit: Number of recent items to return (1-50)
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        List of recent activity items sorted by timestamp
    """
    activities = []
    
    # Get recent summaries
    summaries = (
        db.query(SummaryHistory)
        .filter(SummaryHistory.user_id == current_user.id)
        .order_by(SummaryHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    for s in summaries:
        activities.append({
            "type": "summary",
            "id": s.id,
            "preview": s.summary_text[:100] + "..." if len(s.summary_text) > 100 else s.summary_text,
            "created_at": s.created_at
        })
    
    # Get recent code analyses
    code_analyses = (
        db.query(CodeAnalysisHistory)
        .filter(CodeAnalysisHistory.user_id == current_user.id)
        .order_by(CodeAnalysisHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    for ca in code_analyses:
        activities.append({
            "type": "code_analysis",
            "id": ca.id,
            "analysis_type": ca.analysis_type,
            "language": ca.language,
            "created_at": ca.created_at
        })
    
    # Get recent MCQ sessions
    mcq_sessions = (
        db.query(MCQSessionHistory)
        .filter(MCQSessionHistory.user_id == current_user.id)
        .order_by(MCQSessionHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    for ms in mcq_sessions:
        activities.append({
            "type": "mcq_session",
            "id": ms.id,
            "score_percentage": ms.score_percentage,
            "created_at": ms.created_at
        })
    
    # Sort all activities by timestamp and limit
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    activities = activities[:limit]
    
    # Convert datetime to ISO format
    for activity in activities:
        activity["created_at"] = activity["created_at"].isoformat()
    
    return activities



# ============================================================================
# DELETE ENDPOINTS - Task 76: Allow deletion of history items
# ============================================================================

@router.delete("/summaries/{summary_id}")
def delete_summary_history(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a text summary history entry.
    
    Args:
        summary_id: ID of the summary to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If summary not found
        HTTPException 403: If user doesn't own the summary
    """
    summary = db.query(SummaryHistory).filter(
        SummaryHistory.id == summary_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    if summary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this summary")
    
    db.delete(summary)
    db.commit()
    
    return {"message": "Summary history deleted successfully"}


@router.delete("/document-summaries/{summary_id}")
def delete_document_summary_history(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a document summary history entry.
    
    Args:
        summary_id: ID of the document summary to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If summary not found
        HTTPException 403: If user doesn't own the summary
    """
    summary = db.query(DocumentSummaryHistory).filter(
        DocumentSummaryHistory.id == summary_id
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Document summary not found")
    
    if summary.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this summary")
    
    db.delete(summary)
    db.commit()
    
    return {"message": "Document summary history deleted successfully"}


@router.delete("/key-points/{key_points_id}")
def delete_key_points_history(
    key_points_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a key points history entry.
    
    Args:
        key_points_id: ID of the key points entry to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If key points not found
        HTTPException 403: If user doesn't own the entry
    """
    key_points = db.query(KeyPointsHistory).filter(
        KeyPointsHistory.id == key_points_id
    ).first()
    
    if not key_points:
        raise HTTPException(status_code=404, detail="Key points not found")
    
    if key_points.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")
    
    db.delete(key_points)
    db.commit()
    
    return {"message": "Key points history deleted successfully"}


@router.delete("/flashcards/{flashcard_id}")
def delete_flashcard_history(
    flashcard_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a flashcard history entry.
    
    Args:
        flashcard_id: ID of the flashcard entry to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If flashcard not found
        HTTPException 403: If user doesn't own the entry
    """
    flashcard = db.query(FlashcardHistory).filter(
        FlashcardHistory.id == flashcard_id
    ).first()
    
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    if flashcard.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")
    
    db.delete(flashcard)
    db.commit()
    
    return {"message": "Flashcard history deleted successfully"}


@router.delete("/mcqs/{mcq_id}")
def delete_mcq_history(
    mcq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an MCQ test history entry (pre-test/post-test).
    
    Args:
        mcq_id: ID of the MCQ test to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If MCQ test not found
        HTTPException 403: If user doesn't own the test
    """
    mcq = db.query(MCQHistory).filter(
        MCQHistory.id == mcq_id
    ).first()
    
    if not mcq:
        raise HTTPException(status_code=404, detail="MCQ history not found")
    
    if mcq.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")
    
    db.delete(mcq)
    db.commit()
    
    return {"message": "MCQ history deleted successfully"}


@router.delete("/mcq-sessions/{session_id}")
def delete_mcq_session_history(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an MCQ session history entry.
    
    Args:
        session_id: ID of the MCQ session to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If session not found
        HTTPException 403: If user doesn't own the session
    """
    session = db.query(MCQSessionHistory).filter(
        MCQSessionHistory.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="MCQ session not found")
    
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    
    db.delete(session)
    db.commit()
    
    return {"message": "MCQ session history deleted successfully"}


@router.delete("/learning-gains/{learning_gain_id}")
def delete_learning_gain_history(
    learning_gain_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a learning gain history entry.
    
    Args:
        learning_gain_id: ID of the learning gain entry to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If learning gain not found
        HTTPException 403: If user doesn't own the entry
    """
    learning_gain = db.query(LearningGainHistory).filter(
        LearningGainHistory.id == learning_gain_id
    ).first()
    
    if not learning_gain:
        raise HTTPException(status_code=404, detail="Learning gain not found")
    
    if learning_gain.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")
    
    db.delete(learning_gain)
    db.commit()
    
    return {"message": "Learning gain history deleted successfully"}


@router.delete("/code-analyses/{analysis_id}")
def delete_code_analysis_history(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a code analysis history entry.
    
    Args:
        analysis_id: ID of the code analysis to delete
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If analysis not found
        HTTPException 403: If user doesn't own the analysis
    """
    history = db.query(CodeAnalysisHistory).filter(
        CodeAnalysisHistory.id == analysis_id
    ).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="Code analysis history not found")
    
    if history.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")
    
    db.delete(history)
    db.commit()
    
    return {"message": "Code analysis history deleted successfully"}
