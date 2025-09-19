// Quiz App JavaScript
class QuizApp {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.timer = null;
        this.timeLeft = 0;
        this.token = localStorage.getItem('quiz_token');
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadQuizzes();
        await this.loadLeaderboard();
        this.checkAuthStatus();
        this.updateStats();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('hamburger').addEventListener('click', this.toggleMobileMenu);
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.scrollToSection(target);
            });
        });

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    toggleMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        navMenu.classList.toggle('active');
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    checkAuthStatus() {
        if (this.token) {
            this.showAuthenticatedState();
            this.loadUserStats();
        } else {
            this.showUnauthenticatedState();
        }
    }

    showAuthenticatedState() {
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('profile-link').style.display = 'block';
        document.getElementById('profile').style.display = 'block';
        
        const username = localStorage.getItem('quiz_username');
        if (username) {
            document.getElementById('username-display').textContent = username;
        }
    }

    showUnauthenticatedState() {
        document.getElementById('auth-buttons').style.display = 'flex';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('profile-link').style.display = 'none';
        document.getElementById('profile').style.display = 'none';
    }

    async loadQuizzes() {
        try {
            const response = await fetch('/api/quizzes');
            const quizzes = await response.json();
            this.renderQuizzes(quizzes);
            this.updateStatsDisplay('total-quizzes', quizzes.length);
        } catch (error) {
            console.error('Error loading quizzes:', error);
            this.showToast('Error loading quizzes', 'error');
        }
    }

    renderQuizzes(quizzes) {
        const quizGrid = document.getElementById('quiz-grid');
        quizGrid.innerHTML = '';

        quizzes.forEach(quiz => {
            const quizCard = this.createQuizCard(quiz);
            quizGrid.appendChild(quizCard);
        });
    }

    createQuizCard(quiz) {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>${quiz.description}</p>
            <div class="quiz-meta">
                <span class="quiz-category">${quiz.category}</span>
                <span class="quiz-difficulty ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span>
            </div>
            <div class="quiz-info">
                <span><i class="fas fa-question-circle"></i> ${quiz.question_count} questions</span>
                <span><i class="fas fa-clock"></i> ${Math.floor(quiz.time_limit / 60)} min</span>
            </div>
            <button class="btn btn-primary" onclick="quizApp.startQuiz(${quiz.id})">
                Start Quiz <i class="fas fa-play"></i>
            </button>
        `;
        return card;
    }

    async filterQuizzes() {
        const category = document.getElementById('category-filter').value;
        const difficulty = document.getElementById('difficulty-filter').value;
        
        let url = '/api/quizzes?';
        if (category) url += `category=${category}&`;
        if (difficulty) url += `difficulty=${difficulty}&`;
        
        try {
            const response = await fetch(url);
            const quizzes = await response.json();
            this.renderQuizzes(quizzes);
        } catch (error) {
            console.error('Error filtering quizzes:', error);
            this.showToast('Error filtering quizzes', 'error');
        }
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            const leaderboard = await response.json();
            this.renderLeaderboard(leaderboard);
            this.updateStatsDisplay('total-users', leaderboard.length);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    renderLeaderboard(leaderboard) {
        const leaderboardBody = document.getElementById('leaderboard-body');
        leaderboardBody.innerHTML = '';

        leaderboard.forEach((user, index) => {
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';
            
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';
            
            entry.innerHTML = `
                <span class="rank ${rankClass}">#${index + 1}</span>
                <span>${user.username}</span>
                <span>${user.total_score}</span>
                <span>${user.quizzes_taken}</span>
            `;
            leaderboardBody.appendChild(entry);
        });
    }

    async loadUserStats() {
        if (!this.token) return;
        
        try {
            const response = await fetch('/api/user/stats', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                this.renderUserStats(stats);
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    renderUserStats(stats) {
        document.getElementById('user-total-score').textContent = stats.total_score;
        document.getElementById('user-quizzes-taken').textContent = stats.quizzes_taken;
        
        const recentResultsList = document.getElementById('recent-results-list');
        recentResultsList.innerHTML = '';
        
        stats.recent_results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div>
                    <strong>${result.quiz_title}</strong>
                    <div style="font-size: 0.9rem; color: #666;">
                        ${new Date(result.completed_at).toLocaleDateString()}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div><strong>${result.percentage}%</strong></div>
                    <div style="font-size: 0.9rem; color: #666;">
                        ${result.score}/${result.total_questions}
                    </div>
                </div>
            `;
            recentResultsList.appendChild(resultItem);
        });
    }

    async startQuiz(quizId) {
        if (!this.token) {
            this.showToast('Please login to take quizzes', 'warning');
            this.showLoginModal();
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch(`/api/quiz/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.currentQuiz = await response.json();
                this.currentQuestionIndex = 0;
                this.userAnswers = {};
                this.startQuizTimer();
                this.showQuizModal();
                this.renderQuestion();
            } else {
                this.showToast('Error loading quiz', 'error');
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.showToast('Error starting quiz', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showQuizModal() {
        const modal = document.getElementById('quiz-modal');
        document.getElementById('quiz-title').textContent = this.currentQuiz.title;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    startQuizTimer() {
        this.timeLeft = this.currentQuiz.time_limit;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.submitQuiz();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('quiz-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    renderQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const container = document.getElementById('question-container');
        
        // Update progress
        document.getElementById('quiz-progress').textContent = 
            `${this.currentQuestionIndex + 1}/${this.currentQuiz.questions.length}`;
        
        let optionsHtml = '';
        
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
            optionsHtml = `
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <div class="option" onclick="quizApp.selectOption(${index})" data-option="${index}">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (question.question_type === 'text') {
            optionsHtml = `
                <input type="text" class="text-input" id="text-answer" 
                       placeholder="Type your answer here..." 
                       onchange="quizApp.handleTextAnswer(this.value)">
            `;
        }
        
        container.innerHTML = `
            <div class="question-text">${question.question_text}</div>
            ${optionsHtml}
        `;
        
        // Restore previous answer if exists
        const savedAnswer = this.userAnswers[question.id];
        if (savedAnswer !== undefined) {
            if (question.question_type === 'text') {
                document.getElementById('text-answer').value = savedAnswer;
            } else {
                const options = document.querySelectorAll('.option');
                options[savedAnswer].classList.add('selected');
            }
        }
        
        this.updateNavigationButtons();
    }

    selectOption(optionIndex) {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        document.querySelector(`[data-option="${optionIndex}"]`).classList.add('selected');
        
        // Save answer
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        this.userAnswers[question.id] = optionIndex;
    }

    handleTextAnswer(value) {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        this.userAnswers[question.id] = value;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.currentQuiz.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
        }
    }

    async submitQuiz() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const timeTaken = this.currentQuiz.time_limit - this.timeLeft;
        
        this.showLoading();
        
        try {
            const response = await fetch(`/api/quiz/${this.currentQuiz.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    answers: this.userAnswers,
                    time_taken: timeTaken
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showResults(result);
                this.loadLeaderboard(); // Refresh leaderboard
                this.loadUserStats(); // Refresh user stats
                this.updateStatsDisplay('total-attempts', '+1');
            } else {
                this.showToast('Error submitting quiz', 'error');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            this.showToast('Error submitting quiz', 'error');
        } finally {
            this.hideLoading();
            this.closeQuizModal();
        }
    }

    showResults(result) {
        document.getElementById('result-score').textContent = result.score;
        document.getElementById('result-total').textContent = result.total_questions;
        document.getElementById('result-percentage').textContent = `${result.percentage}%`;
        document.getElementById('result-time').textContent = result.time_taken;
        
        document.getElementById('result-modal').style.display = 'block';
    }

    closeQuizModal() {
        document.getElementById('quiz-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    closeResultModal() {
        document.getElementById('result-modal').style.display = 'none';
    }

    retakeQuiz() {
        this.closeResultModal();
        this.startQuiz(this.currentQuiz.id);
    }

    // Authentication methods
    showLoginModal() {
        document.getElementById('login-modal').style.display = 'block';
    }

    closeLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    showRegisterModal() {
        document.getElementById('register-modal').style.display = 'block';
    }

    closeRegisterModal() {
        document.getElementById('register-modal').style.display = 'none';
    }

    async login(event) {
        event.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        this.showLoading();
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                localStorage.setItem('quiz_token', this.token);
                localStorage.setItem('quiz_username', data.username);
                
                this.closeLoginModal();
                this.showAuthenticatedState();
                this.loadUserStats();
                this.showToast('Login successful!', 'success');
            } else {
                const error = await response.json();
                this.showToast(error.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async register(event) {
        event.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        this.showLoading();
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                localStorage.setItem('quiz_token', this.token);
                localStorage.setItem('quiz_username', username);
                
                this.closeRegisterModal();
                this.showAuthenticatedState();
                this.loadUserStats();
                this.showToast('Registration successful!', 'success');
            } else {
                const error = await response.json();
                this.showToast(error.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('Registration failed', 'error');
        } finally {
            this.hideLoading();
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('quiz_token');
        localStorage.removeItem('quiz_username');
        this.showUnauthenticatedState();
        this.showToast('Logged out successfully', 'success');
    }

    // Utility methods
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    updateStatsDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            if (typeof value === 'string' && value.startsWith('+')) {
                const current = parseInt(element.textContent) || 0;
                element.textContent = current + 1;
            } else {
                element.textContent = value;
            }
        }
    }

    async updateStats() {
        // Animate stats on page load
        setTimeout(() => {
            this.animateNumber('total-users', 50);
            this.animateNumber('total-quizzes', 10);
            this.animateNumber('total-attempts', 150);
        }, 1000);
    }

    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);
            
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 30);
    }
}

// Global functions for HTML onclick events
function scrollToSection(sectionId) {
    quizApp.scrollToSection(sectionId);
}

function filterQuizzes() {
    quizApp.filterQuizzes();
}

function showLoginModal() {
    quizApp.showLoginModal();
}

function closeLoginModal() {
    quizApp.closeLoginModal();
}

function showRegisterModal() {
    quizApp.showRegisterModal();
}

function closeRegisterModal() {
    quizApp.closeRegisterModal();
}

function login(event) {
    quizApp.login(event);
}

function register(event) {
    quizApp.register(event);
}

function logout() {
    quizApp.logout();
}

function nextQuestion() {
    quizApp.nextQuestion();
}

function previousQuestion() {
    quizApp.previousQuestion();
}

function submitQuiz() {
    quizApp.submitQuiz();
}

function closeResultModal() {
    quizApp.closeResultModal();
}

function retakeQuiz() {
    quizApp.retakeQuiz();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});