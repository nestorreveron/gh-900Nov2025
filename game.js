// Game state
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    speed: 50,
    playerPosition: 50, // percentage from left
    enemyCars: [],
    gameLoop: null,
    spawnInterval: null,
    scoreInterval: null
};

// DOM elements
const playerCar = document.getElementById('playerCar');
const gameScreen = document.getElementById('gameScreen');
const scoreDisplay = document.getElementById('score');
const speedDisplay = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Game constants
const LANES = [17, 50, 83]; // Left, center, right lane positions (percentage)
const CAR_EMOJIS = ['🚗', '🚙', '🚕', '🚌', '🚐'];

// Initialize player position
let currentLane = 1; // Start in center lane
updatePlayerPosition();

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    resetGame();
    startGame();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        moveLeft();
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        moveRight();
    }
});

function updatePlayerPosition() {
    gameState.playerPosition = LANES[currentLane];
    playerCar.style.left = gameState.playerPosition + '%';
}

function moveLeft() {
    if (currentLane > 0) {
        currentLane--;
        updatePlayerPosition();
    }
}

function moveRight() {
    if (currentLane < LANES.length - 1) {
        currentLane++;
        updatePlayerPosition();
    }
}

function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Start spawning enemy cars
    spawnEnemyCar();
    gameState.spawnInterval = setInterval(spawnEnemyCar, 2000);
    
    // Start score incrementing
    gameState.scoreInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.score += 10;
            scoreDisplay.textContent = gameState.score;
            
            // Increase speed every 100 points
            if (gameState.score % 100 === 0 && gameState.speed < 150) {
                gameState.speed += 5;
                speedDisplay.textContent = gameState.speed;
            }
        }
    }, 1000);
    
    // Start game loop
    gameState.gameLoop = setInterval(updateGame, 50);
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseBtn.textContent = gameState.isPaused ? 'Reanudar' : 'Pausar';
}

function resetGame() {
    // Clear intervals
    if (gameState.gameLoop) clearInterval(gameState.gameLoop);
    if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
    if (gameState.scoreInterval) clearInterval(gameState.scoreInterval);
    
    // Remove all enemy cars
    gameState.enemyCars.forEach(car => {
        if (car.element && car.element.parentNode) {
            car.element.parentNode.removeChild(car.element);
        }
    });
    
    // Reset state
    gameState = {
        isPlaying: false,
        isPaused: false,
        score: 0,
        speed: 50,
        playerPosition: 50,
        enemyCars: [],
        gameLoop: null,
        spawnInterval: null,
        scoreInterval: null
    };
    
    // Reset display
    scoreDisplay.textContent = '0';
    speedDisplay.textContent = '50';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';
    
    // Reset player position
    currentLane = 1;
    updatePlayerPosition();
}

function spawnEnemyCar() {
    if (gameState.isPaused) return;
    
    const lane = Math.floor(Math.random() * LANES.length);
    const carEmoji = CAR_EMOJIS[Math.floor(Math.random() * CAR_EMOJIS.length)];
    
    const enemyCarElement = document.createElement('div');
    enemyCarElement.className = 'car enemy-car';
    enemyCarElement.textContent = carEmoji;
    enemyCarElement.style.left = LANES[lane] + '%';
    
    const road = gameScreen.querySelector('.road');
    road.appendChild(enemyCarElement);
    
    const enemyCar = {
        element: enemyCarElement,
        lane: lane,
        position: -60 // Starting Y position
    };
    
    gameState.enemyCars.push(enemyCar);
}

function updateGame() {
    if (gameState.isPaused) return;
    
    const speedFactor = gameState.speed / 50;
    
    // Update enemy cars
    gameState.enemyCars.forEach((car, index) => {
        car.position += 5 * speedFactor;
        car.element.style.top = car.position + 'px';
        
        // Remove car if it's off screen
        if (car.position > 560) {
            if (car.element && car.element.parentNode) {
                car.element.parentNode.removeChild(car.element);
            }
            gameState.enemyCars.splice(index, 1);
        }
        
        // Check collision
        if (checkCollision(car)) {
            gameOver();
        }
    });
}

function checkCollision(enemyCar) {
    // Check if enemy car is in the same lane as player
    if (enemyCar.lane !== currentLane) return false;
    
    // Check if enemy car is at player's vertical position
    const playerTop = 450; // Player car is at bottom (500px height - 50px from bottom)
    const carHeight = 60; // Approximate height of car emoji
    
    if (enemyCar.position >= playerTop - carHeight && enemyCar.position <= playerTop + carHeight) {
        return true;
    }
    
    return false;
}

function gameOver() {
    // Stop the game
    gameState.isPlaying = false;
    
    // Clear intervals
    if (gameState.gameLoop) clearInterval(gameState.gameLoop);
    if (gameState.spawnInterval) clearInterval(gameState.spawnInterval);
    if (gameState.scoreInterval) clearInterval(gameState.scoreInterval);
    
    // Show game over screen
    finalScoreDisplay.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
    
    // Disable buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Initialize the game on load
console.log('Juego de Carros cargado. ¡Presiona "Iniciar Juego" para comenzar!');
