// =========================
// ENEMY SYSTEM
// =========================

const enemies = [];

// =========================
// SPAWN ENEMIES
// =========================

function spawnEnemies(){

enemies.length = 0;

if(currentWorld === "dinosaurWorld"){

for(let i=0;i<8;i++){

enemies.push({

type:"dino",

x:800 + i*500,

y:world.groundY-60,

width:60,

height:60,

health:40,

maxHealth:40,

speed:1.2,

damage:5,

alive:true

});

}

}

if(currentWorld === "futureCity"){

for(let i=0;i<8;i++){

enemies.push({

type:"robot",

x:1000 + i*600,

y:world.groundY-60,

width:60,

height:60,

health:60,

maxHealth:60,

speed:1.5,

damage:8,

alive:true

});

}

}

if(currentWorld === "samuraiWorld"){

for(let i=0;i<8;i++){

enemies.push({

type:"samurai",

x:900 + i*550,

y:world.groundY-60,

width:60,

height:60,

health:50,

maxHealth:50,

speed:1.4,

damage:7,

alive:true

});

}

}

if(currentWorld === "spacePlanet"){

for(let i=0;i<8;i++){

enemies.push({

type:"alien",

x:1200 + i*700,

y:world.groundY-60,

width:60,

height:60,

health:70,

maxHealth:70,

speed:1.8,

damage:10,

alive:true

});

}

}

}

// =========================
// UPDATE ENEMIES
// =========================

function updateEnemies(){

enemies.forEach(enemy=>{

if(!enemy.alive)
return;

const distance =

player.x - enemy.x;

if(
Math.abs(distance) < 300
){

enemy.x +=

distance > 0
? enemy.speed
: -enemy.speed;

}

if(
Math.abs(distance) < 60
){

player.health -=
enemy.damage * 0.05;

if(player.health < 0){

player.health = 0;

}

}

});

}

// =========================
// DRAW ENEMIES
// =========================

function drawEnemies(){

enemies.forEach(enemy=>{

if(!enemy.alive)
return;

switch(enemy.type){

case "dino":
ctx.fillStyle="green";
break;

case "robot":
ctx.fillStyle="silver";
break;

case "samurai":
ctx.fillStyle="brown";
break;

case "alien":
ctx.fillStyle="purple";
break;

}

ctx.fillRect(

enemy.x-cameraX,

enemy.y,

enemy.width,

enemy.height

);

ctx.fillStyle="red";

ctx.fillRect(

enemy.x-cameraX,

enemy.y-12,

enemy.health,

5

);

});

}

// =========================
// PLAYER ATTACK
// =========================

function attackEnemy(){

enemies.forEach(enemy=>{

if(!enemy.alive)
return;

const distance =

Math.abs(
player.x -
enemy.x
);

if(distance < 120){

enemy.health -= 20;

createHitEffect(
enemy.x,
enemy.y
);

if(enemy.health <= 0){

enemy.alive = false;

score += 50;

}

}

});

attackBosses();

}

// =========================
// EFFECTS
// =========================

const hitEffects = [];

function createHitEffect(
x,
y
){

for(let i=0;i<15;i++){

hitEffects.push({

x,

y,

vx:
(Math.random()-0.5)*8,

vy:
(Math.random()-0.5)*8,

life:30

});

}

}

function updateEffects(){

hitEffects.forEach(e=>{

e.x += e.vx;

e.y += e.vy;

e.life--;

});

}

function drawEffects(){

hitEffects.forEach(e=>{

ctx.fillStyle=
"yellow";

ctx.fillRect(

e.x-cameraX,

e.y,

4,

4

);

});

}

// =========================
// T-REX BOSS
// =========================

const trexBoss = {

active:false,

x:2500,

y:world.groundY-150,

width:150,

height:150,

health:500,

alive:true

};

// =========================
// FUTURE AI BOSS
// =========================

const aiBoss = {

active:false,

x:3500,

y:world.groundY-150,

width:150,

height:150,

health:700,

alive:true

};

// =========================
// UFO BOSS
// =========================

const ufoBoss = {

active:false,

x:4500,

y:200,

width:180,

height:120,

health:900,

alive:true

};

// =========================
// TIME RIFT KING
// =========================

const finalBoss = {

active:false,

x:8000,

y:world.groundY-200,

width:220,

height:220,

health:2000,

alive:true

};

// =========================
// UPDATE BOSSES
// =========================

function updateBosses(){

if(
currentWorld ===
"dinosaurWorld"
){

trexBoss.active = true;

}

if(
currentWorld ===
"futureCity"
){

aiBoss.active = true;

}

if(
currentWorld ===
"spacePlanet"
){

ufoBoss.active = true;

}

}

// =========================
// DRAW BOSSES
// =========================

function drawBosses(){

if(
trexBoss.active &&
trexBoss.alive
){

ctx.fillStyle=
"darkgreen";

ctx.fillRect(

trexBoss.x-cameraX,

trexBoss.y,

trexBoss.width,

trexBoss.height

);

drawBossHP(
trexBoss
);

}

if(
aiBoss.active &&
aiBoss.alive
){

ctx.fillStyle=
"black";

ctx.fillRect(

aiBoss.x-cameraX,

aiBoss.y,

aiBoss.width,

aiBoss.height

);

drawBossHP(
aiBoss
);

}

if(
ufoBoss.active &&
ufoBoss.alive
){

ctx.fillStyle=
"cyan";

ctx.fillRect(

ufoBoss.x-cameraX,

ufoBoss.y,

ufoBoss.width,

ufoBoss.height

);

drawBossHP(
ufoBoss
);

}

if(
finalBoss.active &&
finalBoss.alive
){

ctx.fillStyle=
"red";

ctx.fillRect(

finalBoss.x-cameraX,

finalBoss.y,

finalBoss.width,

finalBoss.height

);

drawBossHP(
finalBoss
);

}

}

// =========================
// BOSS HP BAR
// =========================

function drawBossHP(boss){

ctx.fillStyle="black";

ctx.fillRect(
200,
20,
400,
30
);

ctx.fillStyle="red";

ctx.fillRect(
200,
20,
boss.health/5,
30
);

}

// =========================
// ATTACK BOSSES
// =========================

function attackBosses(){

const bosses = [

trexBoss,

aiBoss,

ufoBoss,

finalBoss

];

bosses.forEach(boss=>{

if(
!boss.active ||
!boss.alive
)
return;

const distance =

Math.abs(
player.x -
boss.x
);

if(distance < 180){

boss.health -= 20;

createHitEffect(
boss.x,
boss.y
);

if(
boss.health <= 0
){

boss.alive = false;

score += 1000;

}

}

});

}

// =========================
// FINAL BOSS TRIGGER
// =========================

function checkFinalBoss(){

if(

player.x > 7800 &&

finalBoss.alive

){

finalBoss.active = true;

showDialogue(

"System",

"Time Rift King Appears!"

);

}

}

// =========================
// MASTER UPDATE
// =========================

function updateEnemySystem(){

updateEnemies();

updateBosses();

updateEffects();

checkFinalBoss();

}

// =========================
// MASTER DRAW
// =========================

function drawEnemySystem(){

drawEnemies();

drawBosses();

drawEffects();

}

// =========================
// INITIAL SPAWN
// =========================

spawnEnemies();