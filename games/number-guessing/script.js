// Number Guessing Game Logic
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const attemptsDisplay = document.getElementById('attempts');
const rangeDisplay = document.getElementById('range');
const bestScoreDisplay = document.getElementById('bestScore');
const hintDisplay = document.getElementById('hint');
const guessHistory = document.getElementById('guessHistory');
const winOverlay = document.getElementById('winOverlay');
const answerDisplay = document.getElementById('answer');
const finalAttemptsDisplay = document.getElementById('finalAttempts');
const newRecordText = document.getElementById('newRecord');

let secretNumber;
let attempts = 0;
let minRange = 1;
let maxRange = 100;
let gameOver = false;
let bestScore = localStorage.getItem('number_best') || null;

// Display best score
if (bestScore) {
    bestScoreDisplay.textContent = bestScore;
}

// Initialize game
function init() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    minRange = 1;
    maxRange = 100;
    gameOver = false;
    
    attemptsDisplay.textContent = attempts;
    rangeDisplay.textContent = `${minRange}-${maxRange}`;
    hintDisplay.textContent = '1~100 사이의 숫자를 맞춰보세요!';
    hintDisplay.className = 'hint';
    guessHistory.innerHTML = '';
    guessInput.value = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    winOverlay.classList.add('hidden');
    newRecordText.classList.add('hidden');
}

// Append number from number pad
function appendNumber(num) {
    if (gameOver) return;
    const currentValue = guessInput.value;
    const newValue = currentValue + num;
    if (parseInt(newValue) <= 100) {
        guessInput.value = newValue;
    }
}

// Clear input
function clearInput() {
    guessInput.value = '';
}

// Make guess
function makeGuess() {
    if (gameOver) return;
    
    const guess = parseInt(guessInput.value);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
        hintDisplay.textContent = '1~100 사이의 숫자를 입력하세요!';
        hintDisplay.className = 'hint';
        return;
    }
    
    attempts++;
    attemptsDisplay.textContent = attempts;
    
    // Add to history
    const historyItem = document.createElement('span');
    historyItem.className = 'guess-item';
    historyItem.textContent = guess;
    
    if (guess < secretNumber) {
        hintDisplay.textContent = `⬆️ UP! ${guess}보다 큽니다!`;
        hintDisplay.className = 'hint up';
        historyItem.classList.add('up');
        minRange = Math.max(minRange, guess + 1);
    } else if (guess > secretNumber) {
        hintDisplay.textContent = `⬇️ DOWN! ${guess}보다 작습니다!`;
        hintDisplay.className = 'hint down';
        historyItem.classList.add('down');
        maxRange = Math.min(maxRange, guess - 1);
    } else {
        // Correct!
        hintDisplay.textContent = '🎉 정답입니다!';
        hintDisplay.className = 'hint correct';
        gameOver = true;
        
        // Show win overlay
        answerDisplay.textContent = secretNumber;
        finalAttemptsDisplay.textContent = attempts;
        
        // Check for new record
        if (!bestScore || attempts < bestScore) {
            bestScore = attempts;
            localStorage.setItem('number_best', bestScore);
            bestScoreDisplay.textContent = bestScore;
            newRecordText.classList.remove('hidden');
        }
        
        setTimeout(() => {
            winOverlay.classList.remove('hidden');
        }, 500);
        
        guessInput.disabled = true;
        guessBtn.disabled = true;
    }
    
    guessHistory.appendChild(historyItem);
    rangeDisplay.textContent = `${minRange}-${maxRange}`;
    guessInput.value = '';
}

// Reset game
function resetGame() {
    init();
}

// Event listeners
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

// Initialize
init();
