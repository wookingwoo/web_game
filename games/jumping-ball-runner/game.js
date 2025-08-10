const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const groundY = canvas.height - 30;
const ball = { x: 50, y: groundY - 20, radius: 20, dy: 0, jumping: false };
const gravity = 0.6;
const jumpPower = -12;
const obstacles = [];
let frame = 0;
let score = 0;
let gameRunning = true;

function spawnObstacle() {
    const size = 40;
    obstacles.push({ x: canvas.width, y: groundY - size, width: size, height: size });
}

function update() {
    if (!gameRunning) return;
    frame++;
    if (frame % 120 === 0) spawnObstacle();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        ob.x -= 6;
        if (ob.x + ob.width < 0) {
            obstacles.splice(i, 1);
            score++;
            document.getElementById('score').textContent = score;
        }
    }

    ball.dy += gravity;
    ball.y += ball.dy;
    if (ball.y > groundY - ball.radius) {
        ball.y = groundY - ball.radius;
        ball.dy = 0;
        ball.jumping = false;
    }

    for (const ob of obstacles) {
        if (
            ball.x + ball.radius > ob.x &&
            ball.x - ball.radius < ob.x + ob.width &&
            ball.y + ball.radius > ob.y
        ) {
            return gameOver();
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#eee';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2ecc71';
    for (const ob of obstacles) {
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    }
}

function jump() {
    if (!ball.jumping) {
        ball.dy = jumpPower;
        ball.jumping = true;
    }
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function restartGame() {
    obstacles.length = 0;
    score = 0;
    document.getElementById('score').textContent = score;
    frame = 0;
    ball.y = groundY - ball.radius;
    ball.dy = 0;
    ball.jumping = false;
    gameRunning = true;
    document.getElementById('gameOver').classList.add('hidden');
    update();
}

update();
