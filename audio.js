// =========================
// AUDIO SYSTEM
// =========================

const AudioManager = {

musicEnabled:true,

sfxEnabled:true,

currentMusic:null,

tracks:{},

sounds:{}

};

// =========================
// LOAD AUDIO
// =========================

function loadAudio(){

AudioManager.tracks = {

menu:
new Audio(
"assets/audio/menu.mp3"
),

town:
new Audio(
"assets/audio/town.mp3"
),

dinosaur:
new Audio(
"assets/audio/dinosaur.mp3"
),

future:
new Audio(
"assets/audio/future.mp3"
),

samurai:
new Audio(
"assets/audio/samurai.mp3"
),

space:
new Audio(
"assets/audio/space.mp3"
)

};

AudioManager.sounds = {

jump:
new Audio(
"assets/audio/jump.mp3"
),

attack:
new Audio(
"assets/audio/attack.mp3"
),

collect:
new Audio(
"assets/audio/collect.mp3"
),

portal:
new Audio(
"assets/audio/portal.mp3"
),

boss:
new Audio(
"assets/audio/boss.mp3"
)

};

}

// =========================
// PLAY MUSIC
// =========================

function playMusic(name){

if(
!AudioManager.musicEnabled
)
return;

if(
AudioManager.currentMusic
){

AudioManager.currentMusic.pause();

AudioManager.currentMusic.currentTime=0;

}

const track =
AudioManager.tracks[name];

if(!track)
return;

track.loop = true;

track.volume = 0.5;

track.play();

AudioManager.currentMusic =
track;

}

// =========================
// PLAY SFX
// =========================

function playSFX(name){

if(
!AudioManager.sfxEnabled
)
return;

const sound =
AudioManager.sounds[name];

if(!sound)
return;

sound.currentTime = 0;

sound.play();

}