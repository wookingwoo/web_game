// Minesweeper Game Logic
const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

let currentDifficulty = 'easy';
let board = [];
let revealed = [];
let flagged = [];
let gameStarted = false;
let gameOver = false;
let timer = 0;
let timerInterval = null;

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const mineCountDisplay = document.getElementById('mineCount');
const timerDisplay = document.getElementById('timer');
const gameStatus = document.getElementById('gameStatus');
const diffButtons = document.querySelectorAll('.diff-btn');

// Initialize
function init() {
    const { rows, cols, mines } = difficulties[currentDifficulty];
    
    board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    revealed = Array(rows).fill(null).map(() => Array(cols).fill(false));
    flagged = Array(rows).fill(null).map(() => Array(cols).fill(false));
    
    gameStarted = false;
    gameOver = false;
    timer = 0;
    clearInterval(timerInterval);
    
    mineCountDisplay.textContent = mines;
    timerDisplay.textContent = '000';
    gameStatus.textContent = '😊';
    
    render();
}

function placeMines(firstRow, firstCol) {
    const { rows, cols, mines } = difficulties[currentDifficulty];
    let placed = 0;
    
    while (placed < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        // Don't place mine on first click or adjacent cells
        const isNearFirst = Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1;
        
        if (board[row][col] !== -1 && !isNearFirst) {
            board[row][col] = -1;
            placed++;
        }
    }
    
    // Calculate numbers
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === -1) continue;
            board[r][c] = countAdjacentMines(r, c);
        }
    }
}

function countAdjacentMines(row, col) {
    const { rows, cols } = difficulties[currentDifficulty];
    let count = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) {
                count++;
            }
        }
    }
    
    return count;
}

function render() {
    const { rows, cols } = difficulties[currentDifficulty];
    
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    gameBoard.innerHTML = '';
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (revealed[r][c]) {
                cell.classList.add('revealed');
                if (board[r][c] === -1) {
                    cell.textContent = '💣';
                    cell.classList.add('mine');
                } else if (board[r][c] > 0) {
                    cell.textContent = board[r][c];
                    cell.dataset.number = board[r][c];
                }
            } else if (flagged[r][c]) {
                cell.classList.add('flagged');
            }
            
            cell.addEventListener('click', handleClick);
            cell.addEventListener('contextmenu', handleRightClick);
            cell.addEventListener('touchstart', handleTouchStart);
            cell.addEventListener('touchend', handleTouchEnd);
            
            gameBoard.appendChild(cell);
        }
    }
}

let touchTimer = null;
let touchStartTime = 0;

function handleTouchStart(e) {
    touchStartTime = Date.now();
    touchTimer = setTimeout(() => {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        toggleFlag(row, col);
    }, 500);
}

function handleTouchEnd(e) {
    clearTimeout(touchTimer);
    if (Date.now() - touchStartTime < 500) {
        // Short tap - reveal cell
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        if (!flagged[row][col]) {
            revealCell(row, col);
        }
    }
    e.preventDefault();
}

function handleClick(e) {
    if (gameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    if (flagged[row][col]) return;
    
    revealCell(row, col);
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    toggleFlag(row, col);
}

function toggleFlag(row, col) {
    if (revealed[row][col]) return;
    
    flagged[row][col] = !flagged[row][col];
    updateMineCount();
    render();
}

function updateMineCount() {
    const { mines } = difficulties[currentDifficulty];
    let flagCount = 0;
    
    for (let r = 0; r < flagged.length; r++) {
        for (let c = 0; c < flagged[r].length; c++) {
            if (flagged[r][c]) flagCount++;
        }
    }
    
    mineCountDisplay.textContent = Math.max(0, mines - flagCount);
}

function revealCell(row, col) {
    if (!gameStarted) {
        gameStarted = true;
        placeMines(row, col);
        startTimer();
    }
    
    if (revealed[row][col] || flagged[row][col]) return;
    
    revealed[row][col] = true;
    
    if (board[row][col] === -1) {
        // Hit a mine
        revealAllMines();
        endGame(false);
        return;
    }
    
    if (board[row][col] === 0) {
        // Reveal adjacent cells
        const { rows, cols } = difficulties[currentDifficulty];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealCell(nr, nc);
                }
            }
        }
    }
    
    render();
    checkWin();
}

function revealAllMines() {
    const { rows, cols } = difficulties[currentDifficulty];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === -1) {
                revealed[r][c] = true;
            }
        }
    }
    render();
}

function checkWin() {
    const { rows, cols, mines } = difficulties[currentDifficulty];
    let revealedCount = 0;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (revealed[r][c]) revealedCount++;
        }
    }
    
    if (revealedCount === rows * cols - mines) {
        endGame(true);
    }
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    gameStatus.textContent = won ? '😎' : '😵';
    
    if (won) {
        // Flag all remaining mines
        const { rows, cols } = difficulties[currentDifficulty];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === -1) {
                    flagged[r][c] = true;
                }
            }
        }
        mineCountDisplay.textContent = '0';
        render();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = timer.toString().padStart(3, '0');
        if (timer >= 999) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function resetGame() {
    init();
}

// Difficulty selection
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
        init();
    });
});

// Status icon click to reset
gameStatus.addEventListener('click', resetGame);

// Initialize game
init();
