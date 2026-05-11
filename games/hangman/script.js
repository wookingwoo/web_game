// Hangman Game Logic
const WORDS = {
    '동물': ['ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'KANGAROO', 'LEOPARD', 'BUTTERFLY', 'OCTOPUS'],
    '과일': ['APPLE', 'BANANA', 'ORANGE', 'MANGO', 'GRAPE', 'STRAWBERRY', 'WATERMELON', 'PINEAPPLE'],
    '나라': ['KOREA', 'JAPAN', 'AMERICA', 'FRANCE', 'GERMANY', 'BRAZIL', 'AUSTRALIA', 'CANADA'],
    '스포츠': ['SOCCER', 'BASEBALL', 'BASKETBALL', 'TENNIS', 'SWIMMING', 'VOLLEYBALL', 'GOLF', 'HOCKEY'],
    '음식': ['PIZZA', 'BURGER', 'SPAGHETTI', 'SUSHI', 'CHOCOLATE', 'SANDWICH', 'NOODLE', 'STEAK']
};

const BODY_PARTS = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

const wordDisplay = document.getElementById('wordDisplay');
const wrongLettersDisplay = document.getElementById('wrongLetters');
const livesDisplay = document.getElementById('lives');
const categoryDisplay = document.getElementById('category');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const resultTitle = document.getElementById('resultTitle');
const correctWordDisplay = document.getElementById('correctWord');
const keys = document.querySelectorAll('.key');

let currentWord = '';
let currentCategory = '';
let guessedLetters = [];
let wrongLetters = [];
let lives = 6;
let gameOver = false;

// Initialize game
function init() {
    // Pick random category and word
    const categories = Object.keys(WORDS);
    currentCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = WORDS[currentCategory];
    currentWord = words[Math.floor(Math.random() * words.length)];
    
    guessedLetters = [];
    wrongLetters = [];
    lives = 6;
    gameOver = false;
    
    categoryDisplay.textContent = currentCategory;
    livesDisplay.textContent = lives;
    wrongLettersDisplay.textContent = '';
    
    // Reset hangman
    BODY_PARTS.forEach(part => {
        document.getElementById(part).classList.remove('show');
        document.getElementById(part).classList.add('hidden');
    });
    
    // Reset keyboard
    keys.forEach(key => {
        key.disabled = false;
        key.classList.remove('correct', 'wrong');
    });
    
    // Hide overlay
    gameOverOverlay.classList.add('hidden');
    
    updateWordDisplay();
}

// Update word display
function updateWordDisplay() {
    const display = currentWord
        .split('')
        .map(letter => guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
    
    wordDisplay.textContent = display;
    
    // Check win
    if (!display.includes('_')) {
        endGame(true);
    }
}

// Guess letter
function guessLetter(letter) {
    if (gameOver || guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
        return;
    }
    
    const key = document.querySelector(`[data-letter="${letter}"]`);
    
    if (currentWord.includes(letter)) {
        // Correct guess
        guessedLetters.push(letter);
        key.classList.add('correct');
        updateWordDisplay();
    } else {
        // Wrong guess
        wrongLetters.push(letter);
        key.classList.add('wrong');
        wrongLettersDisplay.textContent = wrongLetters.join(' ');
        
        // Show body part
        lives--;
        livesDisplay.textContent = lives;
        
        const partIndex = BODY_PARTS.length - lives - 1;
        if (partIndex >= 0 && partIndex < BODY_PARTS.length) {
            const part = document.getElementById(BODY_PARTS[partIndex]);
            part.classList.remove('hidden');
            part.classList.add('show');
        }
        
        // Check lose
        if (lives <= 0) {
            endGame(false);
        }
    }
    
    key.disabled = true;
}

// End game
function endGame(won) {
    gameOver = true;
    
    // Disable all keys
    keys.forEach(key => key.disabled = true);
    
    // Show overlay
    correctWordDisplay.textContent = currentWord;
    
    if (won) {
        resultTitle.textContent = '🎉 축하합니다!';
        resultTitle.className = 'win';
    } else {
        resultTitle.textContent = '😢 Game Over';
        resultTitle.className = '';
    }
    
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 500);
}

// Start new game
function startNewGame() {
    init();
}

// Event listeners
keys.forEach(key => {
    key.addEventListener('click', () => {
        guessLetter(key.dataset.letter);
    });
});

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    const letter = e.key.toUpperCase();
    if (letter >= 'A' && letter <= 'Z' && letter.length === 1) {
        guessLetter(letter);
    }
});

// Initialize
init();
