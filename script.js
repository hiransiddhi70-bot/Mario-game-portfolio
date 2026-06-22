const Game = {
  canvas: null, ctx: null, state: 'loading',
  player: null, world: 'nobita', level: 1,
  coins: 0, dorayaki: 0, crystals: 0, lives: 3, score: 0,
  keys: {}, touch: {}, camera: {x: 0, y: 0},
  platforms: [], coinArr: [], enemies: [], particles: [],

  worlds: {
    nobita: { name: "Nobita's House", color: '#87CEEB', gravity: 0.8, unlocked: true },
    future: { name: "Future City", color: '#4A90E2', gravity: 0.6, cost: 50 },
    space: { name: "Space World", color: '#1a1a2e', gravity: 0.3, cost: 150 },
    dino: { name: "Dinosaur Land", color: '#228B22', gravity: 0.9, cost: 300 },
    ocean: { name: "Underwater Kingdom", color: '#006994', gravity: 0.4, cost: 500 },
    candy: { name: "Candy World", color: '#FFB6C1', gravity: 0.7, cost: 1000 }
  },

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupControls();
    this.loadSave();

    setTimeout(() => {
      document.getElementById('loading').style.display = 'none';
      this.state = 'menu';
      this.updateHUD();
    }, 1500);
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  setupControls() {
    document.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if(e.key === 'Escape') this.togglePause();
      if(['ArrowUp',' ','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    });
    document.addEventListener('keyup', e => this.keys[e.key] = false);

    const bind = (id, key) => {
      const btn = document.getElementById(id);
      const start = e => {e.preventDefault(); this.touch[key] = true;};
      const end = e => {e.preventDefault(); this.touch[key] = false;};
      btn.addEventListener('touchstart', start, {passive: false});
      btn.addEventListener('touchend', end, {passive: false});
      btn.addEventListener('touchcancel', end, {passive: false});
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
    };
    bind('leftBtn', 'left'); 
    bind('rightBtn', 'right'); 
    bind('jumpBtn', 'jump');
    document.getElementById('gadgetBtn').onclick = () => this.useGadget();

    document.querySelectorAll('.world-card').forEach(card => {
      card.onclick = () => this.selectWorld(card.dataset.world);
    });
  },

  startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('worldSelect').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    this.state = 'playing';
    this.lives = 3;
    this.score = 0;
    this.resetLevel();
    this.gameLoop();
  },

  resetLevel() {
    // FIX 1: Ground position sahi
    const groundY = this.canvas.height - 60;
    this.platforms = [
      {x: 0, y: groundY, w: 3000, h: 60}, // Lamba ground
      {x: 250, y: groundY - 100, w: 150, h: 20},
      {x: 500, y: groundY - 180, w: 150, h: 20},
      {x: 750, y: groundY - 100, w: 150, h: 20},
      {x: 1000, y: groundY - 200, w: 200, h: 20}
    ];

    // FIX 2: Player ko ground pe spawn kar
    this.player = {
      x: 100, y: groundY - 50, w: 45, h: 50,
      vx: 0, vy: 0, speed: 7, jumpPower: -17,
      grounded: false, dir: 1, animFrame: 0, animTimer: 0
    };

    // FIX 3: Coins sahi position pe
    this.coinArr = [
      {x: 300, y: groundY - 140, r: 12, got: false, type: 'coin'},
      {x: 360, y: groundY - 140, r: 12, got: false, type: 'coin'},
      {x: 550, y: groundY - 220, r: 12, got: false, type: 'dorayaki'},
      {x: 610, y: groundY - 220, r: 12, got: false, type: 'dorayaki'},
      {x: 800, y: groundY - 140, r: 12, got: false, type: 'coin'},
      {x: 1050, y: groundY - 240, r: 14, got: false, type: 'crystal'}
    ];

    this.enemies = [
      {x: 600, y: groundY - 30, w: 30, h: 30, vx: 2, dir: 1, min: 500, max: 800, type: 'mouse'}
    ];

    this.particles = [];
    this.camera = {x: 0, y: 0};
    this.updateHUD();
  },

  gameLoop() {
    if (this.state!== 'playing') return;
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  },

  update() {
    const w = this.worlds[this.world];
    const left = this.keys['ArrowLeft'] || this.touch.left;
    const right = this.keys['ArrowRight'] || this.touch.right;
    const jump = this.keys[' '] || this.keys['ArrowUp'] || this.touch.jump;

    // Physics
    this.player.vy += w.gravity;
    this.player.grounded = false;

    // Controls
    if (left) { this.player.vx = -this.player.speed; this.player.dir = -1; }
    else if (right) { this.player.vx = this.player.speed; this.player.dir = 1; }
    else { this.player.vx *= 0.85; }

    // FIX 4: Jump check - grounded hona chahiye
    if (jump && this.player.grounded) {
      this.player.vy = this.player.jumpPower;
      this.keys[' '] = this.keys['ArrowUp'] = this.touch.jump = false;
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Platform collision - FIX 5: Proper grounded detection
    this.platforms.forEach(pl => {
      if (this.player.x + this.player.w > pl.x && 
          this.player.x < pl.x + pl.w &&
          this.player.y + this.player.h > pl.y && 
          this.player.y + this.player.h < pl.y + pl.h + 20) {
        if (this.player.vy >= 0) {
          this.player.y = pl.y - this.player.h;
          this.player.vy = 0;
          this.player.grounded = true;
        }
      }
    });

    // Coin collection
    this.coinArr.forEach(cn => {
      if (!cn.got) {
        let dx = this.player.x + this.player.w/2 - cn.x;
        let dy = this.player.y + this.player.h/2 - cn.y;
        if (Math.sqrt(dx*dx + dy*dy) < cn.r + this.player.w/2) {
          cn.got = true;
          if (cn.type === 'coin') { this.coins++; this.score += 10; }
          else if (cn.type === 'dorayaki') { this.dorayaki++; this.score += 50; }
          else if (cn.type === 'crystal') { this.crystals++; this.score += 100; }
          
          // Particle effect
          for(let i=0; i<8; i++) {
            this.particles.push({
              x: cn.x, y: cn.y,
              vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
              life: 30, color: cn.type === 'crystal'? '#00FFFF' : '#FFD700'
            });
          }
          this.updateHUD();
        }
      }
    });

    // Enemy AI
    this.enemies.forEach((e, i) => {
      e.x += e.vx * e.dir;
      if (e.x <= e.min || e.x >= e.max) e.dir *= -1;
      
      // Collision with player
      if (this.player.x < e.x + e.w && this.player.x + this.player.w > e.x &&
          this.player.y < e.y + e.h && this.player.y + this.player.h > e.y) {
        if (this.player.vy > 0 && this.player.y + this.player.h - this.player.vy <= e.y + 5) {
          this.enemies.splice(i, 1);
          this.player.vy = -12;
          this.score += 50;
          this.updateHUD();
        } else {
          this.loseLife();
        }
      }
    });

    // Particles update
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.life--;
      return p.life > 0;
    });

    // Bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.y > this.canvas.height + 100) this.loseLife();

    // Camera follow
    this.camera.x = this.player.x - this.canvas.width * 0.3;
    if (this.camera.x < 0) this.camera.x = 0;

    // Animation
    this.player.animTimer++;
    if (this.player.animTimer > 6) {
      this.player.animFrame = (this.player.animFrame + 1) % 4;
      this.player.animTimer = 0;
    }
  },

  render() {
    const w = this.worlds[this.world];
    const ctx = this.ctx;

    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, w.color);
    grad.addColorStop(0.7, '#87CEEB');
    grad.addColorStop(1, '#6BBE44');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clouds parallax
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    this.drawCloud(100 - this.camera.x * 0.2, 80);
    this.drawCloud(400 - this.camera.x * 0.2, 120);
    this.drawCloud(700 - this.camera.x * 0.2, 90);
    this.drawCloud(1000 - this.camera.x * 0.2, 100);

    ctx.save();
    ctx.translate(-this.camera.x, 0);

    // Platforms - FIX 6: Ab draw honge
    this.platforms.forEach(pl => {
      ctx.fillStyle = '#D2691E';
      ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(pl.x, pl.y + pl.h - 5, pl.w, 5);
      // Grass top
      ctx.fillStyle = '#228B22';
      ctx.fillRect(pl.x, pl.y, pl.w, 8);
    });

    // Coins - FIX 7: Ab dikhenge
    this.coinArr.forEach(cn => {
      if (!cn.got) {
        if (cn.type === 'coin') {
          ctx.fillStyle = '#FFD700';
          ctx.strokeStyle = '#FF8C00';
        } else if (cn.type === 'dorayaki') {
          ctx.fillStyle = '#D2691E';
          ctx.strokeStyle = '#8B4513';
        } else {
          ctx.fillStyle = '#00FFFF';
          ctx.strokeStyle = '#00CED1';
        }
        ctx.beginPath();
        ctx.arc(cn.x, cn.y, cn.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Enemies
    this.enemies.forEach(e => {
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.arc(e.x + 15, e.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#696969';
      ctx.beginPath();
      ctx.arc(e.x + 8, e.y + 8, 6, 0, Math.PI * 2);
      ctx.arc(e.x + 22, e.y + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 30;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Doraemon
    this.drawDoraemon(this.player.x, this.player.y);

    ctx.restore();
  },

  drawDoraemon(x, y) {
    const ctx = this.ctx;
    const w = this.player.w, h = this.player.h;

    // Body
    ctx.fillStyle = '#00A0E9';
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.65, w*0.45, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.35, w*0.4, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.4, w*0.32, 0, Math.PI * 2);
    ctx.fill();

    // Eyes - Blink animation
    let blink = Math.floor(Date.now() / 3000) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + w*0.38, y + h*0.28, w*0.1, 0, Math.PI * 2);
      ctx.arc(x + w*0.62, y + h*0.28, w*0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + w*0.38, y + h*0.3, w*0.05, 0, Math.PI * 2);
      ctx.arc(x + w*0.62, y + h*0.3, w*0.05, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w*0.32, y + h*0.3); ctx.lineTo(x + w*0.44, y + h*0.3);
      ctx.moveTo(x + w*0.56, y + h*0.3); ctx.lineTo(x + w*0.68, y + h*0.3);
      ctx.stroke();
    }

    // Nose
    ctx.fillStyle = '#E60012';
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.38, w*0.07, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.45, w*0.15, 0, Math.PI);
    ctx.stroke();

    // Bell
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.68, w*0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 1;
    ctx.stroke();
  },

  drawCloud(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 25, 0, Math.PI * 2);
    this.ctx.arc(x + 30, y, 35, 0, Math.PI * 2);
    this.ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
    this.ctx.fill();
  },

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      const groundY = this.canvas.height - 60;
      this.player.x = 100;
      this.player.y = groundY - 50;
      this.player.vx = 0;
      this.player.vy = 0;
    }
    this.updateHUD();
  },

  gameOver() {
    this.state = 'over';
    document.getElementById('final').textContent = `Score: ${this.score}`;
    document.getElementById('over').style.display = 'block';
  },

  updateHUD() {
    document.getElementById('coins').textContent = this.coins;
    document.getElementById('dorayaki').textContent = this.dorayaki;
    document.getElementById('crystals').textContent = this.crystals;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, this.lives));
    document.getElementById('worldName').textContent = this.worlds[this.world].name;
    document.getElementById('levelNum').textContent = this.level;
    document.getElementById('totalCoins').textContent = this.coins;
    document.getElementById('totalDorayaki').textContent = this.dorayaki;
    document.getElementById('totalCrystals').textContent = this.crystals;
  },

  showMenu() {
    document.getElementById('worldSelect').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    this.state = 'menu';
  },

  showWorlds() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('worldSelect').style.display = 'flex';
  },

  selectWorld(world) {
    if (!this.worlds[world].unlocked && this.coins < this.worlds[world].cost) {
      alert(`🔒 Locked! Need ${this.worlds[world].cost} coins`);
      return;
    }
    this.world = world;
    this.showMenu();
  },

  useGadget() { console.log('Gadget system coming soon!'); },
  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      document.getElementById('pauseMenu').style.display = 'block';
    } else if (this.state === 'paused') {
      this.resume();
    }
  },
  resume() {
    this.state = 'playing';
    document.getElementById('pauseMenu').style.display = 'none';
    this.gameLoop();
  },
  restart() {
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('over').style.display = 'none';
    this.startGame();
  },
  quitToMenu() {
    this.state = 'menu';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    this.saveGame();
  },
  saveGame() {
    const save = {
      coins: this.coins, dorayaki: this.dorayaki, crystals: this.crystals,
      worlds: this.worlds
    };
    localStorage.setItem('doraemonSave', JSON.stringify(save));
  },
  loadSave() {
    const save = localStorage.getItem('doraemonSave');
    if (save) {
      const data = JSON.parse(save);
      this.coins = data.coins || 0;
      this.dorayaki = data.dorayaki || 0;
      this.crystals = data.crystals || 0;
      if (data.worlds) this.worlds = data.worlds;
    }
  },
  showGadgets() { alert('🎒 Gadgets: Anywhere Door, Take-Copter coming soon!'); },
  showAchievements() { alert('🏆 Achievements: Coming soon!'); }
};

window.onload = () => Game.init();