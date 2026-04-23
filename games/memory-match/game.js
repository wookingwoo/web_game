// Memory Match Game
const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let timerInterval = null;
let seconds = 0;
let canFlip = true;

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const timerDisplay = document.getElementById('timer');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalMovesDisplay = document.getElementById('finalMoves');
const finalTimeDisplay = document.getElementById('finalTime');

// Initialize the game
function initGame() {
    // Create pairs of cards
    cards = [...emojis, ...emojis];
    shuffleCards();
    createBoard();
    resetStats();
}

// Shuffle cards using Fisher-Yates algorithm
function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Create the game board
function createBoard() {
    gameBoard.innerHTML = '';
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = '?';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = emoji;
        
        card.appendChild(cardBack);
        card.appendChild(cardFront);
        card.addEventListener('click', () => flipCard(card));
        
        gameBoard.appendChild(card);
    });
}

// Reset game statistics
function resetStats() {
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    flippedCards = [];
    canFlip = true;
    
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = `${matchedPairs}/8`;
    timerDisplay.textContent = seconds;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Start the game
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameStarted = true;
    initGame();
    startTimer();
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = seconds;
    }, 1000);
}

// Flip a card
function flipCard(card) {
    // Prevent flipping if conditions are not met
    if (!canFlip || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched') ||
        flippedCards.length >= 2) {
        return;
    }
    
    // Flip the card
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // Check for match if two cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// Check if two flipped cards match
function checkMatch() {
    canFlip = false;
    const [card1, card2] = flippedCards;
    const emoji1 = card1.dataset.emoji;
    const emoji2 = card2.dataset.emoji;
    
    if (emoji1 === emoji2) {
        // Cards match
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            matchesDisplay.textContent = `${matchedPairs}/8`;
            flippedCards = [];
            canFlip = true;
            
            // Check for win
            if (matchedPairs === 8) {
                endGame();
            }
        }, 500);
    } else {
        // Cards don't match - flip them back
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
        finalMovesDisplay.textContent = moves;
        finalTimeDisplay.textContent = seconds;
    }, 500);
}

// Restart the game
function restartGame() {
    gameOverScreen.classList.add('hidden');
    initGame();
    startTimer();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
