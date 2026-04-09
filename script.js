// Quiz Application JavaScript
class QuizApp {
    constructor() {
        this.teams = [];
        this.currentCategory = null;
        this.currentQuestionIndex = 0;
        this.questions = {};
        this.scores = {};
        
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
        const teamCountInput = document.getElementById('teamCount');
        const generateBtn = document.getElementById('generateInputs');
        const startBtn = document.getElementById('startQuiz');
        const submitScoresBtn = document.getElementById('submitScores');
        const skipScoringBtn = document.getElementById('skipScoring');

        if (teamCountInput) {
            teamCountInput.addEventListener('change', () => this.generateTeamInputs());
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateTeamInputs());
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => this.setupQuiz());
        }

        if (submitScoresBtn) {
            submitScoresBtn.addEventListener('click', () => this.submitScores());
        }

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

    checkScoringPhase() {
        const scoringPhase = localStorage.getItem('scoringPhase');
        if (scoringPhase === 'true') {
            this.showScoringSection();
        }
    }

    showScoringSection() {
        // Hide setup section
        const setupSection = document.querySelector('.setup-section');
        const scoringSection = document.getElementById('scoringSection');
        
        if (setupSection) setupSection.classList.add('hidden');
        if (scoringSection) scoringSection.classList.remove('hidden');
        
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

    submitScores() {
        const scores = {};
        
        // Collect scores from radio buttons
        this.teams.forEach(team => {
            const selectedScore = document.querySelector(`input[name="score-${team.id}"]:checked`);
            if (selectedScore) {
                scores[team.id] = parseInt(selectedScore.value);
            } else {
                scores[team.id] = 0; // Default if no score selected
            }
        });
        
        // Store scores with timestamp for animation trigger
        localStorage.setItem('newScores', JSON.stringify(scores));
        localStorage.setItem('scoresTimestamp', Date.now().toString());
        
        // Clear scoring phase
        localStorage.removeItem('scoringPhase');
        localStorage.removeItem('currentQuestion');
        
        // Redirect back to questions page
        window.location.href = 'questions.html';
    }

    skipScoring() {
        // Clear scoring phase and redirect
        localStorage.removeItem('scoringPhase');
        localStorage.removeItem('currentQuestion');
        window.location.href = 'questions.html';
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
        const quizSetup = localStorage.getItem('quizSetup');
        
        if (storedTeams) {
            this.teams = JSON.parse(storedTeams);
            this.displayWelcomeTeams();
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
        }
    }

    checkQuizStatus() {
        const quizSetup = localStorage.getItem('quizSetup');
        const quizActivated = localStorage.getItem('quizActivated');
        const currentSetupTime = localStorage.getItem('quizSetupTime') || '0';
        const currentStartedTime = localStorage.getItem('quizStartedTime') || '0';
        
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
                this.displayTeams();
                teamsSidebar.classList.remove('hidden');
            }
            
            // Show start button for admin
            if (startQuizBtn && startQuizBtn.classList.contains('hidden')) {
                startQuizBtn.classList.remove('hidden');
            }
        }
        
        // If quiz was activated, show categories
        if (quizActivated === 'true') {
            this.showCategorySelection();
            clearInterval(this.refreshInterval);
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
        localStorage.setItem('quizActivated', 'true');
        localStorage.setItem('quizActivated', 'true');
        localStorage.setItem('quizStartedTime', Date.now().toString());
        this.showCategorySelection();
    }

    showCategorySelection() {
        const welcomeSection = document.getElementById('welcomeSection');
        const categorySection = document.querySelector('.category-section');
        
        welcomeSection.classList.add('hidden');
        categorySection.classList.remove('hidden');
    }

    selectCategory(category) {
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
        }

        // Set current questions
        this.currentQuestions = this.questions[category];
        this.currentQuestion = this.currentQuestions[this.currentQuestionIndex];

        this.displayTeams();
        this.showQuestion();
    }

    displayTeams() {
        const teamsList = document.getElementById('teamsList');
        teamsList.innerHTML = '';

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
        
        if (newScores && scoresTimestamp && scoresTimestamp !== this.lastScoresTime) {
            this.lastScoresTime = scoresTimestamp;
            const scores = JSON.parse(newScores);
            
            // Load current scores
            const storedScores = localStorage.getItem('quizScores');
            if (storedScores) {
                this.scores = JSON.parse(storedScores);
            }
            
            // Apply scores to teams
            Object.keys(scores).forEach(teamId => {
                this.scores[teamId] = (this.scores[teamId] || 0) + scores[teamId];
            });
            
            // Save updated scores
            localStorage.setItem('quizScores', JSON.stringify(this.scores));
            
            // Animate score updates
            this.animateScoreUpdates(scores);
            
            // Clear new scores
            localStorage.removeItem('newScores');
        }
    }

    animateScoreUpdates(newScores) {
        const teamsList = document.getElementById('teamsList');
        const teamItems = teamsList.querySelectorAll('.team-item');
        
        // Animate each team's score update
        this.teams.forEach((team, index) => {
            const scoreIncrease = newScores[team.id] || 0;
            if (scoreIncrease > 0) {
                const teamItem = teamItems[index];
                const scoreValue = teamItem.querySelector('.team-score-value');
                
                // Add animation class
                teamItem.classList.add('score-update-animation');
                
                // Show floating score increase
                const floatingScore = document.createElement('div');
                floatingScore.className = 'floating-score';
                floatingScore.textContent = `+${scoreIncrease}`;
                teamItem.appendChild(floatingScore);
                
                // Update score with animation
                setTimeout(() => {
                    const currentScore = this.scores[team.id];
                    this.animateNumber(scoreValue, currentScore - scoreIncrease, currentScore, 1000);
                }, 300);
                
                // Remove animation classes after animation
                setTimeout(() => {
                    teamItem.classList.remove('score-update-animation');
                    floatingScore.remove();
                }, 1500);
            }
        });
        
        // Re-sort teams after all animations complete
        setTimeout(() => {
            this.animateTeamReordering();
        }, 2000);
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    animateTeamReordering() {
        const teamsList = document.getElementById('teamsList');
        
        // Get current order and new order
        const currentItems = Array.from(teamsList.querySelectorAll('.team-item'));
        const sortedTeams = [...this.teams].sort((a, b) => {
            const scoreA = this.scores[a.id] || 0;
            const scoreB = this.scores[b.id] || 0;
            return scoreB - scoreA;
        });
        
        // Reorder with animation
        sortedTeams.forEach((team, newIndex) => {
            const oldIndex = this.teams.findIndex(t => t.id === team.id);
            const currentItem = currentItems[oldIndex];
            
            if (currentItem) {
                // Add reordering animation
                currentItem.classList.add('reordering-animation');
                
                // Move to new position
                setTimeout(() => {
                    teamsList.appendChild(currentItem);
                }, oldIndex * 100);
                
                // Highlight rank change
                setTimeout(() => {
                    currentItem.classList.add('rank-highlight');
                    setTimeout(() => {
                        currentItem.classList.remove('rank-highlight');
                    }, 1000);
                }, (oldIndex * 100) + 500);
            }
        });
        
        // Update teams array order
        this.teams = sortedTeams;
        
        // Refresh display after reordering
        setTimeout(() => {
            this.displayTeams();
        }, 2500);
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
        // Display question info
        categoryDisplay.textContent = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
        questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
        questionText.textContent = this.currentQuestion.question;

        // Show question text
        questionText.classList.remove('hidden');

        // Start stopwatch
        this.startStopwatch(stopwatchDisplay, timerTime, timerCircle);
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

    startStopwatch(stopwatchDisplay, timerTime, timerCircle) {
        let timeLeft = 30; // 30 seconds
        
        // Show stopwatch
        stopwatchDisplay.classList.remove('hidden');
        timerTime.textContent = timeLeft;
        
        const stopwatchInterval = setInterval(() => {
            timeLeft--;
            timerTime.textContent = timeLeft;
            
            // Add warning classes
            if (timeLeft <= 10 && timeLeft > 5) {
                timerCircle.classList.add('warning');
                timerCircle.classList.remove('danger');
            } else if (timeLeft <= 5) {
                timerCircle.classList.add('danger');
                timerCircle.classList.remove('warning');
                // Play warning sound
                this.playSound('warning');
            }
            
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
        
        // Set scoring phase flag
        localStorage.setItem('scoringPhase', 'true');
        localStorage.setItem('currentQuestion', JSON.stringify(this.currentQuestion));
        
        // Show only TIME'S UP! message
        const questionText = document.getElementById('questionText');
        questionText.innerHTML = `
            <div style="color: #e74c3c; font-size: 2rem; font-weight: 800;">
                TIME'S UP!
            </div>
        `;
        
        // Hide stopwatch
        document.getElementById('stopwatchDisplay').classList.add('hidden');
        
        // Show scoring message and redirect to index.html
        setTimeout(() => {
            questionText.innerHTML = `
                <div style="color: #4a90e2; font-size: 1.5rem; font-weight: 600;">
                    Redirecting to scoring page...
                </div>
            `;
            
            // Redirect to index.html for scoring
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 2000);
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
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions[this.currentCategory].length) {
            this.showQuestion();
        } else {
            this.endQuiz();
        }
    }

    endQuiz() {
        // Clear any running timers
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
        }
        
        // Show quiz completion message
        const questionSection = document.getElementById('questionSection');
        questionSection.innerHTML = `
            <div class="card">
                <h2>Quiz Completed!</h2>
                <p>Great job! You've completed the ${this.currentCategory} category.</p>
                <button class="btn btn-primary" onclick="location.reload()">Start New Quiz</button>
            </div>
        `;
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
