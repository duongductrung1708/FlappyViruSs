const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const backgroundMusic = document.getElementById("backgroundMusic");

// Thiết lập canvas
canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth; // Tối đa 800px
canvas.height = window.innerHeight > 600 ? 600 : window.innerHeight; // Tối đa 600px

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
    width: 60,    // Tăng từ 40 lên 60
    height: 45,   // Tăng từ 30 lên 45
    gravity: 0.3,
    lift: -7,
    velocity: 0
};

let pipes = [];
let gap = 200;
let pipeWidth = 50;
let pipeSpeed = 1;
let score = 0;
let gameRunning = true;

// Thêm ống mới với ảnh random
function spawnPipe() {
    if (!gameRunning) return;
    let pipeHeight = Math.floor(Math.random() * (canvas.height / 2 - 100)) + 100;
    const randomPipeImg = pipeImages[Math.floor(Math.random() * pipeImages.length)]; // Random ảnh
    pipes.push({
        x: canvas.width,
        topHeight: pipeHeight,
        pipeImg: randomPipeImg, // Gán ảnh random cho ống
        passed: false
    });
}

// Vẽ trò chơi
function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ chim
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Cập nhật vị trí chim
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
        return;
    }

    // Vẽ và di chuyển ống
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= pipeSpeed;

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
    ctx.fillStyle = "white"; // Đổi màu chữ cho nổi bật
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, 20, 40);

    requestAnimationFrame(draw);
}

// Điều khiển chim (PC và Mobile)
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
    spawnPipe();
    draw();
}

// Nút chơi lại
restartBtn.addEventListener("click", resetGame);

// Tạo ống mới mỗi 3 giây
setInterval(spawnPipe, 3000);

// Bắt đầu game
backgroundMusic.play();
spawnPipe();
draw();