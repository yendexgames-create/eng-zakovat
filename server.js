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

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/questions.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'questions.html'));
});

// Quiz state
let quizState = {
    teams: [],
    scores: {},
    currentCategory: null,
    currentQuestion: null,
    currentAnsweringTeam: null,
    quizStarted: false,
    quizActivated: false
};

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to new client
    socket.emit('stateUpdate', quizState);
    
    // Handle team setup
    socket.on('setupTeams', (teams) => {
        console.log('Teams setup:', teams);
        quizState.teams = teams;
        quizState.scores = {};
        
        teams.forEach(team => {
            quizState.scores[team.id] = 0;
        });
        
        // Broadcast updated state
        io.emit('stateUpdate', quizState);
    });
    
    // Handle quiz activation
    socket.on('activateQuiz', () => {
        console.log('Quiz activated');
        quizState.quizActivated = true;
        io.emit('stateUpdate', quizState);
    });
    
    // Handle modal trigger for other devices
    socket.on('triggerModalOnIndex', (data) => {
        console.log('Modal trigger received:', data);
        
        // Update quiz state with modal data
        quizState.currentQuestion = data.currentQuestion;
        quizState.currentAnsweringTeam = data.currentAnsweringTeam;
        quizState.teams = data.teams;
        quizState.scores = data.scores;
        
        // Broadcast modal trigger to all other clients
        socket.broadcast.emit('showModalOnIndex', data);
        console.log('Modal trigger broadcasted to other devices');
    });
    
    // Handle score submission
    socket.on('submitScores', (scores) => {
        console.log('Scores submitted:', scores);
        Object.assign(quizState.scores, scores);
        io.emit('stateUpdate', quizState);
    });
    
    // Handle quiz reset
    socket.on('resetQuiz', () => {
        console.log('Quiz reset');
        quizState = {
            teams: [],
            scores: {},
            currentCategory: null,
            currentQuestion: null,
            currentAnsweringTeam: null,
            quizStarted: false,
            quizActivated: false
        };
        io.emit('stateUpdate', quizState);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to start`);
});
