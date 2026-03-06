"""
Database migration script for Task 74 - Save code analyses per user
Creates code_analysis_history table to store user code analysis results
"""
from app.database import engine, Base
from app.models.code_analysis_history import CodeAnalysisHistory
from app.models.user import User

def migrate_database():
    """
    Create or update database tables with CodeAnalysisHistory model.
    This will create the code_analysis_history table if it doesn't exist.
    """
    print("Starting database migration for Task 74...")
    print("Creating code_analysis_history table...")
    
    try:
        # Create all tables (will create code_analysis_history if it doesn't exist)
        Base.metadata.create_all(bind=engine)
        print("✓ Database migration completed successfully!")
        print("\nNew table created:")
        print("  - code_analysis_history")
        print("    Columns: id, user_id, analysis_type, input_code, result_output,")
        print("             language, session_id, created_at")
        print("\nCode analyses will now be saved to the database and linked to users.")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_database()
