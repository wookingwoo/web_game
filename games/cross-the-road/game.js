const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    player: {
        x: canvas.width / 2 - 20,
        y: canvas.height - 50,
        width: 40,
        height: 40,
        speed: 4
    },
    cars: [],
    score: 0,
    level: 1,
    gameRunning: true,
    keys: {},
    lanes: [
        { y: 450, direction: 1, speed: 2 },
        { y: 400, direction: -1, speed: 2.5 },
        { y: 350, direction: 1, speed: 3 },
        { y: 300, direction: -1, speed: 2 },
        { y: 250, direction: 1, speed: 3.5 },
        { y: 200, direction: -1, speed: 2.8 },
        { y: 150, direction: 1, speed: 2.2 }
    ]
};

const LANE_HEIGHT = 50;
const CAR_SPAWN_RATE = 0.015;

function drawPlayer() {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(gameState.player.x + 5, gameState.player.y + 5, 30, 30);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(gameState.player.x + 10, gameState.player.y + 10, 5, 5);
    ctx.fillRect(gameState.player.x + 25, gameState.player.y + 10, 5, 5);
    
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(gameState.player.x + 12, gameState.player.y + 18, 16, 8);
    
    ctx.fillStyle = '#000000';
    ctx.font = '25px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐔', gameState.player.x + 20, gameState.player.y + 28);
}

function drawCar(car) {
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(car.x + 5, car.y + 5, car.width - 10, car.height - 10);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(car.x + 2, car.y + car.height - 8, 8, 6);
    ctx.fillRect(car.x + car.width - 10, car.y + car.height - 8, 8, 6);
    ctx.fillRect(car.x + 2, car.y + 2, 8, 6);
    ctx.fillRect(car.x + car.width - 10, car.y + 2, 8, 6);
}

function drawRoad() {
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#36454F';
    for (let i = 0; i < gameState.lanes.length; i++) {
        const lane = gameState.lanes[i];
        ctx.fillRect(0, lane.y, canvas.width, LANE_HEIGHT);
    }
    
    ctx.fillStyle = '#FFFF00';
    ctx.setLineDash([20, 15]);
    for (let i = 0; i < gameState.lanes.length - 1; i++) {
        const y = gameState.lanes[i].y + LANE_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFF00';
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 500, canvas.width, 100);
    ctx.fillRect(0, 0, canvas.width, 100);
}

function createCar(lane, laneIndex) {
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];
    const startX = lane.direction === 1 ? -80 : canvas.width;
    
    return {
        x: startX,
        y: lane.y + 5,
        width: 70,
        height: 40,
        speed: lane.speed * gameState.level * 0.8,
        direction: lane.direction,
        color: colors[Math.floor(Math.random() * colors.length)],
        lane: laneIndex
    };
}

function updateCars() {
    for (let i = gameState.cars.length - 1; i >= 0; i--) {
        const car = gameState.cars[i];
        car.x += car.speed * car.direction;
        
        if ((car.direction === 1 && car.x > canvas.width) || 
            (car.direction === -1 && car.x < -car.width)) {
            gameState.cars.splice(i, 1);
        }
    }
    
    if (Math.random() < CAR_SPAWN_RATE + (gameState.level * 0.005)) {
        const laneIndex = Math.floor(Math.random() * gameState.lanes.length);
        const lane = gameState.lanes[laneIndex];
        
        const tooClose = gameState.cars.some(car => 
            car.lane === laneIndex && 
            Math.abs(car.x - (lane.direction === 1 ? -80 : canvas.width)) < 150
        );
        
        if (!tooClose) {
            gameState.cars.push(createCar(lane, laneIndex));
        }
    }
}

function checkCollisions() {
    for (const car of gameState.cars) {
        if (gameState.player.x < car.x + car.width &&
            gameState.player.x + gameState.player.width > car.x &&
            gameState.player.y < car.y + car.height &&
            gameState.player.y + gameState.player.height > car.y) {
            
            gameOver();
            return;
        }
    }
    
    if (gameState.player.y <= 50) {
        levelComplete();
    }
}

function updatePlayer() {
    const oldX = gameState.player.x;
    const oldY = gameState.player.y;
    
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
    
    if (gameState.player.y < oldY) {
        gameState.score += 1;
    }
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (!gameState.gameRunning) return;
    
    clearCanvas();
    drawRoad();
    updatePlayer();
    updateCars();
    checkCollisions();
    
    drawPlayer();
    gameState.cars.forEach(drawCar);
    
    updateUI();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.gameRunning = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function levelComplete() {
    gameState.gameRunning = false;
    gameState.score += 100 * gameState.level;
    document.getElementById('levelComplete').classList.remove('hidden');
}

function nextLevel() {
    gameState.level++;
    gameState.player.x = canvas.width / 2 - 20;
    gameState.player.y = canvas.height - 50;
    gameState.cars = [];
    gameState.gameRunning = true;
    
    document.getElementById('levelComplete').classList.add('hidden');
    updateUI();
    gameLoop();
}

function restartGame() {
    gameState = {
        player: {
            x: canvas.width / 2 - 20,
            y: canvas.height - 50,
            width: 40,
            height: 40,
            speed: 4
        },
        cars: [],
        score: 0,
        level: 1,
        gameRunning: true,
        keys: {},
        lanes: [
            { y: 450, direction: 1, speed: 2 },
            { y: 400, direction: -1, speed: 2.5 },
            { y: 350, direction: 1, speed: 3 },
            { y: 300, direction: -1, speed: 2 },
            { y: 250, direction: 1, speed: 3.5 },
            { y: 200, direction: -1, speed: 2.8 },
            { y: 150, direction: 1, speed: 2.2 }
        ]
    };
    
    document.getElementById('gameOver').classList.add('hidden');
    updateUI();
    gameLoop();
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    gameState.keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

updateUI();
gameLoop();