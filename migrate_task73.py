"""
Database migration script for Task 73 - Save MCQ session scores per user
Creates mcq_session_history table to store user quiz results
"""
from app.database import engine, Base
from app.models.mcq_session_history import MCQSessionHistory
from app.models.user import User

def migrate_database():
    """
    Create or update database tables with MCQSessionHistory model.
    This will create the mcq_session_history table if it doesn't exist.
    """
    print("Starting database migration for Task 73...")
    print("Creating mcq_session_history table...")
    
    try:
        # Create all tables (will create mcq_session_history if it doesn't exist)
        Base.metadata.create_all(bind=engine)
        print("✓ Database migration completed successfully!")
        print("\nNew table created:")
        print("  - mcq_session_history")
        print("    Columns: id, user_id, document_id, total_questions, correct_answers,")
        print("             score_percentage, detailed_results, created_at")
        print("\nMCQ session scores will now be saved to the database and linked to users.")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_database()
