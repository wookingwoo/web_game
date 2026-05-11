// 2048 Game Logic
const GRID_SIZE = 4;
let grid = [];
let score = 0;
let bestScore = localStorage.getItem('2048_best') || 0;
let gameWon = false;
let gameOver = false;

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const winOverlay = document.getElementById('winOverlay');
const finalScoreDisplay = document.getElementById('finalScore');

// Initialize game
function init() {
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    gameWon = false;
    gameOver = false;
    updateScore();
    addRandomTile();
    addRandomTile();
    render();
    hideOverlays();
}

function hideOverlays() {
    gameOverOverlay.classList.add('hidden');
    winOverlay.classList.add('hidden');
}

function updateScore() {
    scoreDisplay.textContent = score;
    bestScoreDisplay.textContent = bestScore;
}

function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        return { row, col };
    }
    return null;
}

function render(newTile = null) {
    gameBoard.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (grid[i][j] !== 0) {
                tile.textContent = grid[i][j];
                tile.setAttribute('data-value', grid[i][j]);
                if (newTile && newTile.row === i && newTile.col === j) {
                    tile.classList.add('new');
                }
            }
            gameBoard.appendChild(tile);
        }
    }
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    let missing = GRID_SIZE - arr.length;
    let zeros = Array(missing).fill(0);
    return zeros.concat(arr);
}

function combine(row) {
    for (let i = GRID_SIZE - 1; i > 0; i--) {
        if (row[i] === row[i - 1] && row[i] !== 0) {
            row[i] *= 2;
            score += row[i];
            row[i - 1] = 0;
            if (row[i] === 2048 && !gameWon) {
                gameWon = true;
                setTimeout(() => showWin(), 300);
            }
        }
    }
    return row;
}

function moveRight() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid[i].slice();
        row = slide(row);
        row = combine(row);
        row = slide(row);
        if (row.join(',') !== grid[i].join(',')) {
            moved = true;
        }
        grid[i] = row;
    }
    return moved;
}

function moveLeft() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        let row = grid[i].slice().reverse();
        row = slide(row);
        row = combine(row);
        row = slide(row);
        row = row.reverse();
        if (row.join(',') !== grid[i].join(',')) {
            moved = true;
        }
        grid[i] = row;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
        let column = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            column.push(grid[i][j]);
        }
        let original = column.join(',');
        column = column.reverse();
        column = slide(column);
        column = combine(column);
        column = slide(column);
        column = column.reverse();
        if (column.join(',') !== original) {
            moved = true;
        }
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i][j] = column[i];
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let j = 0; j < GRID_SIZE; j++) {
        let column = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            column.push(grid[i][j]);
        }
        let original = column.join(',');
        column = slide(column);
        column = combine(column);
        column = slide(column);
        if (column.join(',') !== original) {
            moved = true;
        }
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i][j] = column[i];
        }
    }
    return moved;
}

function checkGameOver() {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) return false;
        }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }

    return true;
}

function showGameOver() {
    gameOver = true;
    finalScoreDisplay.textContent = score;
    gameOverOverlay.classList.remove('hidden');
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('2048_best', bestScore);
        updateScore();
    }
}

function showWin() {
    winOverlay.classList.remove('hidden');
}

function continueGame() {
    winOverlay.classList.add('hidden');
}

function resetGame() {
    init();
}

function handleMove(direction) {
    if (gameOver) return;

    let moved = false;
    switch (direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }

    if (moved) {
        const newTile = addRandomTile();
        updateScore();
        render(newTile);
        
        if (checkGameOver()) {
            setTimeout(() => showGameOver(), 300);
        }
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            handleMove('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            handleMove('right');
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            handleMove('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            handleMove('down');
            break;
    }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

gameBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

gameBoard.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                handleMove('right');
            } else {
                handleMove('left');
            }
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                handleMove('down');
            } else {
                handleMove('up');
            }
        }
    }
}

// Initialize game on load
init();
