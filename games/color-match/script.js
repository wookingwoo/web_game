// Color Match Game Logic
const colorWord = document.getElementById('colorWord');
const choices = document.getElementById('choices');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const bestScoreDisplay = document.getElementById('bestScore');
const startBtn = document.getElementById('startBtn');
const resultOverlay = document.getElementById('resultOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const newRecordText = document.getElementById('newRecord');
const choiceBtns = document.querySelectorAll('.choice-btn');

const COLORS = [
    { name: '빨강', color: '#e74c3c', key: 'red' },
    { name: '파랑', color: '#3498db', key: 'blue' },
    { name: '초록', color: '#2ecc71', key: 'green' },
    { name: '노랑', color: '#f1c40f', key: 'yellow' }
];

let score = 0;
let timeLeft = 30;
let gameRunning = false;
let timerInterval = null;
let currentColor = null;
let bestScore = localStorage.getItem('color_best') || 0;

// Display best score
bestScoreDisplay.textContent = bestScore;

// Generate new question
function generateQuestion() {
    // Random word (text)
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const word = COLORS[wordIndex].name;
    
    // Random color (different from word to make it harder, 70% of the time)
    let colorIndex;
    if (Math.random() < 0.7) {
        do {
            colorIndex = Math.floor(Math.random() * COLORS.length);
        } while (colorIndex === wordIndex);
    } else {
        colorIndex = Math.floor(Math.random() * COLORS.length);
    }
    
    currentColor = COLORS[colorIndex];
    
    colorWord.textContent = word;
    colorWord.style.color = currentColor.color;
}

// Handle choice
function handleChoice(selectedKey) {
    if (!gameRunning) return;
    
    if (selectedKey === currentColor.key) {
        // Correct!
        score++;
        scoreDisplay.textContent = score;
        colorWord.classList.add('correct');
        setTimeout(() => colorWord.classList.remove('correct'), 300);
    } else {
        // Wrong!
        colorWord.classList.add('wrong');
        setTimeout(() => colorWord.classList.remove('wrong'), 300);
    }
    
    generateQuestion();
}

// Start game
function startGame() {
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    resultOverlay.classList.add('hidden');
    newRecordText.classList.add('hidden');
    startBtn.style.display = 'none';
    
    // Enable buttons
    choiceBtns.forEach(btn => btn.disabled = false);
    
    generateQuestion();
    
    // Start timer
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    
    // Disable buttons
    choiceBtns.forEach(btn => btn.disabled = true);
    
    // Check for new record
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('color_best', bestScore);
        bestScoreDisplay.textContent = bestScore;
        newRecordText.classList.remove('hidden');
    }
    
    finalScoreDisplay.textContent = score;
    resultOverlay.classList.remove('hidden');
    startBtn.style.display = 'inline-block';
}

// Event listeners
choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handleChoice(btn.dataset.color);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key.toLowerCase()) {
        case '1':
        case 'r':
            handleChoice('red');
            break;
        case '2':
        case 'b':
            handleChoice('blue');
            break;
        case '3':
        case 'g':
            handleChoice('green');
            break;
        case '4':
        case 'y':
            handleChoice('yellow');
            break;
    }
});

// Initialize
choiceBtns.forEach(btn => btn.disabled = true);
