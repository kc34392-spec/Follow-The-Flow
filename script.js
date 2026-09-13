// =========================
// CHARACTER SELECTION
// =========================

const characterCards = document.querySelectorAll(".character-card");

let selectedCharacter = "Ripple";

characterCards.forEach((card) => {
  card.addEventListener("click", () => {

    // Remove selected border from every character
    characterCards.forEach((item) => {
      item.classList.remove("selected");
    });

    // Add selected border to clicked character
    card.classList.add("selected");

    // Save selected character
    selectedCharacter = card.dataset.character;

    console.log("Selected:", selectedCharacter);
  });
});


// =========================
// START GAME
// =========================

const startButton = document.getElementById("startButton");
const startScreen = document.querySelector(".start-screen");
const characterSection = document.querySelector(".character-section");
const gameScreen = document.getElementById("gameScreen");

startButton.addEventListener("click", () => {

  console.log("Starting game with:", selectedCharacter);

  const player = document.getElementById("player");

  if (selectedCharacter === "Ripple") {
    player.src = "ripple.png";
  }

  if (selectedCharacter === "Splash") {
    player.src = "splash.png";
  }

  if (selectedCharacter === "Dewey") {
    player.src = "dewey.png";
  }

  startScreen.style.display = "none";
  characterSection.style.display = "none";

  gameScreen.style.display = "block";

  window.scrollTo(0, 0);
});

// =========================
// PLAYER MOVEMENT
// =========================

const player = document.getElementById("player");
const gameArea = document.querySelector(".game-area");

let playerX = 50;
let cleanWater = 100;
let distance = 4.2;

document.addEventListener("keydown", (event) => {

  if (gameScreen.style.display !== "block") {
    return;
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    playerX -= 4;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    playerX += 4;
  }

  // Keep player inside the game area
  playerX = Math.max(7, Math.min(93, playerX));

  player.style.left = playerX + "%";
});
// =========================
// HAZARD MOVEMENT
// =========================

const hazard = document.getElementById("hazard");

let hazardY = -80;
let hazardX = 50;

const hazardTypes = [
  {
    symbol: "🪨",
    damage: 10
  },
  {
    symbol: "🏜️",
    damage: 15
  },
  {
    symbol: "☣️",
    damage: 20
  }
];

let currentHazardDamage = 10;

function resetHazard() {

  hazardY = -80;

  // Pick random position
  hazardX = Math.random() * 80 + 10;
  hazard.style.left = hazardX + "%";

  // Pick random hazard
  const randomHazard =
    hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

  hazard.textContent = randomHazard.symbol;

  currentHazardDamage = randomHazard.damage;
}

function moveHazard() {

  if (gameScreen.style.display === "block") {

    hazardY += 3;
    hazard.style.top = hazardY + "px";

    // Check if the rock hit the player
    checkCollision();

    // Respawn after leaving the screen
    if (hazardY > gameArea.clientHeight) {
      resetHazard();
    }
  }

  requestAnimationFrame(moveHazard);
}

function checkCollision() {

  const playerBox = player.getBoundingClientRect();
  const hazardBox = hazard.getBoundingClientRect();

  const collision =
    playerBox.left < hazardBox.right &&
    playerBox.right > hazardBox.left &&
    playerBox.top < hazardBox.bottom &&
    playerBox.bottom > hazardBox.top;

  if (collision) {

    // Lose water based on hazard type
    cleanWater -= currentHazardDamage;

    // Never go below 0%
    cleanWater = Math.max(0, cleanWater);
    if (cleanWater === 0) {
  endGame();
  return;
}

    // Update HUD
    const waterDisplay = document.getElementById("waterPercent");

waterDisplay.textContent = cleanWater + "%";

const waterBarFill = document.getElementById("waterBarFill");

waterBarFill.style.width = `${cleanWater}%`;

console.log("Water:", cleanWater);
console.log("Bar width:", waterBarFill.style.width);

// Damage animation
player.classList.remove("player-hit");
waterDisplay.classList.remove("water-hit");

void player.offsetWidth;

player.classList.add("player-hit");
waterDisplay.classList.add("water-hit");

// Immediately move the rock away
resetHazard();
  }
}

resetHazard();
moveHazard();

// =========================
// DISTANCE
// =========================

let lastDistanceUpdate = 0;

function updateDistance(timestamp) {

  if (gameScreen.style.display === "block") {

    if (timestamp - lastDistanceUpdate >= 100) {

      distance -= 0.01;

      distance = Math.max(0, distance);

      document.getElementById("distanceRemaining").textContent =
        distance.toFixed(2) + " KM";

      // ADD IT RIGHT HERE
      if (distance <= 0) {
        endGame();
        return;
      }

      lastDistanceUpdate = timestamp;
    }
  }

  requestAnimationFrame(updateDistance);
}

requestAnimationFrame(updateDistance);

// =========================
// END GAME
// =========================

const endScreen = document.getElementById("endScreen");
const finalWaterText = document.getElementById("finalWaterText");
const restartButton = document.getElementById("restartButton");

function endGame() {
  gameScreen.style.display = "none";
  endScreen.style.display = "flex";

  const endTitle = endScreen.querySelector("h2");

  if (cleanWater > 0) {
    endTitle.textContent = "YOU MADE IT!";
    finalWaterText.textContent =
      `You delivered ${cleanWater}% clean water to the community.`;
  } else {
    endTitle.textContent = "THE FLOW STOPPED";
    finalWaterText.textContent =
      "No clean water made it to the community this time.";
  }

  window.scrollTo(0, 0);
}

restartButton.addEventListener("click", () => {
  location.reload();
});