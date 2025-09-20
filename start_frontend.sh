#!/bin/bash

# QuizMaster Frontend Startup Script

echo "⚛️  Starting QuizMaster Frontend..."

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start the React development server
echo "🌟 Starting React development server on http://localhost:3000"
npm start
