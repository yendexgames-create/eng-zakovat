// Quiz Application JavaScript
class QuizApp {
    constructor() {
        this.teams = [];
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.questions = {};
        this.scores = {};
        
        // Check if localStorage is available (for Netlify deployment)
        this.isLocalStorageAvailable = this.checkLocalStorage();
        
        this.initializeQuestions();
        this.bindEvents();
        
        // Check if we're on the questions page
        if (window.location.pathname.includes('questions.html') || window.location.href.includes('questions.html')) {
            this.initializeQuestionsPage();
        } else {
            // Check for scoring phase on index.html
            this.checkScoringPhase();
        }
    }

    checkLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }
    
    // Enhanced storage methods with fallback
    safeSetItem(key, value) {
        console.log(`=== SAFE SET ITEM ${key} ===`);
        console.log('Setting value:', value);
        
        if (this.isLocalStorageAvailable) {
            localStorage.setItem(key, value);
            // Also try to set in sessionStorage for cross-tab sync
            try {
                sessionStorage.setItem(key, value);
            } catch (e) {
                console.warn('sessionStorage not available:', e);
            }
        } else {
            console.warn('localStorage not available, using fallback:', key);
            // Fallback to sessionStorage
            try {
                sessionStorage.setItem(key, value);
            } catch (e) {
                console.warn('sessionStorage not available either:', e);
            }
        }
        
        // Always set in cookies for cross-device sync
        this.setCookie(key, value, 7);
        console.log(`=== SAFE SET ITEM ${key} END ===`);
    }
    
    safeGetItem(key) {
        console.log(`=== SAFE GET ITEM ${key} ===`);
        
        let value = null;
        
        if (this.isLocalStorageAvailable) {
            value = localStorage.getItem(key);
            console.log('From localStorage:', value);
        } else {
            console.warn('localStorage not available, trying sessionStorage:', key);
            // Fallback to sessionStorage
            try {
                value = sessionStorage.getItem(key);
                console.log('From sessionStorage:', value);
            } catch (e) {
                console.warn('sessionStorage not available either:', e);
            }
        }
        
        // Fallback to cookies if empty
        if (!value) {
            value = this.getCookie(key);
            console.log('From cookie:', value);
        }
        
        console.log(`Final value for ${key}:`, value);
        console.log(`=== SAFE GET ITEM ${key} END ===`);
        return value;
    }
    
    safeRemoveItem(key) {
        console.log(`=== SAFE REMOVE ITEM ${key} ===`);
        
        if (this.isLocalStorageAvailable) {
            localStorage.removeItem(key);
            // Also remove from sessionStorage
            try {
                sessionStorage.removeItem(key);
            } catch (e) {
                console.warn('sessionStorage not available:', e);
            }
        } else {
            console.warn('localStorage not available, cannot remove:', key);
            // Fallback to sessionStorage
            try {
                sessionStorage.removeItem(key);
            } catch (e) {
                console.warn('sessionStorage not available either:', e);
            }
        }
        
        // Always remove from cookies
        this.deleteCookie(key);
        console.log(`=== SAFE REMOVE ITEM ${key} END ===`);
    }
    
    // Force refresh from all storage sources
    forceRefreshStorage() {
        console.log('=== FORCE REFRESH STORAGE ===');
        
        // Try localStorage first
        let teams = null;
        let scores = null;
        let quizSetup = null;
        let quizActivated = null;
        
        if (this.isLocalStorageAvailable) {
            teams = localStorage.getItem('quizTeams');
            scores = localStorage.getItem('quizScores');
            quizSetup = localStorage.getItem('quizSetup');
            quizActivated = localStorage.getItem('quizActivated');
            console.log('From localStorage:', { teams, scores, quizSetup, quizActivated });
        }
        
        // Fallback to sessionStorage if localStorage is empty
        if (!teams) {
            try {
                teams = sessionStorage.getItem('quizTeams');
                console.log('From sessionStorage teams:', teams);
            } catch (e) {
                console.warn('sessionStorage not available for teams:', e);
            }
        }
        
        if (!scores) {
            try {
                scores = sessionStorage.getItem('quizScores');
                console.log('From sessionStorage scores:', scores);
            } catch (e) {
                console.warn('sessionStorage not available for scores:', e);
            }
        }
        
        if (!quizSetup) {
            try {
                quizSetup = sessionStorage.getItem('quizSetup');
                console.log('From sessionStorage quizSetup:', quizSetup);
            } catch (e) {
                console.warn('sessionStorage not available for quizSetup:', e);
            }
        }
        
        if (!quizActivated) {
            try {
                quizActivated = sessionStorage.getItem('quizActivated');
                console.log('From sessionStorage quizActivated:', quizActivated);
            } catch (e) {
                console.warn('sessionStorage not available for quizActivated:', e);
            }
        }
        
        // Fallback to cookies if both localStorage and sessionStorage are empty
        if (!teams) {
            teams = this.getCookie('quizTeams');
            console.log('From cookie teams:', teams);
        }
        
        if (!scores) {
            scores = this.getCookie('quizScores');
            console.log('From cookie scores:', scores);
        }
        
        if (!quizSetup) {
            quizSetup = this.getCookie('quizSetup');
            console.log('From cookie quizSetup:', quizSetup);
        }
        
        if (!quizActivated) {
            quizActivated = this.getCookie('quizActivated');
            console.log('From cookie quizActivated:', quizActivated);
        }
        
        // Update local state
        if (teams) {
            this.teams = JSON.parse(teams);
            console.log('Updated teams:', this.teams);
        }
        
        if (scores) {
            this.scores = JSON.parse(scores);
            console.log('Updated scores:', this.scores);
        }
        
        console.log('=== FORCE REFRESH STORAGE END ===');
    }
    
    // Cookie methods for cross-device sync
    setCookie(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
        console.log(`Set cookie ${name}:`, value);
    }
    
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
                console.log(`Got cookie ${name}:`, value);
                return value;
            }
        }
        return null;
    }
    
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        console.log(`Deleted cookie ${name}`);
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
        console.log('=== BIND EVENTS DEBUG ===');
        
        const teamCountInput = document.getElementById('teamCount');
        const generateBtn = document.getElementById('generateInputs');
        const startBtn = document.getElementById('startQuiz');
        const submitScoresBtn = document.getElementById('submitScores');
        const skipScoringBtn = document.getElementById('skipScoring');

        console.log('Found elements:');
        console.log('teamCountInput:', teamCountInput);
        console.log('generateBtn:', generateBtn);
        console.log('startBtn:', startBtn);
        console.log('submitScoresBtn:', submitScoresBtn);
        console.log('skipScoringBtn:', skipScoringBtn);

        if (teamCountInput) {
            console.log('Binding teamCountInput change event');
            teamCountInput.addEventListener('change', () => this.generateTeamInputs());
        } else {
            console.warn('teamCountInput not found');
        }

        if (generateBtn) {
            console.log('Binding generateBtn click event');
            generateBtn.addEventListener('click', () => this.generateTeamInputs());
        } else {
            console.warn('generateBtn not found');
        }

        if (startBtn) {
            console.log('Binding startBtn click event');
            console.log('startBtn type:', typeof startBtn);
            console.log('startBtn tagName:', startBtn.tagName);
            console.log('startBtn onclick:', startBtn.onclick);
            
            try {
                startBtn.addEventListener('click', function(e) {
                    console.log('Setup Quiz button clicked!');
                    console.log('Event object:', e);
                    console.log('this:', this);
                    console.log('window.quizApp:', window.quizApp);
                    
                    if (window.quizApp && typeof window.quizApp.setupQuiz === 'function') {
                        window.quizApp.setupQuiz();
                    } else {
                        console.error('quizApp or setupQuiz method not found');
                        alert('Application error. Please refresh the page.');
                    }
                });
                console.log('Event listener added successfully');
            } catch (error) {
                console.error('Error adding event listener:', error);
                alert('Error setting up button. Please refresh the page.');
            }
        } else {
            console.warn('startBtn not found');
            // Try to find it with different selectors
            const allButtons = document.querySelectorAll('button');
            console.log('All buttons found:', allButtons.length);
            allButtons.forEach((btn, index) => {
                console.log(`Button ${index}:`, btn.id, btn.className, btn.textContent);
            });
        }

        if (submitScoresBtn) {
            console.log('Binding submitScoresBtn click event');
            submitScoresBtn.addEventListener('click', () => this.submitScores());
        } else {
            console.warn('submitScoresBtn not found');
        }

        if (skipScoringBtn) {
            console.log('Binding skipScoringBtn click event');
            skipScoringBtn.addEventListener('click', () => this.skipScoring());
        } else {
            console.warn('skipScoringBtn not found');
        }

        // Category buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        console.log('Found category buttons:', categoryBtns.length);
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectCategory(btn.dataset.category));
        });

        // Next question button
        const nextBtn = document.getElementById('nextQuestion');
        if (nextBtn) {
            console.log('Binding nextBtn click event');
            nextBtn.addEventListener('click', () => this.nextQuestion());
        } else {
            console.warn('nextBtn not found');
        }
        
        console.log('=== BIND EVENTS END ===');
    }

    setupQuiz() {
        console.log('=== SETUP QUIZ DEBUG ===');
        
        const teamInputs = document.querySelectorAll('.team-input input');
        console.log('Found team inputs:', teamInputs.length);
        
        const teamNames = [];
        let hasEmptyInput = false;

        teamInputs.forEach((input, index) => {
            const name = input.value.trim();
            console.log(`Team ${index + 1} input: "${name}"`);
            
            if (name === '') {
                hasEmptyInput = true;
                console.warn(`Team ${index + 1} input is empty`);
            } else {
                teamNames.push(name);
            }
        });

        if (hasEmptyInput) {
            console.warn('Empty team inputs found, stopping setup');
            alert('Please fill in all team names');
            return;
        }

        if (teamNames.length < 2) {
            console.warn('Not enough teams, stopping setup');
            alert('Please enter at least 2 teams');
            return;
        }

        console.log('Team names:', teamNames);

        // Create team objects
        this.teams = teamNames.map((name, index) => ({
            id: index + 1,
            name: name,
            score: 0
        }));

        console.log('Created teams:', this.teams);

        // Initialize scores
        this.teams.forEach(team => {
            this.scores[team.id] = 0;
        });

        console.log('Initialized scores:', this.scores);

        // Reset completed categories for new teams
        this.safeSetItem('completedCategories', JSON.stringify([]));

        // Store teams data with timestamp
        this.safeSetItem('quizTeams', JSON.stringify(this.teams));
        this.safeSetItem('quizScores', JSON.stringify(this.scores));
        this.safeSetItem('quizSetup', 'true');
        this.safeSetItem('quizSetupTime', Date.now().toString());

        console.log('Data saved to storage');

        // Show setup status but don't auto-navigate
        this.showSetupStatus();
        
        // Admin must manually click "Open Questions Page"
        console.log('Quiz setup complete. Admin must manually navigate to questions page.');
        console.log('=== SETUP QUIZ END ===');
    }

    generateTeamInputs() {
        const teamCount = parseInt(document.getElementById('teamCount').value);
        const container = document.getElementById('teamInputs');
        const startBtn = document.getElementById('startQuiz');

        container.innerHTML = '';

        for (let i = 1; i <= teamCount; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'team-input-group';
            inputGroup.innerHTML = `
                <label for="team${i}">Team ${i}:</label>
                <input type="text" id="team${i}" class="text-input" placeholder="Enter team name" required>
            `;
            container.appendChild(inputGroup);
        }

        // Add event listeners to team inputs
        container.querySelectorAll('.text-input').forEach(input => {
            input.addEventListener('input', () => this.checkTeamInputs());
        });

        this.checkTeamInputs();
    }

    checkTeamInputs() {
        console.log('=== CHECK TEAM INPUTS DEBUG ===');
        
        const teamInputs = document.querySelectorAll('.team-input input');
        const startBtn = document.getElementById('startQuiz');
        
        console.log('Found team inputs:', teamInputs.length);
        console.log('Start button:', startBtn);
        
        let allFilled = true;
        let filledCount = 0;
        
        teamInputs.forEach((input, index) => {
            const value = input.value.trim();
            console.log(`Input ${index + 1}: "${value}"`);
            
            if (value !== '') {
                filledCount++;
            } else {
                allFilled = false;
            }
        });
        
        console.log(`Filled inputs: ${filledCount}/${teamInputs.length}`);
        console.log('All filled:', allFilled);
        
        if (startBtn) {
            if (allFilled && filledCount >= 2) {
                console.log('Enabling start button');
                startBtn.disabled = false;
                startBtn.style.cursor = 'pointer';
                startBtn.style.opacity = '1';
            } else {
                console.log('Disabling start button');
                startBtn.disabled = true;
                startBtn.style.cursor = 'not-allowed';
                startBtn.style.opacity = '0.6';
            }
        }
        
        console.log('=== CHECK TEAM INPUTS END ===');
    }

    checkScoringPhase() {
        // Clear any old scoring data first
        this.clearOldScoringData();
        
        const scoringPhase = localStorage.getItem('scoringPhase');
        const timeUpSignal = localStorage.getItem('timeUpSignal');
        
        // Only show scoring if there's an active scoring phase or time up signal
        if (scoringPhase === 'true' || timeUpSignal) {
            this.showScoringSection();
        } else {
            // Make sure we're in normal setup mode
            this.ensureNormalMode();
        }
        
        // Listen for time up signals from questions device
        this.listenForTimeUpSignals();
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
        
        // Always load current scores from localStorage first
        const storedScores = localStorage.getItem('quizScores');
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        } else {
            this.scores = {};
        }
        
        // Update local scores - ONLY ADD NEW SCORES
        Object.keys(scores).forEach(teamId => {
            const oldScore = this.scores[teamId] || 0;
            const newScore = scores[teamId];
            this.scores[teamId] = oldScore + newScore;
        });
        
        // Save final scores directly to quizScores
        this.safeSetItem('quizScores', JSON.stringify(this.scores));
        
        // Also save new scores for animation
        this.safeSetItem('newScores', JSON.stringify(scores));
        this.safeSetItem('scoresTimestamp', Date.now().toString());
        
        // Send scoring completion signal to questions device
        this.safeSetItem('scoringCompleted', Date.now().toString());
        
        // Send auto-next signal to questions.html after animations complete
        setTimeout(() => {
            this.safeSetItem('autoNextQuestion', Date.now().toString());
        }, 2000); // Wait for animations to complete
        
        // Send refresh signal to questions.html after a small delay
        setTimeout(() => {
            this.safeSetItem('refreshQuestions', Date.now().toString());
        }, 100);
        
        // Clear scoring phase
        this.safeRemoveItem('scoringPhase');
        this.safeRemoveItem('currentQuestion');
        this.safeRemoveItem('timeUpSignal');
        // Don't remove scoringCompleted here - let questions page handle it
        
        // Show completion message and restore setup
        this.restoreSetupSection();
    }

    skipScoring() {
        // Send scoring completion signal even when skipping
        this.safeSetItem('scoringCompleted', Date.now().toString());
        
        // Send refresh signal to questions.html after a small delay
        setTimeout(() => {
            this.safeSetItem('refreshQuestions', Date.now().toString());
        }, 100);
        
        // Clear scoring phase
        this.safeRemoveItem('scoringPhase');
        this.safeRemoveItem('currentQuestion');
        this.safeRemoveItem('timeUpSignal');
        this.safeRemoveItem('scoringCompleted');
        
        // Show completion message and restore setup
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
        
// Send auto-next signal to questions.html after animations complete
setTimeout(() => {
    this.safeSetItem('autoNextQuestion', Date.now().toString());
}, 2000); // Wait for animations to complete
        
// Send refresh signal to questions.html after a small delay
setTimeout(() => {
    this.safeSetItem('refreshQuestions', Date.now().toString());
}, 100);
        const teamsPreview = document.getElementById('teamsPreview');
        const teamsSidebar = document.querySelector('.teams-sidebar');
        
        // Store initial timestamps
        this.lastSetupTime = this.safeGetItem('quizSetupTime') || '0';
        this.lastStartedTime = this.safeGetItem('quizStartedTime') || '0';
        this.lastScoresTime = this.safeGetItem('scoresTimestamp') || '0';
        
        // Auto-refresh every 2 seconds to check for quiz setup and activation
        this.refreshInterval = setInterval(() => {
            this.checkQuizStatus();
        }, 2000);
        
        // Check for new scores animation
        this.checkForNewScores();
        
        // Load teams data
        const storedTeams = this.safeGetItem('quizTeams');
        const storedScores = this.safeGetItem('quizScores');
        
        if (storedTeams) {
            this.teams = JSON.parse(storedTeams);
        }
        
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        } else {
            this.scores = {};
        }
        
        // Check if quiz is set up - show teams sidebar
        const quizSetup = this.safeGetItem('quizSetup');
        if (quizSetup === 'true') {
            teamsPreview.classList.remove('hidden');
            if (teamsSidebar) {
                teamsSidebar.classList.remove('hidden');
            }
        }
        
        // Check if quiz is activated
        const quizActivated = this.safeGetItem('quizActivated');
        if (quizActivated === 'true') {
            this.showCategorySelection();
            clearInterval(this.refreshInterval);
            
            // Load completed categories and update buttons
            const completedCategories = this.safeGetItem('completedCategories') ? JSON.parse(this.safeGetItem('completedCategories')) : [];
            this.updateCategoryButtons(completedCategories);
        }
    }

    checkQuizStatus() {
        const quizSetup = this.safeGetItem('quizSetup');
        const quizActivated = this.safeGetItem('quizActivated');
        const currentSetupTime = this.safeGetItem('quizSetupTime') || '0';
        const currentStartedTime = this.safeGetItem('quizStartedTime') || '0';
        
        console.log('=== CHECK QUIZ STATUS DEBUG ===');
        console.log('quizSetup:', quizSetup);
        console.log('quizActivated:', quizActivated);
        console.log('currentSetupTime:', currentSetupTime);
        console.log('currentStartedTime:', currentStartedTime);
        
        // Always reload scores to ensure they're up to date
        const storedScores = this.safeGetItem('quizScores');
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
            console.log('Loaded scores:', this.scores);
        }
        
        // Store last known times
        this.lastSetupTime = this.lastSetupTime || currentSetupTime;
        this.lastStartedTime = this.lastStartedTime || currentStartedTime;
        
        // Check if setup time changed (new setup from index.html)
        if (currentSetupTime !== this.lastSetupTime && currentSetupTime !== '0') {
            console.log('Setup time changed, updating UI');
            this.lastSetupTime = currentSetupTime;
            // Don't reload immediately, just update UI
            this.updateUIForSetup();
            return;
        }
        
        // Check if quiz was just started - UPDATE UI INSTEAD OF RELOAD
        if (currentStartedTime !== this.lastStartedTime && currentStartedTime !== '0') {
            console.log('Quiz started, updating UI');
            this.lastStartedTime = currentStartedTime;
            // Don't reload immediately, just update UI
            this.updateUIForActivation();
            return;
        }
        
        // If quiz was just set up, refresh to show teams
        if (quizSetup === 'true') {
            console.log('Quiz is set up, showing teams');
            const teamsPreview = document.getElementById('teamsPreview');
            const teamsSidebar = document.querySelector('.teams-sidebar');
            const startQuizBtn = document.getElementById('startQuizBtn');
            
            if (teamsPreview && teamsPreview.classList.contains('hidden')) {
                this.updateUIForSetup();
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
            console.log('Quiz is activated, showing category selection');
            const welcomeSection = document.getElementById('welcomeSection');
            const categorySection = document.querySelector('.category-section');
            
            if (welcomeSection && !welcomeSection.classList.contains('hidden')) {
                this.showCategorySelection();
            }
        }
        console.log('=== CHECK QUIZ STATUS END ===');
    }

    updateUIForSetup() {
        const teamsPreview = document.getElementById('teamsPreview');
        const teamsSidebar = document.querySelector('.teams-sidebar');
        const startQuizBtn = document.getElementById('startQuizBtn');
        
        if (teamsPreview) {
            teamsPreview.classList.remove('hidden');
        }
        if (teamsSidebar) {
            teamsSidebar.classList.remove('hidden');
            this.displayTeams();
        }
        if (startQuizBtn) {
            startQuizBtn.classList.add('hidden');
        }
    }

    updateUIForActivation() {
        const welcomeSection = document.getElementById('welcomeSection');
        const categorySection = document.querySelector('.category-section');
        
        if (welcomeSection) {
            welcomeSection.classList.add('hidden');
        }
        if (categorySection) {
            categorySection.classList.remove('hidden');
        }
        
        this.showCategorySelection();
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
        localStorage.setItem('quizActivated', 'true');
        localStorage.setItem('quizStartedTime', Date.now().toString());
        this.showCategorySelection();
    }

    showCategorySelection() {
        console.log('=== SHOW CATEGORY SELECTION DEBUG ===');
        
        const welcomeSection = document.getElementById('welcomeSection');
        const categorySection = document.querySelector('.category-section');
        
        console.log('Before hiding welcome section, welcomeSection.hidden:', welcomeSection ? welcomeSection.classList.contains('hidden') : 'not found');
        console.log('Before showing category section, categorySection.hidden:', categorySection ? categorySection.classList.contains('hidden') : 'not found');
        
        welcomeSection.classList.add('hidden');
        categorySection.classList.remove('hidden');
        
        console.log('After hiding welcome section, welcomeSection.hidden:', welcomeSection ? welcomeSection.classList.contains('hidden') : 'not found');
        console.log('After showing category section, categorySection.hidden:', categorySection ? categorySection.classList.contains('hidden') : 'not found');
        
        // Update category buttons to show completed status
        const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
        console.log('Loading completed categories from localStorage:', completedCategories);
        console.log('Raw localStorage value:', localStorage.getItem('completedCategories'));
        
        this.updateCategoryButtons(completedCategories);
        console.log('=== SHOW CATEGORY SELECTION END ===');
    }

    selectCategory(category) {
        console.log('=== SELECT CATEGORY DEBUG ===');
        console.log('Selected category:', category);
        console.log('Full questions object:', this.questions);
        console.log('Questions for this category:', this.questions[category]);
        console.log('Questions array length:', this.questions[category] ? this.questions[category].length : 'undefined');
        
        // Check if category is already completed
        const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
        console.log('Completed categories check:', completedCategories);
        console.log(`Is ${category} already completed?`, completedCategories.includes(category));
        
        if (completedCategories.includes(category)) {
            console.log(`Category ${category} is already completed, cannot select again`);
            return; // Don't allow selecting completed categories
        }
        
        this.currentCategory = category;
        this.currentQuestionIndex = 0;
        
        // Load teams and scores
        const storedTeams = localStorage.getItem('quizTeams');
        const storedScores = localStorage.getItem('quizScores');
        
        if (storedTeams) {
            this.teams = JSON.parse(storedTeams);
        }
        if (storedScores) {
            this.scores = JSON.parse(storedScores);
        } else {
            this.scores = {};
        }

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
        this.updateCategoryButtons(completedCategories);
        console.log('=== SELECT CATEGORY END ===');
    }
    
    updateCategoryButtons(completedCategories) {
        console.log('=== UPDATE CATEGORY BUTTONS DEBUG ===');
        console.log('Completed categories from localStorage:', completedCategories);
        
        const categoryButtons = document.querySelectorAll('.category-btn');
        console.log('Found category buttons:', categoryButtons.length);
        
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            console.log(`Processing button for category: ${category}`);
            console.log(`Is ${category} in completed categories?`, completedCategories.includes(category));
            
            if (completedCategories.includes(category)) {
                console.log(`Marking ${category} as completed`);
                button.classList.add('completed');
                button.disabled = true;
                button.innerHTML = `
                    <div class="category-icon">Check</div>
                    <span>${category.charAt(0).toUpperCase() + category.slice(1)} (Completed)</span>
                `;
            } else {
                console.log(`Marking ${category} as available`);
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
        console.log('=== UPDATE CATEGORY BUTTONS END ===');
    }
    
    markCategoryCompleted(category) {
        console.log('=== MARK CATEGORY COMPLETED DEBUG ===');
        console.log('Category to mark as completed:', category);
        
        const completedCategories = localStorage.getItem('completedCategories') ? JSON.parse(localStorage.getItem('completedCategories')) : [];
        console.log('Current completed categories before adding:', completedCategories);
        
        if (!completedCategories.includes(category)) {
            completedCategories.push(category);
            localStorage.setItem('completedCategories', JSON.stringify(completedCategories));
            console.log('Updated completed categories after adding:', completedCategories);
            console.log('Saved to localStorage:', localStorage.getItem('completedCategories'));
            
            // Update buttons immediately
            this.updateCategoryButtons(completedCategories);
        } else {
            console.log(`Category ${category} is already in completed categories, not adding again`);
        }
        console.log('=== MARK CATEGORY COMPLETED END ===');
    }

    displayTeams() {
        console.log('=== DISPLAY TEAMS DEBUG ===');
        console.log('Current teams:', this.teams);
        console.log('Current scores:', this.scores);
        
        const teamsList = document.getElementById('teamsList');
        teamsList.innerHTML = '';

        // Load teams from localStorage if not available
        if (!this.teams || this.teams.length === 0) {
            const storedTeams = this.safeGetItem('quizTeams');
            console.log('Loading teams from localStorage:', storedTeams);
            if (storedTeams) {
                this.teams = JSON.parse(storedTeams);
                console.log('Loaded teams:', this.teams);
            }
        }

        // Load scores if not available
        if (!this.scores || Object.keys(this.scores).length === 0) {
            const storedScores = this.safeGetItem('quizScores');
            console.log('Loading scores from localStorage:', storedScores);
            if (storedScores) {
                this.scores = JSON.parse(storedScores);
                console.log('Loaded scores:', this.scores);
            }
        }

        // Sort teams by score
        const sortedTeams = [...this.teams].sort((a, b) => {
            const scoreA = this.scores[a.id] || 0;
            const scoreB = this.scores[b.id] || 0;
            return scoreB - scoreA;
        });

        // Display teams
        sortedTeams.forEach((team, index) => {
            const score = this.scores[team.id] || 0;
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

// Initialize the quiz app globally
window.quizApp = new QuizApp();
console.log('Quiz App initialized globally:', window.quizApp);
