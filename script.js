const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const playBtn = document.getElementById('playBtn');
const restartBtn = document.getElementById('restartBtn');
const coinsEl = document.getElementById('coins');
const starsEl = document.getElementById('stars');
const livesEl = document.getElementById('lives');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');

// Set canvas size
function resizeCanvas() {
  canvas.width = Math.min(800, window.innerWidth - 20);
  canvas.height = Math.min(400, window.innerHeight * 0.7);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let gameRunning = false;
let score = 0;
let coins = 0;
let lives = 3;

// Player - Doraemon drawn with canvas
const player = {
  x: 50, y: 280, w: 50, h: 50,
  vx: 0, vy: 0, speed: 6, jumpPower: -15,
  grounded: false, direction: 1
};

// Platforms
const platforms = [
  {x: 0, y: 350, w: 900, h: 50},
  {x: 150, y: 280, w: 120, h: 20},
  {x: 350, y: 220, w: 120, h: 20},
  {x: 550, y: 280, w: 120, h: 20},
  {x: 750, y: 220, w: 120, h: 20}
];

// Coins
let gameCoins = [];
function spawnCoins() {
  gameCoins = [
    {x: 190, y: 240, r: 12, collected: false},
    {x: 250, y: 240, r: 12, collected: false},
    {x: 390, y: 180, r: 12, collected: false},
    {x: 450, y: 180, r: 12, collected: false},
    {x: 590, y: 240, r: 12, collected: false},
    {x: 650, y: 240, r: 12, collected: false},
    {x: 790, y: 180, r: 12, collected: false}
  ];
}

// Enemies - Mouse
let enemies = [
  {x: 400, y: 320, w: 30, h: 30, vx: 2, dir: 1}
];

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if(e.key === ' ') e.preventDefault();
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Mobile controls
document.getElementById('leftBtn').ontouchstart = (e) => { e.preventDefault(); keys['ArrowLeft'] = true; };
document.getElementById('leftBtn').ontouchend = (e) => { e.preventDefault(); keys['ArrowLeft'] = false; };
document.getElementById('rightBtn').ontouchstart = (e) => { e.preventDefault(); keys['ArrowRight'] = true; };
document.getElementById('rightBtn').ontouchend = (e) => { e.preventDefault(); keys['ArrowRight'] = false; };
document.getElementById('jumpBtn').ontouchstart = (e) => { e.preventDefault(); if(player.grounded) keys[' '] = true; };
document.getElementById('jumpBtn').ontouchend = (e) => { e.preventDefault(); keys[' '] = false; };

playBtn.onclick = startGame;
restartBtn.onclick = () => {
  gameOverScreen.style.display = 'none';
  startGame();
};

function startGame() {
  startMenu.style.display = 'none';
  gameContainer.style.display = 'block';
  gameOverScreen.style.display = 'none';
  
  gameRunning = true;
  score = 0;
  coins = 0;
  lives = 3;
  player.x = 50;
  player.y = 280;
  player.vx = 0;
  player.vy = 0;
  
  spawnCoins();
  updateHUD();
  gameLoop();
}

function updateHUD() {
  coinsEl.textContent = `💰 ${coins}`;
  starsEl.textContent = `⭐ ${score}`;
  livesEl.textContent = '❤️'.repeat(lives);
}

function gameLoop() {
  if (!gameRunning) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw clouds
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  drawCloud(100, 60);
  drawCloud(300, 80);
  drawCloud(600, 70);
  drawCloud(500, 50);
  
  // Physics
  player.vy += 0.7;
  player.grounded = false;
  
  // Controls
  if (keys['ArrowLeft']) {
    player.vx = -player.speed;
    player.direction = -1;
  } else if (keys['ArrowRight']) {
    player.vx = player.speed;
    player.direction = 1;
  } else {
    player.vx *= 0.8;
  }
  
  if ((keys[' '] || keys['ArrowUp']) && player.grounded) {
    player.vy = player.jumpPower;
    keys[' '] = false;
    keys['ArrowUp'] = false;
  }
  
  player.x += player.vx;
  player.y += player.vy;
  
  // Platform collision
  platforms.forEach(p => {
    // Draw platform
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
    
    // Collision
    if (player.x < p.x + p.w && player.x + player.w > p.x &&
        player.y < p.y + p.h && player.y + player.h > p.y) {
      if (player.vy > 0 && player.y < p.y) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }
  });
  
  // Coins
  gameCoins.forEach(c => {
    if (!c.collected) {
      // Coin with shine
      let gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.7, '#FFA500');
      gradient.addColorStop(1, '#FF8C00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Collect
      let dx = player.x + player.w/2 - c.x;
      let dy = player.y + player.h/2 - c.y;
      if (Math.sqrt(dx*dx + dy*dy) < c.r + player.w/2) {
        c.collected = true;
        coins++;
        score += 10;
        updateHUD();
      }
    }
  });
  
  // Enemies
  enemies.forEach(enemy => {
    enemy.x += enemy.vx * enemy.dir;
    if (enemy.x <= 350 || enemy.x >= 600) enemy.dir *= -1;
    
    // Draw mouse
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(enemy.x + 15, enemy.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(enemy.x + 8, enemy.y + 8, 6, 0, Math.PI * 2);
    ctx.arc(enemy.x + 22, enemy.y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Collision with player
    if (player.x < enemy.x + enemy.w && player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h && player.y + player.h > enemy.y) {
      if (player.vy > 0 && player.y < enemy.y) {
        // Jump on enemy
        enemies = enemies.filter(e => e !== enemy);
        player.vy = -10;
        score += 50;
        updateHUD();
      } else {
        // Hit by enemy
        lives--;
        player.x = 50;
        player.y = 280;
        player.vy = 0;
        updateHUD();
        if (lives <= 0) gameOver();
      }
    }
  });
  
  // Draw Doraemon with Canvas
  drawDoraemon(player.x, player.y);
  
  // Bounds
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
  if (player.y > canvas.height) {
    lives--;
    player.x = 50;
    player.y = 280;
    player.vy = 0;
    updateHUD();
    if (lives <= 0) gameOver();
  }
  
  // Win condition
  if (gameCoins.every(c => c.collected)) {
    score += 100;
    updateHUD();
    setTimeout(() => {
      alert('Level Complete! 🎉\nScore: ' + score);
      spawnCoins();
    }, 100);
  }
  
  requestAnimationFrame(gameLoop);
}

function drawDoraemon(x, y) {
  // Body - blue
  ctx.fillStyle = '#00A0E9';
  ctx.beginPath();
  ctx.arc(x + 25, y + 30, 22, 0, Math.PI * 2);
  ctx.fill();
  
  // Head - blue
  ctx.beginPath();
  ctx.arc(x + 25, y + 18, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Face - white
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x + 25, y + 22, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x + 19, y + 15, 5, 0, Math.PI * 2);
  ctx.arc(x + 31, y + 15, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x + 19, y + 16, 2, 0, Math.PI * 2);
  ctx.arc(x + 31, y + 16, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose - red
  ctx.fillStyle = '#E60012';
  ctx.beginPath();
  ctx.arc(x + 25, y + 20, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + 25, y + 23, 8, 0, Math.PI);
  ctx.stroke();
  
  // Bell
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x + 25, y + 35, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 25, y, 30, 0, Math.PI * 2);
  ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

function gameOver() {
  gameRunning = false;
  finalScoreEl.textContent = `Score: ${score}`;
  gameOverScreen.style.display = 'block';
}