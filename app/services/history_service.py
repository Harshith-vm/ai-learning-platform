"""
History Service for AI Learning Platform
Handles saving of user activity history to database
"""
from sqlalchemy.orm import Session
from app.models.summary_history import SummaryHistory
from app.models.mcq_history import MCQHistory
from app.models.mcq_session_history import MCQSessionHistory
from app.models.document_summary_history import DocumentSummaryHistory


def save_summary_history(
    db: Session,
    user_id: int,
    original_text: str,
    summary_text: str
):
    """
    Saves summary generation history.
    
    Args:
        db: Database session
        user_id: ID of the user who generated the summary
        original_text: The original text that was summarized
        summary_text: The generated summary text
    """
    try:
        history_entry = SummaryHistory(
            user_id=user_id,
            original_text=original_text,
            summary_text=summary_text
        )
        
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
        print(f"[HISTORY] Summary saved with id {history_entry.id}")
        return history_entry
    
    except Exception as e:
        db.rollback()
        print(f"[HISTORY ERROR] Failed to save summary history: {e}")
        return None


def save_document_summary_history(
    db: Session,
    user_id: int,
    document_id: str,
    title: str,
    summary_text: str,
    main_themes: str = None
):
    """
    Saves document summary generation history.
    
    Args:
        db: Database session
        user_id: ID of the user who generated the summary
        document_id: The document identifier
        title: Title of the summary
        summary_text: The generated summary text
        main_themes: JSON string of main themes (optional)
    """
    try:
        history_entry = DocumentSummaryHistory(
            user_id=user_id,
            document_id=document_id,
            title=title,
            summary_text=summary_text,
            main_themes=main_themes
        )
        
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
        print(f"[HISTORY] Document summary saved with id {history_entry.id}")
        return history_entry
    
    except Exception as e:
        db.rollback()
        print(f"[HISTORY ERROR] Failed to save document summary history: {e}")
        return None


def save_mcq_history(
    db: Session,
    user_id: int,
    document_id: str,
    test_type: str,
    score: int,
    total_questions: int
):
    """
    Saves MCQ test history.
    
    Args:
        db: Database session
        user_id: ID of the user who took the test
        document_id: The document identifier
        test_type: Type of test (pre_test or post_test)
        score: User's score (number of correct answers)
        total_questions: Total number of questions
    """
    try:
        history_entry = MCQHistory(
            user_id=user_id,
            document_id=document_id,
            test_type=test_type,
            score=score,
            total_questions=total_questions
        )
        
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
        print(f"[HISTORY] MCQ {test_type} saved with id {history_entry.id}")
        return history_entry
    
    except Exception as e:
        db.rollback()
        print(f"[HISTORY ERROR] Failed to save MCQ history: {e}")
        return None


def save_mcq_session_history(
    db: Session,
    user_id: int,
    document_id: str,
    total_questions: int,
    correct_answers: int,
    score_percentage: float,
    detailed_results: str
):
    """
    Saves MCQ session history.
    
    Args:
        db: Database session
        user_id: ID of the user who completed the session
        document_id: The document identifier
        total_questions: Total number of questions
        correct_answers: Number of correct answers
        score_percentage: Score as percentage
        detailed_results: JSON string of detailed results
    """
    try:
        history_entry = MCQSessionHistory(
            user_id=user_id,
            document_id=document_id,
            total_questions=total_questions,
            correct_answers=correct_answers,
            score_percentage=score_percentage,
            detailed_results=detailed_results
        )
        
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
        print(f"[HISTORY] MCQ session saved with id {history_entry.id}")
        return history_entry
    
    except Exception as e:
        db.rollback()
        print(f"[HISTORY ERROR] Failed to save MCQ session history: {e}")
        return None
