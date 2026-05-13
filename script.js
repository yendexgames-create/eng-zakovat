// Quiz Application JavaScript
class QuizApp {
    constructor() {
        this.questions = {};
        this.teams = [];
        this.scores = {};
        this.prevScores = {};
        this.tieBreakerTimer = 15;
        this.tieBreakerActive = false;
        this.tieBreakerRound = 0;
        this.usedQuestionKeys = new Set();
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
        this.teamCategories = {}; // har bir jamoa uchun turlar
        this.categories = ['music', 'sports', 'science', 'history', 'geography', 'literature', 'movies', 'technology', 'games', 'art', 'food', 'nature']; // barcha turlar ro'yxati
        
        // Team-specific question system
        this.currentTeamIndex = 0; // hozirgi jamoa indeksi (0, 1, 2, ...)
        this.currentTeamQuestions = []; // hozirgi jamoaning savollari
        this.currentTeamQuestionIndex = 0; // hozirgi jamoaning savol indeksi
        this.currentAnsweringTeam = 1; // hozirgi javob beruvchi jamoa
        this.currentQuestionAnswered = false; // hozirgi savolga javob berilganmi
        this.questionTimer = 30; // 30 soniyalik timer
        
        // Initialize questions
        this.initializeQuestions();
    }
    
    initializeQuestions() {
        this.questions = {
            music: [
                {
                    question: "Who is known as the 'King of Pop'?",
                    options: ["Michael Jackson", "Elvis Presley", "Madonna", "Prince"],
                    correct: 0
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
                    question: "Which is longest river in the world?",
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
                    correct: 1
                }
            ],
            games: [
                {
                    question: "What is best-selling video game of all time?",
                    options: ["Minecraft", "Grand Theft Auto V", "Tetris", "Wii Sports"],
                    correct: 0
                },
                {
                    question: "Which company created PlayStation?",
                    options: ["Nintendo", "Microsoft", "Sony", "Sega"],
                    correct: 2
                },
                {
                    question: "In which year was first Nintendo Entertainment System (NES) released?",
                    options: ["1983", "1985", "1987", "1989"],
                    correct: 1
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

        // Normalize question objects: ensure each question has `correctAnswer` property
        for (const cat in this.questions) {
            const arr = this.questions[cat];
            for (let i = 0; i < arr.length; i++) {
                const q = arr[i];
                if (q.correctAnswer === undefined && q.correct !== undefined) {
                    q.correctAnswer = q.correct;
                }
                // keep backward-compat: if only correctAnswer exists, fine
            }
        }
    }

    initializeSocket() {
        console.log('=== INITIALIZING SOCKET ===');
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('✅ Connected to server successfully');
            console.log('Socket ID:', this.socket.id);
            console.log('Transport:', this.socket.io.engine.transport.name);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });
        
        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });
        
        this.socket.on('stateUpdate', (state) => {
            console.log('=== STATE UPDATE ===');
            this.updateState(state);
        });
        
        // Listen for modal trigger from other devices
        this.socket.on('showModalOnIndex', (data) => {
            console.log('=== SHOW MODAL ON INDEX EVENT ===');
            console.log('Received modal trigger data:', data);
            
            // Restore data from server
            this.currentQuestion = data.currentQuestion;
            this.currentAnsweringTeam = data.currentAnsweringTeam;
            this.teams = data.teams;
            this.scores = data.scores;
            
            console.log('Data restored, showing modal in 500ms...');
            
            // Show modal after short delay
            setTimeout(() => {
                console.log('About to call showTeamAnswerModal from socket event');
                this.showTeamAnswerModal();
            }, 500);
        });
        
        // Listen for time up modal
        this.socket.on('showTimeUpModal', (data) => {
            console.log('=== SHOW TIME UP MODAL SOCKET EVENT ===');
            console.log('Time up modal data received:', data);
            console.log('Current page:', window.location.pathname);
            
            // Only show modal on index.html
            const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
            console.log('Is index page:', isIndexPage);
            
            if (!isIndexPage) {
                console.log('Not on index page, ignoring time up modal');
                return;
            }
            
            // Store modal data
            this.currentQuestion = data.currentQuestion;
            this.currentAnsweringTeam = data.currentAnsweringTeam;
            this.teams = data.teams;
            this.scores = data.scores;
            
            // Show time up modal
            this.showTimeUpModal(data);
        });
        
        // Listen for next question trigger
        this.socket.on('nextQuestion', (data) => {
            console.log('=== NEXT QUESTION SOCKET EVENT ===');
            console.log('Next question data received:', data);
            console.log('Current page:', window.location.pathname);
            
            // Handle on both index.html and questions.html
            const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
            const isQuestionsPage = window.location.pathname.includes('questions.html');
            console.log('Is index page:', isIndexPage);
            console.log('Is questions page:', isQuestionsPage);
            
            if (!isIndexPage && !isQuestionsPage) {
                console.log('Not on quiz page, ignoring next question');
                return;
            }

            if (isQuestionsPage) {
                console.log('On questions.html - calling nextQuestion');
                this.nextQuestion(data.currentQuestionIndex);
            } else {
                console.log('On index.html - not calling nextQuestion');
                this.currentQuestionIndex = data.currentQuestionIndex;
            }
        });
        
        console.log('=== SOCKET INITIALIZATION COMPLETE ===');
    }
    
    initialize() {
        console.log('=== INITIALIZING QUIZ APP ===');
        
        // Initialize socket connection
        this.initializeSocket();
        
        // Check current page
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('questions.html') || currentPath.includes('/questions')) {
            console.log('On questions page - initializing questions');
            this.initializeQuestionsPage();
        } else {
            console.log('On index page - initializing setup');
            this.initializeIndexPage();
        }
        
        // Bind events
        this.bindEvents();
        
        console.log('=== QUIZ APP INITIALIZATION COMPLETE ===');
    }
    
    initializeIndexPage() {
        console.log('=== INITIALIZE INDEX PAGE START ===');
        
        // Generate initial team inputs
        this.generateTeamInputs();
        
        // Add Team Answer Modal event listeners for index.html
        const answerCorrectBtn = document.getElementById('answerCorrect');
        if (answerCorrectBtn) {
            answerCorrectBtn.addEventListener('click', () => this.handleTeamAnswer(true));
            console.log('Answer correct button event listener added');
        }

        const answerIncorrectBtn = document.getElementById('answerIncorrect');
        if (answerIncorrectBtn) {
            answerIncorrectBtn.addEventListener('click', () => this.handleTeamAnswer(false));
            console.log('Answer incorrect button event listener added');
        }

        const closeTeamAnswerModalBtn = document.getElementById('closeTeamAnswerModal');
        if (closeTeamAnswerModalBtn) {
            closeTeamAnswerModalBtn.addEventListener('click', () => this.closeTeamAnswerModal());
            console.log('Close modal button event listener added');
        }
        
        console.log('=== INITIALIZE INDEX PAGE END ===');
    }
    
    initializeQuestionsPage() {
        console.log('=== INITIALIZE QUESTIONS PAGE ===');
        
        // Check if quiz is already activated
        if (this.teams.length > 0) {
            console.log('Teams already exist, showing category section');
            this.showCategorySelection();
            return;
        }
        
        // Request current state from server
        console.log('Requesting current state from server...');
        this.socket.emit('getState');
        
        // Add event listener for random categories button
        const randomCategoriesBtn = document.getElementById('randomCategoriesBtn');
        if (randomCategoriesBtn) {
            randomCategoriesBtn.addEventListener('click', () => {
                console.log('=== RANDOM CATEGORIES BUTTON CLICKED ===');
                this.selectRandomCategoriesForTeams();
            });
        } else {
            console.log('Random categories button not found yet - will be created later');
        }
        
        // Add event listener for start quiz button
        const startQuizBtn = document.querySelector('.start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                console.log('=== START QUIZ BUTTON CLICKED ===');
                this.startQuestionsQuiz();
            });
        }
        
        // Add event listener for ready to answer button
        const readyToAnswerBtn = document.getElementById('readyToAnswerBtn');
        if (readyToAnswerBtn) {
            readyToAnswerBtn.addEventListener('click', () => {
                console.log('Ready to answer button clicked');
                this.handleReadyToAnswer();
            });
        }
        
        // Add event listener for next question button
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => {
                console.log('Next question button clicked');
                this.hideNextQuestionButton();
                const nextIndex = this.currentQuestionIndex + 1;
                if (this.socket && this.socket.connected) {
                    this.socket.emit('nextQuestion', {
                        currentQuestionIndex: nextIndex
                    });
                }
                this.nextQuestion(nextIndex);
            });
        }
        
        console.log('=== INITIALIZE QUESTIONS PAGE END ===');
    }
    
    bindEvents() {
        console.log('=== BIND EVENTS START ===');
        
        // Team count input
        const teamCountInput = document.getElementById('teamCount');
        if (teamCountInput) {
            teamCountInput.addEventListener('change', () => {
                this.generateTeamInputs();
            });
        }

        // Add event listener for generate inputs button
        const generateInputsBtn = document.getElementById('generateInputs');
        if (generateInputsBtn) {
            console.log('Generate inputs button found!');
            generateInputsBtn.addEventListener('click', () => {
                console.log('Generate inputs button clicked!');
                this.generateTeamInputs();
            });
        } else {
            console.error('Generate inputs button not found!');
        }

        // Add event listener for start quiz button
        const startBtn = document.getElementById('startQuiz');
        if (startBtn) {
            console.log('Start button found:', startBtn);
            console.log('Start button disabled status:', startBtn.disabled);
            console.log('Start button classes:', startBtn.className);
            
            startBtn.addEventListener('click', (e) => {
                console.log('=== START QUIZ BUTTON CLICKED ===');
                console.log('Event target:', e.target);
                console.log('Button disabled status at click:', startBtn.disabled);
                
                if (startBtn.disabled) {
                    console.log('Button is disabled - ignoring click');
                    return;
                }
                
                console.log('Button is enabled - calling startQuiz()');
                this.startQuiz();
            });
        } else {
            console.error('Start button not found!');
        }

        // Add event listener for reset button
        const resetBtn = document.getElementById('resetQuiz');
        if (resetBtn) {
            console.log('Reset button found, adding event listener');
            resetBtn.addEventListener('click', (e) => {
                console.log('=== RESET QUIZ BUTTON CLICKED ===');
                
                // Confirm reset
                if (confirm('Quizni to\'liq qayta boshlashni xohlaysizmi? Barcha ma\'lumotlar o\'chib ketadi.')) {
                    this.resetQuiz();
                }
            });
        } else {
            console.error('Reset button not found!');
        }
        
        console.log('=== BIND EVENTS END ===');
    }
    
    generateTeamInputs() {
        console.log('=== GENERATE TEAM INPUTS DEBUG ===');
        console.log('Function called from:', new Error().stack);
        
        // Check if we're on index page
        const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
        console.log('Is index page:', isIndexPage);
        
        // Check setup section visibility
        const setupSection = document.getElementById('setupSection');
        if (setupSection) {
            const setupStyles = window.getComputedStyle(setupSection);
            const setupRect = setupSection.getBoundingClientRect();
            console.log('Setup section element:', setupSection);
            console.log('Setup section classes:', setupSection.className);
            console.log('Setup section computed styles:', {
                display: setupStyles.display,
                visibility: setupStyles.visibility,
                opacity: setupStyles.opacity
            });
            console.log('Setup section bounding rect:', {
                top: setupRect.top,
                left: setupRect.left,
                width: setupRect.width,
                height: setupRect.height,
                isVisible: setupRect.width > 0 && setupRect.height > 0
            });
        } else {
            console.log('Setup section not found');
        }
        
        const teamCountInput = document.getElementById('teamCount');
        const teamInputsContainer = document.getElementById('teamInputsContainer');
        
        console.log('Team count input:', teamCountInput);
        console.log('Team count value:', teamCountInput ? teamCountInput.value : 'not found');
        console.log('Team inputs container:', teamInputsContainer);
        
        if (!teamCountInput || !teamInputsContainer) {
            console.error('Required elements not found!');
            return;
        }
        
        const teamCount = parseInt(teamCountInput.value);
        console.log('Parsed team count:', teamCount);
        
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
    
    startQuiz() {
        console.log('=== START QUIZ DEBUG ===');
        console.log('startQuiz method called');
        console.log('Current page:', window.location.pathname);
        
        const teamCountInput = document.getElementById('teamCount');
        console.log('Team count input element:', teamCountInput);
        
        if (!teamCountInput) {
            console.error('Team count input not found!');
            return;
        }
        
        const teamCount = parseInt(teamCountInput.value);
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
        
        if (teams.length < 2) {
            alert('Iltimos, kamida 2 ta jamoa nomini kiriting!');
            return;
        }
        
        console.log('Teams collected:', teams);
        
        // Store teams
        this.teams = teams;
        this.scores = {};
        
        teams.forEach(team => {
            this.scores[team.id] = 0;
        });
        
        // Send teams to server
        if (this.socket && this.socket.connected) {
            console.log('Socket connected, emitting setupTeams...');
            this.socket.emit('setupTeams', teams);
        } else {
            console.log('Socket not connected, teams will be sent when connected');
        }
        
        // Show setup status
        this.showSetupStatus(teams);
        
        // Initialize teams display
        this.displayTeams();
    }
    
    showSetupStatus(teams) {
        const setupSection = document.getElementById('setupSection');
        const setupStatus = document.getElementById('setupStatus');
        
        if (setupStatus) {
            setupStatus.classList.remove('hidden');
            
            const teamsList = teams.map(team => `
                <div class="team-item">
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
        
        // Don't show category selection on index.html
        // Categories should only appear on questions.html
        console.log('Setup complete - categories will appear on questions.html');
    }
    
    showCategorySelection() {
        const setupSection = document.getElementById('setupSection');
        const categorySection = document.getElementById('categorySection');
        
        // Check current page - only show categories on questions.html
        const currentPath = window.location.pathname;
        const isQuestionsPage = currentPath.includes('questions.html') || currentPath.includes('/questions') || currentPath.endsWith('questions');
        
        console.log('=== PAGE DETECTION DEBUG ===');
        console.log('Current page path:', currentPath);
        console.log('Includes questions.html:', currentPath.includes('questions.html'));
        console.log('Includes /questions:', currentPath.includes('/questions'));
        console.log('Ends with questions:', currentPath.endsWith('questions'));
        console.log('Is questions page:', isQuestionsPage);
        console.log('=== END PAGE DETECTION DEBUG ===');
        
        // Hide setup section
        if (setupSection) setupSection.classList.add('hidden');
        
        // Show category section only on questions.html
        if (isQuestionsPage) {
            console.log('Showing category section on questions.html');
            console.log('Category section element:', categorySection);
            console.log('Category section classes:', categorySection ? categorySection.className : 'not found');
            console.log('Category section hidden status:', categorySection ? categorySection.classList.contains('hidden') : 'not found');
            
            if (categorySection) {
                categorySection.classList.remove('hidden');
                console.log('Removed hidden class from category section');
                console.log('Category section classes after removal:', categorySection.className);
            }
            
            const categorySelection = document.getElementById('categorySelection');
            console.log('Category selection element:', categorySelection);
            
            if (categorySelection) {
                categorySelection.innerHTML = '';
                
                this.categories.forEach((category, index) => {
                    console.log(`Creating category button ${index + 1}: ${category}`);
                    const categoryBtn = document.createElement('button');
                    categoryBtn.className = 'category-btn';
                    categoryBtn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                    categoryBtn.dataset.category = category;
                    // Remove click event listener - no manual selection allowed
                    categorySelection.appendChild(categoryBtn);
                    console.log(`Category button ${index + 1} added:`, categoryBtn);
                });
                console.log('Categories generated:', this.categories.length);
                console.log('Category selection children count:', categorySelection.children.length);
                console.log('Category selection innerHTML:', categorySelection.innerHTML.substring(0, 200) + '...');
            }
        } else {
            console.log('On index.html - hiding category section');
            if (categorySection) {
                categorySection.classList.add('hidden');
            }
        }
    }
    
    toggleCategory(category) {
        const index = this.selectedCategories.indexOf(category);
        if (index > -1) {
            this.selectedCategories.splice(index, 1);
        } else {
            if (this.selectedCategories.length < 8) {
                this.selectedCategories.push(category);
            } else {
                alert(`Siz faqat 8 ta tur tanlashingiz mumkin!`);
                return;
            }
        }
        
        this.updateCategoryButtons();
        this.updateStartButton();
    }
    
    updateCategoryButtons() {
        console.log('=== UPDATE CATEGORY BUTTONS ===');
        console.log('Selected categories:', this.selectedCategories);
        console.log('Team categories:', this.teamCategories);
        console.log('Teams:', this.teams);
        
        const categoryButtons = document.querySelectorAll('.category-btn');
        console.log('Category buttons found:', categoryButtons.length);
        
        categoryButtons.forEach((button, index) => {
            const category = button.dataset.category;
            const isSelected = this.selectedCategories.includes(category);
            
            console.log(`Button ${index}: Category: ${category}, Selected: ${isSelected}`);
            
            if (isSelected) {
                button.classList.add('selected');
                
                // Add team assignment info if available
                if (this.teamCategories) {
                    const assignedTeams = this.teams.filter(team => 
                        this.teamCategories[team.id] && 
                        this.teamCategories[team.id].includes(category)
                    );
                    
                    console.log(`Assigned teams for ${category}:`, assignedTeams);
                    
                    if (assignedTeams.length > 0) {
                        const teamNames = assignedTeams.map(team => team.name).join(', ');
                        button.setAttribute('title', `Assigned to: ${teamNames}`);
                        button.innerHTML = `
                            <div class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                            <div class="category-teams">${teamNames}</div>
                        `;
                        console.log(`Updated button for ${category} with teams: ${teamNames}`);
                    }
                }
            } else {
                button.classList.remove('selected');
                button.innerHTML = category.charAt(0).toUpperCase() + category.slice(1);
                button.removeAttribute('title');
            }
        });
    }
    
    updateStartButton() {
        const startBtn = document.getElementById('startQuizBtn');
        if (startBtn) {
            const requiredCategories = this.teams.length * 2;
            startBtn.disabled = this.selectedCategories.length !== requiredCategories;
        }
    }
    
    selectRandomCategoriesForTeams() {
        console.log('=== SELECT RANDOM CATEGORIES ===');
        
        // Calculate total categories needed (2 per team)
        const totalCategoriesNeeded = this.teams.length * 2;
        
        // Shuffle all categories
        const shuffled = [...this.categories].sort(() => 0.5 - Math.random());
        
        // Select exactly 2 categories per team
        this.selectedCategories = shuffled.slice(0, totalCategoriesNeeded);
        
        console.log('Selected categories:', this.selectedCategories);
        
        // Assign categories to teams
        this.assignCategoriesToTeams();
        
        this.updateCategoryButtons();
        this.updateStartButton();
    }
    
    assignCategoriesToTeams() {
        console.log('=== ASSIGN CATEGORIES TO TEAMS ===');
        
        this.teamCategories = {};
        const availableCategories = [...this.selectedCategories];
        
        // Create array to track used categories
        const usedCategories = [];
        
        // Assign exactly 2 unique categories per team without duplicates across teams
        this.teams.forEach((team, teamIndex) => {
            // Get available categories (not used yet)
            const remainingCategories = availableCategories.filter(cat => !usedCategories.includes(cat));
            
            // Get 2 random unique categories for this team
            const shuffled = remainingCategories.sort(() => 0.5 - Math.random());
            const teamCategories = shuffled.slice(0, 2);
            
            // Add to used categories
            usedCategories.push(...teamCategories);
            
            this.teamCategories[team.id] = teamCategories;
            
            console.log(`Team ${team.name} categories:`, this.teamCategories[team.id]);
        });
        
        // Display categories summary
        this.displayCategoriesSummary();
    }
    
    displayCategoriesSummary() {
        console.log('=== DISPLAY CATEGORIES SUMMARY ===');
        
        const categoriesSummary = document.getElementById('categoriesSummary');
        const categoriesList = document.getElementById('categoriesList');
        
        if (!categoriesSummary || !categoriesList) {
            console.log('Categories summary elements not found');
            return;
        }
        
        // Show categories summary
        categoriesSummary.style.display = 'block';
        
        // Generate categories summary HTML
        const categoriesHTML = this.selectedCategories.map(category => 
            `<span class="category-tag">${category.charAt(0).toUpperCase() + category.slice(1)}</span>`
        ).join('');
        
        categoriesList.innerHTML = categoriesHTML;
        console.log('Categories summary displayed');
    }
    
    startQuestionsQuiz() {
        console.log('=== START QUESTIONS QUIZ ===');
        
        const requiredCategories = this.teams.length * 2;
        if (this.selectedCategories.length !== requiredCategories) {
            alert(`Iltimos, avval ${requiredCategories} ta tur tanlang!`);
            return;
        }
        
        // Initialize team questions object
        this.teamQuestions = {};
        
        // Mix questions from selected categories (1 question per team per category)
        this.mixedQuestions = [];
        this.teams.forEach(team => {
            const teamCategories = this.teamCategories[team.id] || [];
            console.log(`Team ${team.name} categories:`, teamCategories);
            
            // Initialize team questions array
            this.teamQuestions[team.id] = [];
            
            teamCategories.forEach(category => {
                const categoryQuestions = [...this.questions[category]];
                console.log(`Questions for category ${category}:`, categoryQuestions.length);
                
                // Take 1 random question from this category for this team
                const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
                const selectedQuestion = categoryQuestions[randomIndex];
                
                // Add team info to question for tracking
                selectedQuestion.teamId = team.id;
                selectedQuestion.category = category;
                
                console.log(`Selected question for ${team.name} from ${category}:`, selectedQuestion.question);
                
                // Add to mixed questions
                this.mixedQuestions.push(selectedQuestion);
                
                // Add to team-specific questions
                this.teamQuestions[team.id].push(selectedQuestion);
            });
        });
        
        console.log('Team questions initialized:', this.teamQuestions);
        
        // Don't shuffle questions to maintain team-category association
        // Questions will be shown in team order
        
        console.log('Mixed questions ready:', this.mixedQuestions.length);
        
        // Set first team as answering team
        this.currentAnsweringTeam = this.teams[0].id;
        
        // Start with first question
        this.currentQuestionIndex = 0;
        this.showQuestion();
        
        // Show question section
        const categorySection = document.getElementById('categorySection');
        const questionSection = document.getElementById('questionSection');
        
        if (categorySection) categorySection.classList.add('hidden');
    }
    
    showQuestion() {
        console.log('=== SHOW QUESTION ===');
        console.log('Current question index:', this.currentQuestionIndex);
        console.log('Total mixed questions:', this.mixedQuestions.length);
        console.log('Mixed questions array exists:', !!this.mixedQuestions);
        console.log('Mixed questions array length:', this.mixedQuestions?.length);
        
        if (!this.mixedQuestions || this.mixedQuestions.length === 0) {
            console.log('ERROR: No mixed questions available');
            return;
        }
        
        if (this.currentQuestionIndex >= this.mixedQuestions.length) {
            console.log('Quiz ended - no more questions');
            this.endQuiz();
            return;
        }
        
        // Get current question
        this.currentQuestion = this.mixedQuestions[this.currentQuestionIndex];
        console.log('Current question set to:', this.currentQuestion);

        this.usedQuestionKeys.add(this.getQuestionKey(this.currentQuestion));
        
        // Set current answering team
        this.currentAnsweringTeam = this.currentQuestion.teamId;
        console.log('=== SHOW QUESTION TEAM UPDATE ===');
        console.log('Current question index:', this.currentQuestionIndex);
        console.log('Current question teamId:', this.currentQuestion.teamId);
        console.log('Updated currentAnsweringTeam to:', this.currentAnsweringTeam);
        console.log('=== END SHOW QUESTION TEAM UPDATE ===');
        
        // Force hide category section
        const categorySection = document.getElementById('categorySection');
        if (categorySection) {
            categorySection.classList.add('hidden');
            categorySection.style.display = 'none';
            console.log('Category section force hidden:', categorySection.className);
        } else {
            console.log('Category section not found');
        }
        
        // Force show question section
        const questionSection = document.getElementById('questionSection');
        if (questionSection) {
            questionSection.classList.remove('hidden');
            questionSection.style.display = 'block';
            console.log('Question section force shown:', questionSection.className);
            
            const questionStyles = window.getComputedStyle(questionSection);
            console.log('Question section computed styles:');
            console.log('  display:', questionStyles.display);
            console.log('  visibility:', questionStyles.visibility);
            console.log('  opacity:', questionStyles.opacity);
            console.log('  height:', questionStyles.height);
            console.log('  width:', questionStyles.width);
            console.log('  position:', questionStyles.position);
            console.log('  zIndex:', questionStyles.zIndex);
            console.log('  overflow:', questionStyles.overflow);
            console.log('  transform:', questionStyles.transform);
            
            const questionRect = questionSection.getBoundingClientRect();
            console.log('Question section bounding rect:');
            console.log('  top:', questionRect.top);
            console.log('  left:', questionRect.left);
            console.log('  width:', questionRect.width);
            console.log('  height:', questionRect.height);
            console.log('  isVisible:', questionRect.width > 0 && questionRect.height > 0);
        }
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Show 3 second countdown before question
        this.showCountdownBeforeQuestion();
    }
    
    showCountdownBeforeQuestion() {
        console.log('=== SHOW COUNTDOWN BEFORE QUESTION ===');
        
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const timerDisplay = document.getElementById('timerDisplay');
        const timerProgress = document.getElementById('timerProgress');
        const readyToAnswerBtn = document.getElementById('readyToAnswerBtn');
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        
        // Hide question elements
        if (questionText) questionText.innerHTML = '';
        if (optionsContainer) optionsContainer.innerHTML = '';
        if (readyToAnswerBtn) readyToAnswerBtn.classList.add('hidden');
        if (nextQuestionBtn) nextQuestionBtn.classList.add('hidden');
        
        // Show countdown
        let countdown = 3;
        if (questionText) {
            questionText.innerHTML = `<div class="countdown">${countdown}</div>`;
        }
        
        // Play countdown sound
        this.playSound('countdown');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            
            if (countdown > 0) {
                if (questionText) {
                    questionText.innerHTML = `<div class="countdown">${countdown}</div>`;
                }
                this.playSound('countdown');
            } else {
                clearInterval(countdownInterval);
                this.showActualQuestion();
            }
        }, 1000);
    }
    
    showActualQuestion() {
        console.log('=== SHOW ACTUAL QUESTION ===');
        
        this.updateQuestionDisplay();
        this.updateCategoryTitle();
        this.startQuestionTimer();
        this.showReadyToAnswerButton();
    }
    
    getCategoryFromQuestion(question) {
        // Find which category this question belongs to
        for (const category in this.questions) {
            const categoryQuestions = this.questions[category];
            const found = categoryQuestions.some(q => 
                q.question === question.question && 
                JSON.stringify(q.options) === JSON.stringify(question.options)
            );
            if (found) {
                return category;
            }
        }
        return 'Unknown';
    }
    
    updateCategoryTitle() {
        const categoryTitle = document.getElementById('categoryTitle');
        if (!categoryTitle) return;
        
        if (this.currentQuestion && this.currentQuestion.isTieBreaker) {
            categoryTitle.classList.add('tie-breaker-title');
            categoryTitle.textContent = 'Tie-breaker';
            return;
        }
        
        categoryTitle.classList.remove('tie-breaker-title');

        const currentTeam = this.teams.find(t => t.id === this.currentAnsweringTeam);
        if (!currentTeam) return;
        
        const teamCategories = this.teamCategories[currentTeam.id] || [];
        if (teamCategories.length > 0) {
            // Find which category this question belongs to
            const questionCategory = this.getCategoryFromQuestion(this.currentQuestion);
            categoryTitle.textContent = `Category: ${questionCategory.charAt(0).toUpperCase() + questionCategory.slice(1)}`;
        }
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
            console.log('=== QUESTION NUMBER DEBUG ===');
            console.log('Current question index:', this.currentQuestionIndex);
            console.log('Total mixed questions:', this.mixedQuestions.length);
            console.log('Current answering team ID:', this.currentAnsweringTeam);
            
            // Force remove any hidden classes and ensure visibility
            questionNumber.classList.remove('hidden');
            questionNumber.style.display = 'inline-block';
            questionNumber.style.visibility = 'visible';
            questionNumber.style.opacity = '1';
            
            // Get team-specific questions for current answering team
            const currentTeamObj = this.teams.find(t => t.id === this.currentAnsweringTeam);
            if (currentTeamObj && this.teamQuestions && this.teamQuestions[currentTeamObj.id]) {
                const teamQuestions = this.teamQuestions[currentTeamObj.id];
                
                // Debug: Log teamQuestions structure
                console.log('=== TEAM QUESTIONS DEBUG ===');
                console.log('Current team ID:', this.currentAnsweringTeam);
                console.log('Team questions array:', teamQuestions);
                console.log('Team questions array length:', teamQuestions.length);
                console.log('Team questions array contents:');
                teamQuestions.forEach((q, index) => {
                    console.log(`  [${index}]:`, q);
                });
                console.log('Current question object:', this.currentQuestion);
                console.log('Current question text:', this.currentQuestion.question);
                console.log('Current question category:', this.currentQuestion.category);
                console.log('Current question teamId:', this.currentQuestion.teamId);
                
                // Find current question in team's questions array using unique matching
                const currentTeamQuestionIndex = teamQuestions.findIndex(q => 
                    q.question === this.currentQuestion.question && 
                    q.category === this.currentQuestion.category &&
                    q.teamId === this.currentAnsweringTeam
                );
                
                console.log('Found question index:', currentTeamQuestionIndex);
                console.log('=== END TEAM QUESTIONS DEBUG ===');
                
                if (currentTeamQuestionIndex !== -1) {
                    const displayIndex = currentTeamQuestionIndex + 1;
                    const totalTeamQuestions = teamQuestions.length;
                    
                    questionNumber.textContent = `Question ${displayIndex} of ${totalTeamQuestions}`;
                    console.log('Question number set to:', questionNumber.textContent);
                    console.log('Team question index:', currentTeamQuestionIndex);
                    console.log('Display index:', displayIndex);
                    console.log('Total team questions:', totalTeamQuestions);
                    console.log('Current answering team ID:', this.currentAnsweringTeam);
                    console.log('Current question:', this.currentQuestion.question);
                    console.log('Current category:', this.currentQuestion.category);
                } else {
                    // Fallback to global display if team question not found
                    const displayIndex = this.currentQuestionIndex + 1;
                    const totalQuestions = this.mixedQuestions.length;
                    questionNumber.textContent = `Question ${displayIndex} of ${totalQuestions}`;
                    console.log('Team question not found, fallback question number set to:', questionNumber.textContent);
                    console.log('Current question:', this.currentQuestion.question);
                    console.log('Current category:', this.currentQuestion.category);
                    console.log('Team questions:', teamQuestions);
                }
            } else {
                // Fallback to global display if team questions not available
                const displayIndex = this.currentQuestionIndex + 1;
                const totalQuestions = this.mixedQuestions.length;
                questionNumber.textContent = `Question ${displayIndex} of ${totalQuestions}`;
                console.log('Team questions not available, fallback question number set to:', questionNumber.textContent);
            }
            
            // Force reflow to ensure the update is applied
            questionNumber.offsetHeight;
            console.log('Question number element forced reflow:', questionNumber.textContent);
        }
        
        if (currentTeam) {
            console.log('=== TEAM DEBUG ===');
            console.log('Current answering team ID:', this.currentAnsweringTeam);
            console.log('Available teams:', this.teams);
            console.log('Team categories:', this.teamCategories);
            
            const team = this.teams.find(t => t.id === this.currentAnsweringTeam);
            console.log('Found team:', team);
            
            if (team) {
                currentTeam.textContent = team.name;
                console.log('Set team name:', team.name);
            } else {
                currentTeam.textContent = `Team ${this.currentAnsweringTeam}`;
                console.log('Team not found, using fallback');
            }
        }
    }
    
    selectOption(index) {
        console.log('Option selected:', index);
        
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.classList.remove('selected'));
        
        optionBtns[index].classList.add('selected');
    }

    getTimerForCurrentQuestion() {
        if (this.currentQuestion && this.currentQuestion.isTieBreaker) {
            return this.tieBreakerTimer;
        }
        return this.questionTimer;
    }
    
    startQuestionTimer() {
        console.log('=== START TIMER ===');
        this.stopQuestionTimer();
        
        const totalTime = this.getTimerForCurrentQuestion();
        let timeLeft = totalTime;
        const timerDisplay = document.getElementById('timerDisplay');
        const timerProgress = document.getElementById('timerProgress');
        
        console.log('Timer display element:', timerDisplay);
        console.log('Timer progress element:', timerProgress);
        console.log('Question timer duration:', totalTime);
        
        // Delay to ensure DOM is ready
        setTimeout(() => {
            if (timerDisplay) {
                // Check if element is visible
                const styles = window.getComputedStyle(timerDisplay);
                const rect = timerDisplay.getBoundingClientRect();
                
                console.log('Timer display element found');
                console.log('Timer display computed styles:');
                console.log('  display:', styles.display);
                console.log('  visibility:', styles.visibility);
                console.log('  opacity:', styles.opacity);
                console.log('  position:', styles.position);
                console.log('  zIndex:', styles.zIndex);
                console.log('  fontSize:', styles.fontSize);
                console.log('  color:', styles.color);
                console.log('Timer display bounding rect:');
                console.log('  top:', rect.top);
                console.log('  left:', rect.left);
                console.log('  width:', rect.width);
                console.log('  height:', rect.height);
                console.log('  isVisible:', rect.width > 0 && rect.height > 0);
                
                timerDisplay.textContent = timeLeft;
                timerDisplay.innerText = timeLeft;
                timerDisplay.innerHTML = timeLeft;
                console.log('Timer display set to:', timeLeft);
                console.log('Timer display after set:', timerDisplay.textContent);
                console.log('Timer display actual content:', document.getElementById('timerDisplay').textContent);
                
                // Check parent elements
                const timerSection = timerDisplay.parentElement;
                const questionMain = timerSection ? timerSection.parentElement : null;
                const questionCard = questionMain ? questionMain.parentElement : null;
                
                console.log('Timer section element:', timerSection);
                console.log('Question main element:', questionMain);
                console.log('Question card element:', questionCard);
                
                if (timerSection) {
                    const timerSectionStyles = window.getComputedStyle(timerSection);
                    const timerSectionRect = timerSection.getBoundingClientRect();
                    console.log('Timer section computed styles:');
                    console.log('  display:', timerSectionStyles.display);
                    console.log('  visibility:', timerSectionStyles.visibility);
                    console.log('  opacity:', timerSectionStyles.opacity);
                    console.log('Timer section bounding rect:');
                    console.log('  top:', timerSectionRect.top);
                    console.log('  left:', timerSectionRect.left);
                    console.log('  width:', timerSectionRect.width);
                    console.log('  height:', timerSectionRect.height);
                    console.log('  isVisible:', timerSectionRect.width > 0 && timerSectionRect.height > 0);
                }
            } else {
                console.log('Timer display not found');
            }
            
            if (timerProgress) {
                timerProgress.style.width = '100%';
                console.log('Timer progress set to 100%');
            } else {
                console.log('Timer progress not found');
            }
        }, 100);
        
        this.currentTimerInterval = setInterval(() => {
            timeLeft--;
            
            console.log(`Timer countdown: ${timeLeft} seconds left`);
            
            if (timerDisplay) {
                // Force update with multiple methods
                timerDisplay.textContent = timeLeft;
                timerDisplay.innerText = timeLeft;
                timerDisplay.innerHTML = timeLeft;
                
                // Force reflow
                timerDisplay.style.display = 'none';
                timerDisplay.offsetHeight; // Trigger reflow
                timerDisplay.style.display = '';
                
                console.log(`Timer display updated to: ${timeLeft}`);
                console.log(`Timer display textContent: "${timerDisplay.textContent}"`);
                console.log(`Timer display innerText: "${timerDisplay.innerText}"`);
                console.log(`Timer display innerHTML: "${timerDisplay.innerHTML}"`);
                console.log(`Timer display computed style: ${window.getComputedStyle(timerDisplay).display}`);
            } else {
                console.log('Timer display element not found during countdown');
            }
            
            if (timerProgress) {
                const percentage = (timeLeft / totalTime) * 100;
                timerProgress.style.width = `${percentage}%`;
                console.log(`Timer progress updated to: ${percentage}%`);
            } else {
                console.log('Timer progress element not found during countdown');
            }
            
            if (timeLeft <= 0) {
                console.log('Timer reached zero, stopping timer');
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
        
        const readyBtn = document.getElementById('readyToAnswerBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        if (readyBtn) {
            readyBtn.classList.remove('hidden');
        }
        
        if (nextBtn) {
            nextBtn.classList.add('hidden');
        }
    }
    
    timeUp() {
        console.log('=== TIME UP ===');
        this.stopQuestionTimer();
        
        // Play time up sound
        this.playSound('timeup');
        
        // Send time up modal to index.html
        this.sendTimeUpModalToIndex();
        
        // Show "Time's Up!" message on questions.html
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.innerHTML = `
                <div class="time-up-message">
                    <h2>⏰ Time's Up!</h2>
                    <p>The correct answer was: <strong>${this.currentQuestion.options[this.currentQuestion.correctAnswer]}</strong></p>
                </div>
            `;
        }
        
        // Disable all options
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => btn.disabled = true);
        
        // Show correct answer
        this.showCorrectAnswer();

        this.showNextQuestionButton();
    }
    
    sendTimeUpModalToIndex() {
        console.log('=== SEND TIME UP MODAL TO INDEX ===');
        console.log('Socket connected:', !!this.socket);
        console.log('Socket id:', this.socket?.id);
        
        // Get current answering team
        const currentTeam = this.teams.find(t => t.id === this.currentAnsweringTeam);
        if (!currentTeam) {
            console.error('Current answering team not found');
            return;
        }
        
        // Send time up modal data to server
        const modalData = {
            type: 'timeUp',
            currentQuestion: this.currentQuestion,
            currentAnsweringTeam: this.currentAnsweringTeam,
            teams: this.teams,
            scores: this.scores,
            teamName: currentTeam.name,
            correctAnswer: this.currentQuestion.options[this.currentQuestion.correctAnswer]
        };
        
        console.log('Sending time up modal data:', modalData);
        console.log('Emitting showTimeUpModal event...');
        
        if (this.socket && this.socket.connected) {
            this.socket.emit('showTimeUpModal', modalData);
            console.log('Time up modal emitted successfully');
        } else {
            console.error('Socket not connected or available');
        }
    }
    
    showTimeUpModal(data) {
        console.log('=== SHOW TIME UP MODAL ===');
        console.log('Modal data:', data);
        
        const modal = document.getElementById('teamAnswerModal');
        const teamNameElement = document.getElementById('answeringTeamName');
        const questionElement = document.getElementById('teamAnswerQuestion');
        
        console.log('Modal element exists:', !!modal);
        console.log('Team name element exists:', !!teamNameElement);
        console.log('Question element exists:', !!questionElement);
        
        if (!modal || !teamNameElement || !questionElement) {
            console.error('Time up modal elements not found');
            return;
        }
        
        // Set team name
        teamNameElement.textContent = data.teamName;
        
        // Set time up message
        questionElement.innerHTML = `
            <div class="time-up-modal">
                <h3>⏰ Time's Up!</h3>
                <p>Team <strong>${data.teamName}</strong> ran out of time!</p>
                <p>The correct answer was: <strong>${data.correctAnswer}</strong></p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="quizApp.closeTimeUpModal()">OK</button>
                </div>
            </div>
        `;
        
        // Show modal
        console.log('About to remove hidden class from time up modal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        console.log(`Time up modal for ${data.teamName} shown`);
    }
    
    closeTimeUpModal() {
        console.log('=== CLOSE TIME UP MODAL ===');
        
        const modal = document.getElementById('teamAnswerModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }
    
    hideReadyToAnswerButton() {
        const readyBtn = document.getElementById('readyToAnswerBtn');
        if (readyBtn) {
            readyBtn.classList.add('hidden');
        }
    }
    
    showNextQuestionButton() {
        const readyBtn = document.getElementById('readyToAnswerBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        if (readyBtn) {
            readyBtn.classList.add('hidden');
        }
        
        if (nextBtn) {
            nextBtn.classList.remove('hidden');
        }
    }
    
    hideNextQuestionButton() {
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
            nextBtn.classList.add('hidden');
        }
    }
    
    playSound(type) {
        console.log(`Playing sound: ${type}`);
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different frequencies for different sounds
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
    
    handleReadyToAnswer() {
        console.log('=== HANDLE READY TO ANSWER ===');
        
        // Stop timer
        this.stopQuestionTimer();
        
        // Hide ready to answer button
        this.hideReadyToAnswerButton();
        
        // Store modal data in sessionStorage for same device
        sessionStorage.setItem('autoShowModal', 'true');
        sessionStorage.setItem('autoModalQuestion', JSON.stringify(this.currentQuestion));
        sessionStorage.setItem('autoModalTeam', this.currentAnsweringTeam.toString());
        sessionStorage.setItem('autoModalTeams', JSON.stringify(this.teams));
        sessionStorage.setItem('autoModalScores', JSON.stringify(this.scores));
        console.log('Auto modal trigger set for same device');
        
        // Send modal trigger to server for other devices
        const modalData = {
            currentQuestion: this.currentQuestion,
            currentAnsweringTeam: this.currentAnsweringTeam,
            teams: this.teams,
            scores: this.scores
        };
        
        this.socket.emit('triggerModalOnIndex', modalData);
        console.log('Modal trigger sent to server for other devices');
        
        // Check if we're on index.html
        const currentPath = window.location.pathname;
        if (currentPath.includes('index.html') || currentPath === '/') {
            // Show modal on index.html
            console.log('On index.html - showing modal');
            this.showTeamAnswerModal();
        } else {
            // Don't show modal on questions.html but continue execution
            console.log('On questions.html - modal will not show here, but continuing execution');
        }
    }
    
    showTeamAnswerModal() {
        console.log('=== SHOW TEAM ANSWER MODAL ===');
        console.log('Current page:', window.location.pathname);
        
        const modal = document.getElementById('teamAnswerModal');
        const teamNameElement = document.getElementById('answeringTeamName');
        const questionElement = document.getElementById('teamAnswerQuestion');
        
        console.log('Modal element exists:', !!modal);
        console.log('Team name element exists:', !!teamNameElement);
        console.log('Question element exists:', !!questionElement);
        
        if (!modal || !teamNameElement || !questionElement) {
            console.error('Team answer modal elements not found');
            return;
        }
        
        // Get current answering team
        const currentTeam = this.teams.find(t => t.id === this.currentAnsweringTeam);
        if (!currentTeam) {
            console.error('Current answering team not found');
            return;
        }
        
        // Set team name
        teamNameElement.textContent = currentTeam.name;
        
        // Set team answer interface (no question, just team name and buttons)
        questionElement.innerHTML = `
            <div class="team-answer-prompt">
                <p>Team <strong>${currentTeam.name}</strong> is ready to answer!</p>
            </div>
        `;
        
        // Show modal
        console.log('About to remove hidden class from modal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        console.log(`Team ${currentTeam.name} answer modal shown`);
    }
    
    showCorrectAnswer() {
        console.log('=== SHOW CORRECT ANSWER ===');
        
        // Highlight the correct answer option
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach((btn, index) => {
            if (index === this.currentQuestion.correctAnswer) {
                btn.classList.add('correct');
                btn.style.backgroundColor = '#28a745';
                btn.style.color = 'white';
                btn.style.borderColor = '#28a745';
            } else {
                btn.classList.add('incorrect');
                btn.style.backgroundColor = '#dc3545';
                btn.style.color = 'white';
                btn.style.borderColor = '#dc3545';
            }
            btn.disabled = true;
        });
        
        console.log('Correct answer highlighted');
    }
    
    closeTeamAnswerModal() {
        console.log('=== CLOSE TEAM ANSWER MODAL ===');
        
        const modal = document.getElementById('teamAnswerModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        
        // Show next question button when modal is closed
        this.showNextQuestionButton();
    }
    
    showReadyToAnswerButton() {
        console.log('=== SHOW READY TO ANSWER BUTTON ===');
        
        const readyBtn = document.getElementById('readyToAnswerBtn');
        if (readyBtn) {
            readyBtn.classList.remove('hidden');
            console.log('Ready to answer button shown');
        } else {
            console.log('Ready to answer button not found');
        }
    }
    
    hideReadyToAnswerButton() {
        console.log('=== HIDE READY TO ANSWER BUTTON ===');
        
        const readyBtn = document.getElementById('readyToAnswerBtn');
        if (readyBtn) {
            readyBtn.classList.add('hidden');
            console.log('Ready to answer button hidden');
        } else {
            console.log('Ready to answer button not found');
        }
    }
    
    handleTeamAnswer(isCorrect) {
        console.log('=== HANDLE TEAM ANSWER ===');
        console.log('Team ID:', this.currentAnsweringTeam);
        console.log('Answer correct:', isCorrect);
        console.log('Current page:', window.location.pathname);
        console.log('Is index page:', window.location.pathname.includes('index.html'));
        
        const currentTeam = this.teams.find(t => t.id === this.currentAnsweringTeam);
        if (!currentTeam) {
            console.error('Current answering team not found');
            return;
        }
        
        // Track which teams have answered
        if (!this.teamsAnswered) {
            this.teamsAnswered = [];
        }
        
        // Mark this team as answered
        if (!this.teamsAnswered.includes(this.currentAnsweringTeam)) {
            this.teamsAnswered.push(this.currentAnsweringTeam);
        }
        
        if (isCorrect) {
            // Correct answer - add point and move to next question
            this.scores[this.currentAnsweringTeam] = (this.scores[this.currentAnsweringTeam] || 0) + 1;
            console.log(`Added 1 point to team ${currentTeam.name}`);
            
            // Send score to server
            this.socket.emit('submitScores', {
                [this.currentAnsweringTeam]: this.scores[this.currentAnsweringTeam]
            });
            
            // Show success emoji
            this.showEmoji('✅');

            this.showScoreGain(this.currentAnsweringTeam, 1);
            
            // Close modal
            this.closeTeamAnswerModal();
            
            // Mark question as answered
            this.currentQuestionAnswered = true;
            
            // Go to next question after delay
            console.log('Setting timeout for next question in 2000ms');
            setTimeout(() => {
                console.log('Timeout reached - calling nextQuestion');
                const nextIndex = this.currentQuestionIndex + 1;

                this.socket.emit('nextQuestion', {
                    currentQuestionIndex: nextIndex
                });

                this.nextQuestion(nextIndex);
            }, 2000);
            
        } else {
            // Incorrect answer - check if other teams can answer
            console.log(`Team ${currentTeam.name} answered incorrectly`);
            
            // Show failure emoji
            this.showEmoji('❌');
            
            // Close modal
            this.closeTeamAnswerModal();
            
            // Check if there are other teams that haven't answered
            const teamsNotAnswered = this.teams.filter(team => 
                !this.teamsAnswered.includes(team.id)
            );
            
            console.log('Teams not answered:', teamsNotAnswered.map(t => t.name));
            
            if (teamsNotAnswered.length > 0) {
                // Show modal for other teams to answer
                this.showOtherTeamsModal(teamsNotAnswered);
            } else {
                // All teams have answered incorrectly, move to next question
                console.log('All teams have answered, moving to next question');
                console.log('Setting timeout for next question in 1000ms');
                setTimeout(() => {
                    console.log('All incorrect timeout reached - calling nextQuestion');
                    const nextIndex = this.currentQuestionIndex + 1;

                    this.socket.emit('nextQuestion', {
                        currentQuestionIndex: nextIndex
                    });

                    this.nextQuestion(nextIndex);
                }, 1000);
            }
        }
        
        // Update display
        this.displayTeams();
    }
    
    showOtherTeamsModal(teamsNotAnswered) {
        console.log('=== SHOW OTHER TEAMS MODAL ===');
        console.log('Teams that can answer:', teamsNotAnswered.map(t => t.name));
        
        const modal = document.getElementById('teamAnswerModal');
        const teamNameElement = document.getElementById('answeringTeamName');
        const questionElement = document.getElementById('teamAnswerQuestion');
        
        if (!modal || !teamNameElement || !questionElement) {
            console.error('Modal elements not found');
            return;
        }
        
        // Set team name
        teamNameElement.textContent = 'Other Teams';
        
        // Create team buttons
        const teamButtonsHTML = teamsNotAnswered.map(team => `
            <div class="team-answer-option">
                <h4>${team.name}</h4>
                <div class="answer-buttons">
                    <button class="btn btn-success" onclick="quizApp.handleOtherTeamAnswer(${team.id}, true)">Correct</button>
                    <button class="btn btn-danger" onclick="quizApp.handleOtherTeamAnswer(${team.id}, false)">Incorrect</button>
                </div>
            </div>
        `).join('');
        
        // Set modal content
        questionElement.innerHTML = `
            <div class="other-teams-modal">
                <h3>Other Teams Can Answer!</h3>
                <p>Each team can attempt to answer:</p>
                <div class="teams-grid">
                    ${teamButtonsHTML}
                </div>
            </div>
        `;
        
        // Show modal
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        console.log('Other teams modal shown');
    }
    
    handleOtherTeamAnswer(teamId, isCorrect) {
        console.log('=== HANDLE OTHER TEAM ANSWER ===');
        console.log('Team ID:', teamId);
        console.log('Answer correct:', isCorrect);
        
        // Set current answering team
        this.currentAnsweringTeam = teamId;
        
        // Handle the answer
        this.handleTeamAnswer(isCorrect);
    }
    
    showEmoji(emoji) {
        const container = document.getElementById('emojiContainer');
        if (!container) return;

        container.textContent = emoji;
        container.style.animation = 'none';
        container.offsetHeight;
        container.style.animation = '';

        setTimeout(() => {
            if (container.textContent === emoji) {
                container.textContent = '';
            }
        }, 1000);
    }

    showScoreGain(teamId, delta) {
        const items = document.querySelectorAll(`.leaderboard-item[data-team-id="${teamId}"]`);
        items.forEach((item) => {
            const scoreEl = item.querySelector('.leaderboard-score');
            if (scoreEl) {
                scoreEl.classList.remove('score-bump');
                scoreEl.offsetHeight;
                scoreEl.classList.add('score-bump');
            }
        });

        const primaryItem = document.querySelector(`.leaderboard-item[data-team-id="${teamId}"]`);
        if (!primaryItem) return;

        const rect = primaryItem.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${delta}`;
        popup.style.left = `${Math.max(10, rect.right - 40)}px`;
        popup.style.top = `${Math.max(10, rect.top - 10)}px`;

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 900);
    }

    startConfetti(container, count = 60) {
        if (!container) return;
        container.innerHTML = '';

        const colors = ['#4299e1', '#38a169', '#e53e3e', '#ecc94b', '#805ad5', '#ed64a6'];
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';

            const left = Math.random() * 100;
            const size = 6 + Math.random() * 8;
            const delay = Math.random() * 0.6;
            const duration = 1.9 + Math.random() * 1.6;
            const rotate = Math.random() * 360;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const dx = (Math.random() * 2 - 1) * 80;

            piece.style.left = `${left}%`;
            piece.style.width = `${size}px`;
            piece.style.height = `${Math.max(8, size * 1.6)}px`;
            piece.style.background = color;
            piece.style.animationDelay = `${delay}s`;
            piece.style.animationDuration = `${duration}s`;
            piece.style.setProperty('--rot', `${rotate}deg`);
            piece.style.setProperty('--dx', `${dx}px`);

            container.appendChild(piece);
        }
    }

    getQuestionKey(question) {
        if (!question) return '';
        const category = question.category || this.getCategoryFromQuestion(question) || '';
        const q = question.question || '';
        const options = Array.isArray(question.options) ? question.options.join('||') : '';
        return `${category}::${q}::${options}`;
    }

    getTieGroup() {
        if (!Array.isArray(this.teams) || this.teams.length === 0) return null;

        const sorted = [...this.teams].sort((a, b) => (this.scores[b.id] || 0) - (this.scores[a.id] || 0));
        const byScore = new Map();

        sorted.forEach((team) => {
            const score = this.scores[team.id] || 0;
            const arr = byScore.get(score) || [];
            arr.push(team);
            byScore.set(score, arr);
        });

        const scoresDesc = [...byScore.keys()].sort((a, b) => b - a);
        for (const score of scoresDesc) {
            const group = byScore.get(score) || [];
            if (group.length > 1) {
                return {
                    score,
                    teams: group
                };
            }
        }

        return null;
    }

    getAllQuestionPool() {
        const pool = [];
        for (const category in this.questions) {
            const arr = this.questions[category] || [];
            for (let i = 0; i < arr.length; i++) {
                pool.push({
                    ...arr[i],
                    category
                });
            }
        }
        return pool;
    }

    pickTieBreakerQuestion() {
        const pool = this.getAllQuestionPool();
        const available = pool.filter(q => !this.usedQuestionKeys.has(this.getQuestionKey(q)));
        const list = available.length > 0 ? available : pool;
        const selected = list[Math.floor(Math.random() * list.length)];

        const q = {
            ...selected
        };

        if (q.correctAnswer === undefined && q.correct !== undefined) {
            q.correctAnswer = q.correct;
        }

        return q;
    }

    startTieBreaker(group) {
        if (!group || !Array.isArray(group.teams) || group.teams.length < 2) return false;
        if (!this.mixedQuestions) this.mixedQuestions = [];
        if (!this.teamQuestions) this.teamQuestions = {};

        this.tieBreakerActive = true;
        this.tieBreakerRound += 1;

        const startIndex = this.mixedQuestions.length;
        group.teams.forEach((team) => {
            const base = this.pickTieBreakerQuestion();
            const question = {
                ...base,
                teamId: team.id,
                isTieBreaker: true,
                tieBreakerRound: this.tieBreakerRound
            };

            this.mixedQuestions.push(question);
            this.usedQuestionKeys.add(this.getQuestionKey(question));

            if (!Array.isArray(this.teamQuestions[team.id])) {
                this.teamQuestions[team.id] = [];
            }
            this.teamQuestions[team.id].push(question);
        });

        if (this.socket && this.socket.connected) {
            this.socket.emit('nextQuestion', {
                currentQuestionIndex: startIndex
            });
        }

        this.nextQuestion(startIndex);
        return true;
    }

    updateState(state) {
        if (!state) return;

        if (Array.isArray(state.teams)) {
            this.teams = state.teams;
        }

        if (state.scores && typeof state.scores === 'object') {
            this.scores = state.scores;
        }

        if (state.currentQuestion !== undefined) {
            this.currentQuestion = state.currentQuestion;
        }

        if (state.currentAnsweringTeam !== undefined) {
            this.currentAnsweringTeam = state.currentAnsweringTeam;
        }

        if (state.currentQuestionIndex !== undefined) {
            this.currentQuestionIndex = state.currentQuestionIndex;
        }

        if (state.quizActivated !== undefined) {
            this.quizActivated = state.quizActivated;
        }

        const currentPath = window.location.pathname;
        const isQuestionsPage = currentPath.includes('questions.html') || currentPath.includes('/questions');

        const header = document.querySelector('.header');
        if (header) {
            if (isQuestionsPage) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
        }

        this.displayTeams();

        if (isQuestionsPage && this.quizActivated && this.teams.length > 0) {
            this.showCategorySelection();
        }
    }

    displayTeams() {
        const teamsListEl = document.querySelector('#setupStatus .teams-list');
        if (teamsListEl && this.teams.length > 0) {
            teamsListEl.innerHTML = this.teams.map(team => `
                <div class="team-item">
                    <span class="team-name">${team.name}</span>
                    <span class="team-id">Team ${team.id}</span>
                </div>
            `).join('');
        }

        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const sortedTeams = [...this.teams].sort((a, b) => (this.scores[b.id] || 0) - (this.scores[a.id] || 0));
        const prevScores = this.prevScores || {};

        const html = sortedTeams.map((team, index) => {
            const score = this.scores[team.id] || 0;
            const winnerClass = index === 0 && score > 0 ? ' winner' : '';
            return `
                <div class="leaderboard-item${winnerClass}" data-team-id="${team.id}">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${team.name}</div>
                    </div>
                    <div class="leaderboard-score" data-team-id="${team.id}">${score}</div>
                </div>
            `;
        }).join('');

        const ids = ['leaderboard', 'categoryLeaderboard'];
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        });

        sortedTeams.forEach((team) => {
            const prev = prevScores[team.id] || 0;
            const current = this.scores[team.id] || 0;
            if (current <= prev) return;

            ids.forEach((id) => {
                const root = document.getElementById(id);
                if (!root) return;
                const scoreEl = root.querySelector(`.leaderboard-item[data-team-id="${team.id}"] .leaderboard-score`);
                if (!scoreEl) return;
                scoreEl.classList.remove('score-bump');
                scoreEl.offsetHeight;
                scoreEl.classList.add('score-bump');
            });
        });

        this.prevScores = { ...this.scores };
    }

    activateQuiz() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('activateQuiz');
        }
    }

    nextQuestion(nextIndex) {
        const currentPath = window.location.pathname;
        const isQuestionsPage = currentPath.includes('questions.html') || currentPath.includes('/questions');

        if (typeof nextIndex === 'number') {
            this.currentQuestionIndex = nextIndex;
        } else {
            this.currentQuestionIndex += 1;
        }

        this.teamsAnswered = [];
        this.currentQuestionAnswered = false;
        this.timeUpCalled = false;

        if (!isQuestionsPage) {
            return;
        }

        const card = document.querySelector('#questionSection .question-main .card');
        if (card) {
            card.classList.remove('question-enter');
            card.classList.add('question-exit');
        }

        const run = () => {
            this.hideNextQuestionButton();
            this.showQuestion();

            if (card) {
                card.classList.remove('question-exit');
                card.classList.add('question-enter');
                setTimeout(() => card.classList.remove('question-enter'), 260);
            }
        };

        if (card) {
            setTimeout(run, 180);
        } else {
            run();
        }
    }

    endQuiz() {
        const currentPath = window.location.pathname;
        const isQuestionsPage = currentPath.includes('questions.html') || currentPath.includes('/questions');
        if (!isQuestionsPage) return;

        const questionSection = document.getElementById('questionSection');
        if (!questionSection) return;

        const tieGroup = this.getTieGroup();
        if (tieGroup) {
            const started = this.startTieBreaker(tieGroup);
            if (started) {
                return;
            }
        }

        this.tieBreakerActive = false;

        const sortedTeams = [...this.teams].sort((a, b) => (this.scores[b.id] || 0) - (this.scores[a.id] || 0));
        const winner = sortedTeams[0];

        questionSection.innerHTML = `
            <div class="celebration-overlay" id="celebrationOverlay">
                <div class="celebration-confetti" id="celebrationConfetti"></div>
                <div class="celebration-panel">
                    <div class="celebration-trophy">🏆</div>
                    <h2>Congratulations!</h2>
                    <p class="celebration-winner">${winner ? winner.name : ''}</p>
                    <div class="leaderboard celebration-leaderboard">
                        ${sortedTeams.map((team, index) => `
                            <div class="leaderboard-item${index === 0 ? ' winner' : ''}" data-team-id="${team.id}">
                                <div class="leaderboard-rank">${index + 1}</div>
                                <div class="leaderboard-info">
                                    <div class="leaderboard-name">${team.name}</div>
                                </div>
                                <div class="leaderboard-score" data-team-id="${team.id}">${this.scores[team.id] || 0}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="action-buttons" style="margin-top: 20px;">
                        <button class="btn btn-primary" onclick="location.reload()">Play Again</button>
                    </div>
                </div>
            </div>
        `;

        const confetti = document.getElementById('celebrationConfetti');
        this.startConfetti(confetti, 90);

        if (this.socket && this.socket.connected) {
            this.socket.emit('submitScores', this.scores);
        }
    }

    resetQuiz() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('resetQuiz');
        }

        sessionStorage.clear();
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
    window.quizApp.initialize();
});
