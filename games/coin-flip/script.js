// Coin Flip Game Logic
const coin = document.getElementById('coin');
const coinsDisplay = document.getElementById('coins');
const streakDisplay = document.getElementById('streak');
const resultDisplay = document.getElementById('result');
const headsCountDisplay = document.getElementById('headsCount');
const tailsCountDisplay = document.getElementById('tailsCount');
const winRateDisplay = document.getElementById('winRate');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const betButtons = document.querySelectorAll('.bet-btn');
const choiceButtons = document.querySelectorAll('.choice-btn');

let coins = 100;
let streak = 0;
let currentBet = 25;
let headsCount = 0;
let tailsCount = 0;
let wins = 0;
let totalGames = 0;
let isFlipping = false;

// Bet selection
betButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isFlipping) return;
        
        betButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const bet = btn.dataset.bet;
        if (bet === '100') {
            currentBet = coins;
        } else {
            currentBet = parseInt(bet);
        }
    });
});

// Flip coin
function flipCoin(choice) {
    if (isFlipping || coins <= 0) return;
    
    // Check if bet is valid
    if (currentBet > coins) {
        currentBet = coins;
    }
    
    if (currentBet <= 0) return;
    
    isFlipping = true;
    choiceButtons.forEach(btn => btn.disabled = true);
    
    // Deduct bet
    coins -= currentBet;
    coinsDisplay.textContent = coins;
    
    resultDisplay.textContent = '🪙 던지는 중...';
    resultDisplay.className = 'result';
    
    // Add flipping animation
    coin.classList.add('flipping');
    
    // Determine result (50/50)
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // After animation
    setTimeout(() => {
        coin.classList.remove('flipping');
        coin.classList.remove('heads', 'tails');
        coin.classList.add(result);
        
        // Update counts
        if (result === 'heads') {
            headsCount++;
            headsCountDisplay.textContent = headsCount;
        } else {
            tailsCount++;
            tailsCountDisplay.textContent = tailsCount;
        }
        
        totalGames++;
        
        // Check win/lose
        if (choice === result) {
            // Win! Double the bet
            const winnings = currentBet * 2;
            coins += winnings;
            wins++;
            streak++;
            
            resultDisplay.textContent = `🎉 ${result === 'heads' ? '앞면' : '뒷면'}! +${winnings} 획득!`;
            resultDisplay.className = 'result win';
        } else {
            // Lose
            streak = 0;
            
            resultDisplay.textContent = `😢 ${result === 'heads' ? '앞면' : '뒷면'}이었습니다. -${currentBet}`;
            resultDisplay.className = 'result lose';
        }
        
        coinsDisplay.textContent = coins;
        streakDisplay.textContent = streak;
        winRateDisplay.textContent = Math.round((wins / totalGames) * 100);
        
        // Check game over
        if (coins <= 0) {
            setTimeout(() => {
                gameOverOverlay.classList.remove('hidden');
            }, 500);
        }
        
        isFlipping = false;
        choiceButtons.forEach(btn => btn.disabled = false);
        
    }, 1000);
}

// Reset game
function resetGame() {
    coins = 100;
    streak = 0;
    currentBet = 25;
    headsCount = 0;
    tailsCount = 0;
    wins = 0;
    totalGames = 0;
    
    coinsDisplay.textContent = coins;
    streakDisplay.textContent = streak;
    headsCountDisplay.textContent = headsCount;
    tailsCountDisplay.textContent = tailsCount;
    winRateDisplay.textContent = 0;
    resultDisplay.textContent = '';
    resultDisplay.className = 'result';
    
    coin.classList.remove('heads', 'tails');
    
    gameOverOverlay.classList.add('hidden');
    
    // Reset bet buttons
    betButtons.forEach(btn => btn.classList.remove('active'));
    betButtons[1].classList.add('active'); // 25 as default
}
