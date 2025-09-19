#!/usr/bin/env python3
"""
Setup script for QuizMaster application
"""

import os
import sys
import subprocess

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def create_database():
    """Initialize the database"""
    print("Initializing database...")
    from app import app, db
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

def main():
    print("🚀 Setting up QuizMaster Application")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required!")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    try:
        # Install requirements
        install_requirements()
        print("✅ Requirements installed successfully!")
        
        # Create database
        create_database()
        print("✅ Database initialized successfully!")
        
        print("\n🎉 Setup completed successfully!")
        print("\nTo start the application, run:")
        print("  python app.py")
        print("\nThen open your browser to: http://127.0.0.1:5000")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()