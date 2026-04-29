// Slot Machine Game Logic

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'];

const PAYOUTS = {
    '7️⃣': 20,  // Jackpot
    '💎': 15,
    '⭐': 10,
    '🍇': 8,
    '🍊': 5,
    '🍋': 3,
    '🍒': 2
};

const SYMBOL_WEIGHTS = {
    '🍒': 25,
    '🍋': 22,
    '🍊': 20,
    '🍇': 15,
    '⭐': 10,
    '💎': 5,
    '7️⃣': 3
};

let coins = 100;
let currentBet = 10;
let highScore = 100;
let isSpinning = false;
let reelResults = ['🍒', '🍋', '🍊'];

// Load high score from localStorage
function loadHighScore() {
    const saved = localStorage.getItem('slotMachineHighScore');
    if (saved) {
        highScore = Math.max(parseInt(saved), 100);
    }
}

// Save high score to localStorage
function saveHighScore() {
    localStorage.setItem('slotMachineHighScore', highScore.toString());
}

// Get weighted random symbol
function getRandomSymbol() {
    const totalWeight = Object.values(SYMBOL_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
        random -= weight;
        if (random <= 0) {
            return symbol;
        }
    }
    return SYMBOLS[0];
}

// Update UI
function updateUI() {
    document.getElementById('coins').textContent = coins;
    document.getElementById('currentBet').textContent = currentBet;
    document.getElementById('highScore').textContent = highScore;
    
    // Update bet button states
    document.querySelectorAll('.bet-btn').forEach(btn => {
        const betValue = parseInt(btn.dataset.bet);
        btn.disabled = isSpinning || betValue > coins;
    });
    
    // Update spin button
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = isSpinning || currentBet > coins;
}

// Set bet amount
function setBet(amount, btn) {
    if (isSpinning || amount > coins) return;
    
    currentBet = amount;
    
    document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updateUI();
}

// Calculate win amount
function calculateWin(results) {
    const [r1, r2, r3] = results;
    
    // Three of a kind
    if (r1 === r2 && r2 === r3) {
        const multiplier = PAYOUTS[r1] || 2;
        return {
            type: r1 === '7️⃣' ? 'jackpot' : 'three',
            multiplier: multiplier,
            amount: currentBet * multiplier
        };
    }
    
    // Two of a kind
    if (r1 === r2 || r2 === r3 || r1 === r3) {
        return {
            type: 'two',
            multiplier: 1,
            amount: currentBet
        };
    }
    
    // No win
    return {
        type: 'none',
        multiplier: 0,
        amount: 0
    };
}

// Spin animation for a single reel
function spinReel(reelId, stripId, finalSymbol, delay) {
    return new Promise(resolve => {
        const reel = document.getElementById(reelId);
        const strip = document.getElementById(stripId);
        
        reel.classList.add('spinning');
        
        // Rapid symbol changes
        let spinCount = 0;
        const maxSpins = 15 + Math.floor(Math.random() * 10);
        
        const spinInterval = setInterval(() => {
            strip.innerHTML = `<div class="symbol">${getRandomSymbol()}</div>`;
            spinCount++;
            
            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
            }
        }, 80);
        
        // Stop after delay
        setTimeout(() => {
            clearInterval(spinInterval);
            reel.classList.remove('spinning');
            strip.innerHTML = `<div class="symbol">${finalSymbol}</div>`;
            resolve();
        }, delay);
    });
}

// Main spin function
async function spin() {
    if (isSpinning || currentBet > coins) return;
    
    isSpinning = true;
    updateUI();
    
    // Deduct bet
    coins -= currentBet;
    updateUI();
    
    // Reset display
    const resultText = document.getElementById('resultText');
    const machineFrame = document.querySelector('.machine-frame');
    const winLine = document.querySelector('.win-line');
    
    resultText.textContent = 'Spinning...';
    resultText.className = '';
    machineFrame.classList.remove('winning', 'jackpot-win');
    winLine.classList.remove('active');
    
    // Generate results
    reelResults = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Spin reels with delays
    await spinReel('reel1', 'reelStrip1', reelResults[0], 1000);
    await spinReel('reel2', 'reelStrip2', reelResults[1], 800);
    await spinReel('reel3', 'reelStrip3', reelResults[2], 600);
    
    // Calculate and display result
    const win = calculateWin(reelResults);
    
    if (win.type === 'jackpot') {
        machineFrame.classList.add('jackpot-win');
        winLine.classList.add('active');
        resultText.textContent = `🎉 JACKPOT! +${win.amount} COINS! 🎉`;
        resultText.className = 'jackpot';
        coins += win.amount;
        
        // Extra celebration for jackpot
        setTimeout(() => {
            machineFrame.classList.remove('jackpot-win');
            machineFrame.classList.add('winning');
        }, 2000);
        
    } else if (win.type === 'three') {
        machineFrame.classList.add('winning');
        winLine.classList.add('active');
        resultText.textContent = `🎊 THREE OF A KIND! +${win.amount} COINS!`;
        resultText.className = 'win';
        coins += win.amount;
        
    } else if (win.type === 'two') {
        machineFrame.classList.add('winning');
        resultText.textContent = `✨ Two Match! +${win.amount} COINS`;
        resultText.className = 'win';
        coins += win.amount;
        
    } else {
        resultText.textContent = 'No luck this time... Try again!';
        resultText.className = 'lose';
    }
    
    // Update high score
    if (coins > highScore) {
        highScore = coins;
        saveHighScore();
    }
    
    updateUI();
    
    // Remove win effects after delay
    setTimeout(() => {
        machineFrame.classList.remove('winning', 'jackpot-win');
        winLine.classList.remove('active');
    }, 3000);
    
    isSpinning = false;
    updateUI();
    
    // Check for game over
    if (coins <= 0) {
        setTimeout(showGameOver, 1000);
    }
}

// Show screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Start game
function startGame() {
    loadHighScore();
    showScreen('gameArea');
    updateUI();
    
    // Reset reels display
    document.getElementById('reelStrip1').innerHTML = '<div class="symbol">🍒</div>';
    document.getElementById('reelStrip2').innerHTML = '<div class="symbol">🍋</div>';
    document.getElementById('reelStrip3').innerHTML = '<div class="symbol">🍊</div>';
    
    document.getElementById('resultText').textContent = 'Place your bet and SPIN!';
    document.getElementById('resultText').className = '';
}

// Show game over
function showGameOver() {
    document.getElementById('finalHighScore').textContent = highScore;
    showScreen('gameOverScreen');
}

// Restart game
function restartGame() {
    coins = 100;
    currentBet = 10;
    
    // Reset bet buttons
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.bet) === 10) {
            btn.classList.add('active');
        }
    });
    
    startGame();
}

// Return to menu
function returnToMenu() {
    showScreen('startScreen');
}

// Initialize
loadHighScore();
