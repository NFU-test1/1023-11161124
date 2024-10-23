// 打到球後會增加球的速度，並且球的速度方向保持一致

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 調整畫布大小
canvas.width = 800;
canvas.height = 600;

let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 40;
let dx = 3;
let dy = -3;

const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 20;  // 板子距離底部有 20px

let isJumping = false;
let jumpSpeed = 5;
let gravity = 0.5;
let fallingSpeed = 0;

let ballMoving = false;  // 控制球是否移動
let gameStarted = false;  // 紀錄遊戲是否已開始
let startTime;  // 記錄遊戲開始時間
let endTime;    // 記錄遊戲結束時間

const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 80;
const brickHeight = 25;
const brickPadding = 15;
const brickOffsetTop = 50;
const brickOffsetLeft = 50;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let score = 0;
let lives = 3;
const speedIncreaseFactor = 1.1; // 每次碰撞後球速度增加 10%

// 監聽滑鼠移動事件
document.addEventListener('mousemove', mouseMoveHandler, false);

// 監聽滑鼠左鍵點擊事件觸發跳躍
document.addEventListener('mousedown', jumpHandler, false);

// 監聽滑鼠右鍵發球事件
document.addEventListener('contextmenu', startBallHandler, false);

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
    // 如果球還未移動，讓球跟隨板子移動
    if (!ballMoving) {
      x = paddleX + paddleWidth / 2;
    }
  }
}

// 只允許左鍵觸發跳躍
function jumpHandler(e) {
  if (e.button === 0 && !isJumping) {  // e.button === 0 表示左鍵
    isJumping = true;
    fallingSpeed = -jumpSpeed; // 開始跳躍
  }
}

// 右鍵開始發球
function startBallHandler(e) {
  e.preventDefault();  // 防止右鍵菜單彈出
  if (!ballMoving) {
    ballMoving = true;  // 設定球為移動狀態

    if (!gameStarted) {
      // 開始遊戲計時
      startTime = new Date();
      gameStarted = true;
    }
  }
}

function handleJump() {
  if (isJumping) {
    paddleY += fallingSpeed; // 板子移動
    fallingSpeed += gravity; // 加入重力效果

    // 如果板子回到地面，停止跳躍
    if (fallingSpeed > 0 && paddleY >= canvas.height - paddleHeight - 20) {
      paddleY = canvas.height - paddleHeight - 20;  // 板子固定距離底部 20px
      isJumping = false;
      fallingSpeed = 0;
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;

          // 增加球的速度
          dx *= speedIncreaseFactor;
          dy *= speedIncreaseFactor;

          // 確保球速度方向保持一致
          dx = dx > 0 ? Math.abs(dx) : -Math.abs(dx);
          dy = dy > 0 ? Math.abs(dy) : -Math.abs(dy);

          if (score === brickRowCount * brickColumnCount) {
            endTime = new Date();  // 記錄遊戲結束時間
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // 計算總時間（秒）
            alert(`恭喜你，贏了！你花了 ${timeTaken} 秒`);
            document.location.reload();
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);  // 根據 paddleY 繪製板子
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();
  handleJump();  // 處理跳躍效果

  // 球開始移動時才更新位置
  if (ballMoving) {
    // 球與牆壁的碰撞檢測
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }

    // 球與天花板的碰撞檢測
    if (y + dy < ballRadius) {
      dy = -dy;
    } 
    // 球與板子的碰撞檢測
    else if (y + dy > paddleY - ballRadius && x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    }
    // 球掉到底部，減少生命
    else if (y + dy > canvas.height - ballRadius) {
      lives--;
      if (!lives) {
        alert('遊戲結束');
        document.location.reload();
      } else {
        ballMoving = false;  // 重置球為靜止狀態
        x = canvas.width / 2;
        y = canvas.height - 40;
        dx = 3;
        dy = -3;
        paddleX = (canvas.width - paddleWidth) / 2;
        paddleY = canvas.height - paddleHeight - 20;
      }
    }

    x += dx;
    y += dy;
  }

  requestAnimationFrame(draw);
}

draw();
