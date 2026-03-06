"""
MCQ Session History model for storing user quiz results.
Task 73: Save MCQ session scores per user
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class MCQSessionHistory(Base):
    """
    Model for storing MCQ session results per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        document_id: The document ID associated with the MCQ session
        total_questions: Total number of questions in the session
        correct_answers: Number of correct answers
        score_percentage: Score as a percentage (0-100)
        detailed_results: JSON string containing detailed results for each question
        created_at: Timestamp of session completion
    """
    __tablename__ = "mcq_session_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    score_percentage = Column(Float, nullable=False)
    detailed_results = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<MCQSessionHistory(id={self.id}, user_id={self.user_id}, score={self.score_percentage}%)>"
