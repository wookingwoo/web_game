const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const groundY = canvas.height - 45;
const player = { x: 70, y: groundY - 20, radius: 20, dy: 0, jumping: false, tailPhase: 0 };
const gravity = 0.52;
const jumpPower = -12.5;
const obstacles = [];
const bubbles = [];
const seaweed = [];
let frame = 0;
let score = 0;
let gameRunning = true;
let bgOffset = 0;

for (let i = 0; i < 18; i++) {
  bubbles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 4 + 1.5,
    speed: Math.random() * 0.7 + 0.25,
    wobble: Math.random() * Math.PI * 2,
  });
}

for (let i = 0; i < 9; i++) {
  seaweed.push({
    x: 60 + i * 95 + Math.random() * 30,
    height: 28 + Math.random() * 28,
    phase: Math.random() * Math.PI * 2,
    color: i % 2 === 0 ? '#27ae60' : '#1e8449',
  });
}

function spawnObstacle() {
  const variants = [45, 60, 75];
  const h = variants[Math.floor(Math.random() * variants.length)];
  const type = Math.floor(Math.random() * 3);
  obstacles.push({ x: canvas.width + 10, y: groundY - h, width: 32, height: h, type });
}

function update() {
  if (!gameRunning) return;
  frame++;

  const spawnInterval = Math.max(70, 110 - Math.floor(score / 5) * 4);
  if (frame % spawnInterval === 0) spawnObstacle();

  bgOffset += 1.2;

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    ob.x -= 5 + score * 0.04;
    if (ob.x + ob.width < 0) {
      obstacles.splice(i, 1);
      score++;
      document.getElementById('score').textContent = score;
    }
  }

  bubbles.forEach(b => {
    b.y -= b.speed;
    b.x += Math.sin(frame * 0.03 + b.wobble) * 0.4;
    if (b.y + b.r < 0) {
      b.y = canvas.height + b.r;
      b.x = Math.random() * canvas.width;
    }
  });

  player.dy += gravity;
  player.y += player.dy;
  player.tailPhase += 0.18;

  if (player.y >= groundY - player.radius) {
    player.y = groundY - player.radius;
    player.dy = 0;
    player.jumping = false;
  }

  for (const ob of obstacles) {
    const cx = ob.x + ob.width / 2;
    if (
      player.x + player.radius - 6 > cx - 10 &&
      player.x - player.radius + 6 < cx + 10 &&
      player.y + player.radius - 6 > ob.y
    ) {
      return gameOver();
    }
  }

  draw();
  requestAnimationFrame(update);
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0c2d57');
  grad.addColorStop(0.6, '#1565a0');
  grad.addColorStop(1, '#1e88c8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Light rays
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 6; i++) {
    const rx = ((i * 140 + bgOffset * 0.25) % (canvas.width + 140)) - 70;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx - 40, canvas.height);
    ctx.lineTo(rx + 40, canvas.height);
    ctx.fill();
  }
  ctx.restore();
}

function drawGround() {
  // Sand
  const grad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
  grad.addColorStop(0, '#c8a96e');
  grad.addColorStop(1, '#9e7c4a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // Pebbles
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 24; i++) {
    const px = ((i * 41 + bgOffset * 0.6) % canvas.width);
    ctx.beginPath();
    ctx.ellipse(px, groundY + 10, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSeaweed() {
  seaweed.forEach(sw => {
    const sx = ((sw.x - bgOffset * 0.18) % canvas.width + canvas.width) % canvas.width;
    const sway = Math.sin(frame * 0.045 + sw.phase) * 9;

    ctx.save();
    ctx.lineCap = 'round';

    ctx.strokeStyle = sw.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx, groundY);
    ctx.quadraticCurveTo(sx + sway, groundY - sw.height * 0.5, sx + sway * 1.4, groundY - sw.height);
    ctx.stroke();

    ctx.strokeStyle = sw.color === '#27ae60' ? '#2ecc71' : '#27ae60';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx + 7, groundY);
    ctx.quadraticCurveTo(sx + 7 - sway * 0.7, groundY - sw.height * 0.55, sx + 7 - sway, groundY - sw.height * 0.85);
    ctx.stroke();

    ctx.restore();
  });
}

function drawBubbles() {
  bubbles.forEach(b => {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,230,255,0.9)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // highlight
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
  });
}

function drawFish() {
  const x = player.x;
  const y = player.y;
  const wag = Math.sin(player.tailPhase) * 5;
  const inAir = player.jumping;

  ctx.save();
  ctx.translate(x, y);
  // Tilt slightly upward when jumping
  if (inAir && player.dy < 0) ctx.rotate(-0.18);

  // Tail fin
  ctx.beginPath();
  ctx.moveTo(-15, wag);
  ctx.lineTo(-32, -13 + wag);
  ctx.lineTo(-32, 13 + wag);
  ctx.closePath();
  ctx.fillStyle = '#e67e22';
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 23, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f39c12';
  ctx.fill();

  // White stripe (clownfish style)
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-2, -13, 8, 26);
  ctx.restore();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-4, -12);
  ctx.lineTo(4, -22);
  ctx.lineTo(13, -12);
  ctx.closePath();
  ctx.fillStyle = '#e67e22';
  ctx.fill();

  // Eye white
  ctx.beginPath();
  ctx.arc(13, -3, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  // Pupil
  ctx.beginPath();
  ctx.arc(14, -3, 2.8, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  // Highlight
  ctx.beginPath();
  ctx.arc(15, -4.5, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Bubble trail when moving fast
  if (inAir && Math.random() > 0.5) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(-25 - Math.random() * 8, (Math.random() - 0.5) * 10, Math.random() * 3 + 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,230,255,0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

function drawCoral(ob) {
  const palettes = [
    { trunk: '#e74c6e', branch: '#c0392b', tip: '#ff6b8a' },
    { trunk: '#d35400', branch: '#a04000', tip: '#e67e22' },
    { trunk: '#8e44ad', branch: '#6c3483', tip: '#a569bd' },
  ];
  const p = palettes[ob.type];
  const cx = ob.x + ob.width / 2;
  const base = ob.y + ob.height;

  ctx.save();
  ctx.translate(cx, base);

  // Trunk
  ctx.fillStyle = p.trunk;
  const trunkW = 10;
  ctx.beginPath();
  ctx.roundRect(-trunkW / 2, -ob.height, trunkW, ob.height, 4);
  ctx.fill();

  // Branches
  const levels = Math.floor(ob.height / 22);
  for (let i = 0; i < levels; i++) {
    const by = -(22 + i * 20);
    const blen = 14 - i * 1.5;

    ctx.fillStyle = p.branch;
    // Left
    ctx.beginPath();
    ctx.moveTo(-trunkW / 2, by);
    ctx.lineTo(-trunkW / 2 - blen, by - blen * 0.7);
    ctx.lineTo(-trunkW / 2 - blen + 4, by - blen * 0.7);
    ctx.lineTo(-trunkW / 2, by + 5);
    ctx.fill();
    // Left tip
    ctx.beginPath();
    ctx.arc(-trunkW / 2 - blen, by - blen * 0.7, 4, 0, Math.PI * 2);
    ctx.fillStyle = p.tip;
    ctx.fill();

    // Right
    ctx.fillStyle = p.branch;
    ctx.beginPath();
    ctx.moveTo(trunkW / 2, by);
    ctx.lineTo(trunkW / 2 + blen, by - blen * 0.7);
    ctx.lineTo(trunkW / 2 + blen - 4, by - blen * 0.7);
    ctx.lineTo(trunkW / 2, by + 5);
    ctx.fill();
    // Right tip
    ctx.beginPath();
    ctx.arc(trunkW / 2 + blen, by - blen * 0.7, 4, 0, Math.PI * 2);
    ctx.fillStyle = p.tip;
    ctx.fill();
  }

  // Crown
  ctx.beginPath();
  ctx.arc(0, -ob.height, 7, 0, Math.PI * 2);
  ctx.fillStyle = p.tip;
  ctx.fill();

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawBubbles();
  drawSeaweed();
  drawGround();
  obstacles.forEach(drawCoral);
  drawFish();
}

function jump() {
  if (!player.jumping) {
    player.dy = jumpPower;
    player.jumping = true;
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });

function gameOver() {
  gameRunning = false;
  document.getElementById('finalScore').textContent = score;
  document.getElementById('gameOver').classList.remove('hidden');
}

function restartGame() {
  obstacles.length = 0;
  score = 0;
  frame = 0;
  bgOffset = 0;
  document.getElementById('score').textContent = 0;
  player.y = groundY - player.radius;
  player.dy = 0;
  player.jumping = false;
  player.tailPhase = 0;
  gameRunning = true;
  document.getElementById('gameOver').classList.add('hidden');
  update();
}

update();
