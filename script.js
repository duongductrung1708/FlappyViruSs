const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const backgroundMusic = document.getElementById("backgroundMusic");

// Thiết lập canvas
canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth;
canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight;

// Tải hình ảnh chim
const birdImg = new Image();
birdImg.src = "images/16f842d25d5aed04b44b-removebg-preview.png";

// Tải danh sách ảnh ống cột
const pipeImages = [
    new Image(),
    new Image(),
    new Image()
];
pipeImages[0].src = "images/dung-dich-ve-sinh-phu-nu-lactacyd-odor-fresh-ngan-mui-250ml.png";
pipeImages[1].src = "images/pngtree-sanitary-napkins-png-image_14168960.avif";
pipeImages[2].src = "images/pngtree-top-rated-toothbrushes-for-effective-plaque-removal-png-image_16220002.png";

// Biến trò chơi
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 60,
    height: 45,
    gravity: 0.7,
    lift: -10,
    velocity: 0
};

let pipes = [];
let gap = window.innerWidth < 768 ? 250 : 200;
let pipeWidth = window.innerWidth < 768 ? 70 : 50;
let pipeSpeed = window.innerWidth < 768 ? 120 : 150;
let score = 0;
let gameRunning = true;
let lastTime = performance.now();
let pipeInterval;

// Điều chỉnh cho kích thước màn hình
function adjustForScreenSize() {
    const isMobile = window.innerWidth < 768;
    
    gap = isMobile ? 250 : 200;
    pipeWidth = isMobile ? 70 : 50;
    pipeSpeed = isMobile ? 120 : 150;
    bird.width = isMobile ? 70 : 60;
    bird.height = isMobile ? 52 : 45;
    
    clearInterval(pipeInterval);
    pipeInterval = setInterval(spawnPipe, isMobile ? 3500 : 3000);
}

// Thêm ống mới với ảnh random
function spawnPipe() {
    if (!gameRunning) return;
    
    const minHeight = 100;
    const maxHeight = canvas.height - gap - minHeight;
    let pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    const randomPipeImg = pipeImages[Math.floor(Math.random() * pipeImages.length)];
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        pipeImg: randomPipeImg,
        passed: false
    });
}

// Vẽ trò chơi
function draw(currentTime) {
    if (!gameRunning) return;

    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ chim
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Cập nhật vị trí chim
    bird.velocity += bird.gravity * dt * 60;
    bird.y += bird.velocity * dt * 60;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
        return;
    }

    // Vẽ và di chuyển ống
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= pipeSpeed * dt;

        // Hiệu ứng mờ xung quanh cột
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(p.x - 10, 0, pipeWidth + 20, p.topHeight);
        ctx.fillRect(p.x - 10, p.topHeight + gap, pipeWidth + 20, canvas.height - p.topHeight - gap);

        // Vẽ ống với ảnh random
        ctx.drawImage(p.pipeImg, p.x, 0, pipeWidth, p.topHeight);
        ctx.drawImage(p.pipeImg, p.x, p.topHeight + gap, pipeWidth, canvas.height - p.topHeight - gap);

        // Kiểm tra va chạm
        if (
            bird.x + bird.width > p.x &&
            bird.x < p.x + pipeWidth &&
            (bird.y < p.topHeight || bird.y + bird.height > p.topHeight + gap)
        ) {
            endGame();
            return;
        }

        // Tăng điểm
        if (!p.passed && bird.x > p.x + pipeWidth) {
            p.passed = true;
            score++;
        }

        if (p.x + pipeWidth < 0) pipes.splice(i, 1);
    }

    // Vẽ điểm số
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 20, 40);

    requestAnimationFrame(draw);
}

// Điều khiển chim
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameRunning) {
        bird.velocity = bird.lift;
    }
});

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (gameRunning) {
        bird.velocity = bird.lift;
    }
});

// Kết thúc game
function endGame() {
    gameRunning = false;
    backgroundMusic.pause();
    finalScoreText.textContent = score;
    gameOverScreen.classList.remove("hidden");
}

// Reset game
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameRunning = true;
    gameOverScreen.classList.add("hidden");
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    adjustForScreenSize();
    spawnPipe();
    lastTime = performance.now();
    requestAnimationFrame(draw);
}

// Nút chơi lại
restartBtn.addEventListener("click", resetGame);

// Theo dõi thay đổi kích thước màn hình
window.addEventListener('resize', adjustForScreenSize);

// Khởi tạo game
adjustForScreenSize();
backgroundMusic.play();
spawnPipe();
requestAnimationFrame(draw);