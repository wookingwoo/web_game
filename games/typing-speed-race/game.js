const paragraphs = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing games can improve your speed and accuracy over time.",
  "Practice every day to see the best results in your typing race.",
  "JavaScript powers many interactive websites and games.",
  "Learning to type quickly is a valuable skill for many jobs."
];

const paragraphEl = document.getElementById('paragraph');
const inputEl = document.getElementById('input');
const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const countdownEl = document.getElementById('countdown');
let timer = null;
let timeLeft = 60;
let charIndex = 0;
let mistakes = 0;
let chart = null;

function loadParagraph() {
  const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  paragraphEl.innerHTML = '';
  paragraph.split('').forEach(ch => {
    const span = document.createElement('span');
    span.textContent = ch;
    paragraphEl.appendChild(span);
  });
}

function startGame() {
  loadParagraph();
  startBtn.disabled = true;
  overlay.classList.remove('hidden');
  let count = 3;
  countdownEl.textContent = count;
  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(countdown);
      overlay.classList.add('hidden');
      inputEl.disabled = false;
      inputEl.value = '';
      inputEl.focus();
      timeLeft = 60;
      charIndex = 0;
      mistakes = 0;
      timeEl.textContent = timeLeft;
      timer = setInterval(updateTime, 1000);
    }
  }, 1000);
}

function updateTime() {
  timeLeft--;
  timeEl.textContent = timeLeft;
  updateStats();
  if (timeLeft <= 0) finishGame();
}

function updateStats() {
  const elapsed = (60 - timeLeft) / 60; // minutes
  const wordsTyped = (charIndex - mistakes) / 5;
  const wpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
  wpmEl.textContent = wpm;
  const accuracy = charIndex ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 100;
  accuracyEl.textContent = accuracy;
}

inputEl.addEventListener('input', () => {
  const characters = paragraphEl.querySelectorAll('span');
  const typed = inputEl.value.split('');
  mistakes = 0;
  characters.forEach((span, index) => {
    const char = typed[index];
    if (char == null) {
      span.classList.remove('correct', 'incorrect');
    } else if (char === span.textContent) {
      span.classList.add('correct');
      span.classList.remove('incorrect');
    } else {
      span.classList.add('incorrect');
      span.classList.remove('correct');
      mistakes++;
    }
  });
  charIndex = typed.length;
  updateStats();
  if (typed.length === characters.length) finishGame();
});

function finishGame() {
  clearInterval(timer);
  inputEl.disabled = true;
  startBtn.disabled = false;
  saveResult(parseInt(wpmEl.textContent, 10));
  renderChart();
}

function saveResult(wpm) {
  const history = JSON.parse(localStorage.getItem('typingSpeedHistory') || '[]');
  history.push(wpm);
  localStorage.setItem('typingSpeedHistory', JSON.stringify(history));
}

function renderChart() {
  const ctx = document.getElementById('historyChart').getContext('2d');
  const data = JSON.parse(localStorage.getItem('typingSpeedHistory') || '[]');
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [{
        label: 'WPM History',
        data,
        borderColor: '#4caf50',
        fill: false
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

startBtn.addEventListener('click', startGame);
window.addEventListener('load', renderChart);
