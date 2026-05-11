// Breakout Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const livesDisplay = document.getElementById('lives');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winScreen = document.getElementById('winScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const clearedLevelDisplay = document.getElementById('clearedLevel');

// Game constants
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 8;

// Colors for bricks
const BRICK_COLORS = [
    '#e74c3c', // red
    '#e67e22', // orange
    '#f1c40f', // yellow
    '#2ecc71', // green
    '#3498db'  // blue
];

// Game state
let paddle = {
    x: (canvas.width - PADDLE_WIDTH) / 2,
    y: canvas.height - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    radius: BALL_RADIUS,
    speedX: 4,
    speedY: -4
};

let bricks = [];
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let ballLaunched = false;

// Input state
let leftPressed = false;
let rightPressed = false;

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            const x = col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const y = row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            bricks[row][col] = {
                x: x,
                y: y,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                alive: true,
                color: BRICK_COLORS[row % BRICK_COLORS.length],
                points: (BRICK_ROWS - row) * 10
            };
        }
    }
}

// Reset ball and paddle
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 60;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * (3 + level * 0.5);
    ball.speedY = -(4 + level * 0.3);
    ballLaunched = false;
    paddle.x = (canvas.width - PADDLE_WIDTH) / 2;
}

// Draw paddle
function drawPaddle() {
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(paddle.x + 5, paddle.y + 2, paddle.width - 10, 3);
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    const gradient = ctx.createRadialGradient(
        ball.x - 2, ball.y - 2, 0,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#ecf0f1');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Glow effect
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Draw bricks
function drawBricks() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.alive) {
                const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
                gradient.addColorStop(0, brick.color);
                gradient.addColorStop(1, shadeColor(brick.color, -20));
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
                ctx.fill();
                
                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(brick.x + 3, brick.y + 2, brick.width - 6, 4);
            }
        }
    }
}

// Helper function to shade colors
function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Paddle movement
    if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    }
    
    // Ball follows paddle before launch
    if (!ballLaunched) {
        ball.x = paddle.x + paddle.width / 2;
        return;
    }
    
    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Wall collision
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.speedX = -ball.speedX;
    }
    if (ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }
    
    // Bottom collision (lose life)
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();
        
        if (lives <= 0) {
            endGame();
        } else {
            resetBall();
        }
        return;
    }
    
    // Paddle collision
    if (ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
        
        // Calculate hit position for angle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI * 0.7;
        const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        
        ball.speedX = speed * Math.sin(angle);
        ball.speedY = -Math.abs(speed * Math.cos(angle));
        ball.y = paddle.y - ball.radius;
    }
    
    // Brick collision
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.alive) {
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height) {
                    
                    brick.alive = false;
                    score += brick.points;
                    scoreDisplay.textContent = score;
                    
                    // Determine collision side
                    const overlapLeft = ball.x + ball.radius - brick.x;
                    const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
                    const overlapTop = ball.y + ball.radius - brick.y;
                    const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);
                    
                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);
                    
                    if (minOverlapX < minOverlapY) {
                        ball.speedX = -ball.speedX;
                    } else {
                        ball.speedY = -ball.speedY;
                    }
                    
                    // Check win
                    if (checkAllBricksDestroyed()) {
                        winLevel();
                    }
                    
                    return;
                }
            }
        }
    }
}

function checkAllBricksDestroyed() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            if (bricks[row][col].alive) {
                return false;
            }
        }
    }
    return true;
}

function updateLives() {
    livesDisplay.textContent = '❤️'.repeat(lives);
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawPaddle();
    drawBall();
    
    // Draw launch instruction
    if (!ballLaunched && gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('클릭 또는 스페이스바로 발사!', canvas.width / 2, canvas.height - 100);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    
    score = 0;
    lives = 3;
    level = 1;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    updateLives();
    
    initBricks();
    resetBall();
    gameRunning = true;
}

// End game
function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Win level
function winLevel() {
    gameRunning = false;
    clearedLevelDisplay.textContent = level;
    winScreen.classList.remove('hidden');
}

// Next level
function nextLevel() {
    winScreen.classList.add('hidden');
    level++;
    levelDisplay.textContent = level;
    
    initBricks();
    resetBall();
    gameRunning = true;
}

// Restart game
function restartGame() {
    startGame();
}

// Launch ball
function launchBall() {
    if (!ballLaunched && gameRunning) {
        ballLaunched = true;
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = true;
    }
    if (e.code === 'Space') {
        e.preventDefault();
        launchBall();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = false;
    }
});

// Mouse control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    
    paddle.x = mouseX - paddle.width / 2;
    
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

canvas.addEventListener('click', launchBall);

// Touch control
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    
    paddle.x = touchX - paddle.width / 2;
    
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) {
        paddle.x = canvas.width - paddle.width;
    }
}, { passive: false });

canvas.addEventListener('touchstart', launchBall);

// Polyfill for roundRect
if (!ctx.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Start game loop
gameLoop();
