// Quiz Application JavaScript
class QuizApp {
    constructor() {
        this.questions = {};
        this.teams = [];
        this.scores = {};
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];
        this.currentQuestion = null;
        this.timerInterval = null;
        this.currentTimerInterval = null;
        this.lastScoresTime = '0';
        this.refreshInterval = null;
        this.lastSetupTime = '0';
        this.lastStartedTime = '0';
        
        // Socket.io connection
        this.socket = null;
        
        this.initializeQuestions();
        this.bindEvents();
        
        // Initialize socket connection
        this.initializeSocket();
        
        // Check which page we're on
        if (window.location.pathname.includes('questions.html') || window.location.pathname.endsWith('/questions')) {
            this.initializeQuestionsPage();
        } else {
            this.initializeIndexPage();
        }
    }
    
    initializeSocket() {
        // Connect to Socket.io server
        this.socket = io();
        
        // Handle connection
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });
        
        // Handle state updates
        this.socket.on('stateUpdate', (state) => {
            console.log('State update received:', state);
            this.updateState(state);
        });
        
        // Handle auto next question
        this.socket.on('autoNextQuestion', () => {
            console.log('Auto next question received');
            this.goToNextQuestion();
        });
        
        // Handle disconnect
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }
    
    updateState(state) {
        // Update local state with server state
        this.teams = state.teams || [];
        this.scores = state.scores || {};
        this.currentCategory = state.currentCategory;
        this.currentQuestionIndex = state.currentQuestionIndex || 0;
        this.completedCategories = state.completedCategories || [];
        
        // Update UI based on current page
        if (window.location.pathname.includes('questions.html') || window.location.pathname.endsWith('/questions')) {
            this.updateQuestionsPage(state);
        }
        
        // Always update teams display
        this.displayTeams();
    }
    
    updateQuestionsPage(state) {
        if (state.quizActivated && !state.currentCategory) {
            // Show category selection
            this.showCategorySelection();
        } else if (state.currentCategory && !state.scoringPhase) {
            // Show question
            if (this.currentCategory !== state.currentCategory || this.currentQuestionIndex !== state.currentQuestionIndex) {
                this.selectCategory(state.currentCategory);
            }
        } else if (state.scoringPhase) {
            // Show time up screen
            this.timeUp();
        }
    }

    initializeQuestions() {
        this.questions = {
            music: [
                {
                    question: "Who composed the 'Moonlight Sonata'?",
                    options: ["Mozart", "Beethoven", "Bach", "Chopin"],
                    correct: 1
                },
                {
                    question: "Which instrument has 88 keys?",
                    options: ["Guitar", "Violin", "Piano", "Drums"],
                    correct: 2
                },
                {
                    question: "Who is known as the 'King of Pop'?",
                    options: ["Elvis Presley", "Michael Jackson", "Madonna", "Prince"],
                    correct: 1
                }
            ],
            sports: [
                {
                    question: "How many players are on a basketball team?",
                    options: ["4", "5", "6", "7"],
                    correct: 1
                },
                {
                    question: "In which sport would you perform a slam dunk?",
                    options: ["Tennis", "Basketball", "Baseball", "Golf"],
                    correct: 1
                },
                {
                    question: "How often are the Olympic Games held?",
                    options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"],
                    correct: 2
                }
            ],
            art: [
                {
                    question: "Who painted the Mona Lisa?",
                    options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"],
                    correct: 2
                },
                {
                    question: "What art movement is Pablo Picasso associated with?",
                    options: ["Impressionism", "Cubism", "Surrealism", "Realism"],
                    correct: 1
                },
                {
                    question: "Where is the Louvre Museum located?",
                    options: ["London", "Rome", "Paris", "New York"],
                    correct: 2
                }
            ],
            mathematics: [
                {
                    question: "What is the value of Pi (approximately)?",
                    options: ["3.14", "2.71", "1.61", "4.66"],
                    correct: 0
                },
                {
                    question: "What is 15% of 200?",
                    options: ["25", "30", "35", "40"],
                    correct: 1
                },
                {
                    question: "What is the square root of 144?",
                    options: ["10", "11", "12", "13"],
                    correct: 2
                }
            ],
            science: [
                {
                    question: "What is the chemical symbol for gold?",
                    options: ["Go", "Gd", "Au", "Ag"],
                    correct: 2
                },
                {
                    question: "Which planet is known as the 'Red Planet'?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correct: 1
                },
                {
                    question: "What is the largest organ in the human body?",
                    options: ["Heart", "Liver", "Brain", "Skin"],
                    correct: 3
                }
            ],
            geography: [
                {
                    question: "What is the capital of Japan?",
                    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
                    correct: 2
                },
                {
                    question: "Which is the longest river in the world?",
                    options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
                    correct: 1
                },
                {
                    question: "How many continents are there?",
                    options: ["5", "6", "7", "8"],
                    correct: 2
                }
            ],
            history: [
                {
                    question: "In which year did World War II end?",
                    options: ["1943", "1944", "1945", "1946"],
                    correct: 2
                },
                {
                    question: "Who was the first President of the United States?",
                    options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"],
                    correct: 1
                },
                {
                    question: "Which ancient wonder of the world still stands today?",
                    options: ["Colossus of Rhodes", "Hanging Gardens", "Great Pyramid of Giza", "Lighthouse of Alexandria"],
                    correct: 2
                }
            ],
            literature: [
                {
                    question: "Who wrote 'Romeo and Juliet'?",
                    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                    correct: 1
                },
                {
                    question: "What is the first book in the Harry Potter series?",
                    options: ["Chamber of Secrets", "Prisoner of Azkaban", "Philosopher's Stone", "Goblet of Fire"],
                    correct: 2
                },
                {
                    question: "Who wrote '1984'?",
                    options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"],
                    correct: 0
                }
            ]
        };
    }

    bindEvents() {
        // Team setup events
        const teamCountInput = document.getElementById('teamCount');
        if (teamCountInput) {
            teamCountInput.addEventListener('change', () => this.generateTeamInputs());
        }

        const generateBtn = document.getElementById('generateInputs');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateTeamInputs());
        }

        const startBtn = document.getElementById('startQuiz');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // Scoring events
        const submitScoresBtn = document.getElementById('submitScores');
        if (submitScoresBtn) {
            submitScoresBtn.addEventListener('click', () => this.submitScores());
        }

        const skipScoringBtn = document.getElementById('skipScoring');
        if (skipScoringBtn) {
            skipScoringBtn.addEventListener('click', () => this.skipScoring());
        }

        // Category buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.selectCategory(category);
            });
        });

        // Next question button
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
    }

    generateTeamInputs() {
        const teamCount = parseInt(document.getElementById('teamCount').value);
        const teamInputsContainer = document.getElementById('teamInputsContainer');

        // Clear previous inputs
        teamInputsContainer.innerHTML = '';

        // Generate team inputs
        for (let i = 1; i <= teamCount; i++) {
            const teamInput = document.createElement('div');
            teamInput.className = 'team-input';
            teamInput.innerHTML = `
                <label>Team ${i}:</label>
                <input type="text" id="team${i}" placeholder="Enter team ${i} name" required>
            `;
            teamInputsContainer.appendChild(teamInput);
        }

        // Enable setup button
        const setupBtn = document.getElementById('startQuiz');
        if (setupBtn) {
            setupBtn.disabled = false;
        }
    }

    startQuiz() {
        const teamCount = parseInt(document.getElementById('teamCount').value);
        const teams = [];

        // Collect team names
        for (let i = 1; i <= teamCount; i++) {
            const teamName = document.getElementById(`team${i}`).value.trim();
            if (teamName) {
                teams.push({
                    id: i,
                    name: teamName
                });
            }
        }

        if (teams.length === 0) {
            alert('Iltimos, kamida bitta jamoa nomini kiriting!');
            return;
        }

        // Send teams to server
        this.socket.emit('setupTeams', teams);
        console.log('Teams setup sent to server:', teams);

        // Store teams locally
        this.teams = teams;

        // Show setup status
        this.showSetupStatus();
    }

    showSetupStatus() {
        const setupSection = document.getElementById('setupSection');
        const setupStatus = document.getElementById('setupStatus');
        
        if (setupSection) {
            setupSection.classList.add('hidden');
        }
        
        if (setupStatus) {
            setupStatus.classList.remove('hidden');
        }
        
        // Show activate button
        setTimeout(() => {
            this.showActivateButton();
        }, 1500);
    }

    showActivateButton() {
        const setupStatus = document.getElementById('setupStatus');
        if (setupStatus) {
            setupStatus.innerHTML = `
                <div class="status-message">
                    <h3>Quiz Setup Complete!</h3>
                    <p>Teams are ready. Click below to activate the quiz.</p>
                    <button id="activateQuizBtn" class="btn btn-primary">Start Quiz</button>
                </div>
            `;
            
            // Bind activate button
            const activateBtn = document.getElementById('activateQuizBtn');
            if (activateBtn) {
                activateBtn.addEventListener('click', () => this.activateQuiz());
            }
        }
    }

    activateQuiz() {
        // Send activation signal to server
        this.socket.emit('activateQuiz');
        console.log('Quiz activation sent to server');
    }

    submitScores() {
        const scores = {};
        let hasScore = false;
        
        // Collect scores from all team inputs
        this.teams.forEach(team => {
            const scoreInput = document.querySelector(`input[name="score-${team.id}"]:checked`);
            const score = parseInt(scoreInput.value) || 0;
            if (score > 0) {
                scores[team.id] = score;
                hasScore = true;
            }
        });
        
        if (!hasScore) {
            alert('Iltimos, kamida bitta jamoaga ball bering!');
            return;
        }
        
        // Send scores to server via Socket.io
        this.socket.emit('submitScores', scores);
        console.log('Scores submitted to server:', scores);
        
        // Show completion message and restore setup
        this.restoreSetupSection();
    }

    skipScoring() {
        // Send scoring completion signal even when skipping
        this.socket.emit('submitScores', {});
        console.log('Scoring skipped - signal sent to server');
        
        // Restore setup section
        this.restoreSetupSection();
    }

    restoreSetupSection() {
        const scoringSection = document.getElementById('scoringSection');
        const setupSection = document.getElementById('setupSection');
        
        if (scoringSection) {
            scoringSection.classList.add('hidden');
        }
        
        if (setupSection) {
            setupSection.classList.remove('hidden');
        }
    }

    initializeIndexPage() {
        console.log('Index page initialized');
    }

    initializeQuestionsPage() {
        console.log('Questions page initialized');
        this.displayTeams();
    }

    displayTeams() {
        const teamsList = document.getElementById('teamsList');
        if (!teamsList) return;
        
        teamsList.innerHTML = '';
        
        this.teams.forEach(team => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.dataset.teamId = team.id;
            
            const score = this.scores[team.id] || 0;
            
            teamItem.innerHTML = `
                <div class="team-info">
                    <span class="team-name">${team.name}</span>
                    <span class="team-score">${score}</span>
                </div>
            `;
            
            teamsList.appendChild(teamItem);
        });
    }

    showCategorySelection() {
        const welcomeSection = document.getElementById('welcomeSection');
        const categorySection = document.querySelector('.category-section');
        
        if (welcomeSection) {
            welcomeSection.classList.add('hidden');
        }
        
        if (categorySection) {
            categorySection.classList.remove('hidden');
        }
        
        // Update category buttons to show completed status
        const completedCategories = this.completedCategories || [];
        this.updateCategoryButtons(completedCategories);
    }

    selectCategory(category) {
        console.log('=== SELECT CATEGORY DEBUG ===');
        console.log('Selected category:', category);
        console.log('Full questions object:', this.questions);
        console.log('Questions for this category:', this.questions[category]);
        console.log('Questions array length:', this.questions[category] ? this.questions[category].length : 'undefined');
        
        this.currentCategory = category;
        this.currentQuestionIndex = 0;
        
        // Send category selection to server
        this.socket.emit('selectCategory', category);
        console.log('Category selection sent to server:', category);
        
        // Set current questions
        this.currentQuestions = this.questions[category];
        this.currentQuestion = this.currentQuestions[this.currentQuestionIndex];
        
        console.log('After setting:');
        console.log('currentQuestions:', this.currentQuestions);
        console.log('currentQuestionIndex:', this.currentQuestionIndex);
        console.log('currentQuestion:', this.currentQuestion);

        this.displayTeams();
        this.showQuestion();
        
        // Update category button states
        const completedCategories = this.completedCategories || [];
        this.updateCategoryButtons(completedCategories);
        console.log('=== SELECT CATEGORY END ===');
    }

    updateCategoryButtons(completedCategories) {
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            
            if (completedCategories.includes(category)) {
                button.classList.add('completed');
                button.disabled = true;
                button.innerHTML = `
                    <div class="category-icon">?</div>
                    <span>${category.charAt(0).toUpperCase() + category.slice(1)} (Completed)</span>
                `;
            } else {
                button.classList.remove('completed');
                button.disabled = false;
                const categoryIcons = {
                    'music': 'Music',
                    'sports': 'Sports',
                    'art': 'Art',
                    'mathematics': 'Math',
                    'geography': 'Geo'
                };
                const icon = categoryIcons[category] || category.charAt(0).toUpperCase() + category.slice(1);
                button.innerHTML = `
                    <div class="category-icon">${icon}</div>
                    <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                `;
            }
        });
    }

    showQuestion() {
        const categorySection = document.querySelector('.category-section');
        const questionSection = document.getElementById('questionSection');
        const categoryDisplay = document.getElementById('categoryDisplay');
        const questionNumber = document.getElementById('questionNumber');
        const questionText = document.getElementById('questionText');
        const answerOptions = document.getElementById('answerOptions');
        
        if (!categorySection || !questionSection || !categoryDisplay || !questionNumber || !questionText || !answerOptions) {
            console.error('Question display elements not found');
            return;
        }
        
        // Hide category section, show question section
        categorySection.classList.add('hidden');
        questionSection.classList.remove('hidden');
        
        // Update category display
        categoryDisplay.textContent = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
        
        // Update question number
        questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
        
        // Update question text
        questionText.textContent = this.currentQuestion.question;
        
        // Update answer options
        answerOptions.innerHTML = '';
        this.currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.textContent = option;
            answerOptions.appendChild(optionElement);
        });
        
        // Start timer
        this.startTimer();
    }

    startTimer() {
        const timerContainer = document.getElementById('timerContainer');
        const stopwatchDisplay = document.getElementById('stopwatchDisplay');
        const timerTime = document.querySelector('.timer-time');
        const timerCircle = document.querySelector('.timer-circle');
        
        if (!timerContainer || !stopwatchDisplay || !timerTime || !timerCircle) {
            console.error('Timer elements not found');
            return;
        }
        
        // Show timer
        timerContainer.classList.remove('hidden');
        stopwatchDisplay.classList.remove('hidden');
        
        // Start countdown
        this.startStopwatch(timerTime, timerCircle);
    }

    startStopwatch(timerTime, timerCircle) {
        let timeLeft = 30;
        
        const stopwatchInterval = setInterval(() => {
            timeLeft--;
            timerTime.textContent = timeLeft;
            
            // Update timer circle
            const percentage = (timeLeft / 30) * 100;
            timerCircle.style.background = `conic-gradient(#4a90e2 ${percentage}%, #e9ecef ${percentage}%)`;
            
            // Play warning sounds
            if (timeLeft === 10) {
                this.playSound('warning');
            } else if (timeLeft === 5) {
                this.playSound('warning');
            }
            
            // Time's up
            if (timeLeft <= 0) {
                clearInterval(stopwatchInterval);
                this.timeUp();
            }
        }, 1000);
        
        this.currentTimerInterval = stopwatchInterval;
    }

    timeUp() {
        // Play time's up sound
        this.playSound('timeup');
        
        // Clear timer
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
        }
        
        // Send time up signal to server
        this.socket.emit('timeUp');
        console.log('Time up signal sent to server');
        
        // Show only TIME'S UP! message
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.innerHTML = `
                <div style="color: #e74c3c; font-size: 2rem; font-weight: 800;">
                    TIME'S UP!
                </div>
                <div style="color: #4a90e2; font-size: 1.2rem; margin-top: 15px;">
                    Waiting for scoring from admin...
                </div>
            `;
        }
        
        // Hide stopwatch
        const stopwatchDisplay = document.getElementById('stopwatchDisplay');
        if (stopwatchDisplay) {
            stopwatchDisplay.classList.add('hidden');
        }
    }

    playSound(type) {
        // Create audio context for sound generation
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'countdown':
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'warning':
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'timeup':
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.3;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
        }
    }

    goToNextQuestion() {
        console.log('goToNextQuestion called - proceeding to next question');
        this.nextQuestion();
    }

    nextQuestion() {
        console.log('=== NEXT QUESTION DEBUG ===');
        console.log('Current category:', this.currentCategory);
        console.log('Current question index before increment:', this.currentQuestionIndex);
        console.log('Questions array for this category:', this.questions[this.currentCategory]);
        console.log('Questions array length:', this.questions[this.currentCategory] ? this.questions[this.currentCategory].length : 'undefined');
        
        this.currentQuestionIndex++;
        console.log('Current question index after increment:', this.currentQuestionIndex);
        
        if (this.questions[this.currentCategory] && this.currentQuestionIndex < this.questions[this.currentCategory].length) {
            console.log('Showing next question');
            // Update current question object
            this.currentQuestion = this.questions[this.currentCategory][this.currentQuestionIndex];
            this.showQuestion();
        } else {
            console.log('Category completed - marking as completed');
            // Mark this category as completed
            this.markCategoryCompleted(this.currentCategory);
            
            // Update category buttons immediately
            const completedCategories = this.completedCategories || [];
            this.updateCategoryButtons(completedCategories);
            
            // Show category selection again
            this.showCategorySelection();
        }
        console.log('=== NEXT QUESTION END ===');
    }

    markCategoryCompleted(category) {
        if (!this.completedCategories.includes(category)) {
            this.completedCategories.push(category);
            console.log('Category marked as completed:', category);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});

// Generate initial team inputs on page load
window.addEventListener('load', () => {
    const teamCountInput = document.getElementById('teamCount');
    if (teamCountInput) {
        // Generate inputs for default value
        const event = new Event('change');
        teamCountInput.dispatchEvent(event);
    }
});
