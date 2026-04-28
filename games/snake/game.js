// Snake Game - Neon Edition

// ==================== 게임 설정 ====================
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// 난이도별 설정
const DIFFICULTY_SETTINGS = {
    easy: {
        speed: 150,
        points: 10,
        name: 'EASY',
        color: '#00ff00'
    },
    normal: {
        speed: 100,
        points: 15,
        name: 'NORMAL',
        color: '#ffff00'
    },
    hard: {
        speed: 60,
        points: 25,
        name: 'HARD',
        color: '#ff0066'
    }
};

// ==================== 게임 상태 변수 ====================
let canvas, ctx;
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let currentDifficulty = 'normal';
let gameStarted = false;

// DOM 요소
let startScreen, gameArea, gameOverScreen;
let scoreDisplay, highScoreDisplay, levelDisplay;
let finalScoreDisplay, finalHighScoreDisplay, newRecordDisplay;
let pauseOverlay;

// ==================== 초기화 ====================
document.addEventListener('DOMContentLoaded', () => {
    // 캔버스 초기화
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // DOM 요소 참조
    startScreen = document.getElementById('startScreen');
    gameArea = document.getElementById('gameArea');
    gameOverScreen = document.getElementById('gameOverScreen');
    
    scoreDisplay = document.getElementById('score');
    highScoreDisplay = document.getElementById('highScore');
    levelDisplay = document.getElementById('level');
    
    finalScoreDisplay = document.getElementById('finalScore');
    finalHighScoreDisplay = document.getElementById('finalHighScore');
    newRecordDisplay = document.getElementById('newRecord');
    
    pauseOverlay = document.getElementById('pauseOverlay');
    
    // 최고 점수 불러오기
    loadHighScore();
    
    // 키보드 이벤트 리스너
    document.addEventListener('keydown', handleKeyDown);
    
    // 초기 화면 렌더링
    drawStartScreen();
});

// ==================== 최고 점수 저장/불러오기 ====================
function loadHighScore() {
    const saved = localStorage.getItem(`snake_highscore_${currentDifficulty}`);
    highScore = saved ? parseInt(saved) : 0;
    if (highScoreDisplay) {
        highScoreDisplay.textContent = highScore;
    }
}

function saveHighScore() {
    localStorage.setItem(`snake_highscore_${currentDifficulty}`, highScore.toString());
}

// ==================== 난이도 선택 ====================
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    loadHighScore();
    startGame();
}

// ==================== 게임 시작 ====================
function startGame() {
    // 화면 전환
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');
    
    // 게임 상태 초기화
    initializeGame();
    
    // 게임 루프 시작
    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    levelDisplay.textContent = settings.name;
    levelDisplay.style.color = settings.color;
    
    gameLoop = setInterval(gameUpdate, settings.speed);
    gameStarted = true;
}

function initializeGame() {
    // 뱀 초기화 (화면 중앙에서 시작)
    const startX = Math.floor(GRID_SIZE / 2);
    const startY = Math.floor(GRID_SIZE / 2);
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    
    // 방향 초기화
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    // 점수 초기화
    score = 0;
    scoreDisplay.textContent = score;
    highScoreDisplay.textContent = highScore;
    
    // 상태 초기화
    isPaused = false;
    isGameOver = false;
    pauseOverlay.classList.add('hidden');
    
    // 먹이 생성
    spawnFood();
}

// ==================== 먹이 생성 ====================
function spawnFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);
        
        // 뱀 몸체와 겹치지 않는지 확인
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

// ==================== 키보드 입력 처리 ====================
function handleKeyDown(e) {
    // 시작 화면에서는 무시
    if (!gameStarted && !isGameOver) return;
    
    switch (e.key) {
        // 위로 이동
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) { // 아래로 가는 중이 아닐 때만
                nextDirection = { x: 0, y: -1 };
            }
            e.preventDefault();
            break;
            
        // 아래로 이동
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) { // 위로 가는 중이 아닐 때만
                nextDirection = { x: 0, y: 1 };
            }
            e.preventDefault();
            break;
            
        // 왼쪽으로 이동
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) { // 오른쪽으로 가는 중이 아닐 때만
                nextDirection = { x: -1, y: 0 };
            }
            e.preventDefault();
            break;
            
        // 오른쪽으로 이동
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) { // 왼쪽으로 가는 중이 아닐 때만
                nextDirection = { x: 1, y: 0 };
            }
            e.preventDefault();
            break;
            
        // 일시정지
        case 'p':
        case 'P':
            if (gameStarted && !isGameOver) {
                togglePause();
            }
            break;
            
        // 재시작 (게임 오버 시)
        case 'Enter':
            if (isGameOver) {
                restartGame();
            }
            break;
    }
}

// ==================== 게임 업데이트 (메인 루프) ====================
function gameUpdate() {
    if (isPaused || isGameOver) return;
    
    // 방향 업데이트
    direction = { ...nextDirection };
    
    // 새 머리 위치 계산
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // 충돌 체크
    if (checkCollision(newHead)) {
        gameOver();
        return;
    }
    
    // 뱀 이동 (머리 추가)
    snake.unshift(newHead);
    
    // 먹이 먹었는지 확인
    if (newHead.x === food.x && newHead.y === food.y) {
        // 점수 증가
        const settings = DIFFICULTY_SETTINGS[currentDifficulty];
        score += settings.points;
        scoreDisplay.textContent = score;
        
        // 최고 점수 갱신 확인
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
        }
        
        // 새 먹이 생성
        spawnFood();
    } else {
        // 먹이를 먹지 않았으면 꼬리 제거
        snake.pop();
    }
    
    // 화면 렌더링
    render();
}

// ==================== 충돌 체크 ====================
function checkCollision(head) {
    // 벽 충돌
    if (head.x < 0 || head.x >= GRID_SIZE || 
        head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 자기 몸 충돌 (머리 제외)
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    return false;
}

// ==================== 렌더링 ====================
function render() {
    // 캔버스 클리어
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 그리드 그리기 (선택적)
    drawGrid();
    
    // 먹이 그리기
    drawFood();
    
    // 뱀 그리기
    drawSnake();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
        // 세로선
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        // 가로선
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        
        // 그라데이션 색상 (머리는 밝고 꼬리로 갈수록 어두워짐)
        const brightness = Math.max(0.4, 1 - (index / snake.length) * 0.6);
        const green = Math.floor(255 * brightness);
        
        // 네온 글로우 효과
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = index === 0 ? 15 : 10;
        
        // 뱀 세그먼트 그리기
        ctx.fillStyle = index === 0 
            ? '#00ff00'  // 머리는 밝은 녹색
            : `rgb(0, ${green}, 0)`;  // 몸통은 그라데이션
        
        // 약간의 패딩을 두고 그리기
        const padding = 1;
        ctx.fillRect(
            x + padding, 
            y + padding, 
            CELL_SIZE - padding * 2, 
            CELL_SIZE - padding * 2
        );
        
        // 머리에 눈 그리기
        if (index === 0) {
            drawSnakeEyes(x, y);
        }
    });
    
    // 그림자 효과 리셋
    ctx.shadowBlur = 0;
}

function drawSnakeEyes(x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 5;
    
    const eyeSize = 3;
    const eyeOffset = CELL_SIZE / 3;
    
    // 방향에 따라 눈 위치 조정
    let eye1X, eye1Y, eye2X, eye2Y;
    
    if (direction.x === 1) { // 오른쪽
        eye1X = x + CELL_SIZE - eyeOffset;
        eye1Y = y + eyeOffset;
        eye2X = x + CELL_SIZE - eyeOffset;
        eye2Y = y + CELL_SIZE - eyeOffset;
    } else if (direction.x === -1) { // 왼쪽
        eye1X = x + eyeOffset;
        eye1Y = y + eyeOffset;
        eye2X = x + eyeOffset;
        eye2Y = y + CELL_SIZE - eyeOffset;
    } else if (direction.y === -1) { // 위
        eye1X = x + eyeOffset;
        eye1Y = y + eyeOffset;
        eye2X = x + CELL_SIZE - eyeOffset;
        eye2Y = y + eyeOffset;
    } else { // 아래
        eye1X = x + eyeOffset;
        eye1Y = y + CELL_SIZE - eyeOffset;
        eye2X = x + CELL_SIZE - eyeOffset;
        eye2Y = y + CELL_SIZE - eyeOffset;
    }
    
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawFood() {
    const x = food.x * CELL_SIZE;
    const y = food.y * CELL_SIZE;
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 2;
    
    // 네온 글로우 효과
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = 20;
    
    // 먹이 (원형)
    ctx.fillStyle = '#ff0066';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX - radius/3, centerY - radius/3, radius/4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawStartScreen() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Select Difficulty', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.fillText('to Start', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 25);
}

// ==================== 일시정지 ====================
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
    }
}

// ==================== 게임 오버 ====================
function gameOver() {
    isGameOver = true;
    gameStarted = false;
    
    // 게임 루프 중지
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    // 최고 점수 저장
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
    
    // 게임 오버 화면 표시
    gameArea.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    finalScoreDisplay.textContent = score;
    finalHighScoreDisplay.textContent = highScore;
    
    // 신기록 표시
    if (score >= highScore && score > 0) {
        newRecordDisplay.classList.remove('hidden');
    } else {
        newRecordDisplay.classList.add('hidden');
    }
}

// ==================== 재시작 ====================
function restartGame() {
    isGameOver = false;
    gameOverScreen.classList.add('hidden');
    startGame();
}

// ==================== 메뉴로 돌아가기 ====================
function returnToMenu() {
    // 게임 루프 중지
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    // 상태 초기화
    gameStarted = false;
    isGameOver = false;
    isPaused = false;
    
    // 화면 전환
    gameArea.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    
    // 캔버스 초기화
    drawStartScreen();
}
