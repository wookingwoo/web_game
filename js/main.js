function loadGame(gameType) {
  const gameMenu = document.querySelector(".game-menu");
  const gameContainer = document.getElementById("game-container");
  const gameFrame = document.getElementById("game-frame");
  const gameTitle = document.getElementById("current-game-title");

  gameMenu.style.display = "none";
  gameContainer.style.display = "block";

  switch (gameType) {
    case "dodge-the-poop":
      gameFrame.src = "games/dodge-the-poop/index.html";
      gameTitle.textContent = "Dodge the Poop";
      break;
    case "crossy-road1":
      gameFrame.src = "games/crossy_road/crossy_road.html";
      gameTitle.textContent = "Cross the Road 1";
      break;
    case "cross-the-road":
      gameFrame.src = "games/cross-the-road/index.html";
      gameTitle.textContent = "Cross the Road 2";
      break;
    case "apple-catch":
      gameFrame.src = "games/apple-catch/index.html";
      gameTitle.textContent = "Apple Catch";
      break;
    case "jumping-ball-runner":
      gameFrame.src = "games/jumping-ball-runner/index.html";
      gameTitle.textContent = "Jumping Ball Runner";
      break;
    case "pixel-painter":
      gameFrame.src = "games/pixel-painter/index.html";
      gameTitle.textContent = "Pixel Painter";
      break;
    case "typing-speed-race":
      gameFrame.src = "games/typing-speed-race/index.html";
      gameTitle.textContent = "Typing Speed Race";
      break;
    case "virtual-drum-kit":
      gameFrame.src = "games/virtual-drum-kit/index.html";
      gameTitle.textContent = "Virtual Drum Kit";
      break;
    case "lofi-visualizer":
      gameFrame.src = "games/lofi-visualizer/index.html";
      gameTitle.textContent = "Lo-Fi Visualiser";
      break;
    default:
      console.error("Unknown game type:", gameType);
  }
}

function returnToMenu() {
  const gameMenu = document.querySelector(".game-menu");
  const gameContainer = document.getElementById("game-container");
  const gameFrame = document.getElementById("game-frame");

  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  gameContainer.style.display = "none";
  gameMenu.style.display = "grid";
  gameFrame.src = "";
}

function toggleFullscreen() {
  const gameContainer = document.getElementById("game-container");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  if (!document.fullscreenElement) {
    gameContainer
      .requestFullscreen()
      .then(() => {
        fullscreenBtn.textContent = "🗗 Exit Fullscreen";
      })
      .catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
  } else {
    document
      .exitFullscreen()
      .then(() => {
        fullscreenBtn.textContent = "🔳 Fullscreen";
      })
      .catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
      });
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("fullscreenchange", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    if (document.fullscreenElement) {
      fullscreenBtn.textContent = "🗗 Exit Fullscreen";
    } else {
      fullscreenBtn.textContent = "🔳 Fullscreen";
    }
  });
}

// Expose functions for testing in Node environments
if (typeof module !== "undefined") {
  module.exports = { loadGame, returnToMenu, toggleFullscreen };
}
