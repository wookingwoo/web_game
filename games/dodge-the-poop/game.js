const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    player: {
        x: canvas.width / 2 - 25,
        y: canvas.height - 80,
        width: 50,
        height: 50,
        speed: 5
    },
    poops: [],
    score: 0,
    lives: 3,
    gameRunning: true,
    keys: {}
};

const POOP_SPEED = 3;
const POOP_SPAWN_RATE = 0.02;

function drawPlayer() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(gameState.player.x + 10, gameState.player.y + 10, 30, 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gameState.player.x + 15, gameState.player.y + 15, 8, 8);
    ctx.fillRect(gameState.player.x + 27, gameState.player.y + 15, 8, 8);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(gameState.player.x + 17, gameState.player.y + 17, 4, 4);
    ctx.fillRect(gameState.player.x + 29, gameState.player.y + 17, 4, 4);
}

function drawPoop(poop) {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(poop.x + 15, poop.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(poop.x + 15, poop.y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💩', poop.x + 15, poop.y + 20);
}

function createPoop() {
    return {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: POOP_SPEED + Math.random() * 2
    };
}

function updatePoops() {
    for (let i = gameState.poops.length - 1; i >= 0; i--) {
        const poop = gameState.poops[i];
        poop.y += poop.speed;
        
        if (poop.y > canvas.height) {
            gameState.poops.splice(i, 1);
            gameState.score += 10;
        }
    }
    
    if (Math.random() < POOP_SPAWN_RATE) {
        gameState.poops.push(createPoop());
    }
}

function checkCollisions() {
    for (let i = gameState.poops.length - 1; i >= 0; i--) {
        const poop = gameState.poops[i];
        
        if (gameState.player.x < poop.x + poop.width &&
            gameState.player.x + gameState.player.width > poop.x &&
            gameState.player.y < poop.y + poop.height &&
            gameState.player.y + gameState.player.height > poop.y) {
            
            gameState.poops.splice(i, 1);
            gameState.lives--;
            
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    }
}

function updatePlayer() {
    if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
        gameState.player.x = Math.max(0, gameState.player.x - gameState.player.speed);
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
        gameState.player.x = Math.min(canvas.width - gameState.player.width, gameState.player.x + gameState.player.speed);
    }
    if (gameState.keys['ArrowUp'] || gameState.keys['w']) {
        gameState.player.y = Math.max(0, gameState.player.y - gameState.player.speed);
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['s']) {
        gameState.player.y = Math.min(canvas.height - gameState.player.height, gameState.player.y + gameState.player.speed);
    }
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

function clearCanvas() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (!gameState.gameRunning) return;
    
    clearCanvas();
    updatePlayer();
    updatePoops();
    checkCollisions();
    
    drawPlayer();
    gameState.poops.forEach(drawPoop);
    
    updateUI();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.gameRunning = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function restartGame() {
    gameState = {
        player: {
            x: canvas.width / 2 - 25,
            y: canvas.height - 80,
            width: 50,
            height: 50,
            speed: 5
        },
        poops: [],
        score: 0,
        lives: 3,
        gameRunning: true,
        keys: {}
    };
    
    document.getElementById('gameOver').classList.add('hidden');
    updateUI();
    gameLoop();
}

document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

updateUI();
gameLoop();