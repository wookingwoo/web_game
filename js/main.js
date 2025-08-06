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

    default:
      console.error("Unknown game type:", gameType);
  }
}

function returnToMenu() {
  const gameMenu = document.querySelector(".game-menu");
  const gameContainer = document.getElementById("game-container");
  const gameFrame = document.getElementById("game-frame");

  gameContainer.style.display = "none";
  gameMenu.style.display = "grid";
  gameFrame.src = "";
}
