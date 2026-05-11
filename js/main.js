const GAMES = [
  {
    id: "dodge-the-poop",
    title: "Dodge the Poop",
    icon: "💩",
    description: "Avoid falling objects and survive as long as you can!",
    category: "action",
    src: "games/dodge-the-poop/index.html",
  },
  {
    id: "cross-the-road",
    title: "Cross the Road",
    icon: "🐔",
    description: "Help the chicken cross busy roads safely!",
    category: "action",
    src: "games/cross-the-road/index.html",
  },
  {
    id: "crossy-road1",
    title: "Crossy Road Classic",
    icon: "🐣",
    description: "The original road crossing adventure!",
    category: "action",
    src: "games/crossy_road/crossy_road.html",
  },
  {
    id: "apple-catch",
    title: "Apple Catch",
    icon: "🍎",
    description: "Catch falling apples with your basket!",
    category: "action",
    src: "games/apple-catch/index.html",
  },
  {
    id: "jumping-ball-runner",
    title: "Underwater Dash",
    icon: "🐠",
    description: "Swim a clownfish over coral reefs in this underwater runner!",
    category: "action",
    src: "games/underwater-dash/index.html",
  },
  {
    id: "snake",
    title: "Snake",
    icon: "🐍",
    description: "Classic snake game with neon style. Choose your difficulty!",
    category: "action",
    src: "games/snake/index.html",
  },
  {
    id: "archery",
    title: "Archery",
    icon: "🏹",
    description: "Draw your bow and hit the target!",
    category: "action",
    src: "games/archery/index.html",
  },
  {
    id: "shooting-gallery",
    title: "Shooting Gallery",
    icon: "🎯",
    description: "Aim and shoot targets in this arcade-style game!",
    category: "action",
    src: "games/shooting-gallery/index.html",
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    icon: "✊",
    description: "Challenge the AI in the classic game of Rock Paper Scissors!",
    category: "action",
    src: "games/rock-paper-scissors/index.html",
  },
  {
    id: "slot-machine",
    title: "Slot Machine",
    icon: "🎰",
    description: "Spin the reels and win big! Classic casino slot machine.",
    category: "action",
    src: "games/slot-machine/index.html",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    icon: "🧠",
    description: "Find all matching pairs of cards!",
    category: "puzzle",
    src: "games/memory-match/index.html",
  },
  {
    id: "typing-speed-race",
    title: "Typing Speed Race",
    icon: "⌨️",
    description: "Test your typing speed and accuracy under pressure!",
    category: "puzzle",
    src: "games/typing-speed-race/index.html",
  },
  {
    id: "tetris",
    title: "Tetris",
    icon: "🟦",
    description: "Stack falling blocks and clear lines!",
    category: "puzzle",
    src: "games/tetris/index.html",
  },
  {
    id: "pixel-painter",
    title: "Pixel Painter",
    icon: "🎨",
    description: "Create retro-style pixel art.",
    category: "creative",
    src: "games/pixel-painter/index.html",
  },
  {
    id: "virtual-drum-kit",
    title: "Virtual Drum Kit",
    icon: "🥁",
    description: "Play drums with your keyboard or mouse. Record and play back beats!",
    category: "creative",
    src: "games/virtual-drum-kit/index.html",
  },
  // 새로 추가된 게임들
  {
    id: "2048",
    title: "2048",
    icon: "🔢",
    description: "Combine tiles to reach 2048! Classic puzzle game.",
    category: "puzzle",
    src: "games/2048/index.html",
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "💣",
    description: "Classic minesweeper. Find all mines without triggering any!",
    category: "puzzle",
    src: "games/minesweeper/index.html",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    icon: "9️⃣",
    description: "Classic Sudoku puzzle. Fill the grid with numbers 1-9!",
    category: "puzzle",
    src: "games/sudoku/index.html",
  },
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    icon: "🐦",
    description: "Fly through the pipes! Tap to flap and survive.",
    category: "action",
    src: "games/flappy-bird/index.html",
  },
  {
    id: "breakout",
    title: "Breakout",
    icon: "🧱",
    description: "Break all the bricks with your ball and paddle!",
    category: "action",
    src: "games/breakout/index.html",
  },
  {
    id: "whack-a-mole",
    title: "Whack-a-Mole",
    icon: "🔨",
    description: "Whack the moles as they pop up! Watch out for bombs!",
    category: "action",
    src: "games/whack-a-mole/index.html",
  },
  {
    id: "fruit-ninja",
    title: "Fruit Ninja",
    icon: "🍉",
    description: "Slice the fruits! Avoid the bombs.",
    category: "action",
    src: "games/fruit-ninja/index.html",
  },
  {
    id: "reaction-time",
    title: "Reaction Time",
    icon: "⚡",
    description: "Test your reaction speed! Click when the screen turns green.",
    category: "puzzle",
    src: "games/reaction-time/index.html",
  },
  {
    id: "color-match",
    title: "Color Match",
    icon: "🎨",
    description: "Match the color of the text, not the word! Stroop test game.",
    category: "puzzle",
    src: "games/color-match/index.html",
  },
  {
    id: "simon-says",
    title: "Simon Says",
    icon: "🧠",
    description: "Memory game! Watch the pattern and repeat it correctly.",
    category: "puzzle",
    src: "games/simon-says/index.html",
  },
  {
    id: "coin-flip",
    title: "Coin Flip",
    icon: "🪙",
    description: "Flip a coin and test your luck! Heads or tails?",
    category: "action",
    src: "games/coin-flip/index.html",
  },
  {
    id: "dice-roll",
    title: "Dice Roll",
    icon: "🎲",
    description: "Roll the dice and bet on the outcome!",
    category: "action",
    src: "games/dice-roll/index.html",
  },
  {
    id: "number-guessing",
    title: "Number Guessing",
    icon: "🔢",
    description: "Guess the number between 1 and 100! Up and down game.",
    category: "puzzle",
    src: "games/number-guessing/index.html",
  },
  {
    id: "hangman",
    title: "Hangman",
    icon: "😵",
    description: "Guess the word before the hangman is complete!",
    category: "puzzle",
    src: "games/hangman/index.html",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    icon: "⭕",
    description: "Classic 3x3 game. Play against AI or a friend!",
    category: "puzzle",
    src: "games/tic-tac-toe/index.html",
  },
];

const CATEGORY_COLORS = {
  action: { bg: "#fff0f0", badge: "#e74c3c", label: "Action" },
  puzzle: { bg: "#f0f4ff", badge: "#3b5bdb", label: "Puzzle" },
  creative: { bg: "#f0fff4", badge: "#2f9e44", label: "Creative" },
};

let activeCategory = "all";

function renderGames() {
  const menu = document.getElementById("game-menu");
  menu.innerHTML = GAMES.map((g) => {
    const color = CATEGORY_COLORS[g.category];
    return `
      <div class="game-card" data-id="${g.id}" data-category="${g.category}" onclick="loadGame('${g.id}')">
        <span class="category-badge" style="background:${color.badge}">${color.label}</span>
        <div class="game-icon">${g.icon}</div>
        <h3>${g.title}</h3>
        <p>${g.description}</p>
        <button>Play Now</button>
      </div>`;
  }).join("");

  document.getElementById("game-count").textContent = `${GAMES.length} Games`;
  filterGames();
}

function setCategory(btn) {
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.category;
  filterGames();
}

function filterGames() {
  const query = (document.getElementById("search-input").value || "").toLowerCase();
  const cards = document.querySelectorAll(".game-card");
  let visible = 0;

  cards.forEach((card) => {
    const matchCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const matchSearch = !query || card.querySelector("h3").textContent.toLowerCase().includes(query);
    const show = matchCategory && matchSearch;
    card.style.display = show ? "" : "none";
    if (show) visible++;
  });

  document.getElementById("no-results").style.display = visible === 0 ? "block" : "none";
}

function loadGame(gameId) {
  const game = GAMES.find((g) => g.id === gameId);
  if (!game) return;

  document.querySelector(".controls").style.display = "none";
  document.getElementById("game-menu").style.display = "none";
  document.getElementById("no-results").style.display = "none";
  document.querySelector("header").style.display = "none";

  const gameContainer = document.getElementById("game-container");
  gameContainer.style.display = "block";
  document.getElementById("game-frame").src = game.src;
  document.getElementById("current-game-title").textContent = game.title;
}

function returnToMenu() {
  if (document.fullscreenElement) document.exitFullscreen();

  document.getElementById("game-container").style.display = "none";
  document.getElementById("game-frame").src = "";
  document.querySelector("header").style.display = "";
  document.querySelector(".controls").style.display = "";
  document.getElementById("game-menu").style.display = "";
  filterGames();
}

function toggleFullscreen() {
  const gameContainer = document.getElementById("game-container");
  if (!document.fullscreenElement) {
    gameContainer.requestFullscreen().catch((err) => console.error(err));
  } else {
    document.exitFullscreen().catch((err) => console.error(err));
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("fullscreenchange", () => {
    const btn = document.getElementById("fullscreen-btn");
    if (btn) btn.textContent = document.fullscreenElement ? "🗗 Exit Fullscreen" : "🔳 Fullscreen";
  });

  renderGames();
}

if (typeof module !== "undefined") {
  module.exports = { loadGame, returnToMenu, toggleFullscreen };
}
