// Flappy Bird Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPAWN_INTERVAL = 100;

// Game state
let bird = {
    x: 80,
    y: 300,
    width: 40,
    height: 30,
    velocity: 0,
    rotation: 0
};

let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('flappy_best') || 0;
let gameRunning = false;
let frameCount = 0;

// Update best score display
bestScoreDisplay.textContent = bestScore;

// Bird drawing
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    
    // Body
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(-5, 5, 12, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(10, -5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(12, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(25, 3);
    ctx.lineTo(15, 6);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Pipe drawing
function drawPipe(pipe) {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
    gradient.addColorStop(0, '#27ae60');
    gradient.addColorStop(0.5, '#2ecc71');
    gradient.addColorStop(1, '#27ae60');
    
    ctx.fillStyle = gradient;
    
    // Top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    // Top pipe cap
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
    
    // Bottom pipe
    const bottomY = pipe.topHeight + PIPE_GAP;
    ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, canvas.height - bottomY);
    // Bottom pipe cap
    ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 30);
    
    // Pipe highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(pipe.x + 5, 0, 10, pipe.topHeight - 30);
    ctx.fillRect(pipe.x + 5, bottomY + 30, 10, canvas.height - bottomY - 30);
}

// Ground drawing
function drawGround() {
    ctx.fillStyle = '#c4a000';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    ctx.fillStyle = '#8b7500';
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i, canvas.height - 50, 15, 5);
    }
}

// Background
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#70c5ce');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(50, 80);
    drawCloud(200, 120);
    drawCloud(320, 60);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 30, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
    ctx.fill();
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    frameCount++;
    
    // Bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 1.5);
    
    // Spawn pipes
    if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
        const minHeight = 80;
        const maxHeight = canvas.height - PIPE_GAP - 130;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            passed: false
        });
    }
    
    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;
        
        // Score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }
    });
    
    // Collision detection
    if (checkCollision()) {
        endGame();
    }
}

function checkCollision() {
    // Ground collision
    if (bird.y + bird.height > canvas.height - 50 || bird.y < 0) {
        return true;
    }
    
    // Pipe collision
    for (let pipe of pipes) {
        const birdRight = bird.x + bird.width - 5;
        const birdLeft = bird.x + 5;
        const birdTop = bird.y + 5;
        const birdBottom = bird.y + bird.height - 5;
        
        const pipeRight = pipe.x + PIPE_WIDTH;
        const pipeLeft = pipe.x;
        
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
                return true;
            }
        }
    }
    
    return false;
}

// Draw game
function draw() {
    drawBackground();
    
    pipes.forEach(pipe => drawPipe(pipe));
    
    drawGround();
    drawBird();
    
    // Score on canvas
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(score, canvas.width / 2, 80);
    ctx.fillText(score, canvas.width / 2, 80);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Jump
function jump() {
    if (!gameRunning) return;
    bird.velocity = JUMP_FORCE;
}

// Start game
function startGame() {
    startScreen.classList.add('hidden');
    gameRunning = true;
    bird = {
        x: 80,
        y: 300,
        width: 40,
        height: 30,
        velocity: 0,
        rotation: 0
    };
    pipes = [];
    score = 0;
    frameCount = 0;
    scoreDisplay.textContent = 0;
}

// End game
function endGame() {
    gameRunning = false;
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappy_best', bestScore);
        bestScoreDisplay.textContent = bestScore;
    }
    
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Restart game
function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning && startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden')) {
            startGame();
        } else if (!gameRunning && !startScreen.classList.contains('hidden')) {
            startGame();
        } else {
            jump();
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning) {
        jump();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning) {
        jump();
    }
});

// Start game loop
gameLoop();
