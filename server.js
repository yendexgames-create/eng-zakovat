const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Global quiz state
let quizState = {
    teams: [],
    scores: {},
    currentCategory: null,
    currentQuestionIndex: 0,
    completedCategories: [],
    quizActivated: false,
    scoringPhase: false,
    currentQuestion: null
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to new client
    socket.emit('stateUpdate', quizState);
    
    // Handle team setup
    socket.on('setupTeams', (teams) => {
        quizState.teams = teams;
        quizState.scores = {};
        teams.forEach(team => {
            quizState.scores[team.id] = 0;
        });
        
        // Broadcast to all clients
        io.emit('stateUpdate', quizState);
        console.log('Teams setup:', teams);
    });
    
    // Handle quiz activation
    socket.on('activateQuiz', () => {
        quizState.quizActivated = true;
        io.emit('stateUpdate', quizState);
        console.log('Quiz activated');
    });
    
    // Handle category selection
    socket.on('selectCategory', (category) => {
        quizState.currentCategory = category;
        quizState.currentQuestionIndex = 0;
        io.emit('stateUpdate', quizState);
        console.log('Category selected:', category);
    });
    
    // Handle scoring
    socket.on('submitScores', (scores) => {
        // Update scores
        Object.keys(scores).forEach(teamId => {
            const oldScore = quizState.scores[teamId] || 0;
            const newScore = scores[teamId];
            quizState.scores[teamId] = oldScore + newScore;
        });
        
        // Mark scoring phase as complete
        quizState.scoringPhase = false;
        
        // Send score animation signal
        io.emit('scoreAnimation', scores);
        
        // Broadcast updated scores
        io.emit('stateUpdate', quizState);
        console.log('Scores updated:', quizState.scores);
        
        // Auto-advance to next question after delay
        setTimeout(() => {
            io.emit('autoNextQuestion');
        }, 3000); // Increased delay for animation
    });
    
    // Handle next question
    socket.on('nextQuestion', () => {
        quizState.currentQuestionIndex++;
        
        // Check if category is completed
        if (quizState.currentQuestionIndex >= 3) { // Assuming 3 questions per category
            quizState.completedCategories.push(quizState.currentCategory);
            quizState.currentCategory = null;
            quizState.currentQuestionIndex = 0;
        }
        
        io.emit('stateUpdate', quizState);
        console.log('Next question or category completed');
    });
    
    // Handle time up
    socket.on('timeUp', () => {
        quizState.scoringPhase = true;
        io.emit('stateUpdate', quizState);
        console.log('Time up - scoring phase activated');
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/questions', (req, res) => {
    res.sendFile(path.join(__dirname, 'questions.html'));
});

// API endpoints for state management
app.get('/api/state', (req, res) => {
    res.json(quizState);
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Quiz server running on port ${PORT}`);
    console.log(`Open https://your-app-url.railway.app for admin device`);
    console.log(`Open https://your-app-url.railway.app/questions for player device`);
});
