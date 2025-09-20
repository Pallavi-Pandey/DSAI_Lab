import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Easy',
    time_limit: 10,
    questions: [
      {
        question: '',
        options: { A: '', B: '', C: '', D: '' },
        correct: 'A'
      }
    ]
  });

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    if (field === 'question' || field === 'correct') {
      newQuestions[index][field] = value;
    } else {
      newQuestions[index].options[field] = value;
    }
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: { A: '', B: '', C: '', D: '' },
          correct: 'A'
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/create-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quizData,
          created_by: user?.username || 'Anonymous'
        }),
      });

      if (response.ok) {
        alert('Quiz created successfully!');
        // Reset form
        setQuizData({
          title: '',
          description: '',
          category: '',
          difficulty: 'Easy',
          time_limit: 10,
          questions: [
            {
              question: '',
              options: { A: '', B: '', C: '', D: '' },
              correct: 'A'
            }
          ]
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      alert('Failed to create quiz. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="create-quiz-container">
      <div className="create-quiz-header">
        <h1>Create New Quiz</h1>
        <p>Design your own quiz and share it with the community!</p>
      </div>

      <form onSubmit={handleSubmit} className="create-quiz-form">
        <div className="quiz-basic-info">
          <h2>Quiz Information</h2>
          
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => handleQuizDataChange('title', e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={quizData.description}
              onChange={(e) => handleQuizDataChange('description', e.target.value)}
              placeholder="Describe what your quiz is about"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={quizData.category}
                onChange={(e) => handleQuizDataChange('category', e.target.value)}
                placeholder="e.g., Programming, Science, History"
                required
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={quizData.difficulty}
                onChange={(e) => handleQuizDataChange('difficulty', e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={quizData.time_limit}
                onChange={(e) => handleQuizDataChange('time_limit', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="quiz-questions">
          <h2>Questions</h2>
          
          {quizData.questions.map((question, index) => (
            <div key={index} className="question-card">
              <div className="question-header">
                <h3>Question {index + 1}</h3>
                {quizData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="remove-question-btn"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="options-grid">
                {['A', 'B', 'C', 'D'].map(option => (
                  <div key={option} className="form-group">
                    <label>Option {option} *</label>
                    <input
                      type="text"
                      value={question.options[option]}
                      onChange={(e) => handleQuestionChange(index, option, e.target.value)}
                      placeholder={`Enter option ${option}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={question.correct}
                  onChange={(e) => handleQuestionChange(index, 'correct', e.target.value)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="add-question-btn"
          >
            + Add Another Question
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
