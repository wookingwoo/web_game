// Reaction Time Test Game Logic
const gameArea = document.getElementById('gameArea');
const icon = document.getElementById('icon');
const message = document.getElementById('message');
const subMessage = document.getElementById('subMessage');
const bestTimeDisplay = document.getElementById('bestTime');
const avgTimeDisplay = document.getElementById('avgTime');
const attemptsDisplay = document.getElementById('attempts');
const resultsContainer = document.getElementById('resultsContainer');
const resultsList = document.getElementById('resultsList');
const finalAvgDisplay = document.getElementById('finalAvg');
const rankingDisplay = document.getElementById('ranking');

const MAX_ATTEMPTS = 5;
let state = 'waiting'; // waiting, ready, go, result, early
let startTime = 0;
let timeoutId = null;
let results = [];
let bestTime = localStorage.getItem('reaction_best') || null;

// Display best time
if (bestTime) {
    bestTimeDisplay.textContent = `${bestTime}ms`;
}

// Click handler
gameArea.addEventListener('click', handleClick);

function handleClick() {
    switch (state) {
        case 'waiting':
            startRound();
            break;
        case 'ready':
            tooEarly();
            break;
        case 'go':
            recordTime();
            break;
        case 'result':
        case 'early':
            if (results.length < MAX_ATTEMPTS) {
                startRound();
            }
            break;
    }
}

function startRound() {
    state = 'ready';
    gameArea.className = 'game-area ready';
    icon.textContent = '✋';
    message.textContent = '기다리세요...';
    subMessage.textContent = '초록색이 되면 클릭!';
    
    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;
    timeoutId = setTimeout(showGreen, delay);
}

function showGreen() {
    state = 'go';
    gameArea.className = 'game-area go';
    icon.textContent = '⚡';
    message.textContent = '클릭!';
    subMessage.textContent = '';
    startTime = Date.now();
}

function tooEarly() {
    clearTimeout(timeoutId);
    state = 'early';
    gameArea.className = 'game-area early';
    icon.textContent = '😅';
    message.textContent = '너무 빨랐어요!';
    subMessage.textContent = '클릭하여 다시 시도';
}

function recordTime() {
    const reactionTime = Date.now() - startTime;
    results.push(reactionTime);
    
    state = 'result';
    gameArea.className = 'game-area result';
    icon.textContent = '🎉';
    message.textContent = `${reactionTime}ms`;
    
    // Update attempts
    attemptsDisplay.textContent = `${results.length}/${MAX_ATTEMPTS}`;
    
    // Update best time
    const currentBest = Math.min(...results);
    if (!bestTime || currentBest < bestTime) {
        bestTime = currentBest;
        localStorage.setItem('reaction_best', bestTime);
    }
    bestTimeDisplay.textContent = `${Math.min(currentBest, bestTime)}ms`;
    
    // Update average
    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    avgTimeDisplay.textContent = `${avg}ms`;
    
    if (results.length < MAX_ATTEMPTS) {
        subMessage.textContent = '클릭하여 계속';
    } else {
        subMessage.textContent = '테스트 완료!';
        showResults();
    }
}

function showResults() {
    resultsContainer.classList.remove('hidden');
    
    // Clear previous results
    resultsList.innerHTML = '';
    
    // Find best result
    const bestResult = Math.min(...results);
    
    // Display all results
    results.forEach((time, index) => {
        const item = document.createElement('span');
        item.className = 'result-item' + (time === bestResult ? ' best' : '');
        item.textContent = `${index + 1}: ${time}ms`;
        resultsList.appendChild(item);
    });
    
    // Calculate and display average
    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    finalAvgDisplay.textContent = avg;
    
    // Display ranking
    let ranking = '';
    if (avg < 200) {
        ranking = '🏆 놀라워요! 프로 게이머 수준!';
    } else if (avg < 250) {
        ranking = '🥇 훌륭해요! 반응속도가 매우 빠릅니다!';
    } else if (avg < 300) {
        ranking = '🥈 좋아요! 평균보다 빠릅니다!';
    } else if (avg < 350) {
        ranking = '🥉 괜찮아요! 평균 수준입니다.';
    } else if (avg < 400) {
        ranking = '💪 조금 느리지만 연습하면 좋아질 거예요!';
    } else {
        ranking = '☕ 커피 한 잔 하고 다시 도전해보세요!';
    }
    rankingDisplay.textContent = ranking;
}

function resetGame() {
    results = [];
    state = 'waiting';
    
    gameArea.className = 'game-area waiting';
    icon.textContent = '🎯';
    message.textContent = '클릭하여 시작';
    subMessage.textContent = '화면이 초록색으로 바뀌면 최대한 빨리 클릭하세요!';
    
    attemptsDisplay.textContent = '0/5';
    avgTimeDisplay.textContent = '- ms';
    resultsContainer.classList.add('hidden');
    
    if (bestTime) {
        bestTimeDisplay.textContent = `${bestTime}ms`;
    }
}
