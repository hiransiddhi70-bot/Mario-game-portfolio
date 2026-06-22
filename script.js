const Game = {
  canvas: null, ctx: null, state: 'loading',
  player: null, world: 'nobita', level: 1,
  coins: 0, dorayaki: 0, crystals: 0, lives: 3,
  keys: {}, touch: {}, camera: {x: 0, y: 0},

  // World Data
  worlds: {
    nobita: { name: "Nobita's House", color: '#87CEEB', gravity: 0.8, unlocked: true },
    future: { name: "Future City", color: '#4A90E2', gravity: 0.6, cost: 50 },
    space: { name: "Space World", color: '#1a1a2e', gravity: 0.3, cost: 150 },
    dino: { name: "Dinosaur Land", color: '#228B22', gravity: 0.9, cost: 300 },
    ocean: { name: "Underwater Kingdom", color: '#006994', gravity: 0.4, cost: 500 },
    candy: { name: "Candy World", color: '#FFB6C1', gravity: 0.7, cost: 1000 }
  },

  // Gadgets System
  gadgets: {
    door: { name: 'Anywhere Door', unlocked: true, icon: '🚪' },
    copter: { name: 'Take-Copter', unlocked: false, icon: '🎋' },
    light: { name: 'Small Light', unlocked: false, icon: '🔦' },
    cannon: { name: 'Air Cannon', unlocked: false, icon: '💨' }
  },
  currentGadget: null,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.loadSave();
    this.setupControls();
    this.loadAssets();

    setTimeout(() => {
      document.getElementById('loading').style.display = 'none';
      this.state = 'menu';
    }, 2000);
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
      btn.ontouchstart = btn.onmousedown = e => {e.preventDefault(); this.touch[key] = true;};
      btn.ontouchend = btn.onmouseup = btn.ontouchcancel = e => {e.preventDefault(); this.touch[key] = false;};
    };
    bind('leftBtn', 'left'); bind('rightBtn', 'right'); bind('jumpBtn', 'jump');
    document.getElementById('gadgetBtn').onclick = () => this.useGadget();

    document.querySelectorAll('.world-card').forEach(card => {
      card.onclick = () => this.selectWorld(card.dataset.world);
    });
  },

  loadAssets() {
    // Sprites drawn with canvas - no external files needed
    this.player = {
      x: 100, y: 300, w: 40, h: 50, vx: 0, vy: 0,
      speed: 6, jumpPower: -16, grounded: false, dir: 1,
      animFrame: 0, animTimer: 0
    };
  },

  startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    this.state = 'playing';
    this.resetLevel();
    this.gameLoop();
  },

  resetLevel() {
    const w = this.worlds[this.world];
    this.player.x = 100;
    this.player.y = this.canvas.height - 150;
    this.player.vx = 0; this.player.vy = 0;
    this.level = 1;
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

    if (left) { this.player.vx = -this.player.speed; this.player.dir = -1; }
    else if (right) { this.player.vx = this.player.speed; this.player.dir = 1; }
    else { this.player.vx *= 0.8; }

    if (jump && this.player.grounded) {
      this.player.vy = this.player.jumpPower;
      this.keys[' '] = this.keys['ArrowUp'] = this.touch.jump = false;
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Ground collision
    const groundY = this.canvas.height - 50;
    if (this.player.y + this.player.h > groundY) {
      this.player.y = groundY - this.player.h;
      this.player.vy = 0;
      this.player.grounded = true;
    }

    // Bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.y > this.canvas.height) this.loseLife();

    // Camera follow
    this.camera.x = this.player.x - this.canvas.width / 3;
    if (this.camera.x < 0) this.camera.x = 0;

    // Animation
    this.player.animTimer++;
    if (this.player.animTimer > 8) {
      this.player.animFrame = (this.player.animFrame + 1) % 4;
      this.player.animTimer = 0;
    }
  },

  render() {
    const w = this.worlds[this.world];
    const ctx = this.ctx;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, w.color);
    grad.addColorStop(1, '#6BBE44');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Parallax clouds
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    this.drawCloud(100 - this.camera.x * 0.3, 80);
    this.drawCloud(400 - this.camera.x * 0.3, 120);
    this.drawCloud(700 - this.camera.x * 0.3, 90);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, this.canvas.height - 50, this.canvas.width + this.camera.x + 100, 50);
    ctx.fillStyle = '#6BBE44';
    ctx.fillRect(0, this.canvas.height - 50, this.canvas.width + this.camera.x + 100, 10);

    // Draw Doraemon
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

    // Eyes
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
    if (this.lives <= 0) this.gameOver();
    else {
      this.player.x = 100;
      this.player.y = this.canvas.height - 150;
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
    document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
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
      alert('🔒 Locked! Need ' + this.worlds[world].cost + ' coins');
      return;
    }
    this.world = world;
    this.showMenu();
  },

  useGadget() {
    if (!this.currentGadget) return;
    // Gadget logic here
    console.log('Using:', this.currentGadget);
  },

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
      worlds: this.worlds, gadgets: this.gadgets
    };
    localStorage.setItem('doraemonSave', JSON.stringify(save));
  },

  loadSave() {
    const save = localStorage.getItem('doraemonSave');
    if (save) {
      const data = JSON.parse(save);
      Object.assign(this, data);
    }
  },

  showGadgets() { alert('Gadgets: Coming Soon! 🎒'); },
  showAchievements() { alert('Achievements: Coming Soon! 🏆'); }
};

window.onload = () => Game.init();