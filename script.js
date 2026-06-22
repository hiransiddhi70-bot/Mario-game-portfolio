const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenu = document.getElementById('startMenu');
const gameContainer = document.getElementById('gameContainer');
const playBtn = document.getElementById('playBtn');
const coinsEl = document.getElementById('coins');
const starsEl = document.getElementById('stars');

// LOAD DORAEMON IMAGE - img/doraemon.png daal de repo me
const doraemonImg = new Image();
doraemonImg.src = 'img/doraemon.png'; // Teri image ka path

let gameRunning = false;
let coins = 78;
let stars = 1250;

const player = {
  x: 50, y: 280, w: 50, h: 50,
  vx: 0, vy: 0, speed: 6, jumpPower: -14,
  grounded: false
};

const platforms = [
  {x: 0, y: 350, w: 800, h: 50},
  {x: 180, y: 280, w: 120, h: 20},
  {x: 380, y: 220, w: 120, h: 20},
  {x: 580, y: 280, w: 120, h: 20}
];

let gameCoins = [
  {x: 220, y: 240, r: 12, collected: false},
  {x: 280, y: 240, r: 12, collected: false},
  {x: 420, y: 180, r: 12, collected: false},
  {x: 480, y: 180, r: 12, collected: false},
  {x: 620, y: 240, r: 12, collected: false},
  {x: 680, y: 240, r: 12, collected: false}
];

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Mobile controls
document.getElementById('leftBtn').ontouchstart = () => keys['ArrowLeft'] = true;
document.getElementById('leftBtn').ontouchend = () => keys['ArrowLeft'] = false;
document.getElementById('rightBtn').ontouchstart = () => keys['ArrowRight'] = true;
document.getElementById('rightBtn').ontouchend = () => keys['ArrowRight'] = false;
document.getElementById('jumpBtn').ontouchstart = () => { if(player.grounded) keys[' '] = true; };
document.getElementById('jumpBtn').ontouchend = () => keys[' '] = false;

playBtn.onclick = () => {
  startMenu.style.display = 'none';
  gameContainer.style.display = 'block';
  startGame();
};

function startGame() {
  gameRunning = true;
  coins = 78;
  gameCoins.forEach(c => c.collected = false);
  updateHUD();
  gameLoop();
}

function updateHUD() {
  coinsEl.textContent = `💰 ${coins}`;
  starsEl.textContent = `⭐ ${stars}`;
}

function gameLoop() {
  if (!gameRunning) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Clouds
  ctx.fillStyle = 'white';
  drawCloud(100, 80);
  drawCloud(600, 100);
  drawCloud(350, 60);
  
  // Physics
  player.vy += 0.6;
  player.grounded = false;
  
  if (keys['ArrowLeft']) player.vx = -player.speed;
  else if (keys['ArrowRight']) player.vx = player.speed;
  else player.vx *= 0.8;
  
  if (keys[' '] && player.grounded) {
    player.vy = player.jumpPower;
    keys[' '] = false;
  }
  
  player.x += player.vx;
  player.y += player.vy;
  
  // Platforms
  ctx.fillStyle = '#D2691E';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.w, p.h);
    // Platform shadow
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
    ctx.fillStyle = '#D2691E';
    
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
      // Coin glow
      let gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(1, '#FFA500');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Coin border
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Collect
      let dx = player.x + player.w/2 - c.x;
      let dy = player.y + player.h/2 - c.y;
      if (Math.sqrt(dx*dx + dy*dy) < c.r + player.w/2) {
        c.collected = true;
        coins++;
        stars += 10;
        updateHUD();
      }
    }
  });
  
  // Draw Doraemon
  if (doraemonImg.complete) {
    ctx.drawImage(doraemonImg, player.x, player.y, player.w, player.h);
  } else {
    // Fallback agar image load na ho
    ctx.fillStyle = '#00B4D8';
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
  
  // Bounds
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
  if (player.y > canvas.height) {
    player.x = 50; player.y = 280; player.vy = 0;
  }
  
  requestAnimationFrame(gameLoop);
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.arc(x + 30, y, 35, 0, Math.PI * 2);
  ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
  ctx.fill();
}

doraemonImg.onload = () => console.log('Doraemon loaded!');