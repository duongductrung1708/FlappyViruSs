const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const backgroundMusic = document.getElementById("backgroundMusic");
const startScreen = document.getElementById("startScreen");
const currentScoreDisplay = document.getElementById("currentScore");
const volumeBtn = document.getElementById("volumeBtn");
const volumeSlider = document.getElementById("volumeSlider");

// Game state object
const game = {
    bird: {
        x: 50,
        y: 300,
        width: 60,
        height: 45,
        gravity: 0.5,
        lift: -10,
        velocity: 0
    },
    pipes: [],
    gap: 200,
    pipeWidth: 40,
    pipeSpeed: 2,
    score: 0,
    isRunning: false,
    lastTime: 0,
    pipeInterval: null,
    animationFrameId: null
};

// Setup canvas
function setupCanvas() {
    canvas.width = Math.min(800, window.innerWidth);
    canvas.height = Math.min(600, window.innerHeight);
    game.bird.y = canvas.height / 2;
    
    const isMobile = window.innerWidth < 768;
    game.gap = isMobile ? 250 : 200;
    game.pipeWidth = isMobile ? 70 : 50;
    game.bird.width = isMobile ? 70 : 60;
    game.bird.height = isMobile ? 52 : 45;
}
setupCanvas();

// Load images
const birdImg = new Image();
birdImg.src = "images/16f842d25d5aed04b44b-removebg-preview.png";

const pipeImages = [
    "images/dung-dich-ve-sinh-phu-nu-lactacyd-odor-fresh-ngan-mui-250ml.png",
    "images/pngtree-sanitary-napkins-png-image_14168960.avif",
    "images/pngtree-top-rated-toothbrushes-for-effective-plaque-removal-png-image_16220002.png"
].map(path => {
    const img = new Image();
    img.src = path;
    return img;
});

// Volume control functions
function setupVolumeControls() {
    // Set initial volume
    backgroundMusic.volume = 0.7;
    volumeSlider.value = 0.7;
    
    // Handle volume slider changes
    volumeSlider.addEventListener("input", function() {
        backgroundMusic.volume = this.value;
        updateVolumeIcon();
    });
    
    // Handle mute button click
    volumeBtn.addEventListener("click", function() {
        if (backgroundMusic.volume > 0) {
            backgroundMusic.volume = 0;
            volumeSlider.value = 0;
        } else {
            backgroundMusic.volume = 0.7;
            volumeSlider.value = 0.7;
        }
        updateVolumeIcon();
    });
    
    // Update volume icon based on current volume
    function updateVolumeIcon() {
        if (backgroundMusic.volume === 0) {
            volumeBtn.textContent = "🔇";
        } else if (backgroundMusic.volume < 0.5) {
            volumeBtn.textContent = "🔉";
        } else {
            volumeBtn.textContent = "🔊";
        }
    }
}

// Adjust for screen size
function adjustForScreenSize() {
    const isMobile = window.innerWidth < 768;
    game.gap = isMobile ? 250 : 200;
    game.pipeWidth = isMobile ? 70 : 50;
    game.bird.width = isMobile ? 70 : 60;
    game.bird.height = isMobile ? 52 : 45;
    
    clearInterval(game.pipeInterval);
    game.pipeInterval = setInterval(spawnPipe, isMobile ? 2000 : 1500);
}

// Spawn new pipes
function spawnPipe() {
    if (!game.isRunning) return;
    
    const minHeight = 100;
    const maxHeight = canvas.height - game.gap - minHeight;
    const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    const randomPipeImg = pipeImages[Math.floor(Math.random() * pipeImages.length)];
    
    game.pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        pipeImg: randomPipeImg,
        passed: false
    });
}

// Check collision
function checkCollision(pipe) {
    const bird = game.bird;
    return (
        bird.x + bird.width > pipe.x &&
        bird.x < pipe.x + game.pipeWidth &&
        (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + game.gap)
    );
}

// Draw game
function draw() {
    if (!game.isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird position
    game.bird.velocity += game.bird.gravity;
    game.bird.y += game.bird.velocity;

    // Check ground/ceiling collision
    if (game.bird.y + game.bird.height > canvas.height || game.bird.y < 0) {
        return endGame();
    }

    // Process pipes
    for (let i = game.pipes.length - 1; i >= 0; i--) {
        const pipe = game.pipes[i];
        pipe.x -= game.pipeSpeed;

        // Draw blur effect around pipes
        const blurRadius = 15;
        const glowColor = 'rgba(255, 255, 255, 0.3)';
        
        // Top pipe blur
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = blurRadius;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = glowColor;
        ctx.fillRect(pipe.x - blurRadius/2, 0, game.pipeWidth + blurRadius, pipe.topHeight);
        ctx.restore();
        
        // Bottom pipe blur
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = blurRadius;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = glowColor;
        ctx.fillRect(pipe.x - blurRadius/2, pipe.topHeight + game.gap, 
                    game.pipeWidth + blurRadius, canvas.height - pipe.topHeight - game.gap);
        ctx.restore();

        // Draw pipes
        ctx.drawImage(pipe.pipeImg, pipe.x, 0, game.pipeWidth, pipe.topHeight);
        ctx.drawImage(pipe.pipeImg, pipe.x, pipe.topHeight + game.gap, 
                     game.pipeWidth, canvas.height - pipe.topHeight - game.gap);

        // Check collision
        if (checkCollision(pipe)) {
            return endGame();
        }

        // Increase score
        if (!pipe.passed && game.bird.x > pipe.x + game.pipeWidth + 5) {
            pipe.passed = true;
            game.score++;
            if (currentScoreDisplay) currentScoreDisplay.textContent = game.score;
        }

        // Remove passed pipes
        if (pipe.x + game.pipeWidth < 0) {
            game.pipes.splice(i, 1);
        }
    }

    // Draw bird
    ctx.drawImage(birdImg, game.bird.x, game.bird.y, game.bird.width, game.bird.height);

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + game.score, 20, 40);

    game.animationFrameId = requestAnimationFrame(draw);
}

// Start game
function startGame() {
    startScreen.classList.add("hidden");
    canvas.classList.remove("hidden");
    game.isRunning = true;
    game.score = 0;
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = "0";
    }
    
    // Play music with current volume
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(e => {
        console.log("Autoplay prevented:", e);
    });
    
    resetGame();
}

// End game
function endGame() {
    game.isRunning = false;
    cancelAnimationFrame(game.animationFrameId);
    backgroundMusic.pause();
    finalScoreText.textContent = game.score;
    gameOverScreen.classList.remove("hidden");
    
    // Shake effect
    canvas.style.transform = 'translateX(5px)';
    setTimeout(() => {
        canvas.style.transform = 'translateX(-5px)';
        setTimeout(() => canvas.style.transform = 'translateX(0)', 100);
    }, 100);
}

// Reset game
function resetGame() {
    // Keep current volume when resetting
    const currentVolume = backgroundMusic.volume;
    
    game.bird.y = canvas.height / 2;
    game.bird.velocity = 0;
    game.pipes = [];
    game.score = 0;
    game.isRunning = true;
    gameOverScreen.classList.add("hidden");
    
    // Reset music with current volume
    backgroundMusic.currentTime = 0;
    backgroundMusic.volume = currentVolume;
    backgroundMusic.play().catch(e => {
        console.log("Music restart prevented:", e);
    });
    
    adjustForScreenSize();
    spawnPipe();
    
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = "0";
    }
    
    game.animationFrameId = requestAnimationFrame(draw);
}

// Handle controls
function handleTap(e) {
    e.preventDefault();
    if (!game.isRunning && !startScreen.classList.contains("hidden")) {
        startGame();
    } else if (game.isRunning) {
        game.bird.velocity = game.bird.lift;
    }
}

function handleControls() {
    // Keyboard control
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            handleTap(e);
        }
    });

    // Touch/mouse control
    canvas.addEventListener("touchstart", handleTap);
    canvas.addEventListener("mousedown", handleTap);
    
    // Restart button
    restartBtn.addEventListener("click", () => {
        resetGame();
        canvas.classList.remove("hidden");
        startScreen.classList.add("hidden");
    });
    
    // Button hover effects
    restartBtn.addEventListener("mouseenter", () => restartBtn.style.transform = "scale(1.05)");
    restartBtn.addEventListener("mouseleave", () => restartBtn.style.transform = "scale(1)");
}

// Handle resize
function handleResize() {
    window.addEventListener('resize', () => {
        setupCanvas();
        adjustForScreenSize();
    });
}

// Initialize game
function initGame() {
    adjustForScreenSize();
    handleControls();
    handleResize();
    setupVolumeControls(); // Initialize volume controls
}

initGame();