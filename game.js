// ===== GLOBAL =====

let canvas, ctx;
let running = false;

let player;
let platforms = [];
let coins = [];
let enemies = [];

let score = 0;
let coinCount = 0;
let lives = 3;

let keys = {};

let cameraX = 0;

let debugEl;


// ===== INIT =====

window.onload = () => {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    debugEl = document.getElementById("debug");

    resize();

    window.addEventListener("resize", resize);

    setupButtons();

};


function resize() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}


function log(msg){

    debugEl.textContent = msg;

}



// ===== START GAME =====

function startGame(){

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    score = 0;
    coinCount = 0;
    lives = 3;

    running = true;

    initLevel();

    updateHUD();

    gameLoop();

}