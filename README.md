# English Quiz Application

## 📋 Description
Interactive English quiz application with real-time synchronization between multiple devices using Socket.io.

## 🚀 Features
- **Multi-device Support**: Index page for setup, Questions page for gameplay
- **Real-time Sync**: Modal triggers and score updates across devices
- **Team Management**: Support for 2-10 teams
- **Category Selection**: 8 random categories from 12 available
- **Timer System**: 30-second countdown for each question
- **Score Tracking**: Real-time score updates
- **Modal System**: Team answer confirmation on index.html

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, Socket.io
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Modern gradient design with animations
- **Deployment**: Railway

## 📁 Project Structure
```
eng-zakovat/
├── server.js          # Backend server with Socket.io
├── index.html         # Team setup and scoring page
├── questions.html      # Quiz questions page
├── script.js          # Main application logic
├── styles.css         # Styling and animations
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🎯 How to Use

### 1. Setup (index.html)
1. Open `index.html` in browser
2. Enter number of teams (2-10)
3. Click "Generate Team Inputs"
4. Enter team names
5. Click "Setup Quiz"

### 2. Play (questions.html)
1. Open `questions.html` on same or different device
2. Click "Random Categories" to select 8 categories
3. Click "Start Quiz"
4. Answer questions within 30 seconds
5. Click "Ready to Answer" when ready

### 3. Scoring (index.html)
1. When "Ready to Answer" is clicked, modal appears on index.html
2. Click "Correct" or "Incorrect" to score
3. Scores update in real-time across all devices

## 🔧 Development

### Local Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

### Deployment
The application is deployed on Railway and accessible at:
https://web-production-467b7.up.railway.app

## 🎨 Design Features
- **Modern UI**: Gradient backgrounds, glassmorphism effects
- **Responsive**: Works on desktop and mobile devices
- **Animations**: Smooth transitions and micro-interactions
- **Emoji Feedback**: Visual confirmation for correct/incorrect answers
- **Timer Visualization**: Progress bar with color transitions

## 🔄 Real-time Features
- **Socket.io Integration**: Instant synchronization
- **Modal Triggers**: Cross-device modal display
- **Score Updates**: Live score broadcasting
- **State Management**: Consistent state across devices

## 📱 Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🐛 Troubleshooting

### Common Issues
1. **Modal not showing**: Check console for Socket.io connection errors
2. **Team inputs not generating**: Verify browser console for JavaScript errors
3. **Timer not working**: Ensure no JavaScript errors in console
4. **Scores not syncing**: Check Socket.io connection status

### Debug Mode
Open browser console (F12) to see detailed logging:
- Socket connection status
- Team setup progress
- Question flow
- Modal triggers
- Score updates

## 📄 License
MIT License - Free to use and modify
