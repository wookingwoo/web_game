// Tic-Tac-Toe Game Logic
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreDrawDisplay = document.getElementById('scoreDraw');
const playerOName = document.getElementById('playerOName');
const modeButtons = document.querySelectorAll('.mode-btn');
const diffButtons = document.querySelectorAll('.diff-btn');
const difficultySelector = document.getElementById('difficultySelector');

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let vsAI = true;
let difficulty = 'medium';
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// Mode selection
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        vsAI = btn.dataset.mode === 'ai';
        playerOName.textContent = vsAI ? 'AI' : 'Player 2';
        difficultySelector.classList.toggle('hidden', !vsAI);
        
        resetGame();
    });
});

// Difficulty selection
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.diff;
    });
});

// Handle cell click
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);
    
    if (board[index] !== '' || !gameActive) return;
    if (vsAI && currentPlayer === 'O') return;
    
    makeMove(index);
}

// Make a move
function makeMove(index) {
    board[index] = currentPlayer;
    cells[index].textContent = currentPlayer === 'X' ? '❌' : '⭕';
    cells[index].classList.add(currentPlayer.toLowerCase(), 'taken');
    
    if (checkWin()) {
        handleWin();
        return;
    }
    
    if (checkDraw()) {
        handleDraw();
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
    
    // AI move
    if (vsAI && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

// Check for win
function checkWin() {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => board[index] === currentPlayer);
    });
}

// Check for draw
function checkDraw() {
    return board.every(cell => cell !== '');
}

// Handle win
function handleWin() {
    gameActive = false;
    
    // Find winning combination and highlight
    const winningCombo = WINNING_COMBINATIONS.find(combination => {
        return combination.every(index => board[index] === currentPlayer);
    });
    
    winningCombo.forEach(index => {
        cells[index].classList.add('win');
    });
    
    statusDisplay.textContent = `${currentPlayer === 'X' ? '❌' : '⭕'} 승리!`;
    
    if (currentPlayer === 'X') {
        scoreX++;
        scoreXDisplay.textContent = scoreX;
    } else {
        scoreO++;
        scoreODisplay.textContent = scoreO;
    }
}

// Handle draw
function handleDraw() {
    gameActive = false;
    statusDisplay.textContent = '무승부!';
    scoreDraw++;
    scoreDrawDisplay.textContent = scoreDraw;
}

// Update status
function updateStatus() {
    if (vsAI && currentPlayer === 'O') {
        statusDisplay.textContent = '🤖 AI가 생각 중...';
    } else {
        statusDisplay.textContent = `${currentPlayer === 'X' ? '❌' : '⭕'} 차례입니다`;
    }
}

// AI Move
function makeAIMove() {
    if (!gameActive) return;
    
    let move;
    
    switch (difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }
    
    if (move !== undefined) {
        makeMove(move);
    }
}

// Get random available move
function getRandomMove() {
    const availableMoves = board
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Minimax algorithm for best move
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            const score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    // Check terminal states
    if (checkWinFor('O')) return 10 - depth;
    if (checkWinFor('X')) return depth - 10;
    if (board.every(cell => cell !== '')) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinFor(player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

// Reset game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'taken', 'win');
    });
    
    updateStatus();
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Initialize
updateStatus();
