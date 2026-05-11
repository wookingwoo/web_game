// Dice Roll Game Logic
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const coinsDisplay = document.getElementById('coins');
const totalDisplay = document.getElementById('total');
const resultDisplay = document.getElementById('result');
const betSlider = document.getElementById('betSlider');
const betAmountDisplay = document.getElementById('betAmount');
const historyList = document.getElementById('historyList');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const predButtons = document.querySelectorAll('.pred-btn');
const rollBtn = document.querySelector('.roll-btn');

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

let coins = 100;
let currentBet = 10;
let isRolling = false;
let history = [];

// Bet slider
betSlider.addEventListener('input', (e) => {
    currentBet = parseInt(e.target.value);
    if (currentBet > coins) {
        currentBet = coins;
        betSlider.value = coins;
    }
    betAmountDisplay.textContent = currentBet;
});

// Update slider max based on coins
function updateSlider() {
    betSlider.max = Math.max(10, coins);
    if (currentBet > coins) {
        currentBet = Math.max(10, coins);
        betSlider.value = currentBet;
        betAmountDisplay.textContent = currentBet;
    }
}

// Roll dice animation
function animateDice() {
    return new Promise(resolve => {
        dice1.classList.add('rolling');
        dice2.classList.add('rolling');
        
        let frames = 0;
        const maxFrames = 15;
        
        const animate = setInterval(() => {
            const face1 = DICE_FACES[Math.floor(Math.random() * 6)];
            const face2 = DICE_FACES[Math.floor(Math.random() * 6)];
            
            dice1.querySelector('.dice-face').textContent = face1;
            dice2.querySelector('.dice-face').textContent = face2;
            
            frames++;
            if (frames >= maxFrames) {
                clearInterval(animate);
                dice1.classList.remove('rolling');
                dice2.classList.remove('rolling');
                resolve();
            }
        }, 100);
    });
}

// Roll dice
async function rollDice(prediction = null) {
    if (isRolling || coins <= 0) return;
    
    // Check bet for prediction
    if (prediction && currentBet > coins) {
        currentBet = coins;
    }
    
    isRolling = true;
    predButtons.forEach(btn => btn.disabled = true);
    rollBtn.disabled = true;
    
    // Deduct bet if prediction made
    if (prediction) {
        coins -= currentBet;
        coinsDisplay.textContent = coins;
    }
    
    resultDisplay.textContent = '🎲 굴리는 중...';
    resultDisplay.className = 'result';
    
    await animateDice();
    
    // Final result
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const total = roll1 + roll2;
    
    dice1.querySelector('.dice-face').textContent = DICE_FACES[roll1 - 1];
    dice2.querySelector('.dice-face').textContent = DICE_FACES[roll2 - 1];
    totalDisplay.textContent = total;
    
    // Add to history
    addToHistory(total);
    
    // Check prediction
    if (prediction) {
        let won = false;
        let multiplier = 0;
        
        if (prediction === 'low' && total >= 2 && total <= 6) {
            won = true;
            multiplier = 2;
        } else if (prediction === 'seven' && total === 7) {
            won = true;
            multiplier = 4;
        } else if (prediction === 'high' && total >= 8 && total <= 12) {
            won = true;
            multiplier = 2;
        }
        
        if (won) {
            const winnings = currentBet * multiplier;
            coins += winnings;
            resultDisplay.textContent = `🎉 정답! +${winnings} 획득! (${total})`;
            resultDisplay.className = 'result win';
        } else {
            resultDisplay.textContent = `😢 틀렸습니다. (${total})`;
            resultDisplay.className = 'result lose';
        }
    } else {
        resultDisplay.textContent = `주사위 합: ${total}`;
        resultDisplay.className = 'result';
    }
    
    coinsDisplay.textContent = coins;
    updateSlider();
    
    // Check game over
    if (coins <= 0) {
        setTimeout(() => {
            gameOverOverlay.classList.remove('hidden');
        }, 500);
    }
    
    isRolling = false;
    predButtons.forEach(btn => btn.disabled = false);
    rollBtn.disabled = false;
}

// Place bet with prediction
function placeBet(prediction) {
    rollDice(prediction);
}

// Add to history
function addToHistory(total) {
    history.unshift(total);
    if (history.length > 10) {
        history.pop();
    }
    
    historyList.innerHTML = '';
    history.forEach(t => {
        const item = document.createElement('span');
        item.className = 'history-item';
        item.textContent = t;
        
        if (t >= 2 && t <= 6) {
            item.classList.add('low');
        } else if (t === 7) {
            item.classList.add('seven');
        } else {
            item.classList.add('high');
        }
        
        historyList.appendChild(item);
    });
}

// Reset game
function resetGame() {
    coins = 100;
    currentBet = 10;
    history = [];
    
    coinsDisplay.textContent = coins;
    totalDisplay.textContent = '-';
    betSlider.value = currentBet;
    betSlider.max = 100;
    betAmountDisplay.textContent = currentBet;
    resultDisplay.textContent = '';
    resultDisplay.className = 'result';
    historyList.innerHTML = '';
    
    dice1.querySelector('.dice-face').textContent = '⚀';
    dice2.querySelector('.dice-face').textContent = '⚀';
    
    gameOverOverlay.classList.add('hidden');
}
