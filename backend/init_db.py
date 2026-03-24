import os
import sys

# Ensure current directory is in path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from database import engine, Base # type: ignore
    import models # type: ignore
    
    print("Initializing Database...")
    Base.metadata.create_all(bind=engine)
    print("Database 'attendance.db' created successfully with all tables.")
    
except Exception as e:
    print(f"Error creating database: {e}")
    print("\nNote: Ensure you have sqlalchemy installed (pip install sqlalchemy)")
