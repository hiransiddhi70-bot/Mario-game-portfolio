// =========================
// DOM REFERENCES
// =========================

const canvas =
document.getElementById("gameCanvas");

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

const loadingScreen =
document.getElementById("loadingScreen");

const mainMenu =
document.getElementById("mainMenu");

const gameUI =
document.getElementById("gameUI");

const inventoryPanel =
document.getElementById("inventoryPanel");

const dialogueBox =
document.getElementById("dialogueBox");

const healthBar =
document.getElementById("healthBar");

const scoreDisplay =
document.getElementById("scoreDisplay");

const characterDisplay =
document.getElementById("characterDisplay");

const currentQuest =
document.getElementById("currentQuest");

// =========================
// GAME STATE
// =========================

let gameStarted = false;

let score = 0;

let cameraX = 0;

let gravity = 0.8;

let currentCharacter =
"Doraemon";

let inventoryOpen = false;

// =========================
// PLAYER
// =========================

const player = {

x:200,
y:300,

width:60,
height:60,

vx:0,
vy:0,

speed:6,

jumpPower:-15,

grounded:false,

health:100,

color:"#2196f3"

};

// =========================
// WORLD
// =========================

const world = {

width:10000,

groundY:
canvas.height - 120

};

// =========================
// DORAYAKI
// =========================

const dorayaki = [];

for(let i=0;i<50;i++){

dorayaki.push({

x:600 + i*180,

y:world.groundY - 50,

collected:false

});

}

// =========================
// CLOUDS
// =========================

const clouds = [];

for(let i=0;i<15;i++){

clouds.push({

x:i*500,

y:Math.random()*180,

size:60+Math.random()*50

});

}

// =========================
// ACHIEVEMENTS
// =========================

const achievements = {

firstDorayaki:false,

collector:false,

survivor:false

};

// =========================
// INVENTORY
// =========================

const inventory = [

{
name:"Anywhere Door",
uses:3
},

{
name:"Bamboo Copter",
uses:5
},

{
name:"Time Cloth",
uses:2
}

];

// =========================
// CHARACTER SWITCH
// =========================

const characters = [

"Doraemon",
"Nobita",
"Shizuka",
"Gian",
"Suneo"

];

function switchCharacter(){

let index =
characters.indexOf(
currentCharacter
);

index++;

if(
index >= characters.length
){
index = 0;
}

currentCharacter =
characters[index];

characterDisplay.innerText =
currentCharacter;

}

// =========================
// SAVE SYSTEM
// =========================

function saveGame(){

const data = {

score,

health:
player.health,

character:
currentCharacter

};

localStorage.setItem(
"timeRiftSave",
JSON.stringify(data)
);

}

function loadGame(){

const save =
localStorage.getItem(
"timeRiftSave"
);

if(!save) return;

const data =
JSON.parse(save);

score =
data.score || 0;

player.health =
data.health || 100;

currentCharacter =
data.character ||
"Doraemon";

characterDisplay.innerText =
currentCharacter;

}

// =========================
// GAME START
// =========================

function startGame(){

gameStarted = true;

mainMenu.classList.add(
"hidden"
);

loadingScreen.classList.add(
"hidden"
);

gameUI.classList.remove(
"hidden"
);

}

// =========================
// PLAYER UPDATE
// =========================

function updatePlayer(){

player.vy += gravity;

player.x += player.vx;

player.y += player.vy;

if(

player.y +
player.height >=
world.groundY

){

player.y =
world.groundY -
player.height;

player.vy = 0;

player.grounded = true;

}

cameraX =
player.x -
200;

}

// =========================
// DORAYAKI COLLISION
// =========================

function updateDorayaki(){

dorayaki.forEach(item=>{

if(item.collected)
return;

if(

player.x <
item.x + 30 &&

player.x +
player.width >

item.x &&

player.y <
item.y + 30 &&

player.y +
player.height >

item.y

){

item.collected = true;

score += 10;

if(
!achievements
.firstDorayaki
){

achievements
.firstDorayaki =
true;

}

}

});

}

// =========================
// HEALTH UI
// =========================

function updateUI(){

scoreDisplay.innerText =
"🍩 " + score;

healthBar.style.width =
player.health + "%";

}

// =========================
// DRAW CLOUD
// =========================

function drawCloud(
x,
y,
size
){

ctx.fillStyle =
"white";

ctx.beginPath();

ctx.arc(
x,
y,
size/2,
0,
Math.PI*2
);

ctx.arc(
x+30,
y,
size/2,
0,
Math.PI*2
);

ctx.arc(
x+15,
y-20,
size/2,
0,
Math.PI*2
);

ctx.fill();

}

// =========================
// DRAW PLAYER
// =========================

function drawPlayer(){

ctx.fillStyle =
player.color;

ctx.beginPath();

ctx.arc(

player.x -
cameraX + 30,

player.y + 30,

30,

0,

Math.PI*2

);

ctx.fill();

ctx.fillStyle =
"white";

ctx.beginPath();

ctx.arc(

player.x -
cameraX + 30,

player.y + 35,

18,

0,

Math.PI*2

);

ctx.fill();

}

// =========================
// DRAW WORLD
// =========================

function drawWorld(){

ctx.fillStyle =
"#87ceeb";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

clouds.forEach(cloud=>{

drawCloud(

cloud.x -
cameraX*0.3,

cloud.y,

cloud.size

);

});

ctx.fillStyle =
"#4caf50";

ctx.fillRect(

0,

world.groundY,

10000,

300

);

}

// =========================
// DRAW DORAYAKI
// =========================

function drawDorayaki(){

dorayaki.forEach(item=>{

if(item.collected)
return;

ctx.fillStyle =
"orange";

ctx.beginPath();

ctx.arc(

item.x-cameraX,

item.y,

15,

0,

Math.PI*2

);

ctx.fill();

});

}

// =========================
// INVENTORY TOGGLE
// =========================

function toggleInventory(){

inventoryOpen =
!inventoryOpen;

if(inventoryOpen){

inventoryPanel
.classList
.remove("hidden");

}else{

inventoryPanel
.classList
.add("hidden");

}

}

// =========================
// DRAW LOOP
// =========================

function draw(){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

drawWorld();

drawDorayaki();

drawPlayer();

}

// =========================
// GAME LOOP
// =========================

function gameLoop(){

if(gameStarted){

updatePlayer();

updateDorayaki();

updateUI();

draw();

}

requestAnimationFrame(
gameLoop
);

}

// =========================
// MOBILE CONTROLS
// =========================

const leftBtn =
document.getElementById(
"leftBtn"
);

const rightBtn =
document.getElementById(
"rightBtn"
);

const jumpBtn =
document.getElementById(
"jumpBtn"
);

const gadgetBtn =
document.getElementById(
"gadgetBtn"
);

const switchBtn =
document.getElementById(
"switchBtn"
);

// LEFT

leftBtn.ontouchstart=()=>{

player.vx =
-player.speed;

};

leftBtn.ontouchend=()=>{

player.vx = 0;

};

// RIGHT

rightBtn.ontouchstart=()=>{

player.vx =
player.speed;

};

rightBtn.ontouchend=()=>{

player.vx = 0;

};

// JUMP

jumpBtn.ontouchstart=()=>{

if(player.grounded){

player.vy =
player.jumpPower;

player.grounded =
false;

}

};

// INVENTORY

gadgetBtn.ontouchstart=()=>{

toggleInventory();

};

// CHARACTER SWITCH

switchBtn.ontouchstart=()=>{

switchCharacter();

};

// =========================
// MENU BUTTONS
// =========================

document
.getElementById("playBtn")
.addEventListener(
"click",
startGame
);

document
.getElementById(
"closeInventory"
)
.addEventListener(
"click",
toggleInventory
);

// =========================
// AUTO SAVE
// =========================

setInterval(()=>{

saveGame();

},30000);

// =========================
// LOAD
// =========================

loadGame();

// =========================
// FAKE LOADING
// =========================

let progress = 0;

const loadingBar =
document.getElementById(
"loadingBar"
);

const loader =
setInterval(()=>{

progress += 10;

loadingBar.style.width =
progress + "%";

if(progress >= 100){

clearInterval(
loader
);

loadingScreen
.classList
.add("hidden");

mainMenu
.classList
.remove("hidden");

}

},150);

// =========================
// START LOOP
// =========================

gameLoop();
if(
"serviceWorker"
in navigator
){

navigator.serviceWorker
.register(
"service-worker.js"
);

}