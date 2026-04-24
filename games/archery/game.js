class ArcheryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.roundElement = document.getElementById('round');
        this.arrowsElement = document.getElementById('arrows');
        this.gameOverScreen = document.getElementById('gameOver');
        this.startScreen = document.getElementById('startScreen');
        this.roundScreen = document.getElementById('roundScreen');
        this.powerBar = document.getElementById('powerBar');
        
        // Game state
        this.gameState = 'start'; // 'start', 'aiming', 'flying', 'hit', 'roundEnd', 'gameOver'
        this.score = 0;
        this.round = 1;
        this.arrowsLeft = 5;
        this.maxRounds = 3;
        this.arrowsPerRound = 5;
        
        // Bow position (left side)
        this.bow = {
            x: 100,
            y: this.canvas.height / 2,
            width: 20,
            height: 120
        };
        
        // Arrow
        this.arrow = {
            x: this.bow.x + 30,
            y: this.bow.y,
            vx: 0,
            vy: 0,
            angle: 0,
            length: 60,
            flying: false
        };
        
        // Target (right side)
        this.target = {
            x: this.canvas.width - 120,
            y: this.canvas.height / 2,
            radius: 80,
            rings: 10
        };
        
        // Aiming
        this.aiming = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            power: 0,
            maxPower: 100,
            angle: 0
        };
        
        // Stuck arrows on target
        this.stuckArrows = [];
        
        // Physics
        this.gravity = 0.15;
        
        // Score popup
        this.scorePopup = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMouseDown(this.getTouchPos(touch));
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMouseMove(this.getTouchPos(touch));
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onMouseUp(e);
        });
    }
    
    getTouchPos(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            clientX: touch.clientX,
            clientY: touch.clientY
        };
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    onMouseDown(e) {
        if (this.gameState !== 'aiming' && this.gameState !== 'ready') return;
        
        const pos = this.getMousePos(e);
        
        // Check if clicking near the bow/arrow area
        if (pos.x < 200) {
            this.aiming.active = true;
            this.aiming.startX = pos.x;
            this.aiming.startY = pos.y;
            this.aiming.currentX = pos.x;
            this.aiming.currentY = pos.y;
            this.gameState = 'aiming';
        }
    }
    
    onMouseMove(e) {
        if (!this.aiming.active) return;
        
        const pos = this.getMousePos(e);
        this.aiming.currentX = pos.x;
        this.aiming.currentY = pos.y;
        
        // Calculate power based on drag distance (pulling back)
        const dx = this.aiming.startX - this.aiming.currentX;
        const dy = this.aiming.startY - this.aiming.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.aiming.power = Math.min(distance / 2, this.aiming.maxPower);
        this.aiming.angle = Math.atan2(-dy, dx); // Angle towards drag direction
        
        // Update power bar
        this.powerBar.style.width = this.aiming.power + '%';
    }
    
    onMouseUp(e) {
        if (!this.aiming.active) return;
        
        this.aiming.active = false;
        
        if (this.aiming.power > 10) {
            this.shootArrow();
        }
        
        this.powerBar.style.width = '0%';
    }
    
    shootArrow() {
        const powerMultiplier = this.aiming.power / 100;
        const speed = 15 + powerMultiplier * 15; // 15 to 30
        
        this.arrow.x = this.bow.x + 30;
        this.arrow.y = this.bow.y;
        this.arrow.vx = Math.cos(this.aiming.angle) * speed;
        this.arrow.vy = -Math.sin(this.aiming.angle) * speed;
        this.arrow.angle = this.aiming.angle;
        this.arrow.flying = true;
        
        this.gameState = 'flying';
        this.arrowsLeft--;
        this.updateUI();
    }
    
    updateArrow() {
        if (!this.arrow.flying) return;
        
        // Apply gravity
        this.arrow.vy += this.gravity;
        
        // Update position
        this.arrow.x += this.arrow.vx;
        this.arrow.y += this.arrow.vy;
        
        // Update angle based on velocity
        this.arrow.angle = Math.atan2(-this.arrow.vy, this.arrow.vx);
        
        // Check target collision
        const tipX = this.arrow.x + Math.cos(this.arrow.angle) * (this.arrow.length / 2);
        const tipY = this.arrow.y - Math.sin(this.arrow.angle) * (this.arrow.length / 2);
        
        const distToTarget = Math.sqrt(
            Math.pow(tipX - this.target.x, 2) + 
            Math.pow(tipY - this.target.y, 2)
        );
        
        // Hit target
        if (distToTarget <= this.target.radius && tipX >= this.target.x - 20) {
            this.arrow.flying = false;
            const points = this.calculateScore(distToTarget);
            this.score += points;
            this.showScorePopup(points, tipX, tipY);
            
            // Store stuck arrow
            this.stuckArrows.push({
                x: tipX,
                y: tipY,
                angle: this.arrow.angle
            });
            
            this.updateUI();
            this.checkRoundEnd();
            return;
        }
        
        // Miss - out of bounds
        if (this.arrow.x > this.canvas.width + 50 || 
            this.arrow.y > this.canvas.height + 50 ||
            this.arrow.y < -50) {
            this.arrow.flying = false;
            this.showScorePopup(0, this.canvas.width / 2, this.canvas.height / 2);
            this.checkRoundEnd();
        }
    }
    
    calculateScore(distance) {
        const ringWidth = this.target.radius / this.target.rings;
        const ring = Math.floor(distance / ringWidth);
        
        if (ring >= this.target.rings) return 0;
        return this.target.rings - ring; // 10 for center, 1 for outer
    }
    
    showScorePopup(points, x, y) {
        this.scorePopup = {
            text: points > 0 ? `+${points}` : 'Miss!',
            x: x,
            y: y,
            alpha: 1,
            scale: 1
        };
        
        setTimeout(() => {
            this.scorePopup = null;
            if (this.gameState !== 'roundEnd' && this.gameState !== 'gameOver') {
                this.gameState = 'ready';
            }
        }, 1000);
        
        this.gameState = 'hit';
    }
    
    checkRoundEnd() {
        if (this.arrowsLeft <= 0) {
            if (this.round >= this.maxRounds) {
                setTimeout(() => this.endGame(), 1500);
            } else {
                setTimeout(() => this.showRoundScreen(), 1500);
            }
        }
    }
    
    showRoundScreen() {
        this.gameState = 'roundEnd';
        document.getElementById('roundNumber').textContent = this.round + 1;
        document.getElementById('roundScore').textContent = this.score;
        this.roundScreen.classList.remove('hidden');
    }
    
    nextRound() {
        this.round++;
        this.arrowsLeft = this.arrowsPerRound;
        this.stuckArrows = [];
        this.roundScreen.classList.add('hidden');
        this.gameState = 'ready';
        this.updateUI();
        this.resetArrow();
    }
    
    endGame() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    startGame() {
        this.gameState = 'ready';
        this.startScreen.classList.add('hidden');
        this.score = 0;
        this.round = 1;
        this.arrowsLeft = this.arrowsPerRound;
        this.stuckArrows = [];
        this.resetArrow();
        this.updateUI();
        this.gameLoop();
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startGame();
    }
    
    resetArrow() {
        this.arrow.x = this.bow.x + 30;
        this.arrow.y = this.bow.y;
        this.arrow.vx = 0;
        this.arrow.vy = 0;
        this.arrow.angle = 0;
        this.arrow.flying = false;
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.roundElement.textContent = this.round;
        this.arrowsElement.textContent = this.arrowsLeft;
    }
    
    // Drawing methods
    drawBackground() {
        const ctx = this.ctx;
        
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#b8d4e8');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
        
        // Ground gradient
        const groundGradient = ctx.createLinearGradient(0, this.canvas.height * 0.6, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#90EE90');
        groundGradient.addColorStop(1, '#228B22');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4);
        
        // Draw some clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(150, 80, 40);
        this.drawCloud(400, 50, 50);
        this.drawCloud(600, 100, 35);
    }
    
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
        ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size * 0.5, y + size * 0.3, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawTarget() {
        const ctx = this.ctx;
        const { x, y, radius, rings } = this.target;
        const ringWidth = radius / rings;
        
        // Target stand
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - 10, y + radius, 20, 100);
        ctx.fillRect(x - 30, y + radius + 80, 60, 20);
        
        // Draw rings from outside to inside
        const colors = [
            '#FFFFFF', '#FFFFFF',  // 1-2 white
            '#000000', '#000000',  // 3-4 black
            '#3498db', '#3498db',  // 5-6 blue
            '#e74c3c', '#e74c3c',  // 7-8 red
            '#f1c40f', '#f1c40f'   // 9-10 gold
        ];
        
        for (let i = 0; i < rings; i++) {
            const r = radius - (i * ringWidth);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Center X mark
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const centerSize = ringWidth / 3;
        ctx.beginPath();
        ctx.moveTo(x - centerSize, y - centerSize);
        ctx.lineTo(x + centerSize, y + centerSize);
        ctx.moveTo(x + centerSize, y - centerSize);
        ctx.lineTo(x - centerSize, y + centerSize);
        ctx.stroke();
    }
    
    drawBow() {
        const ctx = this.ctx;
        const { x, y, height } = this.bow;
        
        // Calculate bow bend based on pull
        let bendAmount = 0;
        if (this.aiming.active) {
            bendAmount = this.aiming.power / 100 * 30;
        }
        
        // Draw bow (curved)
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x, y - height / 2);
        ctx.quadraticCurveTo(x + 30 - bendAmount, y, x, y + height / 2);
        ctx.stroke();
        
        // Bow grip
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - 5, y - 15, 15, 30);
        
        // Draw bowstring
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 2;
        
        if (this.aiming.active) {
            // String pulled back
            const pullX = x + 30 - bendAmount;
            ctx.beginPath();
            ctx.moveTo(x, y - height / 2);
            ctx.lineTo(pullX, y);
            ctx.lineTo(x, y + height / 2);
            ctx.stroke();
        } else {
            // String at rest
            ctx.beginPath();
            ctx.moveTo(x, y - height / 2);
            ctx.lineTo(x + 25, y);
            ctx.lineTo(x, y + height / 2);
            ctx.stroke();
        }
    }
    
    drawArrow(x, y, angle, length = 60) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-angle);
        
        // Arrow shaft
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);
        ctx.lineTo(length / 2, 0);
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(length / 2 + 15, 0);
        ctx.lineTo(length / 2, -6);
        ctx.lineTo(length / 2, 6);
        ctx.closePath();
        ctx.fill();
        
        // Arrow feathers
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);
        ctx.lineTo(-length / 2 - 10, -8);
        ctx.lineTo(-length / 2 + 5, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);
        ctx.lineTo(-length / 2 - 10, 8);
        ctx.lineTo(-length / 2 + 5, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    drawAimingLine() {
        if (!this.aiming.active || this.aiming.power < 5) return;
        
        const ctx = this.ctx;
        
        // Draw trajectory preview (dotted line)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const startX = this.bow.x + 30;
        const startY = this.bow.y;
        const powerMultiplier = this.aiming.power / 100;
        const speed = 15 + powerMultiplier * 15;
        const vx = Math.cos(this.aiming.angle) * speed;
        const vy = -Math.sin(this.aiming.angle) * speed;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let px = startX, py = startY;
        let pvx = vx, pvy = vy;
        
        for (let i = 0; i < 30; i++) {
            pvy += this.gravity;
            px += pvx;
            py += pvy;
            
            if (px > this.canvas.width || py > this.canvas.height || py < 0) break;
            ctx.lineTo(px, py);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawStuckArrows() {
        for (const arrow of this.stuckArrows) {
            this.drawArrow(arrow.x, arrow.y, arrow.angle, 40);
        }
    }
    
    drawScorePopup() {
        if (!this.scorePopup) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        ctx.globalAlpha = this.scorePopup.alpha;
        ctx.font = `bold ${36 * this.scorePopup.scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text shadow
        ctx.fillStyle = '#000';
        ctx.fillText(this.scorePopup.text, this.scorePopup.x + 2, this.scorePopup.y + 2);
        
        // Text
        ctx.fillStyle = this.scorePopup.text === 'Miss!' ? '#e74c3c' : '#f1c40f';
        ctx.fillText(this.scorePopup.text, this.scorePopup.x, this.scorePopup.y);
        
        // Animate
        this.scorePopup.y -= 1;
        this.scorePopup.alpha -= 0.02;
        this.scorePopup.scale += 0.01;
        
        ctx.restore();
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawTarget();
        this.drawStuckArrows();
        this.drawBow();
        
        // Draw arrow
        if (this.arrow.flying) {
            this.drawArrow(this.arrow.x, this.arrow.y, this.arrow.angle);
        } else if (this.gameState === 'ready' || this.gameState === 'aiming') {
            // Arrow on bow
            let arrowX = this.bow.x + 30;
            let arrowY = this.bow.y;
            let arrowAngle = 0;
            
            if (this.aiming.active) {
                const bendAmount = this.aiming.power / 100 * 30;
                arrowX = this.bow.x + 30 - bendAmount;
                arrowAngle = this.aiming.angle;
            }
            
            this.drawArrow(arrowX, arrowY, arrowAngle);
        }
        
        this.drawAimingLine();
        this.drawScorePopup();
    }
    
    update() {
        if (this.gameState === 'flying') {
            this.updateArrow();
        }
    }
    
    gameLoop() {
        if (this.gameState === 'gameOver' || this.gameState === 'start') return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global game instance
let game;

function startGame() {
    if (!game) {
        game = new ArcheryGame();
    }
    game.startGame();
}

function restartGame() {
    game.restartGame();
}

function nextRound() {
    game.nextRound();
}

// Initialize game when page loads
window.onload = () => {
    game = new ArcheryGame();
    game.draw();
};
