# QuizMania

An interactive quiz platform with FastAPI backend and React frontend.

## Features

* User authentication
* Multiple question types
* Categories & difficulty levels
* Timed quizzes with scoring
* Leaderboard & user stats
* Responsive modern UI

## Quick Start

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python sample_data.py
python main.py   # http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install
npm start   # http://localhost:3000
```

## API Endpoints

* `POST /register`
* `POST /login`
* `GET /api/quizzes`
* `POST /api/quiz/<id>/submit`
* `GET /api/leaderboard`

## Future Work

* Admin panel
* Advanced analytics
* Social features
* Mobile app
