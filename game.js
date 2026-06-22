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
// ===== LEVEL =====

function initLevel() {

    const groundY = canvas.height - 100;

    // PLAYER
    player = {
        x: 100,
        y: groundY - 60,
        w: 55,
        h: 60,

        vx: 0,
        vy: 0,

        speed: 8,
        jumpPower: -20,

        grounded: false
    };


    // PLATFORMS

    platforms = [

        {
            x: 0,
            y: groundY,
            w: 5000,
            h: 100
        },

        {
            x: 300,
            y: groundY - 150,
            w: 220,
            h: 25
        },

        {
            x: 650,
            y: groundY - 250,
            w: 220,
            h: 25
        },

        {
            x: 1000,
            y: groundY - 170,
            w: 220,
            h: 25
        },

        {
            x: 1400,
            y: groundY - 280,
            w: 250,
            h: 25
        }

    ];


    // COINS

    coins = [

        {
            x: 350,
            y: groundY - 190,
            r: 18,
            got: false
        },

        {
            x: 430,
            y: groundY - 190,
            r: 18,
            got: false
        },

        {
            x: 700,
            y: groundY - 290,
            r: 18,
            got: false
        },

        {
            x: 1080,
            y: groundY - 210,
            r: 18,
            got: false
        },

        {
            x: 1500,
            y: groundY - 320,
            r: 22,
            got: false
        }

    ];


    // ENEMIES

    enemies = [

        {
            x: 800,
            y: groundY - 40,

            w: 40,
            h: 40,

            vx: 2,
            dir: 1,

            minX: 700,
            maxX: 950
        },

        {
            x: 1250,
            y: groundY - 40,

            w: 40,
            h: 40,

            vx: 2,
            dir: 1,

            minX: 1150,
            maxX: 1400
        }

    ];

}
// ===== GAME LOOP =====

function gameLoop(){

    if(!running) return;

    update();

    draw();

    requestAnimationFrame(gameLoop);

}



// ===== UPDATE =====

function update(){

    let left = keys["ArrowLeft"];
    let right = keys["ArrowRight"];
    let jump = keys["Space"] || keys["ArrowUp"];


    // LEFT RIGHT

    if(left){

        player.vx = -player.speed;

    }

    else if(right){

        player.vx = player.speed;

    }

    else{

        player.vx *= 0.8;

    }


    // GRAVITY

    player.vy += 1;


    // MOVE

    player.x += player.vx;

    player.y += player.vy;


    // RESET

    player.grounded = false;


    // PLATFORM COLLISION

    platforms.forEach(p => {

        if(

            player.x + player.w > p.x &&
            player.x < p.x + p.w &&

            player.y + player.h >= p.y &&
            player.y + player.h <= p.y + p.h + 25 &&

            player.vy >= 0

        ){

            player.y = p.y - player.h;

            player.vy = 0;

            player.grounded = true;

        }

    });


    // JUMP FIX

    if(jump && player.grounded){

        player.vy = player.jumpPower;

    }



    // CAMERA FOLLOW

    cameraX = player.x - canvas.width / 3;

    if(cameraX < 0){

        cameraX = 0;

    }



    // COINS

    coins.forEach(c=>{

        if(!c.got){

            let dx = (player.x + player.w/2) - c.x;
            let dy = (player.y + player.h/2) - c.y;

            let dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < c.r + player.w/2){

                c.got = true;

                coinCount++;

                score += 10;

                updateHUD();

            }

        }

    });



    // ENEMIES

    enemies.forEach(e=>{

        e.x += e.vx * e.dir;

        if(e.x <= e.minX || e.x >= e.maxX){

            e.dir *= -1;

        }

    });

}
// ===== ENEMY COLLISION =====

enemies.forEach(e=>{

    if(

        player.x < e.x + e.w &&
        player.x + player.w > e.x &&
        player.y < e.y + e.h &&
        player.y + player.h > e.y

    ){

        // PLAYER JUMPS ON ENEMY

        if(player.vy > 0 && player.y < e.y){

            e.dead = true;

            player.vy = -15;

            score += 50;

            updateHUD();

        }

        else{

            lives--;

            player.x = 100;
            player.y = canvas.height - 160;

            player.vx = 0;
            player.vy = 0;

            updateHUD();

            if(lives <= 0){

                running = false;

                setTimeout(()=>{

                    alert(
                        "GAME OVER!\n\nScore : " + score
                    );

                    location.reload();

                },100);

            }

        }

    }

});



// REMOVE DEAD ENEMIES

enemies = enemies.filter(
    e => !e.dead
);



// FALL OFF MAP

if(player.y > canvas.height + 200){

    lives--;

    player.x = 100;
    player.y = canvas.height - 160;

    player.vx = 0;
    player.vy = 0;

    updateHUD();

    if(lives <= 0){

        running = false;

        setTimeout(()=>{

            alert(
                "GAME OVER!\n\nScore : " + score
            );

            location.reload();

        },100);

    }

}



// LEFT LIMIT

if(player.x < 0){

    player.x = 0;

}
// ===== DRAW =====

function draw() {

    // SKY
    const grad = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    grad.addColorStop(
        0,
        "#87CEEB"
    );

    grad.addColorStop(
        1,
        "#E0F6FF"
    );

    ctx.fillStyle = grad;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // CAMERA

    ctx.save();

    ctx.translate(
        -cameraX,
        0
    );


    // CLOUDS

    ctx.fillStyle =
        "rgba(255,255,255,0.9)";

    drawCloud(100,100);

    drawCloud(500,150);

    drawCloud(900,120);



    // TREES

    for(let i=0;i<20;i++){

        let tx = i * 300 + 100;

        // leaves

        ctx.fillStyle = "#228B22";

        ctx.beginPath();

        ctx.arc(
            tx,
            canvas.height-130,
            45,
            0,
            Math.PI*2
        );

        ctx.fill();


        // trunk

        ctx.fillStyle="#8B4513";

        ctx.fillRect(
            tx-10,
            canvas.height-90,
            20,
            60
        );

    }



    // PLATFORMS

    platforms.forEach(p=>{

        ctx.fillStyle="#8B4513";

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );

        ctx.fillStyle="#32CD32";

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            10
        );

    });



    // COINS

    coins.forEach(c=>{

        if(!c.got){

            ctx.shadowColor="gold";

            ctx.shadowBlur=20;

            ctx.fillStyle="#FFD700";

            ctx.beginPath();

            ctx.arc(
                c.x,
                c.y,
                c.r,
                0,
                Math.PI*2
            );

            ctx.fill();

        }

    });

    ctx.shadowBlur = 0;



    // ENEMIES

    enemies.forEach(e=>{

        ctx.fillStyle="#FF4444";

        ctx.beginPath();

        ctx.arc(

            e.x + e.w/2,

            e.y + e.h/2,

            e.w/2,

            0,

            Math.PI*2

        );

        ctx.fill();

    });



    // PLAYER

    drawDoraemon(
        player.x,
        player.y
    );



    ctx.restore();

}
// ===== DORAEMON =====

function drawDoraemon(x,y){

    let w = player.w;
    let h = player.h;


    // SHADOW

    ctx.fillStyle =
    "rgba(0,0,0,0.3)";

    ctx.beginPath();

    ctx.ellipse(
        x+w/2,
        y+h+8,
        w/2,
        10,
        0,
        0,
        Math.PI*2
    );

    ctx.fill();



    // BODY

    ctx.fillStyle="#00A0E9";

    ctx.beginPath();

    ctx.arc(
        x+w/2,
        y+h*0.65,
        w*0.48,
        0,
        Math.PI*2
    );

    ctx.fill();



    // HEAD

    ctx.beginPath();

    ctx.arc(
        x+w/2,
        y+h*0.35,
        w*0.45,
        0,
        Math.PI*2
    );

    ctx.fill();



    // FACE

    ctx.fillStyle="#fff";

    ctx.beginPath();

    ctx.arc(
        x+w/2,
        y+h*0.40,
        w*0.35,
        0,
        Math.PI*2
    );

    ctx.fill();



    // EYES

    ctx.fillStyle="#fff";

    ctx.beginPath();

    ctx.arc(
        x+w*0.37,
        y+h*0.27,
        w*0.12,
        0,
        Math.PI*2
    );

    ctx.arc(
        x+w*0.63,
        y+h*0.27,
        w*0.12,
        0,
        Math.PI*2
    );

    ctx.fill();



    ctx.fillStyle="#000";

    ctx.beginPath();

    ctx.arc(
        x+w*0.37,
        y+h*0.29,
        w*0.05,
        0,
        Math.PI*2
    );

    ctx.arc(
        x+w*0.63,
        y+h*0.29,
        w*0.05,
        0,
        Math.PI*2
    );

    ctx.fill();



    // NOSE

    ctx.fillStyle="#E60012";

    ctx.beginPath();

    ctx.arc(
        x+w/2,
        y+h*0.38,
        w*0.08,
        0,
        Math.PI*2
    );

    ctx.fill();



    // BELL

    ctx.fillStyle="#FFD700";

    ctx.beginPath();

    ctx.arc(
        x+w/2,
        y+h*0.68,
        w*0.09,
        0,
        Math.PI*2
    );

    ctx.fill();

}
// ===== CONTROLS =====

function setupButtons(){

    function bind(btn,key){

        btn.addEventListener(
            "touchstart",
            e=>{
                e.preventDefault();
                keys[key]=true;
            },
            {passive:false}
        );

        btn.addEventListener(
            "touchend",
            e=>{
                e.preventDefault();
                keys[key]=false;
            },
            {passive:false}
        );

        btn.addEventListener(
            "mousedown",
            ()=>{
                keys[key]=true;
            }
        );

        btn.addEventListener(
            "mouseup",
            ()=>{
                keys[key]=false;
            }
        );

    }


    bind(
        document.getElementById(
            "leftBtn"
        ),
        "ArrowLeft"
    );


    bind(
        document.getElementById(
            "rightBtn"
        ),
        "ArrowRight"
    );


    bind(
        document.getElementById(
            "jumpBtn"
        ),
        "Space"
    );

}



// ===== KEYBOARD =====

document.addEventListener(
    "keydown",
    e=>{

        keys[e.key]=true;

        if(e.key===" ")
            keys["Space"]=true;

    }
);


document.addEventListener(
    "keyup",
    e=>{

        keys[e.key]=false;

        if(e.key===" ")
            keys["Space"]=false;

    }
);

function updateHUD(){

    document.getElementById(
        "coins"
    ).textContent = coinCount;

    document.getElementById(
        "score"
    ).textContent = score;

    document.getElementById(
        "lives"
    ).textContent =
        "❤️".repeat(
            Math.max(0,lives)
        );

}
function drawCloud(x,y){

    ctx.beginPath();

    ctx.arc(x,y,35,0,Math.PI*2);

    ctx.arc(x+45,y,50,0,Math.PI*2);

    ctx.arc(x+90,y,35,0,Math.PI*2);

    ctx.fill();

}