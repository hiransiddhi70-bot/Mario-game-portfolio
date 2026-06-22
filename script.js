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

// FIX 1: Canvas size set karo pehle
function resizeCanvas() {
  canvas.width = window.innerWidth > 800? 800 : window.innerWidth - 20;
  canvas.height = window.innerHeight > 500? 400 : window.innerHeight * 0.65;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// FIX 2: Doraemon image + Fallback
const doraemonImg = new Image();
doraemonImg.src = 'img/doraemon.png'; // Agar ye image hai toh load hogi
let imageLoaded = false;
doraemonImg.onload = () => { imageLoaded = true; console.log('Doraemon ✅'); };
doraemonImg.onerror = () => { imageLoaded = false; console.log('Fallback Doraemon ✅'); };

let gameRunning = false;
let score = 0;
let coins = 0;
let lives = 3;
let particles = []; // Coin collect particles

const player = {
  x: 50, y: 0, w: 45, h: 45,
  vx: 0, vy: 0, speed: 6, jumpPower: -15,
  grounded: false, direction: 1, dancing: false
};

const platforms = [
  {x: 0, y: 0, w: 0, h: 50}, // Ground - size set hoga resize me
  {x: 150, y: 280, w: 120, h: 20},
  {x: 350, y: 220, w: 120, h: 20},
  {x: 550, y: 280, w: 120, h: 20}
];

let gameCoins = [];
let enemies = [];

function resetLevel() {
  // Ground position fix
  platforms[0].y = canvas.height - 50;
  platforms[0].w = canvas.width + 100;
  
  player.y = platforms[0].y - player.h - 10;
  player.x = 50;
  player.vx = 0;
  player.vy = 0;
  
  gameCoins = [
    {x: 190, y: 240, r: 12, collected: false},
    {x: 250, y: 240, r: 12, collected: false},
    {x: 390, y: 180, r: 12, collected: false},
    {x: 450, y: 180, r: 12, collected: false},
    {x: 590, y: 240, r: 12, collected: false},
    {x: 650, y: 240, r: 12, collected: false}
  ];
  
  enemies = [
    {x: 400, y: platforms[0].y - 30, w: 30, h: 30, vx: 2, dir: 1, minX: 350, maxX: 600}
  ];
  
  particles = [];
}

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Mobile controls
function addBtn(btn, key) {
  btn.ontouchstart = (e) => { e.preventDefault(); keys[key] = true; };
  btn.ontouchend = (e) => { e.preventDefault(); keys[key] = false; };
  btn.ontouchcancel = (e) => { e.preventDefault(); keys[key] = false; };
}
addBtn(document.getElementById('leftBtn'), 'ArrowLeft');
addBtn(document.getElementById('rightBtn'), 'ArrowRight');
addBtn(document.getElementById('jumpBtn'), ' ');

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
  
  resetLevel();
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
  
  // Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  drawCloud(80, 60);
  drawCloud(300, 80);
  drawCloud(550, 50);
  drawCloud(650, 90);
  
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
  
  // Platforms
  platforms.forEach(p => {
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(p.x, p.y + p.h - 5, p.w, 5);
    
    if (player.x < p.x + p.w && player.x + player.w > p.x &&
        player.y < p.y + p.h && player.y + player.h > p.y) {
      if (player.vy > 0 && player.y + player.h - player.vy <= p.y + 5) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }
  });
  
  // Coins + Particles
  gameCoins.forEach(c => {
    if (!c.collected) {
      // Coin
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
        // ✨ PARTICLE EFFECT
        for(let i=0; i<8; i++) {
          particles.push({
            x: c.x, y: c.y,
            vx: (Math.random()-0.5)*6,
            vy: (Math.random()-0.5)*6,
            life: 30,
            color: '#FFD700'
          });
        }
        updateHUD();
      }
    }
  });
  
  // Draw particles
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return p.life > 0;
  });
  
  // Enemies
  enemies.forEach((enemy, idx) => {
    enemy.x += enemy.vx * enemy.dir;
    if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) enemy.dir *= -1;
    
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
    
    // Collision
    if (player.x < enemy.x + enemy.w && player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h && player.y + player.h > enemy.y) {
      if (player.vy > 0 && player.y + player.h - player.vy <= enemy.y + 5) {
        enemies.splice(idx, 1);
        player.vy = -10;
        score += 50;
        updateHUD();
      } else {
        lives--;
        player.x = 50;
        player.y = platforms[0].y - player.h - 10;
        player.vy = 0;
        updateHUD();
        if (lives <= 0) gameOver();
      }
    }
  });
  
  // Draw Doraemon
  drawDoraemon(player.x, player.y);
  
  // Bounds
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
  if (player.y > canvas.height) {
    lives--;
    if (lives <= 0) {
      gameOver();
    } else {
      player.x = 50;
      player.y = platforms[0].y - player.h - 10;
      player.vy = 0;
      updateHUD();
    }
  }
  
  // Win condition
  if (gameCoins.every(c => c.collected) && enemies.length === 0) {
    score += 100;
    player.dancing = true;
    updateHUD();
    setTimeout(() => {
      player.dancing = false;
      alert('Level Complete! 🎉\nScore: ' + score);
      resetLevel();
    }, 2000);
  }
  
  requestAnimationFrame(gameLoop);
}

function drawDoraemon(x, y) {
  ctx.save();
  
  // 💃 WINNING DANCE
  if (player.dancing) {
    ctx.translate(x + player.w/2, y + player.h/2);
    ctx.rotate(Math.sin(Date.now()/100) * 0.3);
    ctx.translate(-x - player.w/2, -y - player.h/2);
  }
  
  if (imageLoaded && doraemonImg.complete) {
    // Real image
    ctx.drawImage(doraemonImg, x, y, player.w, player.h);
  } else {
    // FALLBACK: Canvas Doraemon - hamesha dikhega
    // Body
    ctx.fillStyle = '#00A0E9';
    ctx.beginPath();
    ctx.arc(x + 22, y + 30, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(x + 22, y + 18, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Face white
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 22, y + 22, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // 😉 BLINK ANIMATION
    let blink = Math.floor(Date.now() / 3000) % 2 === 0;
    if (blink) {
      // Eyes open
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x + 16, y + 15, 4, 0, Math.PI * 2);
      ctx.arc(x + 28, y + 15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 2, 0, Math.PI * 2);
      ctx.arc(x + 28, y + 16, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Eyes closed
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 16); ctx.lineTo(x + 20, y + 16);
      ctx.moveTo(x + 24, y + 16); ctx.lineTo(x + 32, y + 16);
      ctx.stroke();
    }
    
    // Nose
    ctx.fillStyle = '#E60012';
    ctx.beginPath();
    ctx.arc(x + 22, y + 20, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 22, y + 24, 7, 0, Math.PI);
    ctx.stroke();
    
    // Bell
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + 22, y + 35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.arc(x + 22, y, 25, 0, Math.PI * 2);
  ctx.arc(x + 45, y, 18, 0, Math.PI * 2);
  ctx.fill();
}

function gameOver() {
  gameRunning = false;
  finalScoreEl.textContent = `Score: ${score}`;
  gameOverScreen.style.display = 'block';
}