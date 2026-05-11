// Whack-a-Mole Game Logic
const holes = document.querySelectorAll('.hole');
const moles = document.querySelectorAll('.mole');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const bestScoreDisplay = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const resultOverlay = document.getElementById('resultOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const newRecordText = document.getElementById('newRecord');

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let moleTimeout = null;
let timerInterval = null;
let lastHole = null;
let bestScore = localStorage.getItem('whack_best') || 0;

// Display best score
bestScoreDisplay.textContent = bestScore;

// Get random hole that's different from the last one
function getRandomHole() {
    const index = Math.floor(Math.random() * holes.length);
    const hole = holes[index];
    
    if (hole === lastHole) {
        return getRandomHole();
    }
    
    lastHole = hole;
    return hole;
}

// Get random time for mole to stay up
function getRandomTime(min, max) {
    return Math.random() * (max - min) + min;
}

// Show mole
function showMole() {
    if (!gameRunning) return;
    
    const hole = getRandomHole();
    const mole = hole.querySelector('.mole');
    
    // Randomly show bomb (15% chance)
    const isBomb = Math.random() < 0.15;
    mole.textContent = isBomb ? '💣' : '🐹';
    mole.dataset.type = isBomb ? 'bomb' : 'mole';
    
    // Calculate time based on remaining time (gets faster)
    const minTime = Math.max(400, 800 - (30 - timeLeft) * 15);
    const maxTime = Math.max(800, 1200 - (30 - timeLeft) * 15);
    const upTime = getRandomTime(minTime, maxTime);
    
    hole.classList.add('active');
    
    moleTimeout = setTimeout(() => {
        hole.classList.remove('active');
        if (gameRunning) {
            setTimeout(showMole, getRandomTime(200, 500));
        }
    }, upTime);
}

// Handle click on mole
function whackMole(e) {
    if (!gameRunning) return;
    
    const hole = e.currentTarget;
    const mole = hole.querySelector('.mole');
    
    if (!hole.classList.contains('active')) return;
    
    hole.classList.remove('active');
    hole.classList.add('whacked');
    hole.classList.add('hit');
    
    setTimeout(() => {
        hole.classList.remove('whacked');
        hole.classList.remove('hit');
    }, 200);
    
    if (mole.dataset.type === 'bomb') {
        // Hit a bomb - lose points
        score = Math.max(0, score - 10);
        showFloatingText(hole, '-10', '#e74c3c');
    } else {
        // Hit a mole - gain points
        score += 10;
        showFloatingText(hole, '+10', '#2ecc71');
    }
    
    scoreDisplay.textContent = score;
}

// Show floating text effect
function showFloatingText(hole, text, color) {
    const floater = document.createElement('div');
    floater.textContent = text;
    floater.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        font-weight: bold;
        color: ${color};
        pointer-events: none;
        animation: floatUp 0.8s ease-out forwards;
        z-index: 100;
    `;
    
    hole.style.position = 'relative';
    hole.appendChild(floater);
    
    setTimeout(() => floater.remove(), 800);
}

// Add floating animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -150%);
        }
    }
`;
document.head.appendChild(style);

// Start game
function startGame() {
    // Reset
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    resultOverlay.classList.add('hidden');
    newRecordText.classList.add('hidden');
    startBtn.disabled = true;
    startBtn.textContent = '게임 중...';
    
    // Clear any existing moles
    holes.forEach(hole => {
        hole.classList.remove('active');
        hole.classList.remove('whacked');
    });
    
    // Start timer
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Start showing moles
    showMole();
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    clearTimeout(moleTimeout);
    
    // Hide all moles
    holes.forEach(hole => {
        hole.classList.remove('active');
    });
    
    // Check for new record
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('whack_best', bestScore);
        bestScoreDisplay.textContent = bestScore;
        newRecordText.classList.remove('hidden');
    }
    
    // Show results
    finalScoreDisplay.textContent = score;
    resultOverlay.classList.remove('hidden');
    
    startBtn.disabled = false;
    startBtn.textContent = '🎮 게임 시작';
}

// Event listeners
holes.forEach(hole => {
    hole.addEventListener('click', whackMole);
    
    // Prevent double tap zoom on mobile
    hole.addEventListener('touchend', (e) => {
        e.preventDefault();
        whackMole(e);
    });
});
