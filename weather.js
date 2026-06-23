// =========================
// WEATHER SYSTEM
// =========================

const weatherTypes = [

"sunny",
"rain",
"fog",
"storm"

];

let currentWeather =
"sunny";

let weatherParticles =
[];

// =========================
// RANDOM WEATHER
// =========================

setInterval(()=>{

currentWeather =

weatherTypes[
Math.floor(
Math.random()*
weatherTypes.length
)
];

},120000);

// =========================
// UPDATE WEATHER
// =========================

function updateWeather(){

if(
currentWeather ===
"rain"
){

for(let i=0;i<4;i++){

weatherParticles.push({

x:
cameraX +
Math.random()*
canvas.width,

y:-10,

speed:10

});

}

}

weatherParticles.forEach(p=>{

p.y += p.speed;

});

weatherParticles =
weatherParticles.filter(
p=>p.y < canvas.height
);

}

// =========================
// DRAW WEATHER
// =========================

function drawWeather(){

if(
currentWeather ===
"rain"
){

ctx.strokeStyle =
"#8ecae6";

weatherParticles.forEach(p=>{

ctx.beginPath();

ctx.moveTo(
p.x-cameraX,
p.y
);

ctx.lineTo(
p.x-cameraX,
p.y+15
);

ctx.stroke();

});

}

if(
currentWeather ===
"fog"
){

ctx.fillStyle =
"rgba(255,255,255,.2)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

}

if(
currentWeather ===
"storm"
){

ctx.fillStyle =
"rgba(0,0,0,.25)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

}

}