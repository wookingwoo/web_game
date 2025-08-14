const canvas = document.getElementById('viz');
const ctx = canvas.getContext('2d');
let audioCtx, analyser, dataArray;
let style = 'bars';
let speed = 1;
let density = 64;
let glow = 10;
let color = '#00ffff';
let time = 0;

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resize);
resize();

function setupAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // create simple vaporwave tone using oscillators
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  gain.gain.value = 0.15;
  osc1.type = 'sawtooth';
  osc2.type = 'sine';
  osc1.frequency.value = 220;
  osc2.frequency.value = 330;
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(filter);
  filter.connect(analyser);
  analyser.connect(audioCtx.destination);
  osc1.start();
  osc2.start();

  const notes = [220, 196, 246, 174];
  let i = 0;
  setInterval(() => {
    osc1.frequency.setValueAtTime(notes[i % notes.length], audioCtx.currentTime);
    osc2.frequency.setValueAtTime(notes[(i + 2) % notes.length] * 1.5, audioCtx.currentTime);
    i++;
  }, 2000);
}

function draw() {
  requestAnimationFrame(draw);
  if (!analyser) return;
  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = glow;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  const step = Math.max(1, Math.floor(dataArray.length / density));
  switch (style) {
    case 'bars':
      const barWidth = canvas.width / density;
      for (let i = 0; i < density; i++) {
        const val = dataArray[i * step] / 255;
        const barHeight = val * canvas.height;
        ctx.globalAlpha = val;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
      break;
    case 'dots':
      const spacing = canvas.width / density;
      for (let i = 0; i < density; i++) {
        const val = dataArray[i * step] / 255;
        const radius = val * 10 * speed + 2;
        const x = i * spacing + spacing / 2;
        const y = canvas.height / 2 + Math.sin((i + time) * 0.3 * speed) * canvas.height / 4;
        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'grid':
      const cells = Math.floor(Math.sqrt(density));
      const cellW = canvas.width / cells;
      const cellH = canvas.height / cells;
      let idx = 0;
      for (let x = 0; x < cells; x++) {
        for (let y = 0; y < cells; y++) {
          const val = dataArray[idx % dataArray.length] / 255;
          ctx.globalAlpha = val;
          ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
          idx += step;
        }
      }
      break;
  }
  time += 0.02 * speed;
}

document.getElementById('style').addEventListener('change', e => style = e.target.value);
document.getElementById('speed').addEventListener('input', e => speed = parseFloat(e.target.value));
document.getElementById('density').addEventListener('input', e => density = parseInt(e.target.value, 10));
document.getElementById('glow').addEventListener('input', e => glow = parseInt(e.target.value, 10));
document.getElementById('hue').addEventListener('input', e => color = e.target.value);

document.getElementById('start-btn').addEventListener('click', () => {
  if (!audioCtx) {
    setupAudio();
  }
  draw();
  document.getElementById('start-btn').style.display = 'none';
});
