"""
MCQ History model for storing user MCQ session scores.
Task 73: Save MCQ session scores per user
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class MCQHistory(Base):
    """
    Model for storing MCQ session scores per user.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to users table
        document_id: Document ID (stored as string in DOCUMENT_STORE)
        test_type: Type of test (pre_test or post_test)
        score: User's score (number of correct answers)
        total_questions: Total number of questions in the test
        created_at: Timestamp of test submission
    """
    __tablename__ = "mcq_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, nullable=False, index=True)
    test_type = Column(String, nullable=False)  # "pre_test" or "post_test"
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<MCQHistory(id={self.id}, user_id={self.user_id}, test_type={self.test_type}, score={self.score}/{self.total_questions})>"
