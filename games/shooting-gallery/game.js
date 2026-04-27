class ShootingGalleryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.roundElement = document.getElementById('round');
        this.ammoElement = document.getElementById('ammo');
        this.timeElement = document.getElementById('time');
        this.timerBar = document.getElementById('timerBar');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.roundScreen = document.getElementById('roundScreen');
        
        // Game state
        this.gameState = 'start';
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.ammo = 15;
        this.maxAmmo = 15;
        this.timeLeft = 30;
        this.maxTime = 30;
        
        // Stats
        this.totalShots = 0;
        this.totalHits = 0;
        this.roundShots = 0;
        this.roundHits = 0;
        this.roundScore = 0;
        
        // Targets
        this.targets = [];
        this.effects = [];
        
        // Mouse position
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // Round configurations
        this.roundConfigs = [
            { spawnRate: 0.015, moveSpeed: 1, targetLife: 3500, hasBomb: false, hasBonus: false, minSize: 1 },
            { spawnRate: 0.02, moveSpeed: 1.5, targetLife: 3000, hasBomb: false, hasBonus: true, minSize: 1 },
            { spawnRate: 0.025, moveSpeed: 2, targetLife: 2500, hasBomb: true, hasBonus: true, minSize: 0.9 },
            { spawnRate: 0.03, moveSpeed: 2.5, targetLife: 2000, hasBomb: true, hasBonus: true, minSize: 0.8 },
            { spawnRate: 0.035, moveSpeed: 3, targetLife: 1500, hasBomb: true, hasBonus: true, minSize: 0.7 }
        ];
        
        // Timer interval
        this.timerInterval = null;
        
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onShoot(e));
        
        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMouseMove(this.getTouchEvent(touch));
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMouseMove(this.getTouchEvent(touch));
            this.onShoot(this.getTouchEvent(touch));
        });
    }
    
    getTouchEvent(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            clientX: touch.clientX,
            clientY: touch.clientY
        };
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    onMouseMove(e) {
        const pos = this.getMousePos(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
    }
    
    onShoot(e) {
        if (this.gameState !== 'playing') return;
        if (this.ammo <= 0) return;
        
        const pos = this.getMousePos(e);
        this.ammo--;
        this.totalShots++;
        this.roundShots++;
        this.updateUI();
        
        // Add muzzle flash effect
        this.addEffect(pos.x, pos.y, 'muzzle');
        
        // Check for hits
        let hit = false;
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            if (this.isHit(pos.x, pos.y, target)) {
                hit = true;
                this.handleHit(target, i, pos.x, pos.y);
                break; // Only hit one target per shot
            }
        }
        
        if (!hit) {
            this.addEffect(pos.x, pos.y, 'miss');
        }
        
        // Check ammo
        if (this.ammo <= 3) {
            this.ammoElement.parentElement.classList.add('low');
        }
        
        if (this.ammo <= 0) {
            this.endRound();
        }
    }
    
    isHit(x, y, target) {
        if (target.type === 'star') {
            // Star uses circular hit detection
            const dx = x - target.x;
            const dy = y - target.y;
            return Math.sqrt(dx * dx + dy * dy) < target.radius;
        } else {
            // Circular targets
            const dx = x - target.x;
            const dy = y - target.y;
            return Math.sqrt(dx * dx + dy * dy) < target.radius;
        }
    }
    
    handleHit(target, index, x, y) {
        this.targets.splice(index, 1);
        
        if (target.type === 'bomb') {
            // Hit bomb - lose points
            this.score = Math.max(0, this.score - 20);
            this.roundScore -= 20;
            this.addEffect(x, y, 'bomb');
        } else {
            // Hit target - gain points
            this.score += target.points;
            this.roundScore += target.points;
            this.totalHits++;
            this.roundHits++;
            this.addEffect(x, y, 'hit', target.points);
        }
        
        this.updateUI();
    }
    
    addEffect(x, y, type, points = 0) {
        this.effects.push({
            x, y, type, points,
            life: type === 'muzzle' ? 5 : 30,
            maxLife: type === 'muzzle' ? 5 : 30,
            particles: type === 'hit' || type === 'bomb' ? this.createParticles(x, y, type) : []
        });
    }
    
    createParticles(x, y, type) {
        const particles = [];
        const count = type === 'bomb' ? 20 : 12;
        const color = type === 'bomb' ? '#e74c3c' : '#ffd700';
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 3;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 20 + Math.random() * 10,
                color,
                size: 3 + Math.random() * 3
            });
        }
        return particles;
    }
    
    spawnTarget() {
        const config = this.roundConfigs[this.round - 1];
        if (Math.random() > config.spawnRate) return;
        if (this.targets.length >= 8) return;
        
        // Determine target type
        let type, points, color, radius, speed;
        const rand = Math.random();
        
        if (config.hasBomb && rand < 0.12) {
            type = 'bomb';
            points = -20;
            color = '#1a1a1a';
            radius = 35 * config.minSize;
            speed = 0;
        } else if (config.hasBonus && rand < 0.2) {
            type = 'star';
            points = 50;
            color = '#ffd700';
            radius = 25 * config.minSize;
            speed = config.moveSpeed * 1.5;
        } else if (rand < 0.35) {
            type = 'small';
            points = 30;
            color = '#f1c40f';
            radius = 20 * config.minSize;
            speed = 0;
        } else if (rand < 0.55) {
            type = 'moving';
            points = 20;
            color = '#3498db';
            radius = 35 * config.minSize;
            speed = config.moveSpeed;
        } else {
            type = 'normal';
            points = 10;
            color = '#e74c3c';
            radius = 40 * config.minSize;
            speed = 0;
        }
        
        // Random position (avoid edges)
        const margin = radius + 20;
        const x = margin + Math.random() * (this.canvas.width - margin * 2);
        const y = margin + Math.random() * (this.canvas.height - margin * 2);
        
        // Movement direction
        const moveDir = Math.random() < 0.5 ? 1 : -1;
        const moveAxis = Math.random() < 0.5 ? 'x' : 'y';
        
        this.targets.push({
            x, y,
            radius,
            type,
            points,
            color,
            speed,
            moveDir,
            moveAxis,
            life: config.targetLife,
            maxLife: config.targetLife,
            spawnTime: Date.now()
        });
    }
    
    updateTargets() {
        const config = this.roundConfigs[this.round - 1];
        
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            
            // Update life
            target.life -= 16; // Approximately 60fps
            
            // Remove expired targets
            if (target.life <= 0) {
                this.targets.splice(i, 1);
                continue;
            }
            
            // Move target
            if (target.speed > 0) {
                if (target.moveAxis === 'x') {
                    target.x += target.speed * target.moveDir;
                    if (target.x <= target.radius || target.x >= this.canvas.width - target.radius) {
                        target.moveDir *= -1;
                    }
                } else {
                    target.y += target.speed * target.moveDir;
                    if (target.y <= target.radius || target.y >= this.canvas.height - target.radius) {
                        target.moveDir *= -1;
                    }
                }
            }
        }
    }
    
    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life--;
            
            // Update particles
            for (const particle of effect.particles) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Gravity
                particle.life--;
            }
            
            effect.particles = effect.particles.filter(p => p.life > 0);
            
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw targets
        this.drawTargets();
        
        // Draw effects
        this.drawEffects();
        
        // Draw crosshair
        if (this.gameState === 'playing') {
            this.drawCrosshair();
        }
        
        requestAnimationFrame(() => this.draw());
    }
    
    drawBackground() {
        // Dark gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.4, '#2d2d44');
        gradient.addColorStop(0.7, '#3d2817');
        gradient.addColorStop(1, '#2c1810');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw wooden shelf lines
        this.ctx.strokeStyle = '#5c4033';
        this.ctx.lineWidth = 3;
        for (let y = 150; y < this.canvas.height; y += 120) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Add some ambient details
        this.ctx.fillStyle = 'rgba(255, 200, 100, 0.03)';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, -100, 300, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawTargets() {
        for (const target of this.targets) {
            const lifeRatio = target.life / target.maxLife;
            
            this.ctx.save();
            this.ctx.globalAlpha = Math.min(1, lifeRatio * 2);
            
            if (target.type === 'star') {
                this.drawStar(target);
            } else if (target.type === 'bomb') {
                this.drawBomb(target);
            } else {
                this.drawCircleTarget(target);
            }
            
            // Draw life indicator
            if (lifeRatio < 0.5) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(target.x, target.y, target.radius + 5, 
                    -Math.PI / 2, 
                    -Math.PI / 2 + (Math.PI * 2 * lifeRatio), 
                    false);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    drawCircleTarget(target) {
        const { x, y, radius, color, type } = target;
        
        // Outer ring
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner rings
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Points text
        this.ctx.fillStyle = '#333';
        this.ctx.font = `bold ${Math.floor(radius * 0.4)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(target.points, x, y);
    }
    
    drawStar(target) {
        const { x, y, radius } = target;
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.5;
        
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#ff8c00';
        this.ctx.lineWidth = 3;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i / spikes) - Math.PI / 2;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Shine effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Points
        this.ctx.fillStyle = '#8b4513';
        this.ctx.font = `bold ${Math.floor(radius * 0.5)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('50', x, y);
    }
    
    drawBomb(target) {
        const { x, y, radius } = target;
        
        // Bomb body
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fuse
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - radius);
        this.ctx.quadraticCurveTo(x + 10, y - radius - 15, x + 5, y - radius - 20);
        this.ctx.stroke();
        
        // Spark
        const sparkSize = 5 + Math.sin(Date.now() / 100) * 3;
        this.ctx.fillStyle = '#ff6600';
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y - radius - 20, sparkSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y - radius - 20, sparkSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // X mark
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 4;
        const xSize = radius * 0.4;
        this.ctx.beginPath();
        this.ctx.moveTo(x - xSize, y - xSize);
        this.ctx.lineTo(x + xSize, y + xSize);
        this.ctx.moveTo(x + xSize, y - xSize);
        this.ctx.lineTo(x - xSize, y + xSize);
        this.ctx.stroke();
    }
    
    drawEffects() {
        for (const effect of this.effects) {
            if (effect.type === 'muzzle') {
                // Muzzle flash
                const alpha = effect.life / effect.maxLife;
                this.ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, 15, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (effect.type === 'miss') {
                // Miss indicator
                const alpha = effect.life / effect.maxLife;
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.lineWidth = 2;
                const size = 10 + (1 - effect.life / effect.maxLife) * 10;
                this.ctx.beginPath();
                this.ctx.moveTo(effect.x - size, effect.y - size);
                this.ctx.lineTo(effect.x + size, effect.y + size);
                this.ctx.moveTo(effect.x + size, effect.y - size);
                this.ctx.lineTo(effect.x - size, effect.y + size);
                this.ctx.stroke();
            } else if (effect.type === 'hit' || effect.type === 'bomb') {
                // Particles
                for (const particle of effect.particles) {
                    this.ctx.fillStyle = particle.color;
                    this.ctx.globalAlpha = particle.life / 30;
                    this.ctx.fillRect(
                        particle.x - particle.size / 2,
                        particle.y - particle.size / 2,
                        particle.size,
                        particle.size
                    );
                }
                this.ctx.globalAlpha = 1;
                
                // Points popup
                if (effect.type === 'hit' && effect.points > 0) {
                    const alpha = effect.life / effect.maxLife;
                    const offsetY = (1 - alpha) * 30;
                    this.ctx.fillStyle = effect.points >= 50 ? '#ffd700' : 
                                         effect.points >= 30 ? '#f1c40f' : 
                                         effect.points >= 20 ? '#3498db' : '#fff';
                    this.ctx.font = 'bold 24px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillText(`+${effect.points}`, effect.x, effect.y - offsetY - 20);
                    this.ctx.globalAlpha = 1;
                } else if (effect.type === 'bomb') {
                    const alpha = effect.life / effect.maxLife;
                    const offsetY = (1 - alpha) * 30;
                    this.ctx.fillStyle = '#e74c3c';
                    this.ctx.font = 'bold 24px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillText('-20', effect.x, effect.y - offsetY - 20);
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    drawCrosshair() {
        const { mouseX: x, mouseY: y } = this;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        // Outer circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Cross lines
        this.ctx.beginPath();
        this.ctx.moveTo(x - 30, y);
        this.ctx.lineTo(x - 10, y);
        this.ctx.moveTo(x + 10, y);
        this.ctx.lineTo(x + 30, y);
        this.ctx.moveTo(x, y - 30);
        this.ctx.lineTo(x, y - 10);
        this.ctx.moveTo(x, y + 10);
        this.ctx.lineTo(x, y + 30);
        this.ctx.stroke();
        
        // Center dot
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.round = 1;
        this.totalShots = 0;
        this.totalHits = 0;
        this.targets = [];
        this.effects = [];
        
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.roundScreen.classList.add('hidden');
        
        this.startRound();
    }
    
    startRound() {
        this.ammo = this.maxAmmo;
        this.timeLeft = this.maxTime;
        this.roundShots = 0;
        this.roundHits = 0;
        this.roundScore = 0;
        this.targets = [];
        this.effects = [];
        
        this.ammoElement.parentElement.classList.remove('low');
        this.updateUI();
        
        // Start timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endRound();
            }
        }, 1000);
        
        // Start game loop
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.spawnTarget();
        this.updateTargets();
        this.updateEffects();
        
        // Check if round should end
        if (this.ammo <= 0) {
            this.endRound();
            return;
        }
        
        setTimeout(() => this.gameLoop(), 16);
    }
    
    endRound() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.round >= this.maxRounds) {
            this.endGame();
        } else {
            this.gameState = 'roundEnd';
            document.getElementById('roundNumber').textContent = this.round;
            document.getElementById('roundScore').textContent = this.roundScore;
            document.getElementById('roundHits').textContent = this.roundHits;
            document.getElementById('roundShots').textContent = this.roundShots;
            this.roundScreen.classList.remove('hidden');
        }
    }
    
    nextRound() {
        this.round++;
        this.roundScreen.classList.add('hidden');
        this.gameState = 'playing';
        this.startRound();
    }
    
    endGame() {
        this.gameState = 'gameOver';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const accuracy = this.totalShots > 0 
            ? Math.round((this.totalHits / this.totalShots) * 100) 
            : 0;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('accuracy').textContent = accuracy;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startGame();
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.roundElement.textContent = this.round;
        this.ammoElement.textContent = this.ammo;
        this.timeElement.textContent = this.timeLeft;
        this.timerBar.style.width = (this.timeLeft / this.maxTime * 100) + '%';
    }
}

// Initialize game
const game = new ShootingGalleryGame();
