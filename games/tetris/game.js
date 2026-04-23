// Tetris Game Implementation
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = canvas.width / COLS;
const NEXT_BLOCK_SIZE = 20;
const HOLD_BLOCK_SIZE = 20;

// Colors for tetrominoes
const COLORS = [
    null,
    '#00f0f0', // I - Cyan
    '#0000f0', // J - Blue
    '#f0a000', // L - Orange
    '#f0f000', // O - Yellow
    '#00f000', // S - Green
    '#a000f0', // T - Purple
    '#f00000'  // Z - Red
];

// Tetromino shapes
const SHAPES = [
    null,
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // O
    [
        [4, 4],
        [4, 4]
    ],
    // S
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    // T
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // Z
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// Game state
let board = [];
let currentPiece = null;
let nextPieces = [];
let holdPiece = null;
let canHold = true;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let paused = false;
let gameStarted = false;
let dropInterval = 1000;
let lastDropTime = 0;
let animationId = null;

// Piece class
class Piece {
    constructor(type) {
        this.type = type;
        this.shape = SHAPES[type].map(row => [...row]);
        this.color = COLORS[type];
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    rotate() {
        const rotated = this.shape[0].map((_, i) =>
            this.shape.map(row => row[i]).reverse()
        );
        return rotated;
    }
}

// Initialize game board
function createBoard() {
    board = [];
    for (let row = 0; row < ROWS; row++) {
        board.push(new Array(COLS).fill(0));
    }
}

// Generate random piece
function randomPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    return new Piece(type);
}

// Fill next pieces queue
function fillNextPieces() {
    while (nextPieces.length < 3) {
        nextPieces.push(randomPiece());
    }
}

// Get next piece
function getNextPiece() {
    fillNextPieces();
    const piece = nextPieces.shift();
    fillNextPieces();
    return piece;
}

// Check collision
function collision(piece, offsetX = 0, offsetY = 0, shape = piece.shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = piece.x + col + offsetX;
                const newY = piece.y + row + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Lock piece to board
function lockPiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const y = currentPiece.y + row;
                const x = currentPiece.x + col;
                if (y >= 0) {
                    board[y][x] = currentPiece.type;
                }
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(new Array(COLS).fill(0));
            linesCleared++;
            row++; // Check same row again
        }
    }

    if (linesCleared > 0) {
        // Scoring based on lines cleared
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        lines += linesCleared;

        // Level up every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }

        updateStats();
    }
}

// Move piece
function movePiece(dir) {
    if (!collision(currentPiece, dir, 0)) {
        currentPiece.x += dir;
    }
}

// Rotate piece
function rotatePiece() {
    const rotated = currentPiece.rotate();
    
    // Try normal rotation
    if (!collision(currentPiece, 0, 0, rotated)) {
        currentPiece.shape = rotated;
        return;
    }
    
    // Wall kick - try moving left or right
    const kicks = [-1, 1, -2, 2];
    for (const kick of kicks) {
        if (!collision(currentPiece, kick, 0, rotated)) {
            currentPiece.x += kick;
            currentPiece.shape = rotated;
            return;
        }
    }
}

// Drop piece
function dropPiece() {
    if (!collision(currentPiece, 0, 1)) {
        currentPiece.y++;
        return true;
    }
    return false;
}

// Hard drop
function hardDrop() {
    while (dropPiece()) {
        score += 2;
    }
    lockAndGetNext();
}

// Soft drop
function softDrop() {
    if (dropPiece()) {
        score += 1;
        updateStats();
    }
}

// Hold piece
function holdCurrentPiece() {
    if (!canHold) return;

    if (holdPiece === null) {
        holdPiece = new Piece(currentPiece.type);
        currentPiece = getNextPiece();
    } else {
        const temp = new Piece(holdPiece.type);
        holdPiece = new Piece(currentPiece.type);
        currentPiece = temp;
    }

    canHold = false;
    drawHold();
}

// Get ghost piece Y position
function getGhostY() {
    let ghostY = currentPiece.y;
    while (!collision(currentPiece, 0, ghostY - currentPiece.y + 1)) {
        ghostY++;
    }
    return ghostY;
}

// Lock piece and get next
function lockAndGetNext() {
    lockPiece();
    clearLines();
    currentPiece = getNextPiece();
    canHold = true;

    // Check game over
    if (collision(currentPiece)) {
        gameOver = true;
        document.getElementById('finalScore').textContent = score;
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }

    drawNext();
}

// Draw functions
function drawBlock(context, x, y, color, size = BLOCK_SIZE) {
    const padding = 1;
    
    // Main block
    context.fillStyle = color;
    context.fillRect(x * size + padding, y * size + padding, size - padding * 2, size - padding * 2);
    
    // Highlight
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * size + padding, y * size + padding, size - padding * 2, (size - padding * 2) / 4);
    
    // Shadow
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * size + padding, y * size + size - padding - (size - padding * 2) / 4, size - padding * 2, (size - padding * 2) / 4);
}

function drawBoard() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw locked pieces
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(ctx, col, row, COLORS[board[row][col]]);
            }
        }
    }
}

function drawPiece() {
    if (!currentPiece) return;

    // Draw ghost piece
    const ghostY = getGhostY();
    ctx.globalAlpha = 0.3;
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(ctx, currentPiece.x + col, ghostY + row, currentPiece.color);
            }
        }
    }
    ctx.globalAlpha = 1;

    // Draw current piece
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(ctx, currentPiece.x + col, currentPiece.y + row, currentPiece.color);
            }
        }
    }
}

function drawNext() {
    nextCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    for (let i = 0; i < Math.min(nextPieces.length, 3); i++) {
        const piece = nextPieces[i];
        const offsetX = (nextCanvas.width - piece.shape[0].length * NEXT_BLOCK_SIZE) / 2;
        const offsetY = i * 100 + 10;

        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    nextCtx.fillStyle = piece.color;
                    nextCtx.fillRect(
                        offsetX + col * NEXT_BLOCK_SIZE,
                        offsetY + row * NEXT_BLOCK_SIZE,
                        NEXT_BLOCK_SIZE - 2,
                        NEXT_BLOCK_SIZE - 2
                    );
                }
            }
        }
    }
}

function drawHold() {
    holdCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (holdPiece) {
        const offsetX = (holdCanvas.width - holdPiece.shape[0].length * HOLD_BLOCK_SIZE) / 2;
        const offsetY = (holdCanvas.height - holdPiece.shape.length * HOLD_BLOCK_SIZE) / 2;

        for (let row = 0; row < holdPiece.shape.length; row++) {
            for (let col = 0; col < holdPiece.shape[row].length; col++) {
                if (holdPiece.shape[row][col]) {
                    holdCtx.fillStyle = canHold ? holdPiece.color : 'rgba(128, 128, 128, 0.5)';
                    holdCtx.fillRect(
                        offsetX + col * HOLD_BLOCK_SIZE,
                        offsetY + row * HOLD_BLOCK_SIZE,
                        HOLD_BLOCK_SIZE - 2,
                        HOLD_BLOCK_SIZE - 2
                    );
                }
            }
        }
    }
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Game loop
function gameLoop(timestamp) {
    if (gameOver || paused || !gameStarted) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    if (timestamp - lastDropTime > dropInterval) {
        if (!dropPiece()) {
            lockAndGetNext();
        }
        lastDropTime = timestamp;
    }

    drawBoard();
    drawPiece();

    animationId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    
    createBoard();
    nextPieces = [];
    fillNextPieces();
    currentPiece = getNextPiece();
    holdPiece = null;
    canHold = true;
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    paused = false;
    gameStarted = true;
    dropInterval = 1000;
    lastDropTime = 0;

    updateStats();
    drawNext();
    drawHold();
    
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    animationId = requestAnimationFrame(gameLoop);
}

// Restart game
function restartGame() {
    document.getElementById('gameOverOverlay').classList.add('hidden');
    startGame();
}

// Toggle pause
function togglePause() {
    if (gameOver || !gameStarted) return;
    
    paused = !paused;
    if (paused) {
        document.getElementById('pauseOverlay').classList.remove('hidden');
    } else {
        document.getElementById('pauseOverlay').classList.add('hidden');
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameStarted || gameOver) return;

    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (!paused) movePiece(-1);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (!paused) movePiece(1);
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (!paused) rotatePiece();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (!paused) softDrop();
            break;
        case ' ':
            if (!paused) hardDrop();
            break;
        case 'c':
        case 'C':
            if (!paused) holdCurrentPiece();
            break;
        case 'p':
        case 'P':
        case 'Escape':
            togglePause();
            break;
    }
    
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

// Mobile controls
document.getElementById('btnLeft')?.addEventListener('click', () => movePiece(-1));
document.getElementById('btnRight')?.addEventListener('click', () => movePiece(1));
document.getElementById('btnRotate')?.addEventListener('click', () => rotatePiece());
document.getElementById('btnDown')?.addEventListener('click', () => softDrop());
document.getElementById('btnDrop')?.addEventListener('click', () => hardDrop());
document.getElementById('btnHold')?.addEventListener('click', () => holdCurrentPiece());

// Touch controls for swipe
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    if (!gameStarted || gameOver || paused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;
    
    const minSwipeDistance = 30;
    
    if (deltaTime < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Tap - rotate
        rotatePiece();
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            // Horizontal swipe
            if (deltaX > 0) {
                movePiece(1);
            } else {
                movePiece(-1);
            }
        }
    } else {
        if (deltaY > minSwipeDistance) {
            // Swipe down - hard drop
            if (deltaY > 100) {
                hardDrop();
            } else {
                softDrop();
            }
        }
    }
    
    e.preventDefault();
});

// Initialize
drawBoard();
drawNext();
drawHold();
