// Fruit Ninja Game Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const bestScoreDisplay = document.getElementById('bestScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');

// Fruits and their colors
const FRUITS = [
    { emoji: '🍎', color: '#e74c3c', points: 1 },
    { emoji: '🍊', color: '#e67e22', points: 1 },
    { emoji: '🍋', color: '#f1c40f', points: 1 },
    { emoji: '🍇', color: '#9b59b6', points: 2 },
    { emoji: '🍉', color: '#27ae60', points: 2 },
    { emoji: '🍓', color: '#e74c3c', points: 1 },
    { emoji: '🥝', color: '#2ecc71', points: 2 },
    { emoji: '🍑', color: '#f39c12', points: 1 }
];

const BOMB = { emoji: '💣', color: '#2c3e50' };

// Game state
let fruits = [];
let sliceTrail = [];
let score = 0;
let lives = 3;
let gameRunning = false;
let spawnInterval = null;
let bestScore = localStorage.getItem('fruit_best') || 0;
let isSlicing = false;
let lastMousePos = null;

// Display best score
bestScoreDisplay.textContent = bestScore;

// Fruit class
class Fruit {
    constructor() {
        this.x = Math.random() * (canvas.width - 60) + 30;
        this.y = canvas.height + 30;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = -(Math.random() * 5 + 10);
        this.gravity = 0.3;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.size = 40;
        this.sliced = false;
        this.missed = false;
        
        // 15% chance for bomb
        if (Math.random() < 0.15) {
            this.type = 'bomb';
            this.emoji = BOMB.emoji;
            this.color = BOMB.color;
            this.points = 0;
        } else {
            this.type = 'fruit';
            const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            this.emoji = fruit.emoji;
            this.color = fruit.color;
            this.points = fruit.points;
        }
    }
    
    update() {
        this.velocityY += this.gravity;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.rotation += this.rotationSpeed;
        
        // Check if fruit went off screen without being sliced
        if (this.y > canvas.height + 50 && !this.sliced && this.type === 'fruit') {
            this.missed = true;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.sliced) {
            // Draw sliced effect
            ctx.globalAlpha = 0.5;
        }
        
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        
        ctx.restore();
    }
    
    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.size / 2 + 10;
    }
}

// Slice particles
class SliceParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 10 + 5;
        this.velocityX = (Math.random() - 0.5) * 8;
        this.velocityY = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.2;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

// Spawn fruit
function spawnFruit() {
    if (!gameRunning) return;
    fruits.push(new Fruit());
}

// Draw slice trail
function drawSliceTrail() {
    if (sliceTrail.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(sliceTrail[0].x, sliceTrail[0].y);
    
    for (let i = 1; i < sliceTrail.length; i++) {
        ctx.lineTo(sliceTrail[i].x, sliceTrail[i].y);
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();
}

// Check slice collision
function checkSlice(x, y) {
    if (!lastMousePos) return;
    
    fruits.forEach(fruit => {
        if (fruit.sliced) return;
        
        // Check if the slice line intersects with the fruit
        if (fruit.containsPoint(x, y) || fruit.containsPoint(lastMousePos.x, lastMousePos.y)) {
            fruit.sliced = true;
            
            if (fruit.type === 'bomb') {
                // Hit bomb - lose all lives
                lives = 0;
                updateLives();
                endGame();
            } else {
                // Score points
                score += fruit.points;
                scoreDisplay.textContent = score;
                
                // Create particles
                for (let i = 0; i < 8; i++) {
                    particles.push(new SliceParticle(fruit.x, fruit.y, fruit.color));
                }
            }
        }
    });
}

// Update lives display
function updateLives() {
    livesDisplay.textContent = '❤️'.repeat(Math.max(0, lives));
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'rgba(26, 37, 47, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Update and draw fruits
    fruits = fruits.filter(fruit => {
        fruit.update();
        fruit.draw();
        
        // Remove missed fruits and decrease lives
        if (fruit.missed && !fruit.sliced) {
            lives--;
            updateLives();
            if (lives <= 0) {
                endGame();
            }
            return false;
        }
        
        // Remove fruits that are off screen
        return fruit.y < canvas.height + 100;
    });
    
    // Draw slice trail
    drawSliceTrail();
    
    // Fade out slice trail
    if (sliceTrail.length > 0) {
        sliceTrail = sliceTrail.slice(-10);
    }
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    fruits = [];
    particles = [];
    sliceTrail = [];
    score = 0;
    lives = 3;
    gameRunning = true;
    
    scoreDisplay.textContent = score;
    updateLives();
    
    // Clear canvas
    ctx.fillStyle = '#1a252f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Spawn fruits at intervals
    spawnInterval = setInterval(() => {
        const count = Math.random() < 0.3 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            setTimeout(() => spawnFruit(), i * 200);
        }
    }, 1000);
    
    gameLoop();
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('fruit_best', bestScore);
        bestScoreDisplay.textContent = bestScore;
    }
    
    finalScoreDisplay.textContent = score;
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

// Restart game
function restartGame() {
    startGame();
}

// Mouse/Touch handlers
function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startSlice(e) {
    if (!gameRunning) return;
    isSlicing = true;
    const pos = getCanvasPos(e);
    sliceTrail = [pos];
    lastMousePos = pos;
}

function moveSlice(e) {
    if (!gameRunning || !isSlicing) return;
    e.preventDefault();
    
    const pos = getCanvasPos(e);
    sliceTrail.push(pos);
    checkSlice(pos.x, pos.y);
    lastMousePos = pos;
}

function endSlice() {
    isSlicing = false;
    lastMousePos = null;
    sliceTrail = [];
}

// Event listeners
canvas.addEventListener('mousedown', startSlice);
canvas.addEventListener('mousemove', moveSlice);
canvas.addEventListener('mouseup', endSlice);
canvas.addEventListener('mouseleave', endSlice);

canvas.addEventListener('touchstart', startSlice);
canvas.addEventListener('touchmove', moveSlice);
canvas.addEventListener('touchend', endSlice);

// Initial draw
ctx.fillStyle = '#1a252f';
ctx.fillRect(0, 0, canvas.width, canvas.height);
