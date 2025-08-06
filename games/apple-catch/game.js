class AppleCatchGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.gameOverScreen = document.getElementById('gameOver');
        this.startScreen = document.getElementById('startScreen');
        
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        this.basket = {
            x: this.canvas.width / 2 - 30,
            y: this.canvas.height - 60,
            width: 60,
            height: 40,
            speed: 8
        };
        
        this.apples = [];
        this.appleSpeed = 2;
        this.appleSpawnRate = 0.02;
        
        this.keys = {};
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.startScreen.style.display = 'none';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.apples = [];
        this.basket.x = this.canvas.width / 2 - 30;
        this.updateUI();
        this.gameLoop();
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startGame();
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.levelElement.textContent = this.level;
    }
    
    spawnApple() {
        if (Math.random() < this.appleSpawnRate + (this.level * 0.005)) {
            this.apples.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: this.appleSpeed + (this.level * 0.5)
            });
        }
    }
    
    updateBasket() {
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.basket.x -= this.basket.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.basket.x += this.basket.speed;
        }
        
        // Keep basket within canvas bounds
        this.basket.x = Math.max(0, Math.min(this.canvas.width - this.basket.width, this.basket.x));
    }
    
    updateApples() {
        for (let i = this.apples.length - 1; i >= 0; i--) {
            const apple = this.apples[i];
            apple.y += apple.speed;
            
            // Check collision with basket
            if (this.checkCollision(apple, this.basket)) {
                this.apples.splice(i, 1);
                this.score += 10;
                
                // Level up every 100 points
                if (this.score > 0 && this.score % 100 === 0) {
                    this.level++;
                }
                
                this.updateUI();
            }
            // Remove apples that fell off screen
            else if (apple.y > this.canvas.height) {
                this.apples.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawBasket() {
        const ctx = this.ctx;
        const basket = this.basket;
        
        // Draw basket body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
        
        // Draw basket rim
        ctx.fillStyle = '#654321';
        ctx.fillRect(basket.x - 2, basket.y, basket.width + 4, 8);
        
        // Draw basket pattern
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(basket.x + (i * basket.width / 3), basket.y + 8);
            ctx.lineTo(basket.x + (i * basket.width / 3), basket.y + basket.height);
            ctx.stroke();
        }
    }
    
    drawApple(apple) {
        const ctx = this.ctx;
        
        // Draw apple body
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(apple.x + apple.width/2, apple.y + apple.height/2, apple.width/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw apple highlight
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(apple.x + apple.width/2 - 5, apple.y + apple.height/2 - 5, apple.width/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw apple stem
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(apple.x + apple.width/2 - 1, apple.y + 2, 2, 6);
        
        // Draw apple leaf
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.ellipse(apple.x + apple.width/2 + 3, apple.y + 4, 3, 2, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBackground() {
        const ctx = this.ctx;
        
        // Draw ground
        ctx.fillStyle = '#8FBC8F';
        ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        
        // Draw some clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.drawCloud(100, 50, 40);
        this.drawCloud(300, 80, 50);
        this.drawCloud(600, 40, 45);
    }
    
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size/2, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size, y, size, 0, Math.PI * 2);
        ctx.arc(x + size/2, y - size/2, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.drawBasket();
        
        this.apples.forEach(apple => {
            this.drawApple(apple);
        });
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.spawnApple();
        this.updateBasket();
        this.updateApples();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }
}

// Initialize game
let game;

function startGame() {
    if (!game) {
        game = new AppleCatchGame();
    }
    game.startGame();
}

function restartGame() {
    game.restartGame();
}

// Create game instance when page loads
window.addEventListener('DOMContentLoaded', () => {
    game = new AppleCatchGame();
});