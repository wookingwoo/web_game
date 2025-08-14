const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const soundMap = {
  kick: playKick,
  snare: playSnare,
  hihat: () => playHiHat(false),
  "hihat-open": () => playHiHat(true),
  tom1: () => playTom(200),
  tom2: () => playTom(170),
  tom3: () => playTom(140),
  crash: playCrash,
  clap: playClap
};

let isRecording = false;
let recordStart = 0;
let recorded = [];

const pads = document.querySelectorAll(".pad");
const recordBtn = document.getElementById("record-btn");
const playBtn = document.getElementById("play-btn");
const clearBtn = document.getElementById("clear-btn");

pads.forEach(pad => {
  pad.addEventListener("click", () => triggerSound(pad.dataset.sound));
});

document.addEventListener("keydown", e => {
  const pad = Array.from(pads).find(p => p.dataset.key === e.key.toUpperCase());
  if (pad) {
    triggerSound(pad.dataset.sound);
  }
});

recordBtn.addEventListener("click", () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

playBtn.addEventListener("click", playRecording);
clearBtn.addEventListener("click", () => {
  recorded = [];
  playBtn.disabled = true;
});

function triggerSound(name) {
  const fn = soundMap[name];
  if (!fn) return;
  fn();
  const pad = Array.from(pads).find(p => p.dataset.sound === name);
  pad.classList.add("active");
  setTimeout(() => pad.classList.remove("active"), 100);
  if (isRecording) {
    recorded.push({ sound: name, time: performance.now() - recordStart });
  }
}

function startRecording() {
  recorded = [];
  isRecording = true;
  recordStart = performance.now();
  recordBtn.classList.add("recording");
  recordBtn.textContent = "⏺ Recording";
  playBtn.disabled = true;
}

function stopRecording() {
  isRecording = false;
  recordBtn.classList.remove("recording");
  recordBtn.textContent = "● Record";
  if (recorded.length > 0) {
    playBtn.disabled = false;
  }
}

function playRecording() {
  if (recorded.length === 0) return;
  recorded.forEach(event => {
    setTimeout(() => triggerSound(event.sound), event.time);
  });
}

// --- Sound synthesis functions ---
function playKick() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

function playSnare() {
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1000;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start();
  noise.stop(audioCtx.currentTime + 0.2);
}

function playHiHat(open) {
  const duration = open ? 0.4 : 0.05;
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 5000;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start();
  noise.stop(audioCtx.currentTime + duration);
}

function playTom(freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

function playCrash() {
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start();
  noise.stop(audioCtx.currentTime + 1.5);
}

function playClap() {
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const gain = audioCtx.createGain();
  noise.connect(gain).connect(audioCtx.destination);
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.setValueAtTime(0, audioCtx.currentTime + 0.1);
  noise.start();
  noise.stop(audioCtx.currentTime + 0.2);
}
