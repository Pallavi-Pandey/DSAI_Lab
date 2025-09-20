#!/bin/bash

# QuizMaster Backend Startup Script

echo "🚀 Starting QuizMaster Backend..."

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Initialize database with sample data
echo "🗄️  Initializing database..."
python3 sample_data.py

# Start the FastAPI server
echo "🌟 Starting FastAPI server on http://localhost:8000"
python3 main.py
