// =========================
// WORLD SYSTEM
// =========================

const WORLD_TYPES = {

NOBI_TOWN: "nobiTown",

DINOSAUR: "dinosaurWorld",

FUTURE: "futureCity",

SAMURAI: "samuraiWorld",

SPACE: "spacePlanet"

};

let currentWorld =
WORLD_TYPES.NOBI_TOWN;

// =========================
// WORLD DATA
// =========================

const worlds = {

nobiTown:{

name:"Nobi Town",

spawnX:200,

background:"#87ceeb",

music:"town.mp3"

},

dinosaurWorld:{

name:"Dinosaur Valley",

spawnX:200,

background:"#90ee90",

music:"dinosaur.mp3"

},

futureCity:{

name:"Future City",

spawnX:200,

background:"#90caf9",

music:"future.mp3"

},

samuraiWorld:{

name:"Samurai Kingdom",

spawnX:200,

background:"#d7ccc8",

music:"samurai.mp3"

},

spacePlanet:{

name:"Space Planet",

spawnX:200,

background:"#111827",

music:"space.mp3"

}

};

// =========================
// NPC DATA
// =========================

const npcs = [

{

name:"Dekisugi",

world:"nobiTown",

x:900,

y:world.groundY-60,

dialogue:[
"Study hard Nobita!"
]

},

{

name:"Teacher",

world:"nobiTown",

x:1400,

y:world.groundY-60,

dialogue:[
"Homework complete?"
]

},

{

name:"Scientist Bot",

world:"futureCity",

x:1000,

y:world.groundY-60,

dialogue:[
"Future is unstable."
]

},

{

name:"Samurai Master",

world:"samuraiWorld",

x:1200,

y:world.groundY-60,

dialogue:[
"Honor comes first."
]

},

{

name:"Alien Chief",

world:"spacePlanet",

x:1600,

y:world.groundY-60,

dialogue:[
"Welcome Earth Hero."
]

}

];

// =========================
// PORTALS
// =========================

const portals = [

{

name:"Dinosaur Portal",

target:
WORLD_TYPES.DINOSAUR,

x:2500,

y:world.groundY-90

},

{

name:"Future Portal",

target:
WORLD_TYPES.FUTURE,

x:4500,

y:world.groundY-90

},

{

name:"Samurai Portal",

target:
WORLD_TYPES.SAMURAI,

x:6500,

y:world.groundY-90

},

{

name:"Space Portal",

target:
WORLD_TYPES.SPACE,

x:8500,

y:world.groundY-90

}

];

// =========================
// CHANGE WORLD
// =========================

function changeWorld(worldName){

currentWorld =
worldName;

player.x =
worlds[
worldName
].spawnX;

showDialogue(

"System",

"Entering " +
worlds[worldName]
.name

);

}

// =========================
// DIALOGUE
// =========================

function showDialogue(
speaker,
text
){

dialogueBox
.classList
.remove("hidden");

document
.getElementById(
"speakerName"
).innerText =
speaker;

document
.getElementById(
"dialogueText"
).innerText =
text;

setTimeout(()=>{

dialogueBox
.classList
.add("hidden");

},3000);

}

// =========================
// DRAW NPCS
// =========================

function drawNPCs(){

npcs.forEach(npc=>{

if(
npc.world !==
currentWorld
)
return;

ctx.fillStyle =
"purple";

ctx.fillRect(

npc.x-cameraX,

npc.y,

40,

60

);

ctx.fillStyle =
"white";

ctx.font =
"16px Arial";

ctx.fillText(

npc.name,

npc.x-cameraX-10,

npc.y-10

);

});

}

// =========================
// NPC INTERACTION
// =========================

function interactNPC(){

npcs.forEach(npc=>{

if(
npc.world !==
currentWorld
)
return;

const distance =

Math.abs(
player.x -
npc.x
);

if(distance < 120){

showDialogue(

npc.name,

npc.dialogue[0]

);

}

});

}

// =========================
// DRAW PORTALS
// =========================

function drawPortals(){

portals.forEach(portal=>{

ctx.fillStyle =
"cyan";

ctx.beginPath();

ctx.arc(

portal.x-cameraX,

portal.y,

45,

0,

Math.PI*2

);

ctx.fill();

ctx.fillStyle =
"black";

ctx.font =
"12px Arial";

ctx.fillText(

portal.name,

portal.x-cameraX-40,

portal.y+70

);

});

}

// =========================
// PORTAL COLLISION
// =========================

function checkPortals(){

portals.forEach(portal=>{

const distance =

Math.abs(
player.x -
portal.x
);

if(distance < 60){

changeWorld(
portal.target
);

}

});

}

// =========================
// WORLD BACKGROUNDS
// =========================

function drawWorldBackground(){

switch(currentWorld){

case
WORLD_TYPES.NOBI_TOWN:

ctx.fillStyle =
"#87ceeb";
break;

case
WORLD_TYPES.DINOSAUR:

ctx.fillStyle =
"#9ccc65";
break;

case
WORLD_TYPES.FUTURE:

ctx.fillStyle =
"#90caf9";
break;

case
WORLD_TYPES.SAMURAI:

ctx.fillStyle =
"#bcaaa4";
break;

case
WORLD_TYPES.SPACE:

ctx.fillStyle =
"#0f172a";
break;

}

ctx.fillRect(

0,

0,

canvas.width,

canvas.height

);

}

// =========================
// SPECIAL STRUCTURES
// =========================

function drawWorldObjects(){

if(
currentWorld ===
WORLD_TYPES.NOBI_TOWN
){

drawTown();

}

if(
currentWorld ===
WORLD_TYPES.DINOSAUR
){

drawDinosaurWorld();

}

if(
currentWorld ===
WORLD_TYPES.FUTURE
){

drawFutureCity();

}

if(
currentWorld ===
WORLD_TYPES.SAMURAI
){

drawSamuraiWorld();

}

if(
currentWorld ===
WORLD_TYPES.SPACE
){

drawSpaceWorld();

}

}

// =========================
// TOWN
// =========================

function drawTown(){

ctx.fillStyle =
"#795548";

ctx.fillRect(
300-cameraX,
250,
180,
180
);

ctx.fillRect(
1000-cameraX,
220,
200,
210
);

}

// =========================
// DINOSAUR
// =========================

function drawDinosaurWorld(){

ctx.fillStyle =
"#5d4037";

ctx.beginPath();

ctx.moveTo(
800-cameraX,
world.groundY
);

ctx.lineTo(
1100-cameraX,
120
);

ctx.lineTo(
1400-cameraX,
world.groundY
);

ctx.fill();

}

// =========================
// FUTURE CITY
// =========================

function drawFutureCity(){

ctx.fillStyle =
"#607d8b";

for(
let i=0;
i<8;
i++
){

ctx.fillRect(

(500+i*250)
-cameraX,

150,

120,

300

);

}

}

// =========================
// SAMURAI
// =========================

function drawSamuraiWorld(){

ctx.fillStyle =
"#8d6e63";

ctx.fillRect(

1200-cameraX,

120,

350,

320

);

}

// =========================
// SPACE
// =========================

function drawSpaceWorld(){

ctx.fillStyle =
"white";

for(
let i=0;
i<100;
i++
){

ctx.fillRect(

(i*150-cameraX)%12000,

Math.random()*500,

2,

2

);

}

}

// =========================
// UPDATE WORLD
// =========================

function updateWorld(){

checkPortals();

}

// =========================
// WORLD DRAW CALL
// =========================

function drawWorldSystem(){

drawWorldBackground();

drawWorldObjects();

drawNPCs();

drawPortals();

}