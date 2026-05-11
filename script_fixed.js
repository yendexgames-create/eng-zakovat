class QuizApp {
    constructor() {
        this.teams = [];
        this.scores = {};
        this.currentCategory = null;
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.currentAnsweringTeam = null;
        this.currentQuestionAnswered = false;
        this.teamsAnswered = [];
        this.socket = null;
        this.questions = {};
        this.mixedQuestions = [];
        this.teamCategories = {};
        this.questionTimer = 30;
        this.currentTimerInterval = null;
        this.lastSetupTime = '0';
        this.lastStartedTime = '0';
        this.currentSound = null;
        this.timeUpCalled = false;
        this.isAnimating = false;
        
        // NEW CONFIGURATION
        this.quizActivated = false;
        this.quizStarted = false;
        this.categoriesPerTeam = 2;
        this.questionsPerCategory = 2;
        
        // Initialize
        this.initializeQuestions();
    }
    
    initializeQuestions() {
        this.questions = {
            music: [
                {
                    question: "Who is known as the 'King of Pop'?",
                    options: ["Michael Jackson", "Elvis Presley", "Madonna", "Prince"],
                    correct: 1
                },
                {
                    question: "Which instrument has 88 keys?",
                    options: ["Guitar", "Violin", "Piano", "Drums"],
                    correct: 2
                },
                {
                    question: "What does 'MP3' stand for?",
                    options: ["Music Player 3", "MPEG Audio Layer 3", "Multi-Player 3", "Music Playback 3"],
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
                    question: "How often are Olympic Games held?",
                    options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"],
                    correct: 2
                }
            ],
            science: [
                {
                    question: "What is chemical symbol for gold?",
                    options: ["Go", "Gd", "Au", "Ag"],
                    correct: 2
                },
                {
                    question: "Which planet is known as 'Red Planet'?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correct: 1
                },
                {
                    question: "What is largest organ in human body?",
                    options: ["Heart", "Liver", "Brain", "Skin"],
                    correct: 3
                }
            ],
            geography: [
                {
                    question: "What is capital of Japan?",
                    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
                    correct: 2
                },
                {
                    question: "Which is longest river in world?",
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
                    question: "Who was first President of United States?",
                    options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"],
                    correct: 1
                },
                {
                    question: "Which ancient wonder of world still stands today?",
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
                    question: "What is first book in Harry Potter series?",
                    options: ["Chamber of Secrets", "Prisoner of Azkaban", "Philosopher's Stone", "Goblet of Fire"],
                    correct: 2
                },
                {
                    question: "Who wrote '1984'?",
                    options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"],
                    correct: 0
                }
            ],
            technology: [
                {
                    question: "Who founded Microsoft?",
                    options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Larry Page"],
                    correct: 1
                },
                {
                    question: "What does 'HTML' stand for?",
                    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
                    correct: 0
                },
                {
                    question: "Which programming language is known as 'language of the web'?",
                    options: ["Python", "Java", "JavaScript", "C++"],
                    correct: 2
                }
            ],
            movies: [
                {
                    question: "Who directed movie 'Titanic'?",
                    options: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Martin Scorsese"],
                    correct: 1
                },
                {
                    question: "Which movie won Academy Award for Best Picture in 2020?",
                    options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
                    correct: 2
                },
                {
                    question: "What is highest-grossing movie of all time?",
                    options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"],
                    correct: 0
                }
            ],
            games: [
                {
                    question: "What is best-selling video game of all time?",
                    options: ["Minecraft", "Grand Theft Auto V", "Tetris", "Wii Sports"],
                    correct: 2
                },
                {
                    question: "Which company created PlayStation?",
                    options: ["Nintendo", "Microsoft", "Sony", "Sega"],
                    correct: 2
                },
                {
                    question: "In which year was first Nintendo Entertainment System (NES) released?",
                    options: ["1983", "1985", "1987", "1989"],
                    correct: 0
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
            food: [
                {
                    question: "Which country is famous for sushi?",
                    options: ["China", "Japan", "Korea", "Thailand"],
                    correct: 1
                },
                {
                    question: "What is main ingredient in guacamole?",
                    options: ["Tomato", "Avocado", "Onion", "Lime"],
                    correct: 1
                },
                {
                    question: "Which spice is known as 'red gold'?",
                    options: ["Paprika", "Cayenne", "Saffron", "Chili powder"],
                    correct: 2
                }
            ],
            nature: [
                {
                    question: "What is largest ocean on Earth?",
                    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
                    correct: 3
                },
                {
                    question: "Which animal is known as 'King of the Jungle'?",
                    options: ["Tiger", "Lion", "Elephant", "Leopard"],
                    correct: 1
                },
                {
                    question: "What is fastest land animal?",
                    options: ["Lion", "Cheetah", "Leopard", "Gazelle"],
                    correct: 1
                }
            ]
        };
    }
    
    // Rest of the methods will be added here...
    // For now, let's create a basic working version
    
    initializeSocket() {
        console.log('=== INITIALIZING SOCKET ===');
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('✅ Connected to server successfully');
            console.log('Socket ID:', this.socket.id);
        });
        
        this.socket.on('stateUpdate', (state) => {
            console.log('=== STATE UPDATE ===');
            this.updateState(state);
        });
        
        this.socket.on('showModalOnIndex', (data) => {
            console.log('=== SHOW MODAL ON INDEX ===');
            console.log('Modal data received:', data);
            
            this.currentQuestion = data.currentQuestion;
            this.currentAnsweringTeam = data.currentAnsweringTeam;
            this.teams = data.teams;
            this.scores = data.scores;
            
            setTimeout(() => {
                this.showTeamAnswerModal();
            }, 500);
        });
        
        console.log('=== SOCKET INITIALIZATION COMPLETE ===');
    }
    
    initialize() {
        console.log('=== INITIALIZING QUIZ APP ===');
        
        this.initializeSocket();
        
        this.checkCurrentPage();
        this.addEventListeners();
    }
    
    checkCurrentPage() {
        const currentPath = window.location.pathname;
        console.log('Current path:', currentPath);
        
        if (currentPath.includes('index.html') || currentPath === '/') {
            console.log('On index.html page');
            this.initializeIndexPage();
        } else if (currentPath.includes('questions.html')) {
            console.log('On questions.html page');
            this.initializeQuestionsPage();
        }
    }
    
    initializeIndexPage() {
        console.log('=== INITIALIZING INDEX PAGE ===');
        
        const teamCountInput = document.getElementById('teamCount');
        const startQuizBtn = document.getElementById('startQuiz');
        
        if (teamCountInput) {
            teamCountInput.addEventListener('input', () => this.generateTeamInputs());
        }
        
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => this.startQuiz());
        }
    }
    
    initializeQuestionsPage() {
        console.log('=== INITIALIZING QUESTIONS PAGE ===');
        
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectCategory(btn.dataset.category));
        });
    }
    
    addEventListeners() {
        console.log('=== ADDING EVENT LISTENERS ===');
        
        const answerCorrectBtn = document.getElementById('answerCorrect');
        const answerIncorrectBtn = document.getElementById('answerIncorrect');
        
        if (answerCorrectBtn) {
            answerCorrectBtn.addEventListener('click', () => this.handleTeamAnswer(true));
        }
        
        if (answerIncorrectBtn) {
            answerIncorrectBtn.addEventListener('click', () => this.handleTeamAnswer(false));
        }
    }
    
    generateTeamInputs() {
        const teamCount = parseInt(document.getElementById('teamCount').value) || 0;
        const container = document.getElementById('teamInputsContainer');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 1; i <= teamCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `team${i}`;
            input.placeholder = `Team ${i} name`;
            input.className = 'team-input';
            
            container.appendChild(input);
        }
        
        const startQuizBtn = document.getElementById('startQuiz');
        if (startQuizBtn) {
            startQuizBtn.disabled = teamCount < 2;
        }
    }
    
    startQuiz() {
        console.log('=== START QUIZ ===');
        
        const teams = this.collectTeams();
        
        if (teams.length < 2) {
            alert('Please enter at least 2 team names!');
            return;
        }
        
        this.teams = teams;
        this.scores = {};
        teams.forEach(team => {
            this.scores[team.id] = 0;
        });
        
        this.socket.emit('setupTeams', teams);
        this.socket.emit('activateQuiz');
        
        window.location.href = 'questions.html';
    }
    
    collectTeams() {
        const teamCount = parseInt(document.getElementById('teamCount').value) || 0;
        const teams = [];
        
        for (let i = 1; i <= teamCount; i++) {
            const teamName = document.getElementById(`team${i}`).value.trim();
            
            if (teamName) {
                teams.push({
                    id: i,
                    name: teamName
                });
            }
        }
        
        return teams;
    }
    
    selectCategory(category) {
        console.log('=== SELECT CATEGORY ===');
        console.log('Selected category:', category);
        
        this.currentCategory = category;
        this.socket.emit('selectCategory', { category });
    }
    
    handleTeamAnswer(isCorrect) {
        console.log('=== HANDLE TEAM ANSWER ===');
        console.log('Answer correct:', isCorrect);
        
        if (isCorrect) {
            this.scores[this.currentAnsweringTeam] = (this.scores[this.currentAnsweringTeam] || 0) + 1;
            this.socket.emit('submitScores', this.scores);
        }
        
        this.closeTeamAnswerModal();
        this.nextQuestion();
    }
    
    closeTeamAnswerModal() {
        const modal = document.getElementById('teamAnswerModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    nextQuestion() {
        console.log('=== NEXT QUESTION ===');
        this.currentQuestionIndex++;
        this.showQuestion();
    }
    
    showQuestion() {
        console.log('=== SHOW QUESTION ===');
        
        if (this.currentQuestionIndex >= this.mixedQuestions.length) {
            this.endQuiz();
            return;
        }
        
        this.currentQuestion = this.mixedQuestions[this.currentQuestionIndex];
        this.currentQuestionAnswered = false;
        this.currentAnsweringTeam = this.currentQuestion.teamId;
        
        console.log('Current question:', this.currentQuestion);
        console.log('Current answering team ID:', this.currentAnsweringTeam);
        
        this.updateQuestionDisplay();
        this.startQuestionTimer();
    }
    
    updateQuestionDisplay() {
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionNumber = document.getElementById('questionNumber');
        const currentTeam = document.getElementById('currentTeam');
        
        if (questionText) {
            questionText.textContent = this.currentQuestion.question;
        }
        
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            this.currentQuestion.options.forEach((option, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-btn';
                optionBtn.textContent = option;
                optionBtn.addEventListener('click', () => this.selectOption(index));
                optionsContainer.appendChild(optionBtn);
            });
        }
        
        if (questionNumber) {
            const displayIndex = this.currentQuestionIndex + 1;
            const totalQuestions = this.mixedQuestions.length;
            
            questionNumber.textContent = `Question ${displayIndex} of ${totalQuestions}`;
        }
        
        if (currentTeam) {
            const team = this.teams.find(t => t.id === this.currentAnsweringTeam);
            if (team) {
                currentTeam.textContent = team.name;
            } else {
                currentTeam.textContent = `Team ${this.currentAnsweringTeam}`;
            }
        }
    }
    
    selectOption(index) {
        console.log('Option selected:', index);
        
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.disabled = true);
        
        const isCorrect = index === this.currentQuestion.correct;
        
        if (isCorrect) {
            optionBtns[index].classList.add('correct');
        } else {
            optionBtns[index].classList.add('incorrect');
        }
        
        setTimeout(() => {
            this.showTeamAnswerModal(isCorrect);
        }, 1000);
    }
    
    showTeamAnswerModal(isCorrect) {
        console.log('=== SHOW TEAM ANSWER MODAL ===');
        console.log('Answer correct:', isCorrect);
        
        const modal = document.getElementById('teamAnswerModal');
        const teamNameElement = document.getElementById('answeringTeamName');
        const questionElement = document.getElementById('teamAnswerQuestion');
        
        if (!modal || !teamNameElement || !questionElement) {
            console.error('Modal elements not found');
            return;
        }
        
        const currentTeam = this.teams.find(t => t.id === this.currentAnsweringTeam);
        if (!currentTeam) {
            console.error('Current answering team not found');
            return;
        }
        
        teamNameElement.textContent = currentTeam.name;
        
        const answerText = isCorrect ? 'Correct!' : 'Incorrect!';
        const answerClass = isCorrect ? 'correct' : 'incorrect';
        
        questionElement.innerHTML = `
            <div class="team-answer-result">
                <h3>${answerText}</h3>
                <p>Team <strong>${currentTeam.name}</strong> answered ${isCorrect ? 'correctly' : 'incorrectly'}</p>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    startQuestionTimer() {
        console.log('=== START TIMER ===');
        
        this.stopQuestionTimer();
        
        let timeLeft = this.questionTimer;
        const timerDisplay = document.getElementById('timerDisplay');
        const timerProgress = document.getElementById('timerProgress');
        
        if (timerDisplay) {
            timerDisplay.textContent = timeLeft;
        }
        
        if (timerProgress) {
            timerProgress.style.width = '100%';
        }
        
        this.currentTimerInterval = setInterval(() => {
            timeLeft--;
            
            if (timerDisplay) {
                timerDisplay.textContent = timeLeft;
            }
            
            if (timerProgress) {
                const percentage = (timeLeft / this.questionTimer) * 100;
                timerProgress.style.width = `${percentage}%`;
            }
            
            if (timeLeft <= 0) {
                this.stopQuestionTimer();
                this.timeUp();
            }
        }, 1000);
    }
    
    stopQuestionTimer() {
        if (this.currentTimerInterval) {
            clearInterval(this.currentTimerInterval);
            this.currentTimerInterval = null;
        }
    }
    
    timeUp() {
        console.log('=== TIME UP ===');
        
        this.stopQuestionTimer();
        this.playSound('timeup');
        
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.innerHTML = `
                <div class="time-up-message">
                    <h2>⏰ Time's Up!</h2>
                    <p>The correct answer was: <strong>${this.currentQuestion.options[this.currentQuestion.correct]}</strong></p>
                </div>
            `;
        }
        
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.disabled = true);
        
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
    }
    
    playSound(type) {
        console.log(`Playing sound: ${type}`);
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'countdown':
                    oscillator.frequency.value = 800;
                    gainNode.gain.value = 0.1;
                    break;
                case 'timeup':
                    oscillator.frequency.value = 300;
                    gainNode.gain.value = 0.2;
                    break;
                case 'correct':
                    oscillator.frequency.value = 1000;
                    gainNode.gain.value = 0.1;
                    break;
                case 'wrong':
                    oscillator.frequency.value = 200;
                    gainNode.gain.value = 0.1;
                    break;
            }
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Sound not supported:', error);
        }
    }
    
    endQuiz() {
        console.log('=== END QUIZ ===');
        
        const sortedTeams = [...this.teams].sort((a, b) => {
            return (this.scores[b.id] || 0) - (this.scores[a.id] || 0);
        });
        
        const winner = sortedTeams[0];
        
        alert(`Quiz ended! Winner: ${winner.name} with ${this.scores[winner.id]} points!`);
        
        window.location.href = 'index.html';
    }
    
    updateState(state) {
        console.log('=== UPDATE STATE ===');
        
        if (state.teams) this.teams = state.teams;
        if (state.scores) this.scores = state.scores;
        if (state.currentCategory) this.currentCategory = state.currentCategory;
        if (state.currentQuestion) this.currentQuestion = state.currentQuestion;
        if (state.currentAnsweringTeam) this.currentAnsweringTeam = state.currentAnsweringTeam;
        
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        console.log('=== UPDATE LEADERBOARD ===');
        
        const leaderboardElement = document.getElementById('leaderboard');
        if (!leaderboardElement) return;
        
        const sortedTeams = [...this.teams].sort((a, b) => {
            return (this.scores[b.id] || 0) - (this.scores[a.id] || 0);
        });
        
        const leaderboardHTML = sortedTeams.map((team, index) => {
            const score = this.scores[team.id] || 0;
            const isWinner = index === 0 && score > 0;
            
            return `
                <div class="leaderboard-item ${isWinner ? 'winner' : ''}">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${team.name}</div>
                        <div class="leaderboard-score">${score} ${score === 1 ? 'point' : 'points'}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        leaderboardElement.innerHTML = leaderboardHTML;
    }
}

// Initialize the quiz app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
    window.quizApp.initialize();
});
