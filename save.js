// =========================
// SAVE SYSTEM
// =========================

const SAVE_PREFIX =
"timeRiftSlot_";

let currentSaveSlot = 1;

// =========================
// PLAYTIME
// =========================

let playTimeSeconds = 0;

setInterval(()=>{

if(gameStarted){

playTimeSeconds++;

}

},1000);

// =========================
// STORY JOURNAL
// =========================

const storyJournal = [

"Time Machine Crash"

];

// =========================
// ADD JOURNAL ENTRY
// =========================

function addJournalEntry(text){

if(
storyJournal.includes(text)
)
return;

storyJournal.push(text);

saveCurrentSlot();

}

// =========================
// ACHIEVEMENTS
// =========================

const playerAchievements = {

firstDorayaki:false,

dinoSlayer:false,

robotHunter:false,

samuraiMaster:false,

alienExplorer:false,

bossHunter:false,

timeTraveler:false,

allGadgets:false,

trueEnding:false

};

// =========================
// UNLOCK ACHIEVEMENT
// =========================

function unlockAchievement(id){

if(
playerAchievements[id]
)
return;

playerAchievements[id] =
true;

showDialogue(

"Achievement",

id + " Unlocked!"

);

saveCurrentSlot();

}

// =========================
// PLAYER STATS
// =========================

const playerStats = {

enemiesDefeated:0,

bossesDefeated:0,

dorayakiCollected:0,

gadgetsUsed:0,

distanceTravelled:0,

worldsVisited:[]

};

// =========================
// RECORD WORLD VISIT
// =========================

function recordWorldVisit(name){

if(

playerStats
.worldsVisited
.includes(name)

)
return;

playerStats
.worldsVisited
.push(name);

}

// =========================
// QUEST PROGRESS
// =========================

const questProgress = {

mainQuest:

"Collect Time Machine Parts",

partsCollected:0,

dinosaurComplete:false,

futureComplete:false,

samuraiComplete:false,

spaceComplete:false

};

// =========================
// CHARACTER PROGRESS
// =========================

const characterProgress = {

Doraemon:{
level:1,
xp:0
},

Nobita:{
level:1,
xp:0
},

Shizuka:{
level:1,
xp:0
},

Gian:{
level:1,
xp:0
},

Suneo:{
level:1,
xp:0
}

};

// =========================
// XP
// =========================

function addXP(
character,
amount
){

characterProgress
[character]
.xp += amount;

const data =
characterProgress
[character];

if(
data.xp >= 100
){

data.level++;

data.xp = 0;

showDialogue(

"Level Up",

character +
" Lv." +
data.level

);

}

}

// =========================
// ENDINGS
// =========================

const endings = {

normal:false,

hero:false,

collector:false,

trueEnding:false

};

// =========================
// SAVE OBJECT
// =========================

function buildSaveData(){

return {

score,

playTimeSeconds,

playerHealth:
player.health,

playerX:
player.x,

currentCharacter,

inventory:
playerInventory,

achievements:
playerAchievements,

journal:
storyJournal,

stats:
playerStats,

quests:
questProgress,

characters:
characterProgress,

endings

};

}

// =========================
// SAVE SLOT
// =========================

function saveSlot(slot){

localStorage.setItem(

SAVE_PREFIX + slot,

JSON.stringify(
buildSaveData()
)

);

showDialogue(

"Save",

"Saved Slot " +
slot

);

}

// =========================
// LOAD SLOT
// =========================

function loadSlot(slot){

const save =

localStorage.getItem(
SAVE_PREFIX + slot
);

if(!save)
return false;

const data =
JSON.parse(save);

// SCORE

score =
data.score || 0;

// PLAYER

player.health =
data.playerHealth || 100;

player.x =
data.playerX || 200;

// CHARACTER

currentCharacter =
data.currentCharacter ||
"Doraemon";

// PLAYTIME

playTimeSeconds =
data.playTimeSeconds || 0;

// INVENTORY

if(data.inventory){

playerInventory
.dorayaki =
data.inventory
.dorayaki;

playerInventory
.items =
data.inventory
.items;

}

// ACHIEVEMENTS

Object.assign(

playerAchievements,

data.achievements

);

// JOURNAL

storyJournal.length = 0;

data.journal
.forEach(entry=>{

storyJournal.push(
entry
);

});

// STATS

Object.assign(
playerStats,
data.stats
);

// QUESTS

Object.assign(
questProgress,
data.quests
);

// CHARACTERS

Object.assign(

characterProgress,

data.characters

);

// ENDINGS

Object.assign(
endings,
data.endings
);

currentSaveSlot =
slot;

renderInventory();

return true;

}

// =========================
// QUICK SAVE
// =========================

function saveCurrentSlot(){

saveSlot(
currentSaveSlot
);

}

// =========================
// QUICK LOAD
// =========================

function loadCurrentSlot(){

loadSlot(
currentSaveSlot
);

}

// =========================
// AUTO SAVE
// =========================

setInterval(()=>{

if(gameStarted){

saveCurrentSlot();

}

},30000);

// =========================
// SAVE SLOT SELECT
// =========================

function selectSaveSlot(
slot
){

currentSaveSlot =
slot;

}

// =========================
// STAT TRACKERS
// =========================

function addEnemyKill(){

playerStats
.enemiesDefeated++;

if(

playerStats
.enemiesDefeated >= 50

){

unlockAchievement(
"bossHunter"
);

}

}

function addBossKill(){

playerStats
.bossesDefeated++;

}

function addDistance(
amount
){

playerStats
.distanceTravelled +=
amount;

}

function addDorayakiStat(){

playerStats
.dorayakiCollected++;

if(

playerStats
.dorayakiCollected >= 100

){

unlockAchievement(
"firstDorayaki"
);

}

}

// =========================
// PART COLLECTION
// =========================

function collectTimePart(){

questProgress
.partsCollected++;

if(

questProgress
.partsCollected >= 4

){

unlockAchievement(
"timeTraveler"
);

}

}

// =========================
// ENDING UNLOCKS
// =========================

function unlockEnding(
name
){

if(
!endings[name]
){

endings[name] =
true;

showDialogue(

"Ending",

name +
" Unlocked"

);

}

}

// =========================
// TRUE ENDING CHECK
// =========================

function checkTrueEnding(){

if(

questProgress
.partsCollected >= 4 &&

playerStats
.bossesDefeated >= 4

){

unlockEnding(
"trueEnding"
);

unlockAchievement(
"trueEnding"
);

}

}

// =========================
// EXPORT SAVE
// =========================

function exportSave(){

const data =

JSON.stringify(
buildSaveData()
);

return data;

}

// =========================
// IMPORT SAVE
// =========================

function importSave(
json
){

try{

const data =
JSON.parse(json);

localStorage.setItem(

SAVE_PREFIX +
currentSaveSlot,

JSON.stringify(data)

);

loadCurrentSlot();

}catch(e){

console.log(
"Invalid Save"
);

}

}

// =========================
// FIRST LOAD
// =========================

loadCurrentSlot();