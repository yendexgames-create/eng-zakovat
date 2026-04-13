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

    // Show setup button
    const setupBtn = document.getElementById('startQuizBtn');
    if (setupBtn) {
        setupBtn.classList.remove('hidden');
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
        
        // Show setup button
        const setupBtn = document.getElementById('startQuizBtn');
        if (setupBtn) {
            setupBtn.classList.remove('hidden');
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

    clearOldScoringData() {
        // Check for old incomplete scoring data and clear it
        const scoringPhase = localStorage.getItem('scoringPhase');
        const timeUpSignal = localStorage.getItem('timeUpSignal');
        const scoringCompleted = localStorage.getItem('scoringCompleted');
        
        // If scoring was completed but still showing, clear everything
        if (scoringCompleted && (!scoringPhase || scoringPhase !== 'true')) {
            localStorage.removeItem('scoringPhase');
            localStorage.removeItem('currentQuestion');
            localStorage.removeItem('timeUpSignal');
            localStorage.removeItem('scoringCompleted');
        }
    }

    ensureNormalMode() {
        // Force normal setup mode - show header and setup
        const scoringSection = document.getElementById('scoringSection');
        const header = document.querySelector('.header');
        const setupSection = document.querySelector('.setup-section');
        
        if (scoringSection) {
            scoringSection.classList.add('hidden');
            scoringSection.innerHTML = ''; // Clear content too
        }
        if (header) header.classList.remove('hidden'); // Show header in normal mode
        if (setupSection) setupSection.classList.remove('hidden');
    }

    listenForTimeUpSignals() {
        const timeUpListener = (e) => {
            if (e.key === 'timeUpSignal') {
                // Time up signal received, show scoring section
                this.showScoringSection();
            }
        };
        
        window.addEventListener('storage', timeUpListener);
    }

    showScoringSection() {
        // Hide header and replace setup section content with scoring
        const header = document.querySelector('.header');
        const setupSection = document.querySelector('.setup-section');
        const scoringSection = document.getElementById('scoringSection');
        
        if (header) header.classList.add('hidden');
        
        // Replace setup section content with scoring content
        if (setupSection) {
            setupSection.innerHTML = `
                <div class="card">
                    <h2>Score This Question</h2>
                    <div id="scoringQuestion" class="scoring-question"></div>
                    <div id="teamScores" class="team-scores">
                        <!-- Team scoring inputs will be generated here -->
                    </div>
                    <div class="scoring-actions">
                        <button id="submitScores" class="btn btn-primary">Submit Scores</button>
                        <button id="skipScoring" class="btn btn-secondary">Skip Scoring</button>
                    </div>
                </div>
            `;
        }
        
        // Hide the separate scoring section since we're using setup section
        if (scoringSection) scoringSection.classList.add('hidden');
        
        // Load teams and current question
        const storedTeams = localStorage.getItem('quizTeams');
        const currentQuestion = localStorage.getItem('currentQuestion');
        
        if (storedTeams) {
            this.teams = JSON.parse(storedTeams);
        }
        if (currentQuestion) {
            this.currentQuestion = JSON.parse(currentQuestion);
        }
        
        // Display question and team scoring inputs
        this.displayScoringQuestion();
        this.generateTeamScoringInputs();
        
        // Re-bind events for new buttons
        this.bindScoringEvents();
    }

    displayScoringQuestion() {
        const scoringQuestion = document.getElementById('scoringQuestion');
        if (scoringQuestion && this.currentQuestion) {
            scoringQuestion.textContent = this.currentQuestion.question;
        }
    }

    generateTeamScoringInputs() {
        const teamScores = document.getElementById('teamScores');
        teamScores.innerHTML = '';
        
        this.teams.forEach(team => {
            const teamScoreInput = document.createElement('div');
            teamScoreInput.className = 'team-score-input';
            teamScoreInput.innerHTML = `
                <div class="team-score-name">${team.name}</div>
                <div class="score-rating">
                    <input type="radio" id="score-${team.id}-1" name="score-${team.id}" value="1">
                    <label for="score-${team.id}-1">1</label>
                    <input type="radio" id="score-${team.id}-2" name="score-${team.id}" value="2">
                    <label for="score-${team.id}-2">2</label>
                    <input type="radio" id="score-${team.id}-3" name="score-${team.id}" value="3">
                    <label for="score-${team.id}-3">3</label>
                    <input type="radio" id="score-${team.id}-4" name="score-${team.id}" value="4">
                    <label for="score-${team.id}-4">4</label>
                    <input type="radio" id="score-${team.id}-5" name="score-${team.id}" value="5">
                    <label for="score-${team.id}-5">5</label>
                </div>
            `;
            teamScores.appendChild(teamScoreInput);
        });
    }

    bindScoringEvents() {
        const submitScoresBtn = document.getElementById('submitScores');
        const skipScoringBtn = document.getElementById('skipScoring');

        if (submitScoresBtn) {
            submitScoresBtn.addEventListener('click', () => this.submitScores());
        }

        if (skipScoringBtn) {
            skipScoringBtn.addEventListener('click', () => this.skipScoring());
        }
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
        localStorage.setItem('scoringCompleted', Date.now().toString());
        
        // Send refresh signal to questions.html after a small delay
        setTimeout(() => {
            localStorage.setItem('refreshQuestions', Date.now().toString());
        }, 100);
        
        // Clear all scoring data completely
        localStorage.removeItem('scoringPhase');
        localStorage.removeItem('currentQuestion');
        localStorage.removeItem('timeUpSignal');
        localStorage.removeItem('scoringCompleted');
        
        // Restore setup section
        this.restoreSetupSection();
    }

    restoreSetupSection() {
        const setupSection = document.querySelector('.setup-section');
        const header = document.querySelector('.header');
        
        if (setupSection) {
            setupSection.innerHTML = `
                <div class="card">
                    <h2>Team Setup</h2>
                    
                    <div class="input-group">
                        <label for="teamCount">Number of Teams:</label>
                        <input type="number" id="teamCount" min="2" max="10" value="2" class="number-input">
                        <button id="generateInputs" class="btn btn-secondary">Generate Team Inputs</button>
                    </div>

                    <div id="teamInputs" class="team-inputs">
                        <!-- Team inputs will be generated here -->
                    </div>

                    <div class="action-buttons">
                        <button id="startQuiz" class="btn btn-primary" disabled>Setup Quiz</button>
                    </div>
                    <div id="setupStatus" class="setup-status hidden">
                        <div class="status-message">
                            <h3>Quiz Setup Complete!</h3>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Show header again
        if (header) header.classList.remove('hidden');
        
        // Reset completed categories when new teams are added
        localStorage.removeItem('completedCategories');
        
        // Re-bind setup events
        this.bindEvents();
    }

    checkTeamInputs() {
        const teamInputs = document.querySelectorAll('#teamInputs .text-input');
        const startBtn = document.getElementById('startQuiz');
        const allFilled = Array.from(teamInputs).every(input => input.value.trim() !== '');

        startBtn.disabled = !allFilled;
    }

    setupQuiz() {
        const teamInputs = document.querySelectorAll('#teamInputs .text-input');
        this.teams = Array.from(teamInputs).map((input, index) => ({
            id: index + 1,
            name: input.value.trim(),
            score: 0
        }));

        // Initialize scores
        this.teams.forEach(team => {
            this.scores[team.id] = 0;
        });

        // Reset completed categories for new teams
        localStorage.setItem('completedCategories', JSON.stringify([]));

        // Store teams data with timestamp
        localStorage.setItem('quizTeams', JSON.stringify(this.teams));
        localStorage.setItem('quizScores', JSON.stringify(this.scores));
        localStorage.setItem('quizSetup', 'true');
        localStorage.setItem('quizSetupTime', Date.now().toString());

        // Show setup status but don't auto-navigate
        this.showSetupStatus();
        
        // Admin must manually click "Open Questions Page"
        console.log('Quiz setup complete. Admin must manually navigate to questions page.');
    }

    showSetupStatus() {
        const setupStatus = document.getElementById('setupStatus');
        const startBtn = document.getElementById('startQuiz');
        
        setupStatus.classList.remove('hidden');
        startBtn.disabled = true;
    }

    initializeQuestionsPage() {
        const welcomeSection = document.getElementById('welcomeSection');
        const categorySection = document.querySelector('.category-section');
        const startQuizBtn = document.getElementById('startQuizBtn');
        const teamsPreview = document.getElementById('teamsPreview');
        const teamsSidebar = document.querySelector('.teams-sidebar');
        
        // Store initial timestamps
        this.lastSetupTime = localStorage.getItem('quizSetupTime') || '0';
        this.lastStartedTime = localStorage.getItem('quizStartedTime') || '0';
        this.lastScoresTime = localStorage.getItem('scoresTimestamp') || '0';
        
        // Auto-refresh every 2 seconds to check for quiz setup and activation
        this.refreshInterval = setInterval(() => {
            this.checkQuizStatus();
        }, 2000);
        
        // Check for new scores animation
        this.checkForNewScores();
        
        // Load teams data
        const storedTeams = localStorage.getItem('quizTeams');
        const storedScores = localStorage.getItem('quizScores');
        const quizSetup = localStorage.getItem('quizSetup');
        
        if (storedTeams) {
            this.teams = JSON.parse(storedTeams);
            this.displayWelcomeTeams();
        }
        
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        } else {
            this.scores = {};
        }
        
        // Check if quiz is set up - show teams sidebar
        if (quizSetup === 'true') {
            teamsPreview.classList.remove('hidden');
            if (teamsSidebar) {
                teamsSidebar.classList.remove('hidden');
                this.displayTeams();
            }
        }
        
        // Check if quiz is activated
        const quizActivated = localStorage.getItem('quizActivated');
        if (quizActivated === 'true') {
            this.showCategorySelection();
            clearInterval(this.refreshInterval);
            
            // Load completed categories and update buttons
            const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
            this.updateCategoryButtons(completedCategories);
        }
    }

    checkQuizStatus() {
        const quizSetup = localStorage.getItem('quizSetup');
        const quizActivated = localStorage.getItem('quizActivated');
        const currentSetupTime = localStorage.getItem('quizSetupTime') || '0';
        const currentStartedTime = localStorage.getItem('quizStartedTime') || '0';
        
        // Always reload scores to ensure they're up to date
        const storedScores = localStorage.getItem('quizScores');
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        }
        
        // Store last known times
        this.lastSetupTime = this.lastSetupTime || currentSetupTime;
        this.lastStartedTime = this.lastStartedTime || currentStartedTime;
        
        // Check if setup time changed (new setup from index.html)
        if (currentSetupTime !== this.lastSetupTime && currentSetupTime !== '0') {
            this.lastSetupTime = currentSetupTime;
            location.reload();
            return;
        }
        
        // Check if quiz was just started - INSTANT REFRESH
        if (currentStartedTime !== this.lastStartedTime && currentStartedTime !== '0') {
            this.lastStartedTime = currentStartedTime;
            location.reload();
            return;
        }
        
        // If quiz was just set up, refresh to show teams
        if (quizSetup === 'true') {
            const teamsPreview = document.getElementById('teamsPreview');
            const teamsSidebar = document.querySelector('.teams-sidebar');
            const startQuizBtn = document.getElementById('startQuizBtn');
            
            if (teamsPreview && teamsPreview.classList.contains('hidden')) {
                location.reload();
            }
            
            if (teamsSidebar && teamsSidebar.classList.contains('hidden')) {
                teamsSidebar.classList.remove('hidden');
                this.displayTeams();
            }
            
            if (startQuizBtn && !startQuizBtn.classList.contains('hidden')) {
                startQuizBtn.classList.add('hidden');
            }
        }
        
        // If quiz is activated, show category selection
        if (quizActivated === 'true') {
            const welcomeSection = document.getElementById('welcomeSection');
            const categorySection = document.querySelector('.category-section');
            
            if (welcomeSection && !welcomeSection.classList.contains('hidden')) {
                this.showCategorySelection();
            }
        }
    }

    displayWelcomeTeams() {
        const welcomeTeamsList = document.getElementById('welcomeTeamsList');
        welcomeTeamsList.innerHTML = '';
        
        this.teams.forEach(team => {
            const teamItem = document.createElement('div');
            teamItem.className = 'welcome-team-item';
            teamItem.textContent = team.name;
            welcomeTeamsList.appendChild(teamItem);
        });
    }

    activateQuiz() {
        // Send activation signal to server
        this.socket.emit('activateQuiz');
        console.log('Quiz activation sent to server');
    }

    showCategorySelection() {
        const welcomeSection = document.getElementById('welcomeSection');
        const categorySection = document.querySelector('.category-section');
        
        welcomeSection.classList.add('hidden');
        categorySection.classList.remove('hidden');
        
        // Update category buttons to show completed status
        const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
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
                    <div class="category-icon">✓</div>
                    <span>${category.charAt(0).toUpperCase() + category.slice(1)} (Completed)</span>
                `;
            } else {
                button.classList.remove('completed');
                button.disabled = false;
                // Restore original content based on category
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
    
    markCategoryCompleted(category) {
        const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
        if (!completedCategories.includes(category)) {
            completedCategories.push(category);
            localStorage.setItem('completedCategories', JSON.stringify(completedCategories));
            
            // Update buttons immediately
            this.updateCategoryButtons(completedCategories);
        }
    }

    displayTeams() {
        const teamsList = document.getElementById('teamsList');
        teamsList.innerHTML = '';

        // Load teams from localStorage if not available
        if (!this.teams || this.teams.length === 0) {
            const storedTeams = localStorage.getItem('quizTeams');
            if (storedTeams) {
                this.teams = JSON.parse(storedTeams);
            }
        }

        // Load scores from localStorage if not available
        if (!this.scores || Object.keys(this.scores).length === 0) {
            const storedScores = localStorage.getItem('quizScores');
            if (storedScores) {
                this.scores = JSON.parse(storedScores);
            }
        }

        // Sort teams by score (highest first)
        const sortedTeams = [...this.teams].sort((a, b) => {
            const scoreA = this.scores[a.id] || 0;
            const scoreB = this.scores[b.id] || 0;
            return scoreB - scoreA;
        });

        sortedTeams.forEach((team, index) => {
            const score = this.scores[team.id] || 0;
            const rankNumber = index + 1;
            let rankClass = '';
            let rankText = rankNumber.toString();

            // Add special classes for top 3
            if (rankNumber === 1) {
                rankClass = 'gold';
                rankText = '1';
            } else if (rankNumber === 2) {
                rankClass = 'silver';
                rankText = '2';
            } else if (rankNumber === 3) {
                rankClass = 'bronze';
                rankText = '3';
            }

            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.setAttribute('data-team-id', team.id);
            teamItem.innerHTML = `
                <div class="team-rank ${rankClass}">${rankText}</div>
                <div class="team-name">${team.name}</div>
                <div class="team-score">
                    Score: <span class="team-score-value">${score}</span>
                </div>
            `;
            teamsList.appendChild(teamItem);
        });
    }

    checkForNewScores() {
        const newScores = localStorage.getItem('newScores');
        const scoresTimestamp = localStorage.getItem('scoresTimestamp');
        
        // Load final scores from localStorage (submitScores already calculated them)
        const storedScores = localStorage.getItem('quizScores');
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        } else {
            this.scores = {};
        }
        
        if (newScores && scoresTimestamp && scoresTimestamp !== this.lastScoresTime) {
            this.lastScoresTime = scoresTimestamp;
            const scores = JSON.parse(newScores);
            
            // DON'T add scores again - submitScores already did this
            // Just animate score updates
            // Save updated scores (already final)
            localStorage.setItem('quizScores', JSON.stringify(this.scores));
            
            // Animate score updates
            this.animateScoreUpdates(scores);
            
            // Clear new scores
            localStorage.removeItem('newScores');
        }
        
        // Always refresh display after checking
        this.displayTeams();
    }

animateScoreUpdates(scores) {
    // Animate each team's score update with longer delays
    Object.keys(scores).forEach((teamId, index) => {
        const scoreValue = scores[teamId];
        if (scoreValue > 0) {
            setTimeout(() => {
                this.animateSingleTeamScore(teamId, scoreValue);
            }, index * 200); // Reduced stagger delay
        }
    });
    
    // Calculate total animation time and trigger reorder after all animations complete
    const totalScoreAnimationTime = Object.keys(scores).length * 200 + 2500; // 2.5s for individual animations
    setTimeout(() => {
        this.reorderTeamsWithJumpAnimation();
    }, totalScoreAnimationTime);
}

animateSingleTeamScore(teamId, scoreValue) {
        const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
        if (!teamCard) return;
        
        // Add score update animation
        teamCard.classList.add('score-update-animation');
        
        // Create floating score element with actual score value
        const floatingScore = document.createElement('div');
        floatingScore.className = 'floating-score';
        floatingScore.textContent = `+${scoreValue}`; // Show actual score value
        teamCard.appendChild(floatingScore);
        
        // Animate score number with shorter duration
        const scoreElement = teamCard.querySelector('.team-score-value');
        if (scoreElement) {
            // Use CORRECT score from this.scores, not from DOM
            const oldScore = (this.scores[teamId] || 0) - scoreValue;
            const targetScore = this.scores[teamId] || 0;
            this.animateNumber(scoreElement, oldScore, targetScore, 1500); // Shorter animation
        }
        
        // Remove animation classes after completion
        setTimeout(() => {
            teamCard.classList.remove('score-update-animation');
            if (floatingScore.parentNode) {
                floatingScore.remove();
            }
        }, 2000); // Shorter duration to match 3-second timeline
    }

animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
            
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);
            
        element.textContent = current;
            
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
        
    requestAnimationFrame(animate);
}

reorderTeamsWithJumpAnimation() {
    const teamsContainer = document.querySelector('.teams-list');
    if (!teamsContainer) return;
        
    const teamCards = Array.from(teamsContainer.querySelectorAll('.team-item'));
    const currentOrder = teamCards.map(card => parseInt(card.dataset.teamId));
    
    // Get current scores and sort teams
    const teamsWithScores = currentOrder.map(teamId => ({
        id: teamId,
        score: this.scores[teamId] || 0,
        card: teamCards.find(card => parseInt(card.dataset.teamId) === teamId)
    }));
        
    teamsWithScores.sort((a, b) => b.score - a.score);
    
    // Check if order changed
    const newOrder = teamsWithScores.map(team => team.id);
    const orderChanged = !currentOrder.every((id, index) => id === newOrder[index]);
    
    if (orderChanged) {
        // Animate teams moving to new positions
        teamsWithScores.forEach((team, newIndex) => {
            const oldIndex = currentOrder.indexOf(team.id);
                
            if (oldIndex !== newIndex) {
                if (oldIndex > newIndex) {
                    // Team is moving up (jumping forward)
                    team.card.classList.add('jumping', 'moving-up');
                } else {
                    // Team is moving down
                    team.card.classList.add('moving-down');
                }
                    
                // Set new position
                team.card.style.order = newIndex;
                    
                // Remove animation classes after shorter duration
                setTimeout(() => {
                    team.card.classList.remove('jumping', 'moving-up', 'moving-down');
                }, 1500); // Shorter animation duration
            }
        });
            
        // Highlight new rankings
        setTimeout(() => {
            teamsWithScores.forEach((team, index) => {
                if (index < 3) { // Top 3 teams
                    team.card.classList.add('rank-highlight');
                    setTimeout(() => {
                        team.card.classList.remove('rank-highlight');
                    }, 1000); // Shorter highlight duration
                }
            });
        }, 1600);
        
        // Refresh display after reordering
        setTimeout(() => {
            this.displayTeams();
        }, 3000); // Total 3 seconds for all animations
    }
}

    showQuestion() {
        const categorySection = document.querySelector('.category-section');
        const questionSection = document.getElementById('questionSection');
        const categoryDisplay = document.getElementById('categoryDisplay');
        const questionNumber = document.getElementById('questionNumber');
        const questionText = document.getElementById('questionText');
        const answerOptions = document.getElementById('answerOptions');
        const timerContainer = document.getElementById('timerContainer');
        const countdownDisplay = document.getElementById('countdownDisplay');
        const stopwatchDisplay = document.getElementById('stopwatchDisplay');
        const countdownNumber = countdownDisplay.querySelector('.countdown-number');
        const timerTime = stopwatchDisplay.querySelector('.timer-time');
        const timerCircle = stopwatchDisplay.querySelector('.timer-circle');

        // Hide category section and show question section
        categorySection.classList.add('hidden');
        questionSection.classList.remove('hidden');

        // Hide question text and answer options during countdown
        questionText.classList.add('hidden');
        answerOptions.classList.add('hidden');
        stopwatchDisplay.classList.add('hidden');

        // Show timer container and start countdown
        timerContainer.classList.remove('hidden');
        countdownDisplay.classList.remove('hidden');
        
        // Start countdown with callback to show question after completion
        this.startCountdown(countdownDisplay, countdownNumber, stopwatchDisplay, timerTime, timerCircle, () => {
            // Show question after countdown completes
            this.showQuestionAfterCountdown(categoryDisplay, questionNumber, questionText, stopwatchDisplay, timerTime, timerCircle);
        });
    }

    showQuestionAfterCountdown(categoryDisplay, questionNumber, questionText, stopwatchDisplay, timerTime, timerCircle) {
        // Display question info - use currentQuestionIndex + 1 for display
        categoryDisplay.textContent = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
        questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
        questionText.textContent = this.currentQuestion.question;
        
        // Show question text
        questionText.classList.remove('hidden');

        // Show stopwatch and start timer
        stopwatchDisplay.classList.remove('hidden');
        this.startStopwatch(timerTime, timerCircle);

        // Hide next question button - it will only show on TIME'S UP
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            nextBtn.classList.add('hidden');
        }

        // Show answer options
        this.showAnswerOptions();
    }

startCountdown(countdownDisplay, countdownNumber, stopwatchDisplay, timerTime, timerCircle, callback) {
        let count = 3;

        // Show countdown
        countdownDisplay.classList.remove('hidden');
        countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            
            if (count > 0) {
                countdownNumber.textContent = count;
                // Play countdown sound
                this.playSound('countdown');
            } else {
                clearInterval(countdownInterval);
                countdownDisplay.classList.add('hidden');
                
                // Call callback to show question
                if (callback) {
                    callback();
                }
            }
        }, 1000);
    }

    startStopwatch(timerTime, timerCircle) {
        let timeLeft = 30;
        
        // Show stopwatch
        timerTime.textContent = timeLeft.toString();
        
        const stopwatchInterval = setInterval(() => {
            timeLeft--;
            timerTime.textContent = timeLeft.toString();
            
            // Add warning classes
            if (timeLeft <= 10 && timeLeft > 5) {
                timerCircle.classList.add('warning');
                timerCircle.classList.remove('danger');
            } else if (timeLeft <= 5) {
                timerCircle.classList.add('danger');
                timerCircle.classList.remove('warning');
            }
            
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
        
        // Store interval reference
        this.currentTimerInterval = stopwatchInterval;
    }

    timeUp() {
        // Play time up sound
        this.playSound('timeup');
        
        // Set scoring phase flag and send signal to admin device
        localStorage.setItem('scoringPhase', 'true');
        localStorage.setItem('currentQuestion', JSON.stringify(this.currentQuestion));
        localStorage.setItem('timeUpSignal', Date.now().toString());
        
        // Show only TIME'S UP! message
        const questionText = document.getElementById('questionText');
        questionText.innerHTML = `
            <div style="color: #e74c3c; font-size: 2rem; font-weight: 800;">
                TIME'S UP!
            </div>
            <div style="color: #4a90e2; font-size: 1.2rem; margin-top: 15px;">
                Waiting for scoring from admin...
            </div>
        `;
        
        // Hide stopwatch
        document.getElementById('stopwatchDisplay').classList.add('hidden');
        
        // Listen for scoring completion
        this.listenForScoringCompletion();
    }

    listenForScoringCompletion() {
        // Listen for both scoring completion and refresh signals
        const scoringCompleteListener = (e) => {
            if (e.key === 'scoringCompleted') {
                // Scoring completed, show completion message
                const questionText = document.getElementById('questionText');
                questionText.innerHTML = `
                    <div style="color: #27ae60; font-size: 1.5rem; font-weight: 600;">
                        Scoring Complete!
                    </div>
                `;
            }
            
            if (e.key === 'autoNextQuestion') {
                // Auto-next question after scoring
                console.log('Auto-next signal received - going to next question');
                this.goToNextQuestion();
            }
            
            if (e.key === 'refreshQuestions') {
                // Check for new scores and animate immediately
                this.checkForNewScores();
            }
        };
        
        window.addEventListener('storage', scoringCompleteListener);
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
        questionText.innerHTML = `
            <div style="color: #e74c3c; font-size: 2rem; font-weight: 800;">
                TIME'S UP!
            </div>
            <div style="color: #4a90e2; font-size: 1.2rem; margin-top: 15px;">
                Waiting for scoring from admin...
            </div>
        `;
        
        // Hide stopwatch
        document.getElementById('stopwatchDisplay').classList.add('hidden');
    }

    listenForScoringCompletion() {
        // Remove existing listener to avoid duplicates
        if (this.scoringCompleteListener) {
            window.removeEventListener('storage', this.scoringCompleteListener);
        }
        
        // Create new listener
        this.scoringCompleteListener = (e) => {
            console.log('Storage event received:', e.key);
            
            if (e.key === 'scoringCompleted') {
                // Scoring completed, show completion message
                const questionText = document.getElementById('questionText');
                questionText.innerHTML = `
                    <div style="color: #27ae60; font-size: 1.5rem; font-weight: 600;">
                        Scoring Complete!
                    </div>
                `;
            }
            
            if (e.key === 'autoNextQuestion') {
                // Auto-next question after scoring
                console.log('Auto-next signal received - going to next question');
                // Wait for animations to complete, then go to next question
                setTimeout(() => {
                    this.goToNextQuestion();
                }, 3000); // 3 seconds for animations
            }
            
            if (e.key === 'refreshQuestions') {
                // Check for new scores and animate immediately
                this.checkForNewScores();
            }
        };
        
        window.addEventListener('storage', this.scoringCompleteListener);
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
            const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
            this.updateCategoryButtons(completedCategories);
            
            // Show category selection again
            this.showCategorySelection();
        }
        console.log('=== NEXT QUESTION END ===');
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
