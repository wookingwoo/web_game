// Rock Paper Scissors - VS AI

// ==================== 게임 설정 ====================
const CHOICES = ['rock', 'paper', 'scissors'];
const CHOICE_EMOJIS = {
    rock: '✊',
    paper: '🖐️',
    scissors: '✌️'
};

// 승리 조건: key가 value를 이김
const WIN_CONDITIONS = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

// ==================== 게임 상태 변수 ====================
let playerScore = 0;
let aiScore = 0;
let draws = 0;
let currentStreak = 0;
let bestStreak = 0;
let gameHistory = [];
let isPlaying = false;

// DOM 요소
let playerScoreDisplay, aiScoreDisplay, drawsDisplay;
let playerChoiceEmoji, aiChoiceEmoji;
let resultDisplay, resultText;
let countdown, countdownText;
let historyItems;
let bestStreakDisplay, currentStreakDisplay;
let choiceButtons;

// ==================== 초기화 ====================
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 참조
    playerScoreDisplay = document.getElementById('playerScore');
    aiScoreDisplay = document.getElementById('aiScore');
    drawsDisplay = document.getElementById('draws');
    
    playerChoiceEmoji = document.getElementById('playerChoiceEmoji');
    aiChoiceEmoji = document.getElementById('aiChoiceEmoji');
    
    resultDisplay = document.getElementById('resultDisplay');
    resultText = document.getElementById('resultText');
    
    countdown = document.getElementById('countdown');
    countdownText = document.getElementById('countdownText');
    
    historyItems = document.getElementById('historyItems');
    
    bestStreakDisplay = document.getElementById('bestStreak');
    currentStreakDisplay = document.getElementById('currentStreak');
    
    choiceButtons = document.querySelectorAll('.choice-btn');
    
    // 저장된 기록 불러오기
    loadStats();
    
    // UI 초기화
    updateDisplay();
});

// ==================== 저장/불러오기 ====================
function loadStats() {
    const saved = localStorage.getItem('rps_stats');
    if (saved) {
        const stats = JSON.parse(saved);
        bestStreak = stats.bestStreak || 0;
    }
}

function saveStats() {
    const stats = {
        bestStreak: bestStreak
    };
    localStorage.setItem('rps_stats', JSON.stringify(stats));
}

// ==================== 게임 로직 ====================
function getAIChoice() {
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[randomIndex];
}

function determineWinner(playerChoice, aiChoice) {
    if (playerChoice === aiChoice) {
        return 'draw';
    }
    if (WIN_CONDITIONS[playerChoice] === aiChoice) {
        return 'win';
    }
    return 'lose';
}

async function playRound(playerChoice) {
    if (isPlaying) return;
    
    isPlaying = true;
    disableButtons(true);
    
    // 결과 숨기기
    resultDisplay.classList.add('hidden');
    resultDisplay.className = 'result-display hidden';
    
    // 카운트다운 애니메이션
    await showCountdown();
    
    // AI 선택
    const aiChoice = getAIChoice();
    
    // 선택 표시
    playerChoiceEmoji.textContent = CHOICE_EMOJIS[playerChoice];
    aiChoiceEmoji.textContent = CHOICE_EMOJIS[aiChoice];
    
    // 승패 판정
    const result = determineWinner(playerChoice, aiChoice);
    
    // 점수 및 연승 업데이트
    updateScores(result);
    
    // 히스토리 추가
    addToHistory(result);
    
    // 결과 표시
    showResult(result);
    
    // UI 업데이트
    updateDisplay();
    
    // 저장
    saveStats();
    
    // 약간의 딜레이 후 버튼 활성화
    setTimeout(() => {
        isPlaying = false;
        disableButtons(false);
    }, 500);
}

async function showCountdown() {
    const battleArea = document.querySelector('.battle-area');
    const gameArea = document.querySelector('.game-area');
    
    // 초기화
    playerChoiceEmoji.textContent = '❓';
    aiChoiceEmoji.textContent = '❓';
    
    countdown.classList.remove('hidden');
    battleArea.classList.add('shaking');
    gameArea.classList.add('thinking');
    
    const counts = ['✊', '✌️', '🖐️', 'GO!'];
    
    for (let i = 0; i < counts.length; i++) {
        countdownText.textContent = counts[i];
        countdown.style.animation = 'none';
        countdown.offsetHeight; // 리플로우 강제
        countdown.style.animation = 'countdownPulse 0.3s ease';
        await sleep(300);
    }
    
    countdown.classList.add('hidden');
    battleArea.classList.remove('shaking');
    gameArea.classList.remove('thinking');
}

function updateScores(result) {
    switch (result) {
        case 'win':
            playerScore++;
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
            break;
        case 'lose':
            aiScore++;
            currentStreak = 0;
            break;
        case 'draw':
            draws++;
            // 무승부는 연승 유지
            break;
    }
}

function showResult(result) {
    resultDisplay.classList.remove('hidden', 'win', 'lose', 'draw');
    
    let text = '';
    switch (result) {
        case 'win':
            text = '🎉 YOU WIN!';
            resultDisplay.classList.add('win');
            // 축하 효과
            playerChoiceEmoji.parentElement.classList.add('celebrating');
            setTimeout(() => {
                playerChoiceEmoji.parentElement.classList.remove('celebrating');
            }, 1500);
            break;
        case 'lose':
            text = '😢 YOU LOSE';
            resultDisplay.classList.add('lose');
            break;
        case 'draw':
            text = '🤝 DRAW';
            resultDisplay.classList.add('draw');
            break;
    }
    
    resultText.textContent = text;
}

function addToHistory(result) {
    gameHistory.unshift(result);
    if (gameHistory.length > 10) {
        gameHistory.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (gameHistory.length === 0) {
        historyItems.innerHTML = '<span class="history-empty">Play to start!</span>';
        return;
    }
    
    historyItems.innerHTML = gameHistory.map((result, index) => {
        const letter = result === 'win' ? 'W' : (result === 'lose' ? 'L' : 'D');
        return `<span class="history-item ${result}" style="animation-delay: ${index * 0.05}s">${letter}</span>`;
    }).join('');
}

function updateDisplay() {
    playerScoreDisplay.textContent = playerScore;
    aiScoreDisplay.textContent = aiScore;
    drawsDisplay.textContent = draws;
    bestStreakDisplay.textContent = bestStreak;
    currentStreakDisplay.textContent = currentStreak;
}

function disableButtons(disabled) {
    choiceButtons.forEach(btn => {
        btn.disabled = disabled;
    });
}

function resetGame() {
    // 게임 중이면 무시
    if (isPlaying) return;
    
    // 점수 초기화
    playerScore = 0;
    aiScore = 0;
    draws = 0;
    currentStreak = 0;
    gameHistory = [];
    
    // UI 초기화
    playerChoiceEmoji.textContent = '❓';
    aiChoiceEmoji.textContent = '❓';
    resultDisplay.classList.add('hidden');
    
    updateDisplay();
    updateHistoryDisplay();
}

// ==================== 유틸리티 ====================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 키보드 지원 ====================
document.addEventListener('keydown', (e) => {
    if (isPlaying) return;
    
    switch (e.key.toLowerCase()) {
        case 'r':
        case '1':
            playRound('rock');
            break;
        case 'p':
        case '2':
            playRound('paper');
            break;
        case 's':
        case '3':
            playRound('scissors');
            break;
    }
});
