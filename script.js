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
        this.currentSound = null;
        this.timeUpCalled = false;
        this.isAnimating = false;
        
        // NEW CONFIGURATION
        this.totalCategories = 12; // 12 ta tur
        this.categoriesToSelect = 8; // 8 tasini tanlash
        this.questionsPerCategory = 1; // har bir turdan 1 ta savol (8 ta jami)
        this.selectedCategories = []; // tanlangan turlar
        this.questionTimer = 30; // 30 soniyalik timer
        this.startTimer = 3; // 3 sekundlik start timer
        this.currentTimeLeft = 0; // joriy timer qiymati
        this.currentTimerInterval = null; // timer interval ID
        this.lastAnswerCorrect = false; // oxirgi javob to'g'ri yoki noto'g'ri
        
        // Socket.io connection
        this.socket = null;
        
        this.initializeQuestions();
        this.bindEvents();
        
        // Initialize socket connection
        this.initializeSocket();
        
        // Add beforeunload event listener
        this.initializeRefreshWarning();
        
        // Check which page we're on
        if (window.location.pathname.includes('questions.html') || window.location.pathname.endsWith('/questions')) {
            this.initializeQuestionsPage();
        } else {
            this.initializeIndexPage();
        }
    }
    
    initializeRefreshWarning() {
        console.log('=== INITIALIZING REFRESH WARNING ===');
        
        // Add beforeunload event listener
        window.addEventListener('beforeunload', (event) => {
            // Check if we're in question or scoring phase
            const currentPhase = localStorage.getItem('currentPhase');
            const quizStarted = localStorage.getItem('quizStarted');
            
            console.log('Beforeunload check - currentPhase:', currentPhase);
            console.log('Beforeunload check - quizStarted:', quizStarted);
            
            // Show warning if quiz is started and we're in question or scoring phase
            if (quizStarted === 'true' && (currentPhase === 'question' || currentPhase === 'scoring')) {
                console.log('Showing refresh warning - user will lose progress');
                
                // Set the warning message
                const message = 'Savol davom etmoqda! Sahifani tark etingiz barcha progress yo\'qolishiga olib kelishi mumkin. Davom etishni istaysizmi?';
                
                // Standard way for most browsers
                event.preventDefault();
                
                // For older browsers
                event.returnValue = message;
                
                // Return message for some browsers
                return message;
            }
        });
        
        console.log('Refresh warning initialized');
    }
    
    initializeSocket() {
        console.log('=== INITIALIZING SOCKET ===');
        
        // Determine server URL
        const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        console.log('Connecting to server:', serverUrl);
        
        // Connect to Socket.io server with better configuration
        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
            timeout: 20000, // 20 second timeout
            forceNew: true, // Force new connection
            reconnection: true, // Enable reconnection
            reconnectionAttempts: 5, // Max reconnection attempts
            reconnectionDelay: 1000, // Delay between reconnections
            reconnectionDelayMax: 5000 // Max delay
        });
        
        // Handle connection
        this.socket.on('connect', () => {
            console.log('✅ Connected to server successfully');
            console.log('Socket ID:', this.socket.id);
            console.log('Transport:', this.socket.io.engine.transport.name);
        });
        
        // Handle connection error
        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            console.error('Error details:', error.message, error.description, error.context, error.type);
            
            // Show user-friendly error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-weight: 600;
                max-width: 300px;
            `;
            errorDiv.innerHTML = `
                <strong>Serverga ulanishda xatolik!</strong><br>
                Xatolik: ${error.message || 'Noma\'lum'}<br>
                <small>Iltimos, server ishlayotganini tekshiring yoki qayta urining</small>
            `;
            
            document.body.appendChild(errorDiv);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 10000);
        });
        
        // Handle disconnection
        this.socket.on('disconnect', (reason) => {
            console.warn('⚠️ Disconnected from server:', reason);
            
            if (reason === 'io server disconnect') {
                // Server was stopped
                console.log('Server was stopped');
            }
        });
        
        // Handle reconnection attempts
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}`);
        });
        
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        });
        
        this.socket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect to server');
        });
        
        console.log('=== SOCKET INITIALIZATION COMPLETE ===');
        
        // Handle server state updates
        this.socket.on('quizStateUpdate', (state) => {
            console.log('Quiz state update received from server:', state);
            
            // Update local state
            this.teams = state.teams || [];
            this.scores = state.scores || {};
            this.currentCategory = state.currentCategory;
            this.currentQuestion = state.currentQuestion;
            this.selectedCategories = state.selectedCategories || [];
            this.mixedQuestions = state.mixedQuestions || [];
            this.currentQuestionIndex = state.currentQuestionIndex || 0;
            
            // Update localStorage
            localStorage.setItem('quizState', JSON.stringify(state));
            localStorage.setItem('currentPhase', state.currentPhase);
            
            console.log('State updated from server and saved to localStorage');
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
        
        // Handle score animation
        this.socket.on('scoreAnimation', (scores) => {
            console.log('Score animation received:', scores);
            this.animateScoreUpdates(scores);
        });
        
        // Handle category completion
        this.socket.on('categoryCompleted', (category) => {
            if (!this.completedCategories.includes(category)) {
                this.completedCategories.push(category);
                console.log('Category completed on server:', category);
                console.log('All completed categories:', this.completedCategories);
                
                // Broadcast updated state
                this.socket.emit('stateUpdate', this);
            }
        });
        
        // Handle quiz reset
        this.socket.on('resetQuiz', () => {
            console.log('Quiz reset received');
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
        
        console.log('updateState called, current page:', window.location.pathname);
        console.log('State received:', state);
        
        // Update UI based on current page
        if (window.location.pathname.includes('questions.html') || 
            window.location.pathname.endsWith('/questions') ||
            window.location.href.includes('questions.html')) {
            console.log('Updating questions page');
            this.updateQuestionsPage(state);
        } else {
            console.log('Updating index page');
            // Index page - handle scoring phase
            this.updateIndexPage(state);
        }
        
        // Only update teams display if not in animation
        if (!this.isAnimating) {
            this.displayTeams();
        }
    }
    
    updateIndexPage(state) {
        if (state.scoringPhase) {
            // Show scoring section on index.html
            this.showScoringSection();
        }
    }
    
    showScoringSection() {
        const setupSection = document.getElementById('setupSection');
        const setupStatus = document.getElementById('setupStatus');
        const scoringSection = document.getElementById('scoringSection');
        const scoringQuestion = document.getElementById('scoringQuestion');
        const teamScores = document.getElementById('teamScores');
        
        // Hide entire setup section including card with more aggressive hiding
        if (setupSection) {
            setupSection.style.display = 'none';
            setupSection.classList.add('hidden');
        }
        
        // Hide setup status as well
        if (setupStatus) {
            setupStatus.style.display = 'none';
            setupStatus.classList.add('hidden');
        }
        
        // Show scoring section
        if (scoringSection) {
            scoringSection.style.display = 'block';
            scoringSection.classList.remove('hidden');
        }
        
        if (scoringQuestion) {
            scoringQuestion.innerHTML = `
                <h3>Time's Up!</h3>
                <p>Mark each team as Correct or Incorrect for this question</p>
            `;
        }
        
        if (teamScores) {
            teamScores.innerHTML = '';
            this.teams.forEach(team => {
                const teamScoreDiv = document.createElement('div');
                teamScoreDiv.className = 'team-score-input';
                teamScoreDiv.innerHTML = `
                    <h4>${team.name}</h4>
                    <div class="team-scoring-buttons">
                        <button class="btn btn-success correct-btn" data-team-id="${team.id}">
                            Correct (1 point)
                        </button>
                        <button class="btn btn-danger incorrect-btn" data-team-id="${team.id}">
                            Incorrect (0 points)
                        </button>
                    </div>
                `;
                teamScores.appendChild(teamScoreDiv);
                
                // Add event listeners with delay
                setTimeout(() => {
                    const correctBtn = teamScoreDiv.querySelector('.correct-btn');
                    const incorrectBtn = teamScoreDiv.querySelector('.incorrect-btn');
                    
                    console.log(`Adding event listeners for team ${team.id}:`);
                    console.log('Correct button:', correctBtn);
                    console.log('Incorrect button:', incorrectBtn);
                    
                    if (correctBtn) {
                        correctBtn.addEventListener('click', (e) => {
                            console.log(`Correct button clicked for team ${team.id}`);
                            e.preventDefault();
                            e.stopPropagation();
                            this.scoreTeam(team.id, true);
                        });
                        console.log('Correct button event listener added');
                    } else {
                        console.error('Correct button not found for team:', team.id);
                    }
                    
                    if (incorrectBtn) {
                        incorrectBtn.addEventListener('click', (e) => {
                            console.log(`Incorrect button clicked for team ${team.id}`);
                            e.preventDefault();
                            e.stopPropagation();
                            this.scoreTeam(team.id, false);
                        });
                        console.log('Incorrect button event listener added');
                    } else {
                        console.error('Incorrect button not found for team:', team.id);
                    }
                }, 100);
            });
        }
    }
    
    scoreTeam(teamId, isCorrect) {
        console.log(`=== SCORE TEAM CALLED ===`);
        console.log(`Team ID: ${teamId}`);
        console.log(`Is Correct: ${isCorrect}`);
        console.log(`Current scores before:`, this.scores);
        console.log(`Teams available:`, this.teams);
        
        // Update score if correct
        if (isCorrect) {
            this.scores[teamId] = (this.scores[teamId] || 0) + 1;
            console.log(`Updated score for team ${teamId}: ${this.scores[teamId]}`);
        } else {
            console.log(`Team ${teamId} got incorrect answer, no points awarded`);
        }
        
        console.log(`Current scores after:`, this.scores);
        
        // Send score to server
        if (this.socket) {
            this.socket.emit('teamScore', {
                teamId: teamId,
                isCorrect: isCorrect,
                newScore: this.scores[teamId]
            });
            console.log(`Score sent to server for team ${teamId}`);
        } else {
            console.error('Socket not available, cannot send score to server');
        }
        
        // Update display
        this.displayTeams();
        
        // Visual feedback
        const teamButton = document.querySelector(`[data-team-id="${teamId}"]`);
        if (teamButton) {
            teamButton.style.background = isCorrect ? '#d4edda' : '#f8d7da';
            setTimeout(() => {
                teamButton.style.background = '';
            }, 1000);
        }
        
        console.log(`=== SCORE TEAM COMPLETED ===`);
    }
    
    showTimeUpMessage() {
        console.log('=== SHOW TIME UP MESSAGE ===');
        
        // Hide question section
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.classList.add('hidden');
        }
        
        // Show time up message
        const questionText = document.querySelector('.question-text');
        if (questionText) {
            questionText.innerHTML = `
                <div style="color: #e74c3c; font-size: 2.5rem; font-weight: 800; text-align: center;">
                    TIME'S UP!
                </div>
                <div style="color: #4a90e2; font-size: 1.3rem; margin-top: 20px; text-align: center;">
                    Scoring is available on the main screen
                </div>
                <div style="color: #666; font-size: 1rem; margin-top: 15px; text-align: center;">
                    Please wait for the administrator to complete scoring
                </div>
            `;
        }
        
        // Hide timer
        const timerElement = document.getElementById('questionTimer');
        if (timerElement) {
            timerElement.style.display = 'none';
        }
        
        console.log('Time up message shown on questions.html');
    }
    
    updateQuestionsPage(state) {
        console.log('=== UPDATE QUESTIONS PAGE START ===');
        console.log('State received:', state);
        console.log('quizActivated:', state.quizActivated);
        console.log('currentCategory:', state.currentCategory);
        console.log('scoringPhase:', state.scoringPhase);
        
        if (state.quizActivated && !state.currentCategory) {
            // Show category selection
            console.log('Condition met: quizActivated=true, currentCategory=false');
            console.log('Calling showCategorySelection...');
            this.showCategorySelection();
        } else if (state.currentCategory && !state.scoringPhase) {
            // Show question
            console.log('Showing question for category:', state.currentCategory);
            if (this.currentCategory !== state.currentCategory || this.currentQuestionIndex !== state.currentQuestionIndex) {
                this.selectCategory(state.currentCategory);
            }
        } else if (state.scoringPhase) {
            // Don't show scoring interface on questions.html
            // Only index.html should show scoring interface
            console.log('Scoring phase detected on questions.html - showing time up message');
            this.showTimeUpMessage();
        }
        
        console.log('=== UPDATE QUESTIONS PAGE END ===');
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
        console.log('=== BIND EVENTS START ===');
        
        // Team count input
        const teamCountInput = document.getElementById('teamCount');
        if (teamCountInput) {
            teamCountInput.addEventListener('change', () => {
                // Don't reset all data, just regenerate inputs
                this.generateTeamInputs();
            });
        }

        const generateBtn = document.getElementById('generateInputs');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('Generate button clicked');
                console.log('Team count input value before generate:', document.getElementById('teamCount').value);
                this.generateTeamInputs();
                console.log('Team count input value after generate:', document.getElementById('teamCount').value);
            });
        }

        const startBtn = document.getElementById('startQuiz');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                console.log('=== START QUIZ BUTTON CLICKED ===');
                console.log('Event:', e);
                console.log('Button element:', startBtn);
                console.log('Button disabled:', startBtn.disabled);
                console.log('Button classList:', startBtn.classList);
                
                if (startBtn.disabled) {
                    console.log('Button is disabled - click ignored');
                    return;
                }
                
                console.log('Button is enabled - calling startQuiz()');
                this.startQuiz();
            });
        } else {
            console.error('Start button not found!');
        }

        // Add event listener for start-quiz-btn (only on questions page)
        if (window.location.pathname.includes('questions.html') || window.location.pathname.endsWith('/questions')) {
            const startQuizBtn = document.querySelector('.start-quiz-btn');
            if (startQuizBtn) {
                console.log('Start quiz button found, adding event listener');
                startQuizBtn.addEventListener('click', (e) => {
                    console.log('=== START QUIZ BUTTON CLICKED ===');
                    console.log('Event:', e);
                    console.log('Button element:', startQuizBtn);
                    console.log('Button classes:', startQuizBtn.classList);
                    console.log('Button disabled:', startQuizBtn.disabled);
                    
                    if (startQuizBtn.disabled) {
                        console.log('Button is disabled - click ignored');
                        return;
                    }
                    
                    console.log('Button is enabled - calling startQuestionsQuiz()');
                    this.startQuestionsQuiz();
                });
            } else {
                console.error('Start quiz button not found on questions page!');
            }
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
        console.log('=== GENERATE TEAM INPUTS DEBUG ===');
        
        // Don't reset everything, just generate inputs
        // this.resetAllData(); // This was causing the issue
        
        const teamCountInput = document.getElementById('teamCount');
        const teamInputsContainer = document.getElementById('teamInputsContainer');
        
        console.log('Team count input:', teamCountInput);
        console.log('Team count value:', teamCountInput ? teamCountInput.value : 'not found');
        console.log('Team inputs container:', teamInputsContainer);
        
        const teamCount = parseInt(teamCountInput.value);
        console.log('Parsed team count:', teamCount);
        
        if (!teamInputsContainer) {
            console.error('Team inputs container not found!');
            return;
        }
        
        if (isNaN(teamCount) || teamCount < 2 || teamCount > 10) {
            console.error('Invalid team count:', teamCount);
            return;
        }

        // Clear previous inputs
        teamInputsContainer.innerHTML = '';
        console.log('Cleared previous inputs');

        // Generate team inputs
        for (let i = 1; i <= teamCount; i++) {
            console.log(`Creating team input ${i}`);
            const teamInput = document.createElement('div');
            teamInput.className = 'team-input';
            teamInput.innerHTML = `
                <label>Team ${i}:</label>
                <input type="text" id="team${i}" placeholder="Enter team ${i} name" required>
            `;
            teamInputsContainer.appendChild(teamInput);
            console.log(`Added team input ${i} to container`);
        }
        
        console.log(`Generated ${teamCount} team inputs`);
        console.log('Container children count:', teamInputsContainer.children.length);

        // Enable setup button
        const setupBtn = document.getElementById('startQuiz');
        if (setupBtn) {
            setupBtn.disabled = false;
            console.log('Setup button enabled');
        }
        
        console.log('=== GENERATE TEAM INPUTS END ===');
    }
    
    resetAllData() {
        // Reset local data
        this.teams = [];
        this.scores = {};
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];
        this.currentQuestion = null;
        this.completedCategories = [];
        this.timeUpCalled = false;
        
        // Clear timers
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
        }
        
        // Hide all sections
        this.hideAllSections();
        
        // Reset UI elements (but don't reset teamCount input)
        const teamCountInput = document.getElementById('teamCount');
        // Don't reset teamCount input value - let user keep their selection
        // if (teamCountInput) {
        //     teamCountInput.value = '2';
        // }
        
        // Send reset signal to server
        if (this.socket) {
            this.socket.emit('resetQuiz');
            console.log('Reset signal sent to server');
        }
    }
    
    hideAllSections() {
        // Hide all sections
        const sections = [
            'setupStatus',
            'scoringSection',
            'welcomeSection',
            'categorySection',
            'questionSection'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('hidden');
            }
        });
        
        // Show setup section
        const setupSection = document.getElementById('setupSection');
        if (setupSection) {
            setupSection.classList.remove('hidden');
        }
    }

    startQuiz() {
        console.log('=== START QUIZ DEBUG ===');
        console.log('startQuiz method called');
        
        const teamCount = parseInt(document.getElementById('teamCount').value);
        console.log('Team count:', teamCount);
        
        const teams = [];

        // Collect team names
        for (let i = 1; i <= teamCount; i++) {
            const teamName = document.getElementById(`team${i}`).value.trim();
            console.log(`Team ${i} name:`, teamName);
            
            if (teamName) {
                teams.push({
                    id: i,
                    name: teamName
                });
            }
        }

        console.log('Teams collected:', teams);

        if (teams.length === 0) {
            alert('Iltimos, kamida bitta jamoa nomini kiriting!');
            return;
        }

        // Check socket connection
        if (!this.socket) {
            console.error('Socket is not connected!');
            alert('Serverga ulanishda xatolik! Iltimos, sahifani qayta yuklang.');
            return;
        }

        console.log('Socket connected, emitting setupTeams...');
        
        // Send teams to server
        this.socket.emit('setupTeams', teams);
        console.log('Teams setup sent to server:', teams);

        // Store teams locally
        this.teams = teams;

        // Show setup status
        this.showSetupStatus();
        console.log('=== START QUIZ DEBUG END ===');
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
            // Show teams list and multi-device instructions
            const teamsList = this.teams.map(team => `
                <div class="team-display-item">
                    <span class="team-name">${team.name}</span>
                    <span class="team-id">Team ${team.id}</span>
                </div>
            `).join('');
            
            setupStatus.innerHTML = `
                <div class="status-message">
                    <h3>Quiz Setup Complete!</h3>
                    <p>Quiz is activated! Open questions.html on another device to start.</p>
                    <div class="teams-display">
                        <h4>Registered Teams:</h4>
                        <div class="teams-list">
                            ${teamsList}
                        </div>
                    </div>
                    <div class="quiz-status">
                        <p class="status-text">Quiz is ready on other devices!</p>
                        <button id="openQuestionsBtn" class="btn btn-secondary" style="margin-top: 15px;">Open Questions Page</button>
                    </div>
                </div>
            `;
            
            // Bind optional open questions button
            const openQuestionsBtn = document.getElementById('openQuestionsBtn');
            if (openQuestionsBtn) {
                openQuestionsBtn.addEventListener('click', () => {
                    window.open('questions.html', '_blank');
                });
            }
            
            // Auto-activate the quiz for other devices
            setTimeout(() => {
                this.activateQuiz();
            }, 1000);
        }
    }

    activateQuiz() {
        // Send activation signal to server
        this.socket.emit('activateQuiz');
        console.log('Quiz activation sent to server');
        
        // Don't open questions page automatically
        // Let other devices handle the questions page
        console.log('Quiz activated - waiting for other devices to open questions page');
    }

    skipScoring() {
        // Send empty scores to server
        this.socket.emit('submitScores', {});
        console.log('Scoring skipped - signal sent to server');

        // Show loading state in scoring section
        const scoringQuestion = document.getElementById('scoringQuestion');
        const teamScores = document.getElementById('teamScores');
        const scoringActions = document.querySelector('.scoring-actions');
        
        if (scoringQuestion) {
            scoringQuestion.innerHTML = `
                <h3>Scoring Skipped!</h3>
                <p>Waiting for next question...</p>
            `;
        }
        
        if (teamScores) {
            teamScores.innerHTML = '<div style="text-align: center; padding: 20px;">Loading next question...</div>';
        }
        
        if (scoringActions) {
            scoringActions.innerHTML = '';
        }

        console.log('Scoring skipped - waiting for next question');
    }

    submitScores() {
        const scores = {};
        let hasScore = false;
        
        // Collect scores from all team inputs
        this.teams.forEach(team => {
            const scoreInput = document.querySelector(`input[name="score-${team.id}"]:checked`);
            const score = parseInt(scoreInput.value) || 0;
            scores[team.id] = score;
            if (score > 0) hasScore = true;
        });

        if (!hasScore) {
            alert('Iltimos, kamida bitta jamoa uchun ball belgilang!');
            return;
        }

        // Send scores to server
        this.socket.emit('submitScores', scores);
        console.log('Scores submitted:', scores);

        // Show loading state in scoring section
        const scoringQuestion = document.getElementById('scoringQuestion');
        const teamScores = document.getElementById('teamScores');
        const scoringActions = document.querySelector('.scoring-actions');
        
        if (scoringQuestion) {
            scoringQuestion.innerHTML = `
                <h3>Scores Submitted!</h3>
                <p>Waiting for next question...</p>
            `;
        }
        
        if (teamScores) {
            teamScores.innerHTML = '<div style="text-align: center; padding: 20px;">Loading next question...</div>';
        }
        
        if (scoringActions) {
            scoringActions.innerHTML = '';
        }
        
        console.log('Scoring completed - waiting for next question');
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
        console.log('=== INITIALIZE INDEX PAGE START ===');
        
        // Generate initial team inputs
        this.generateTeamInputs();
        
        // Check if setup button should be enabled
        const teamCountInput = document.getElementById('teamCount');
        const startBtn = document.getElementById('startQuiz');
        
        console.log('Team count input found:', teamCountInput);
        console.log('Start button found:', startBtn);
        console.log('Team count value:', teamCountInput ? teamCountInput.value : 'not found');
        
        if (startBtn && teamCountInput) {
            const teamCount = parseInt(teamCountInput.value);
            const hasTeamInputs = document.querySelectorAll('.team-input input').length > 0;
            
            console.log('Team count:', teamCount);
            console.log('Has team inputs:', hasTeamInputs);
            
            // Enable button if we have valid team count and inputs
            if (!isNaN(teamCount) && teamCount >= 2 && teamCount <= 10 && hasTeamInputs) {
                startBtn.disabled = false;
                console.log('Setup button enabled on init');
            } else {
                startBtn.disabled = true;
                console.log('Setup button disabled on init - missing inputs');
            }
        }
        
        console.log('=== INITIALIZE INDEX PAGE END ===');
    }

    initializeQuestionsPage() {
        console.log('Questions page initialized');
        
        // Try to restore state from localStorage
        try {
            const savedState = localStorage.getItem('quizState');
            if (savedState) {
                const state = JSON.parse(savedState);
                console.log('Restoring state from localStorage:', state);
                
                // Check if this is a valid state (has currentQuestion and currentCategory)
                if (state.currentQuestion && state.currentCategory && state.currentPhase) {
                    console.log('Valid state found, restoring...');
                    
                    // Restore all state
                    this.teams = state.teams || [];
                    this.scores = state.scores || {};
                    this.currentCategory = state.currentCategory;
                    this.currentQuestion = state.currentQuestion;
                    this.selectedCategories = state.selectedCategories || [];
                    this.mixedQuestions = state.mixedQuestions || [];
                    this.currentQuestionIndex = state.currentQuestionIndex || 0;
                    
                    console.log('State restored successfully');
                    
                    // Show appropriate section based on phase
                    if (state.currentPhase === 'scoring') {
                        console.log('Restoring scoring phase');
                        this.showScoringInterface();
                    } else if (state.currentPhase === 'question') {
                        console.log('Restoring question phase');
                        this.displayQuestion(state.currentQuestion);
                        
                        // Restore timer state if available
                        const timerState = localStorage.getItem('timerState');
                        if (timerState) {
                            const timerData = JSON.parse(timerState);
                            console.log('Restoring timer state:', timerData);
                            
                            // Calculate remaining time
                            const elapsed = Date.now() - timerData.startTime;
                            const remaining = Math.max(0, timerData.countdown - Math.floor(elapsed / 1000));
                            
                            if (remaining > 0) {
                                console.log('Timer has', remaining, 'seconds remaining');
                                // Start timer with remaining time
                                this.startTimerWithRemaining(remaining);
                            } else {
                                console.log('Timer expired, showing scoring interface');
                                this.timeUp();
                            }
                        } else {
                            // Start fresh timer
                            this.startQuestionTimer();
                        }
                    } else {
                        console.log('Showing category selection');
                        this.showCategorySelection();
                    }
                    
                    return; // Don't continue to default logic
                } else {
                    console.log('Invalid or incomplete state, clearing localStorage');
                    localStorage.removeItem('quizState');
                    localStorage.removeItem('timerState');
                    localStorage.removeItem('currentPhase');
                }
            }
        } catch (error) {
            console.error('Error restoring state:', error);
            // Clear corrupted state
            localStorage.removeItem('quizState');
            localStorage.removeItem('timerState');
            localStorage.removeItem('currentPhase');
        }
        
        // Fallback to default logic if no valid saved state
        console.log('No valid saved state, requesting from server');
        
        // Request current state from server for multi-device sync
        this.socket.emit('requestQuizState');
        console.log('Requested quiz state from server');
        
        // Check if quiz was started (prevent refresh from going to welcome)
        const quizStarted = localStorage.getItem('quizStarted');
        console.log('Quiz started from localStorage:', quizStarted);
        
        // Check current phase from localStorage
        const currentPhase = localStorage.getItem('currentPhase');
        console.log('Current phase from localStorage:', currentPhase);
        
        if (quizStarted === 'true') {
            if (currentPhase === 'question' || currentPhase === 'scoring') {
                console.log('Already in question or scoring phase, maintaining current state');
                // Don't go to category selection, let updateQuestionsPage handle it
            } else {
                console.log('Quiz was started but not in question phase, showing category selection');
                setTimeout(() => {
                    this.showCategorySelection();
                }, 100);
            }
        } else {
            console.log('Quiz not started, showing welcome section');
            this.displayTeams();
        }
    }

    displayTeams() {
        console.log('=== DISPLAY TEAMS DEBUG ===');
        console.log('Current teams:', this.teams);
        console.log('Current scores:', this.scores);
        console.log('Current page:', window.location.pathname);
        
        // Check if we're on welcome page and need to display welcomeTeamsList
        const welcomeTeamsList = document.getElementById('welcomeTeamsList');
        const teamsList = document.getElementById('teamsList');
        
        console.log('Welcome teams list found:', welcomeTeamsList);
        console.log('Teams list found:', teamsList);
        
        // Handle welcome teams list (4-column grid)
        if (welcomeTeamsList) {
            console.log('Updating welcome teams list');
            welcomeTeamsList.innerHTML = '';
            
            this.teams.forEach((team, index) => {
                console.log(`Creating welcome team item for ${team.name} with ID ${team.id}`);
                const teamItem = document.createElement('div');
                teamItem.className = 'welcome-team-item';
                teamItem.textContent = team.name;
                welcomeTeamsList.appendChild(teamItem);
                console.log(`Welcome team item appended for ${team.name}`);
            });
        }
        
        // Handle regular teams list (leaderboard)
        if (!teamsList) {
            console.log('Teams list element not found');
            return;
        }
        
        console.log('Teams list element found:', teamsList);
        teamsList.innerHTML = '';
        
        // Sort teams by score for display (leaderboard style)
        const sortedTeams = [...this.teams].sort((a, b) => {
            const scoreA = this.scores[a.id] || 0;
            const scoreB = this.scores[b.id] || 0;
            return scoreB - scoreA; // Highest score first
        });
        
        console.log('Sorted teams:', sortedTeams);
        
        sortedTeams.forEach((team, index) => {
            console.log(`Creating team item for ${team.name} with ID ${team.id}`);
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.dataset.teamId = team.id; // Make sure this is set correctly
            
            const score = this.scores[team.id] || 0;
            const rank = index + 1;
            
            console.log(`Team ${team.name} - Score: ${score}, Rank: ${rank}`);
            
            // Add rank styling based on position
            let rankClass = '';
            let rankIcon = '';
            
            if (rank === 1) {
                rankClass = 'rank-first';
                rankIcon = '1st';
            } else if (rank === 2) {
                rankClass = 'rank-second';
                rankIcon = '2nd';
            } else if (rank === 3) {
                rankClass = 'rank-third';
                rankIcon = '3rd';
            } else {
                rankIcon = `${rank}th`;
            }
            
            teamItem.innerHTML = `
                <div class="team-rank ${rankClass}">
                    <span class="rank-number">${rankIcon}</span>
                </div>
                <div class="team-info">
                    <span class="team-name">${team.name}</span>
                    <span class="team-score">${score}</span>
                </div>
            `;
            
            teamsList.appendChild(teamItem);
            console.log(`Team item appended for ${team.name}`);
        });
        
        console.log('=== DISPLAY TEAMS END ===');
    }

    showCategorySelection() {
        console.log('=== SHOW CATEGORY SELECTION START ===');
        console.log('Current window width:', window.innerWidth);
        console.log('Current window height:', window.innerHeight);
        
        // Hide question section first
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.classList.add('hidden');
            console.log('Question section hidden');
        }
        
        // Hide scoring section
        const scoringSection = document.querySelector('.scoring-section');
        if (scoringSection) {
            scoringSection.classList.add('hidden');
            console.log('Scoring section hidden');
        }
        
        // IMMEDIATE CSS INJECTION TO FORCE FIX
        const style = document.createElement('style');
        style.textContent = `
            .questions-page .categories-grid {
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 12px !important;
                width: 100% !important;
                max-width: 1400px !important;
                margin: 0 auto 30px auto !important;
                padding: 25px !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border-radius: 15px !important;
                box-sizing: border-box !important;
            }
            
            .questions-page .category-btn {
                padding: 15px 10px !important;
                font-size: 0.85rem !important;
                min-height: 100px !important;
                border-radius: 12px !important;
                gap: 6px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .questions-page .category-section {
                max-width: 1500px !important;
                margin: 0 auto !important;
                display: block !important;
            }
            
            .questions-page .card {
                max-width: 1500px !important;
                margin: 0 auto !important;
            }
            
            /* Hide question and scoring sections during category selection */
            .questions-page .question-section {
                display: none !important;
            }
            
            .questions-page .scoring-section {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        console.log('CSS INJECTED FORCIBLY!');
        
        // Debug container hierarchy
        const container = document.querySelector('.container');
        const mainContent = document.querySelector('.main-content');
        const categorySection = document.querySelector('.category-section');
        const categoriesGrid = document.querySelector('.categories-grid'); // PLURAL!
        const categoryGrid = document.querySelector('.category-grid'); // SINGULAR!
        
        console.log('=== CONTAINER DEBUG ===');
        console.log('Container found:', container);
        console.log('Main content found:', mainContent);
        console.log('Category section found:', categorySection);
        console.log('Categories-grid found:', categoriesGrid); // PLURAL!
        console.log('Category-grid found:', categoryGrid); // SINGULAR!
        
        // Check which grid is actually being used
        const actualGrid = categoriesGrid || categoryGrid;
        console.log('Actual grid being used:', actualGrid);
        
        if (actualGrid) {
            const actualGridRect = actualGrid.getBoundingClientRect();
            console.log('Actual grid rect:', actualGridRect);
            console.log('Actual grid computed style:', window.getComputedStyle(actualGrid));
            console.log('Actual grid offsetWidth:', actualGrid.offsetWidth);
            console.log('Actual grid scrollWidth:', actualGrid.scrollWidth);
            console.log('Actual grid clientWidth:', actualGrid.clientWidth);
            
            // Force apply styles with !important
            actualGrid.style.cssText = `
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 12px !important;
                width: 100% !important;
                max-width: 1400px !important;
                margin: 0 auto 30px auto !important;
                padding: 25px !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border-radius: 15px !important;
                box-sizing: border-box !important;
            `;
            console.log('Forced grid styles applied with !important');
        }
        
        const welcomeSection = document.getElementById('welcomeSection');
        
        console.log('Welcome section found:', welcomeSection);
        console.log('Category section found:', categorySection);
        
        if (welcomeSection) {
            welcomeSection.classList.add('hidden');
            console.log('Welcome section hidden');
        }
        
        if (categorySection) {
            categorySection.classList.remove('hidden');
            console.log('Category section shown');
            
            // Initially hide start button until 8 categories are selected
            const startBtn = document.querySelector('.start-quiz-btn');
            if (startBtn) {
                startBtn.style.display = 'none';
                startBtn.classList.add('hidden');
                startBtn.disabled = true;
                console.log('Start button initially hidden');
            }
            
            // Debug category buttons
            const categoryBtns = document.querySelectorAll('.category-btn');
            console.log('Category buttons found:', categoryBtns.length);
            categoryBtns.forEach((btn, index) => {
                console.log(`Button ${index}:`, btn);
                console.log(`Button ${index} computed style:`, window.getComputedStyle(btn));
                console.log(`Button ${index} rect:`, btn.getBoundingClientRect());
                
                // Force apply button styles with !important
                btn.style.cssText = `
                    padding: 15px 10px !important;
                    font-size: 0.85rem !important;
                    min-height: 100px !important;
                    border-radius: 12px !important;
                    gap: 6px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                `;
            });
        } else {
            console.log('Category section NOT found - this is the problem!');
        }
        
        // Update category buttons to show completed status
        const completedCategories = this.completedCategories || [];
        this.updateCategoryButtons(completedCategories);
        
        console.log('=== SHOW CATEGORY SELECTION END ===');
    }

    selectCategory(category) {
        console.log('=== SELECT CATEGORY DEBUG ===');
        console.log('Selected category:', category);
        console.log('Currently selected categories:', this.selectedCategories);
        console.log('Categories to select:', this.categoriesToSelect);
        console.log('Selected categories length:', this.selectedCategories.length);
        
        // Check if category is already selected
        if (this.selectedCategories.includes(category)) {
            console.log('Category already selected, removing:', category);
            this.removeSelectedCategory(category);
            return;
        }
        
        // Check if we can select more categories
        if (this.selectedCategories.length >= this.categoriesToSelect) {
            console.log('Maximum categories selected, cannot select more');
            return;
        }
        
        // Add category to selected list
        this.selectedCategories.push(category);
        console.log('Category added to selection:', category);
        console.log('Updated selected categories:', this.selectedCategories);
        
        // Update UI to show selection
        this.updateCategorySelectionUI();
        
        // Check if all categories are selected
        if (this.selectedCategories.length === this.categoriesToSelect) {
            console.log('All categories selected - start button will be shown by updateCategorySelectionUI');
        }
        
        // Send category selection to server
        this.socket.emit('selectCategory', {
            category: category,
            selectedCategories: this.selectedCategories
        });
    }
    
    removeSelectedCategory(category) {
        // Remove category from selected list
        this.selectedCategories = this.selectedCategories.filter(cat => cat !== category);
        console.log('Category removed from selection:', category);
        
        // Update UI
        this.updateCategorySelectionUI();
        
        // Start button will be hidden by updateCategorySelectionUI if not all categories selected
        if (this.selectedCategories.length < this.categoriesToSelect) {
            console.log('Not all categories selected - start button will be hidden by updateCategorySelectionUI');
        }
        
        // Send removal to server
        this.socket.emit('removeCategory', {
            category: category,
            selectedCategories: this.selectedCategories
        });
    }
    
    updateCategorySelectionUI() {
        console.log('=== UPDATE CATEGORY SELECTION UI DEBUG ===');
        console.log('Selected categories:', this.selectedCategories);
        console.log('Selected categories length:', this.selectedCategories.length);
        
        // Update category buttons to show selection status
        const categoryBtns = document.querySelectorAll('.category-btn');
        console.log('Category buttons found:', categoryBtns.length);
        
        categoryBtns.forEach((btn, index) => {
            const category = btn.dataset.category;
            console.log(`Button ${index} (${category}):`, btn);
            
            const selectionCount = btn.querySelector('.selection-count');
            console.log(`Selection count element for ${category}:`, selectionCount);
            
            if (this.selectedCategories.includes(category)) {
                btn.classList.add('selected');
                const categoryIndex = this.selectedCategories.indexOf(category) + 1;
                console.log(`Setting selection count for ${category}:`, categoryIndex);
                if (selectionCount) {
                    selectionCount.textContent = categoryIndex;
                    selectionCount.style.display = 'flex';
                }
            } else {
                btn.classList.remove('selected');
                console.log(`Clearing selection count for ${category}`);
                if (selectionCount) {
                    selectionCount.textContent = '';
                    selectionCount.style.display = 'none';
                }
            }
        });
        
        // Update selection counter
        const selectionCounter = document.querySelector('.selection-counter');
        console.log('Selection counter element:', selectionCounter);
        if (selectionCounter) {
            const counterText = `${this.selectedCategories.length}/${this.categoriesToSelect} selected`;
            console.log('Setting selection counter text:', counterText);
            selectionCounter.textContent = counterText;
        }
        
        // Show or hide start button based on selection count
        const startBtn = document.querySelector('.start-quiz-btn');
        console.log('Start button element:', startBtn);
        console.log('Selected categories count:', this.selectedCategories.length);
        console.log('Categories to select:', this.categoriesToSelect);
        
        if (startBtn) {
            if (this.selectedCategories.length === this.categoriesToSelect) {
                // Show start button when exactly 8 categories are selected
                startBtn.style.display = 'block';
                startBtn.classList.remove('hidden');
                startBtn.disabled = false;
                console.log('Start button shown - 8 categories selected');
            } else {
                // Hide start button when not exactly 8 categories are selected
                startBtn.style.display = 'none';
                startBtn.classList.add('hidden');
                startBtn.disabled = true;
                console.log('Start button hidden - not 8 categories selected');
            }
        }
        
        console.log('=== UPDATE CATEGORY SELECTION UI END ===');
    }
    
    showStartButton() {
        const startBtn = document.querySelector('.start-quiz-btn');
        if (startBtn) {
            startBtn.style.display = 'block';
            startBtn.classList.remove('hidden');
        }
    }
    
    hideStartButton() {
        const startBtn = document.querySelector('.start-quiz-btn');
        if (startBtn) {
            startBtn.style.display = 'none';
            startBtn.classList.add('hidden');
        }
    }
    
    startQuestionsQuiz() {
        console.log('=== START QUESTIONS QUIZ DEBUG ===');
        console.log('Selected categories:', this.selectedCategories);
        console.log('Number of categories selected:', this.selectedCategories.length);
        console.log('Questions per category: 1');
        console.log('Total questions expected:', this.selectedCategories.length * 1);
        console.log('Questions should be mixed from all selected categories');
        
        // Clear old localStorage state to prevent interference
        localStorage.removeItem('quizState');
        localStorage.removeItem('timerState');
        localStorage.removeItem('currentPhase');
        console.log('Cleared old localStorage state');
        
        // Mark quiz as started in localStorage (prevent refresh from going to welcome)
        localStorage.setItem('quizStarted', 'true');
        console.log('Quiz started flag saved to localStorage');
        
        // Show 3-second countdown
        this.showStartCountdown();
        
        // Send start signal to server with 1 question per category
        this.socket.emit('startQuiz', {
            selectedCategories: this.selectedCategories,
            questionsPerCategory: 1 // 1 question from each category
        });
        
        console.log('Quiz start signal sent to server');
        console.log('=== START QUESTIONS QUIZ END ===');
    }
    
    showStartCountdown() {
        console.log('=== SHOW START COUNTDOWN ===');
        
        // Hide category section first
        const categorySection = document.querySelector('.category-section');
        if (categorySection) {
            categorySection.classList.add('hidden');
            console.log('Category section hidden');
        }
        
        // Show countdown section
        const countdownElement = document.querySelector('.start-countdown');
        if (!countdownElement) {
            console.error('Countdown element not found!');
            return;
        }
        
        // Make countdown section visible
        countdownElement.classList.remove('hidden');
        countdownElement.style.display = 'block';
        
        let countdown = this.startTimer;
        const countdownNumber = countdownElement.querySelector('.countdown-number');
        if (countdownNumber) {
            countdownNumber.textContent = countdown;
        }
        
        console.log('Countdown started from:', countdown);
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                if (countdownNumber) {
                    countdownNumber.textContent = countdown;
                }
                console.log('Countdown:', countdown);
            } else {
                clearInterval(countdownInterval);
                countdownElement.classList.add('hidden');
                countdownElement.style.display = 'none';
                console.log('Countdown finished, starting questions');
                this.startQuestions();
            }
        }, 1000);
    }
    
    startQuestions() {
        console.log('=== START QUESTIONS ===');
        console.log('Starting questions phase');
        
        // Mix all questions from selected categories
        this.mixedQuestions = this.mixQuestionsFromCategories();
        this.currentQuestionIndex = 0;
        
        console.log('Mixed questions prepared:', this.mixedQuestions.length);
        console.log('Current question index:', this.currentQuestionIndex);
        
        // Show question section
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.classList.remove('hidden');
            console.log('Question section shown');
        }
        
        // Show first question
        this.showNextQuestion();
        
        console.log('=== START QUESTIONS END ===');
    }
    
    mixQuestionsFromCategories() {
        const allQuestions = [];
        
        // Collect questions from all selected categories
        this.selectedCategories.forEach(category => {
            const categoryQuestions = this.questions[category] || [];
            // Take first 10 questions from each category
            const limitedQuestions = categoryQuestions.slice(0, this.questionsPerCategory);
            
            // Add category info to each question
            limitedQuestions.forEach(question => {
                allQuestions.push({
                    ...question,
                    category: category
                });
            });
        });
        
        // Shuffle all questions
        return this.shuffleArray(allQuestions);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    showNextQuestion() {
        if (this.currentQuestionIndex >= this.mixedQuestions.length) {
            this.endQuiz();
            return;
        }
        
        // Set current phase to question
        localStorage.setItem('currentPhase', 'question');
        
        const question = this.mixedQuestions[this.currentQuestionIndex];
        this.currentQuestion = question;
        this.currentCategory = question.category;
        
        // Save complete state to localStorage AND send to server
        const stateData = {
            quizStarted: true,
            currentPhase: 'question',
            currentQuestion: this.currentQuestion,
            currentCategory: this.currentCategory,
            teams: this.teams,
            scores: this.scores,
            selectedCategories: this.selectedCategories,
            mixedQuestions: this.mixedQuestions,
            currentQuestionIndex: this.currentQuestionIndex
        };
        
        localStorage.setItem('quizState', JSON.stringify(stateData));
        console.log('Question state saved to localStorage');
        
        // Send state to server for multi-device sync
        this.socket.emit('saveQuizState', stateData);
        console.log('Quiz state sent to server for multi-device sync');
        
        // Show question UI
        this.displayQuestion(question);
        
        // Start 30-second timer
        this.startQuestionTimer();
        
        this.currentQuestionIndex++;
    }
    
    startQuestionTimer() {
        console.log('=== SIMPLE TIMER START ===');
        
        // Stop any existing timer
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
        }
        
        // Get timer element
        const timerElement = document.getElementById('questionTimer');
        console.log('Timer element:', timerElement);
        
        if (!timerElement) {
            console.error('Timer element not found!');
            return;
        }
        
        // Start from 30
        let countdown = 30;
        timerElement.textContent = countdown;
        console.log('Timer set to:', countdown);
        
        // Save timer state
        localStorage.setItem('timerState', JSON.stringify({
            countdown: countdown,
            isRunning: true,
            startTime: Date.now()
        }));
        
        // Simple countdown
        this.currentTimerInterval = setInterval(() => {
            countdown--;
            console.log('Countdown:', countdown);
            
            // Update display
            timerElement.textContent = countdown;
            
            // Update timer state
            localStorage.setItem('timerState', JSON.stringify({
                countdown: countdown,
                isRunning: true,
                startTime: Date.now()
            }));
            
            // Check if time is up
            if (countdown <= 0) {
                console.log('TIME UP!');
                clearInterval(this.currentTimerInterval);
                this.currentTimerInterval = null;
                
                // Clear timer state
                localStorage.removeItem('timerState');
                
                this.timeUp();
            }
        }, 1000);
        
        console.log('Timer started');
    }
    
    startTimerWithRemaining(remaining) {
        console.log('=== STARTING TIMER WITH REMAINING TIME ===');
        console.log('Remaining seconds:', remaining);
        
        // Stop any existing timer
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
        }
        
        // Get timer element
        const timerElement = document.getElementById('questionTimer');
        if (!timerElement) {
            console.error('Timer element not found!');
            return;
        }
        
        // Set initial time
        timerElement.textContent = remaining;
        
        // Save timer state
        localStorage.setItem('timerState', JSON.stringify({
            countdown: remaining,
            isRunning: true,
            startTime: Date.now()
        }));
        
        // Start countdown from remaining time
        this.currentTimerInterval = setInterval(() => {
            remaining--;
            console.log('Countdown from remaining:', remaining);
            
            // Update display
            timerElement.textContent = remaining;
            
            // Update timer state
            localStorage.setItem('timerState', JSON.stringify({
                countdown: remaining,
                isRunning: true,
                startTime: Date.now()
            }));
            
            // Check if time is up
            if (remaining <= 0) {
                console.log('TIME UP!');
                clearInterval(this.currentTimerInterval);
                this.currentTimerInterval = null;
                
                // Clear timer state
                localStorage.removeItem('timerState');
                
                this.timeUp();
            }
        }, 1000);
        
        console.log('Timer started with remaining time');
    }
    
    stopQuestionTimer() {
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
            console.log('Timer stopped');
        }
    }
    
    displayQuestion(question) {
        // Save state to prevent refresh changes
        localStorage.setItem('quizState', JSON.stringify({
            quizStarted: true,
            currentPhase: 'question',
            currentQuestion: this.currentQuestion,
            currentCategory: this.currentCategory,
            teams: this.teams,
            scores: this.scores,
            selectedCategories: this.selectedCategories,
            mixedQuestions: this.mixedQuestions,
            currentQuestionIndex: this.currentQuestionIndex
        }));
        
        // Hide category selection
        const categorySection = document.querySelector('.category-section');
        if (categorySection) {
            categorySection.classList.add('hidden');
            categorySection.style.display = 'none';
        }
        
        // Hide scoring section
        const scoringSection = document.querySelector('.scoring-section');
        if (scoringSection) {
            scoringSection.classList.add('hidden');
            scoringSection.style.display = 'none';
        }
        
        // Show question section
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.classList.remove('hidden');
            questionSection.style.display = 'block';
        }
        
        // Update question content
        const questionText = document.querySelector('.question-text');
        if (questionText) {
            questionText.textContent = question.question;
        }
        
        // Update category indicator
        const categoryIndicator = document.querySelector('.category-indicator');
        if (categoryIndicator) {
            categoryIndicator.textContent = question.category;
        }
        
        // Update answer options - REMOVED (no variants needed)
        const answerOptions = document.querySelector('.answer-options');
        if (answerOptions) {
            answerOptions.innerHTML = ''; // Empty - no variants needed
            console.log('Answer options cleared - no variants needed');
        }
    }
    
    selectAnswer(answerIndex) {
        this.stopQuestionTimer();
        
        // Check if answer is correct
        const correct = this.currentQuestion.correct === answerIndex;
        
        // Send answer to server
        this.socket.emit('answerQuestion', {
            question: this.currentQuestion,
            answer: answerIndex,
            correct: correct,
            category: this.currentCategory
        });
        
        // Show next question after delay
        setTimeout(() => {
            this.showNextQuestion();
        }, 2000);
    }
    
    timeUp() {
        console.log('Time up for question');
        
        // Set current phase to scoring
        localStorage.setItem('currentPhase', 'scoring');
        
        // Save complete state to localStorage AND send to server
        const stateData = {
            quizStarted: true,
            currentPhase: 'scoring',
            currentQuestion: this.currentQuestion,
            currentCategory: this.currentCategory,
            teams: this.teams,
            scores: this.scores,
            selectedCategories: this.selectedCategories,
            mixedQuestions: this.mixedQuestions,
            currentQuestionIndex: this.currentQuestionIndex
        };
        
        localStorage.setItem('quizState', JSON.stringify(stateData));
        console.log('Scoring state saved to localStorage');
        
        // Send state to server for multi-device sync
        this.socket.emit('saveQuizState', stateData);
        console.log('Scoring state sent to server for multi-device sync');
        
        // Send time up to server
        this.socket.emit('timeUp', {
            question: this.currentQuestion,
            category: this.currentCategory
        });
        
        // Send scoring phase signal to server
        this.socket.emit('scoringPhase', {
            question: this.currentQuestion,
            category: this.currentCategory,
            scoringPhase: true
        });
        
        // Don't show scoring interface on questions.html
        // Let updateQuestionsPage handle it
        console.log('Time up completed - waiting for server response');
    }
    
    showScoringInterface() {
        console.log('=== SHOW SCORING INTERFACE ===');
        
        // Reset timeUpCalled flag to allow future timeUp calls
        this.timeUpCalled = false;
        
        // Hide question section
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.classList.add('hidden');
        }
        
        // Show scoring section
        const scoringSection = document.querySelector('.scoring-section');
        if (scoringSection) {
            scoringSection.classList.remove('hidden');
            
            // Update scoring content
            const scoringContent = scoringSection.querySelector('.card');
            if (scoringContent) {
                const questionText = this.currentQuestion.question || 'Question not available';
                const categoryText = this.currentCategory || 'Category not available';
                const correctAnswerText = this.currentQuestion.options && this.currentQuestion.correct !== undefined 
                    ? this.currentQuestion.options[this.currentQuestion.correct] 
                    : 'Answer not available';
                
                scoringContent.innerHTML = '<h2>Scoring</h2>' +
                    '<div class="question-info">' +
                        '<p><strong>Question:</strong> ' + questionText + '</p>' +
                        '<p><strong>Category:</strong> ' + categoryText + '</p>' +
                        '<p><strong>Correct Answer:</strong> ' + correctAnswerText + '</p>' +
                    '</div>' +
                    '<div class="scoring-buttons">' +
                        '<button class="btn btn-success" id="correctBtn">' +
                            'Correct (1 point)' +
                        '</button>' +
                        '<button class="btn btn-danger" id="incorrectBtn">' +
                            'Incorrect (0 points)' +
                        '</button>' +
                    '</div>' +
                    '<div class="teams-scoring">' +
                        '<h3>Select Team to Award Points:</h3>' +
                        '<div class="team-scoring-list" id="teamScoringList">' +
                            '<!-- Team buttons will be generated here -->' +
                        '</div>' +
                    '</div>';
                
                // Add event listeners to scoring buttons
                setTimeout(() => {
                    const correctBtn = document.getElementById('correctBtn');
                    const incorrectBtn = document.getElementById('incorrectBtn');
                    
                    if (correctBtn) {
                        correctBtn.addEventListener('click', () => this.markAnswer(true));
                    }
                    
                    if (incorrectBtn) {
                        incorrectBtn.addEventListener('click', () => this.markAnswer(false));
                    }
                }, 100);
                
                // Generate team scoring buttons
                this.generateTeamScoringButtons();
            }
        }
        
        console.log('=== SHOW SCORING INTERFACE END ===');
    }
    
    generateTeamScoringButtons() {
        const teamScoringList = document.getElementById('teamScoringList');
        if (!teamScoringList) return;
        
        teamScoringList.innerHTML = '';
        
        // Get teams from this.teams (not this.registeredTeams)
        const teams = this.teams || [];
        console.log('Teams for scoring:', teams);
        
        teams.forEach((team, index) => {
            const teamButton = document.createElement('button');
            teamButton.className = 'btn btn-primary team-score-btn';
            teamButton.textContent = team.name;
            teamButton.dataset.teamIndex = index;
            teamButton.onclick = () => this.awardPointsToTeam(index);
            teamScoringList.appendChild(teamButton);
        });
        
        console.log('Team scoring buttons generated:', teams.length);
    }
    
    markAnswer(isCorrect) {
        console.log('Answer marked as:', isCorrect ? 'Correct' : 'Incorrect');
        
        // Store answer correctness
        this.lastAnswerCorrect = isCorrect;
        
        // Enable/disable team buttons based on correctness
        const teamButtons = document.querySelectorAll('.team-score-btn');
        teamButtons.forEach(button => {
            button.disabled = !isCorrect; // Only allow scoring if correct
            if (!isCorrect) {
                button.textContent += ' (0 points)';
            }
        });
        
        // Update scoring buttons visual state
        const correctBtn = document.querySelector('.btn-success');
        const incorrectBtn = document.querySelector('.btn-danger');
        
        if (isCorrect) {
            correctBtn.classList.add('selected');
            incorrectBtn.classList.remove('selected');
        } else {
            incorrectBtn.classList.add('selected');
            correctBtn.classList.remove('selected');
        }
    }
    
    awardPointsToTeam(teamIndex) {
        if (!this.lastAnswerCorrect) {
            console.log('No points awarded - answer was incorrect');
            return;
        }
        
        console.log('Awarding 1 point to team:', teamIndex);
        
        // Award 1 point to the team
        this.socket.emit('awardPoint', {
            teamIndex: teamIndex,
            points: 1,
            question: this.currentQuestion,
            category: this.currentCategory
        });
        
        // Show next question after awarding points
        setTimeout(() => {
            this.goToNextQuestion();
        }, 1500);
    }
    
    goToNextQuestion() {
        console.log('Proceeding to next question');
        
        // Hide scoring section
        const scoringSection = document.querySelector('.scoring-section');
        if (scoringSection) {
            scoringSection.classList.add('hidden');
        }
        
        // Reset flags
        this.lastAnswerCorrect = false;
        
        // Show next question
        this.showNextQuestion();
    }
    
    endQuiz() {
        console.log('Quiz ended');
        
        // Send quiz end to server
        this.socket.emit('endQuiz', {
            selectedCategories: this.selectedCategories
        });
        
        // Show scoring phase
        this.showScoringPhase();
    }
    
    showScoringPhase() {
        // Hide question section
        const questionSection = document.querySelector('.question-section');
        if (questionSection) {
            questionSection.classList.add('hidden');
        }
        
        // Show scoring section
        const scoringSection = document.querySelector('.scoring-section');
        if (scoringSection) {
            scoringSection.classList.remove('hidden');
        }
    }
    
    showCountdown(callback) {
        const categorySection = document.querySelector('.category-section');
        const questionSection = document.getElementById('questionSection');
        const countdownDisplay = document.getElementById('countdownDisplay');
        const countdownNumber = document.querySelector('.countdown-number');
        
        if (!categorySection || !questionSection || !countdownDisplay || !countdownNumber) {
            console.error('Countdown elements not found');
            callback();
            return;
        }
        
        // Hide category section, show question section with countdown
        categorySection.classList.add('hidden');
        questionSection.classList.remove('hidden');
        
        // Show countdown display
        countdownDisplay.classList.remove('hidden');
        
        let count = 3;
        countdownNumber.textContent = count;
        
        // Play countdown sound
        this.playSound('countdown');
        
        const countdownInterval = setInterval(() => {
            count--;
            
            if (count > 0) {
                countdownNumber.textContent = count;
                // Play sound for each number
                this.playSound('countdown');
            } else {
                clearInterval(countdownInterval);
                countdownDisplay.classList.add('hidden');
                callback();
            }
        }, 1000);
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
        
        // Reset flags
        this.timeUpCalled = false;
        this.isAnimating = false;
        
        console.log('Timer started - flags reset');
        
        // Show timer
        timerContainer.classList.remove('hidden');
        stopwatchDisplay.classList.remove('hidden');
        
        // Start countdown
        this.startStopwatch(timerTime, timerCircle);
    }

    startStopwatch(timerTime, timerCircle) {
        let timeLeft = 30;
        
        // Clear any existing timer
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
        }
        
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
            
            // Time's up - only call once
            if (timeLeft <= 0 && !this.timeUpCalled) {
                clearInterval(stopwatchInterval);
                this.currentTimerInterval = null;
                this.timeUp();
            }
        }, 1000);
        
        this.currentTimerInterval = stopwatchInterval;
    }

    timeUp() {
        // Prevent multiple timeUp calls
        if (this.timeUpCalled) {
            console.log('TimeUp already called, skipping...');
            return;
        }
        
        this.timeUpCalled = true;
        console.log('TimeUp called - setting flag');
        
        // Play time's up sound
        this.playSound('timeup');
        
        // Clear timer
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
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
        // Prevent multiple sounds from playing at once
        if (this.currentSound) {
            try {
                this.currentSound.stop();
                this.currentSound = null;
            } catch (e) {
                console.log('Error stopping previous sound:', e);
                this.currentSound = null;
            }
        }
        
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
                oscillator.stop(audioContext.currentTime + 0.5);
                
                // Set up stop handler
                oscillator.onended = () => {
                    console.log('Time up sound ended');
                    this.currentSound = null;
                };
                
                this.currentSound = oscillator;
                break;
        }
    }

    goToNextQuestion() {
        console.log('goToNextQuestion called - proceeding to next question');
        // Reset timeUp flag for next question
        this.timeUpCalled = false;
        // Also reset animation flag
        this.isAnimating = false;
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

    animateScoreUpdates(scores) {
        // Set animation flag
        this.isAnimating = true;
        
        console.log('Starting 3-second score animation for scores:', scores);
        
        // Simple animation - just update display with effect
        Object.keys(scores).forEach((teamId, index) => {
            const scoreValue = scores[teamId];
            if (scoreValue > 0) {
                setTimeout(() => {
                    this.animateSingleTeamScore(teamId, scoreValue);
                }, index * 200);
            }
        });
        
        // Clear animation flag after 3 seconds
        setTimeout(() => {
            this.isAnimating = false;
            console.log('3-second score animation completed');
        }, 3000); // Extended to 3 seconds
    }
    
    animateSingleTeamScore(teamId, scoreValue) {
        const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
        if (!teamCard) {
            console.log('Team card not found for team:', teamId);
            return;
        }
        
        // Find the score element
        const scoreElement = teamCard.querySelector('.team-score');
        if (!scoreElement) {
            console.log('Score element not found for team:', teamId);
            return;
        }
        
        // Get current and target scores
        const currentScore = parseInt(scoreElement.textContent) || 0;
        const targetScore = currentScore + scoreValue;
        
        console.log(`Animating score for team ${teamId}: ${currentScore} -> ${targetScore}`);
        
        // Add visual effect
        teamCard.style.background = '#e8f5e8';
        teamCard.style.transform = 'scale(1.05)';
        teamCard.style.transition = 'all 0.3s ease';
        
        // Animate the number
        this.animateNumber(scoreElement, currentScore, targetScore, 800);
        
        // Remove visual effect after animation
        setTimeout(() => {
            teamCard.style.background = '';
            teamCard.style.transform = '';
        }, 800);
    }
    
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = currentNumber;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = end; // Ensure final number is exact
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    markCategoryCompleted(category) {
        if (!this.completedCategories.includes(category)) {
            this.completedCategories.push(category);
            console.log('Category marked as completed:', category);
            console.log('All completed categories:', this.completedCategories);
            
            // Update buttons immediately to show completion
            this.updateCategoryButtons(this.completedCategories);
            
            // Send completion signal to server
            if (this.socket) {
                this.socket.emit('categoryCompleted', category);
                console.log('Category completion signal sent to server:', category);
            }
        } else {
            console.log('Category already marked as completed:', category);
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

// Create global app instance for HTML onclick handlers
const app = new QuizApp();
window.app = app; // Make it globally available
