// Simon Says Game Logic
const buttons = {
    green: document.getElementById('btn-green'),
    red: document.getElementById('btn-red'),
    yellow: document.getElementById('btn-yellow'),
    blue: document.getElementById('btn-blue')
};

const levelDisplay = document.getElementById('level');
const levelDisplayCenter = document.getElementById('levelDisplay');
const bestLevelDisplay = document.getElementById('bestLevel');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalLevelDisplay = document.getElementById('finalLevel');
const newRecordText = document.getElementById('newRecord');

const COLORS = ['green', 'red', 'yellow', 'blue'];
const SOUNDS = {
    green: 392,  // G4
    red: 329.63, // E4
    yellow: 261.63, // C4
    blue: 220    // A3
};

let sequence = [];
let playerSequence = [];
let level = 0;
let isPlaying = false;
let canClick = false;
let bestLevel = localStorage.getItem('simon_best') || 0;

// Audio context for sounds
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(color, duration = 300) {
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = SOUNDS[color];
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}

// Display best level
bestLevelDisplay.textContent = bestLevel;

// Flash button
function flashButton(color, duration = 300) {
    return new Promise(resolve => {
        buttons[color].classList.add('active');
        playSound(color, duration);
        
        setTimeout(() => {
            buttons[color].classList.remove('active');
            resolve();
        }, duration);
    });
}

// Play sequence
async function playSequence() {
    canClick = false;
    statusDisplay.textContent = '패턴을 기억하세요...';
    setButtonsDisabled(true);
    
    await sleep(500);
    
    for (let color of sequence) {
        await flashButton(color, 400);
        await sleep(200);
    }
    
    canClick = true;
    statusDisplay.textContent = '이제 따라하세요!';
    setButtonsDisabled(false);
}

// Add to sequence and play
async function nextRound() {
    level++;
    levelDisplay.textContent = level;
    levelDisplayCenter.textContent = level;
    
    // Add random color to sequence
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    sequence.push(randomColor);
    
    playerSequence = [];
    
    await playSequence();
}

// Handle player click
async function handleClick(color) {
    if (!canClick || !isPlaying) return;
    
    initAudio();
    
    playerSequence.push(color);
    await flashButton(color, 200);
    
    // Check if correct
    const currentIndex = playerSequence.length - 1;
    
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        // Wrong!
        gameOver();
        return;
    }
    
    // Check if sequence complete
    if (playerSequence.length === sequence.length) {
        canClick = false;
        statusDisplay.textContent = '정답! 🎉';
        
        await sleep(1000);
        nextRound();
    }
}

// Set buttons disabled state
function setButtonsDisabled(disabled) {
    Object.values(buttons).forEach(btn => {
        if (disabled) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

// Game over
function gameOver() {
    isPlaying = false;
    canClick = false;
    setButtonsDisabled(true);
    
    // Play error sound
    if (audioCtx) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100;
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
    
    // Check for new record
    if (level > bestLevel) {
        bestLevel = level;
        localStorage.setItem('simon_best', bestLevel);
        bestLevelDisplay.textContent = bestLevel;
        newRecordText.classList.remove('hidden');
    } else {
        newRecordText.classList.add('hidden');
    }
    
    finalLevelDisplay.textContent = level;
    gameOverOverlay.classList.remove('hidden');
    startBtn.disabled = false;
}

// Start game
function startGame() {
    initAudio();
    
    sequence = [];
    playerSequence = [];
    level = 0;
    isPlaying = true;
    
    levelDisplay.textContent = level;
    levelDisplayCenter.textContent = level;
    gameOverOverlay.classList.add('hidden');
    startBtn.disabled = true;
    
    nextRound();
}

// Helper function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listeners
Object.entries(buttons).forEach(([color, btn]) => {
    btn.addEventListener('click', () => handleClick(color));
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleClick(color);
    });
});

// Initialize
setButtonsDisabled(true);
