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
        // Control page events
        const teamCountInput = document.getElementById('teamCount');
        const generateBtn = document.getElementById('generateInputs');
        const startBtn = document.getElementById('startQuiz');

        if (teamCountInput) {
            teamCountInput.addEventListener('change', () => this.generateTeamInputs());
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateTeamInputs());
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => this.setupQuiz());
        }

        // Questions page events
        const startQuizBtn = document.getElementById('startQuizBtn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => this.activateQuiz());
        }

        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.selectCategory(category);
            });
        });

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
        
        // Store initial setup time to detect changes
        this.lastSetupTime = localStorage.getItem('quizSetupTime') || '0';
        
        // Auto-refresh every 2 seconds to check for quiz setup and activation
        this.refreshInterval = setInterval(() => {
            this.checkQuizStatus();
        }, 2000);
        
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

        this.displayTeams();
        this.showQuestion();
    }

    displayTeams() {
        const teamsList = document.getElementById('teamsList');
        teamsList.innerHTML = '';

        this.teams.forEach(team => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="team-score">
                    Score: <span class="team-score-value">${this.scores[team.id] || 0}</span>
                </div>
            `;
            teamsList.appendChild(teamItem);
        });
    }

    showQuestion() {
        const categorySection = document.querySelector('.category-section');
        const questionSection = document.getElementById('questionSection');
        const categoryDisplay = document.getElementById('categoryDisplay');
        const questionNumber = document.getElementById('questionNumber');
        const questionText = document.getElementById('questionText');
        const answerOptions = document.getElementById('answerOptions');

        // Hide category section, show question section
        categorySection.classList.add('hidden');
        questionSection.classList.remove('hidden');

        // Display category and question number
        categoryDisplay.textContent = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
        questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions[this.currentCategory].length}`;

        // Get current question
        const currentQuestion = this.questions[this.currentCategory][this.currentQuestionIndex];
        questionText.textContent = currentQuestion.question;

        // Generate answer options
        answerOptions.innerHTML = '';
        currentQuestion.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'answer-option';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => this.selectAnswer(index));
            answerOptions.appendChild(optionBtn);
        });

        // Hide next button initially
        document.getElementById('nextQuestion').classList.add('hidden');
    }

    selectAnswer(selectedIndex) {
        const currentQuestion = this.questions[this.currentCategory][this.currentQuestionIndex];
        const answerOptions = document.querySelectorAll('.answer-option');
        const nextBtn = document.getElementById('nextQuestion');

        // Disable all options
        answerOptions.forEach(option => {
            option.style.pointerEvents = 'none';
        });

        // Show correct/incorrect
        if (selectedIndex === currentQuestion.correct) {
            answerOptions[selectedIndex].classList.add('correct');
            // Award points to all teams (you can modify this logic)
            this.teams.forEach(team => {
                this.scores[team.id] = (this.scores[team.id] || 0) + 10;
            });
        } else {
            answerOptions[selectedIndex].classList.add('incorrect');
            answerOptions[currentQuestion.correct].classList.add('correct');
        }

        // Update scores display
        this.displayTeams();

        // Show next button
        nextBtn.classList.remove('hidden');
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions[this.currentCategory].length) {
            this.showQuestion();
        } else {
            // Quiz completed for this category
            this.showCategoryCompletion();
        }
    }

    showCategoryCompletion() {
        const questionSection = document.getElementById('questionSection');
        const categorySection = document.querySelector('.category-section');
        
        questionSection.innerHTML = `
            <div class="card">
                <h2>Category Complete!</h2>
                <p>You've completed all questions in ${this.currentCategory}.</p>
                <div class="final-scores">
                    <h3>Final Scores:</h3>
                    ${this.teams.map(team => `
                        <div class="team-item">
                            <div class="team-name">${team.name}</div>
                            <div class="team-score">Score: ${this.scores[team.id] || 0}</div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="location.reload()" class="btn btn-primary">Select Another Category</button>
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
