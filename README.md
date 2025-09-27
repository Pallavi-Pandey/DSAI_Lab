# QuizMania - Interactive Quiz Platform

A modern full-stack quiz application built with FastAPI backend and React frontend, featuring user authentication, real-time leaderboards, and a beautiful responsive interface.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Multiple Question Types**: Multiple choice, true/false, and text input questions
- **Quiz Categories**: Programming, Data Science, Mathematics, General Knowledge
- **Difficulty Levels**: Easy, Medium, Hard
- **Timer System**: Time-limited quizzes with visual countdown
- **Real-time Scoring**: Instant feedback and score calculation

### Advanced Features
- **Leaderboard**: Global ranking system with user scores
- **User Profiles**: Personal statistics and quiz history
- **Progress Tracking**: Track quizzes taken and total scores
- **Responsive Design**: Mobile-friendly interface
- **Toast Notifications**: User-friendly feedback system
- **Local Storage**: Persistent login sessions

### User Interface
- **Modern Design**: Clean, gradient-based UI with smooth animations
- **Interactive Components**: Hover effects and smooth transitions
- **Modal System**: Overlays for quizzes, results, and authentication
- **Navigation**: Smooth scrolling single-page application
- **Loading States**: Visual feedback during API calls

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database with sample data**
   ```bash
   python sample_data.py
   ```

5. **Start the FastAPI backend**
   ```bash
   python main.py
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
DSAI_Lab/
├── backend/                 # FastAPI backend
│   ├── app.py              # Main application with API endpoints
│   ├── config.py           # Configuration settings
│   ├── main.py             # Application entry point
│   ├── sample_data.py      # Sample quiz data
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components (Navbar, Modals)
│   │   ├── pages/          # Page components (Home, Quizzes, etc.)
│   │   ├── services/       # Authentication context
│   │   └── styles/         # CSS styles
│   └── package.json        # Node dependencies
├── static/                 # Legacy static files
├── templates/              # Legacy templates  
└── README.md              # This file
```

## 🎮 How to Use

### For Users

1. **Register**: Create a new account with username, email, and password
2. **Browse Quizzes**: View available quizzes by category and difficulty
3. **Take Quizzes**: Select a quiz and answer questions within the time limit
4. **View Results**: See your score, percentage, and time taken
5. **Track Progress**: Monitor your statistics in the profile section
6. **Compete**: Check your ranking on the global leaderboard

### Sample Quizzes Included

The application comes with two sample quizzes:
- **Python Basics** (Easy): 2 questions, 5 minutes
- **Data Science Fundamentals** (Medium): 2 questions, 10 minutes

## 🛠 Technical Details

### Backend (Flask)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens for secure sessions
- **CORS**: Enabled for API access
- **Models**: User, Quiz, Question, QuizResult

### Frontend
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **CSS3**: Modern styling with animations and gradients
- **Responsive**: Mobile-first design approach
- **localStorage**: Client-side session management

### API Endpoints

- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /api/quizzes` - List available quizzes
- `GET /api/quiz/<id>` - Get quiz details and questions
- `POST /api/quiz/<id>/submit` - Submit quiz answers
- `GET /api/leaderboard` - Get top users
- `GET /api/user/stats` - Get user statistics

## 🎨 Design Features

### Visual Elements
- **Gradient Backgrounds**: Modern purple-blue gradient theme
- **Card-based Layout**: Clean, organized content presentation
- **Smooth Animations**: CSS transitions and hover effects
- **Interactive Components**: Buttons with hover states and feedback
- **Typography**: Google Fonts (Poppins) for modern appearance

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Flexible Grid**: CSS Grid and Flexbox layouts
- **Adaptive Navigation**: Hamburger menu for mobile
- **Scalable Interface**: Works on all screen sizes

## 🔧 Customization

### Adding New Quizzes
Edit the `init_sample_data()` function in `app.py` to add more quizzes:

```python
{
    'title': 'Your Quiz Title',
    'description': 'Quiz description',
    'category': 'Category Name',
    'difficulty': 'Easy/Medium/Hard',
    'time_limit': 600,  # seconds
    'questions': [
        {
            'question_text': 'Your question?',
            'question_type': 'multiple_choice/true_false/text',
            'options': ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            'correct_answer': 'Correct Answer',
            'points': 1
        }
    ]
}
```

### Styling
Modify `static/css/style.css` to customize:
- Colors and gradients
- Typography and fonts
- Layout and spacing
- Animations and transitions

## 🚀 Deployment

For production deployment:

1. **Environment Variables**: Set up proper environment variables for secrets
2. **Database**: Use PostgreSQL or MySQL instead of SQLite
3. **Password Hashing**: Implement proper password hashing (bcrypt)
4. **HTTPS**: Enable SSL/TLS encryption
5. **Web Server**: Use Gunicorn or uWSGI with Nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- Admin panel for quiz creation
- Question bank management
- Quiz scheduling and time windows
- Advanced analytics and reporting
- Social features (comments, sharing)
- Mobile app development
- Multi-language support
- Advanced question types (drag-drop, image-based)

---

**Built with ❤️ for learning and knowledge sharing**
