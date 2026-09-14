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
const mobileControls = document.querySelector(".mobile-controls");

const hazardImage = document.querySelector("#hazard .hazard-image");
const hazard2Image = document.querySelector("#hazard2 .hazard-image");
const helpImage = document.querySelector("#helpItem .help-image");

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
  if (window.matchMedia("(max-width: 900px)").matches || navigator.maxTouchPoints > 0) {
    mobileControls.classList.add("mobile-controls-visible");
  }
  updateProgressState();

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
let score = 0;

function movePlayer(direction) {
  if (gameScreen.style.display !== "block") {
    return;
  }

  playerX += direction * 4;
  playerX = Math.max(7, Math.min(93, playerX));
  player.style.left = playerX + "%";
}

document.addEventListener("keydown", (event) => {

  if (gameScreen.style.display !== "block") {
    return;
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    movePlayer(-1);
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    movePlayer(1);
  }
});

document.getElementById("moveLeftButton").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  movePlayer(-1);
});

document.getElementById("moveRightButton").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  movePlayer(1);
});
// =========================
// HAZARD MOVEMENT
// =========================

const hazard = document.getElementById("hazard");

let hazardY = -80;
let hazardX = 50;

const hazard2 = document.getElementById("hazard2");

let hazard2Y = -80;
let hazard2X = 50;
let hazard2Active = false;
let currentHazard2Damage = 10;

const hazardTypes = [
  {
    image: "rock-hazard.png",
    imageClass: "rock-image",
    damage: 10
  },
  {
    image: "dry-hazard.png",
    imageClass: "dry-image",
    damage: 15
  },
  {
    image: "contamination-hazard.png",
    imageClass: "contamination-image",
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

  hazardImage.src = randomHazard.image;
  hazardImage.alt = randomHazard.imageClass.replace("-image", "") + " hazard";
  hazardImage.className = `hazard-image ${randomHazard.imageClass}`;

  currentHazardDamage = randomHazard.damage;

}
function resetHazard2() {
  hazard2Y = -80;

  hazard2X = Math.random() * 80 + 10;
  hazard2.style.left = hazard2X + "%";

  const randomHazard =
    hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

  hazard2Image.src = randomHazard.image;
  hazard2Image.alt = randomHazard.imageClass.replace("-image", "") + " hazard";
  hazard2Image.className = `hazard-image ${randomHazard.imageClass}`;
  currentHazard2Damage = randomHazard.damage;

  let spawnChance = 0;

  if (distance <= 3.0 && distance > 1.5) {
    spawnChance = 0.3;
  } else if (distance <= 1.5) {
    spawnChance = 0.6;
  }

  if (Math.random() < spawnChance) {
    hazard2.style.display = "block";
    hazard2Active = true;
  } else {
    hazard2.style.display = "none";
    hazard2Active = false;
  }
}

function moveHazard() {

  if (gameScreen.style.display === "block") {

    let hazardSpeed;

if (distance > 3.0) {
  hazardSpeed = 3;
} else if (distance > 1.5) {
  hazardSpeed = 4;
} else {
  hazardSpeed = 7;
}

hazardY += hazardSpeed;
    hazard.style.top = hazardY + "px";

    // Check if the rock hit the player
    checkCollision();

    // Respawn after leaving the screen
    if (hazardY > gameArea.clientHeight) {

      score += 25;
       document.getElementById("score").textContent = score;
      showFeedback("+25 DODGE", "positive");
       resetHazard();
      }
  }

  requestAnimationFrame(moveHazard);
}

function moveHazard2() {
  if (gameScreen.style.display === "block" && hazard2Active) {

    let hazard2Speed;

    if (distance > 3.0) {
      hazard2Speed = 3;
    } else if (distance > 1.5) {
      hazard2Speed = 4.5;
    } else {
      hazard2Speed = 7;
    }

    hazard2Y += hazard2Speed;
    hazard2.style.top = hazard2Y + "px";

    checkCollision2();

    if (hazard2Y > gameArea.clientHeight) {
      score += 25;
      document.getElementById("score").textContent = score;
      showFeedback("+25 DODGE", "positive");

      resetHazard2();
    }
  }

  requestAnimationFrame(moveHazard2);
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
    // Never go below 0%
cleanWater = Math.max(0, cleanWater);

// Lose points for hitting a hazard
score -= 75;
score = Math.max(0, score);
document.getElementById("score").textContent = score;
showFeedback("-75 POINTS", "negative");
showFeedback(`-${currentHazardDamage}% WATER`, "negative");

if (cleanWater === 0) {
  endGame();
  return;
}
    if (cleanWater === 0) {
  endGame();
  return;
}

    // Update HUD
    const waterDisplay = document.getElementById("waterPercent");

waterDisplay.textContent = cleanWater + "%";

const waterBarFill = document.getElementById("waterBarFill");

waterBarFill.style.width = `${cleanWater}%`;
updateWaterState();

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

function checkCollision2() {

  const playerBox = player.getBoundingClientRect();
  const hazardBox = hazard2.getBoundingClientRect();

  const collision =
    playerBox.left < hazardBox.right &&
    playerBox.right > hazardBox.left &&
    playerBox.top < hazardBox.bottom &&
    playerBox.bottom > hazardBox.top;

  if (collision) {
    cleanWater -= currentHazard2Damage;
    cleanWater = Math.max(0, cleanWater);

    score -= 75;
    score = Math.max(0, score);
    document.getElementById("score").textContent = score;
    showFeedback("-75 POINTS", "negative");
    showFeedback(`-${currentHazard2Damage}% WATER`, "negative");

    if (cleanWater === 0) {
      endGame();
      return;
    }

    const waterDisplay = document.getElementById("waterPercent");
    waterDisplay.textContent = cleanWater + "%";
    document.getElementById("waterBarFill").style.width = `${cleanWater}%`;
    updateWaterState();

    player.classList.remove("player-hit");
    waterDisplay.classList.remove("water-hit");
    void player.offsetWidth;
    player.classList.add("player-hit");
    waterDisplay.classList.add("water-hit");

    resetHazard2();
  }
}

resetHazard();
resetHazard2();

moveHazard();
moveHazard2();

// =========================
// HELP ITEM
// =========================

const helpItem = document.getElementById("helpItem");

let helpY = -60;
let helpX = 30;
let helpActive = false;

const helpTypes = [
  {
    image: "clean-drop.png",
    imageClass: "clean-drop-image",
    water: 10,
    points: 100
  },
  {
    image: "jerry-can.png",
    imageClass: "jerry-can-image",
    water: 20,
    points: 150
  }
];

let currentHelpWater = 15;
let currentHelpPoints = 100;

function spawnHelpItem() {
  helpY = -60;

  helpX = Math.random() * 80 + 10;
  helpItem.style.left = helpX + "%";

  const randomHelp =
    helpTypes[Math.floor(Math.random() * helpTypes.length)];

  helpImage.src = randomHelp.image;
  helpImage.alt = randomHelp.imageClass.replace("-image", "") + " collectible";
  helpImage.className = `help-image ${randomHelp.imageClass}`;
  currentHelpWater = randomHelp.water;
  currentHelpPoints = randomHelp.points;

  helpItem.style.display = "block";
  helpActive = true;
}

function scheduleHelpItem() {
  helpActive = false;
  helpItem.style.display = "none";

  const delay = Math.random() * 4000 + 6000;

  setTimeout(() => {
    spawnHelpItem();
  }, delay);
}

function moveHelpItem() {

  if (gameScreen.style.display === "block" && helpActive) {

    let helpSpeed;

if (distance > 3.0) {
  helpSpeed = 3;
} else if (distance > 1.5) {
  helpSpeed = 4.5;
} else {
  helpSpeed = 7;
}

helpY += helpSpeed;

    helpItem.style.top = helpY + "px";

    checkHelpCollision();

    if (helpY > gameArea.clientHeight) {
      scheduleHelpItem();
    }
  }

  requestAnimationFrame(moveHelpItem);
}

function checkHelpCollision() {

  const playerBox = player.getBoundingClientRect();
  const helpBox = helpItem.getBoundingClientRect();

  const collision =
    playerBox.left < helpBox.right &&
    playerBox.right > helpBox.left &&
    playerBox.top < helpBox.bottom &&
    playerBox.bottom > helpBox.top;

  if (collision) {

    cleanWater += currentHelpWater;
    cleanWater = Math.min(100, cleanWater);


    score += currentHelpPoints;
    showFeedback(`+${currentHelpWater}% WATER`, "positive");
    showFeedback(`+${currentHelpPoints} POINTS`, "positive");

    document.getElementById("waterPercent").textContent =
      cleanWater + "%";

    document.getElementById("waterBarFill").style.width =
      cleanWater + "%";
    updateWaterState();

    document.getElementById("score").textContent =
      score;

    scheduleHelpItem();
  }
}

scheduleHelpItem();
moveHelpItem();

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
      updateProgressState();

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

function updateWaterState() {
  document.querySelector(".water-hud").classList.toggle("water-danger", cleanWater < 25);
}

function updateProgressState() {
  gameScreen.classList.remove("progress-source", "progress-middle", "progress-community");

  if (distance > 3.0) {
    gameScreen.classList.add("progress-source");
  } else if (distance > 1.5) {
    gameScreen.classList.add("progress-middle");
  } else {
    gameScreen.classList.add("progress-community");
  }
}

function showFeedback(message, tone) {
  const feedback = document.createElement("span");
  feedback.className = `game-feedback ${tone}`;
  feedback.textContent = message;
  feedback.style.left = `${playerX}%`;
  feedback.style.bottom = "125px";
  gameArea.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 900);
}

function endGame() {
  gameScreen.style.display = "none";
  endScreen.style.display = "flex";

  const endTitle = endScreen.querySelector("h2");
  const missionMessage = document.getElementById("missionMessage");
  document.getElementById("finalScore").textContent = score;

  if (cleanWater >= 75) {
  endTitle.textContent = "EXCELLENT DELIVERY";
  finalWaterText.textContent =
    `You delivered ${cleanWater}% clean water to the community.`;

  missionMessage.textContent =
    "You protected most of the water along the journey. In real life, reliable clean water depends on systems that help communities keep water safe from source to home.";

} else if (cleanWater >= 50) {
  endTitle.textContent = "STRONG DELIVERY";
  finalWaterText.textContent =
    `You delivered ${cleanWater}% clean water to the community.`;

  missionMessage.textContent =
    "You made it, but a large part of the water was lost along the way. Real communities face even greater barriers to reliable access to clean water.";

} else if (cleanWater >= 25) {
  endTitle.textContent = "LIMITED DELIVERY";
  finalWaterText.textContent =
    `You delivered ${cleanWater}% clean water to the community.`;

  missionMessage.textContent =
    "Only part of your clean water survived the journey. Reaching a community is only one part of the challenge — keeping that water clean and reliable matters too.";

} else if (cleanWater > 0) {
  endTitle.textContent = "CRITICAL DELIVERY";
  finalWaterText.textContent =
    `You delivered only ${cleanWater}% clean water to the community.`;

  missionMessage.textContent =
    "Very little clean water made it through. For real communities, access can depend on overcoming obstacles far greater than the ones you faced in this game.";

} else {
  endTitle.textContent = "THE FLOW STOPPED";
  finalWaterText.textContent =
    "No clean water made it to the community this time.";

  missionMessage.textContent =
    "When clean water cannot reach a community, everyday life becomes harder. Sustainable water projects help create reliable access where it is needed most.";
}

}

restartButton.addEventListener("click", () => {
  location.reload();
});