// =========================
// 4D POCKET INVENTORY
// =========================

const playerInventory = {

dorayaki: 0,

items: [

{
id:"anywhereDoor",
name:"Anywhere Door",
uses:3,
level:1,
owned:true
},

{
id:"bambooCopter",
name:"Bamboo Copter",
uses:5,
level:1,
owned:true
},

{
id:"timeCloth",
name:"Time Cloth",
uses:2,
level:1,
owned:true
},

{
id:"bigLight",
name:"Big Light",
uses:2,
level:1,
owned:true
},

{
id:"smallLight",
name:"Small Light",
uses:2,
level:1,
owned:true
}

]

};

// =========================
// INVENTORY UI
// =========================

const inventoryContainer =
document.getElementById(
"inventoryItems"
);

function renderInventory(){

if(!inventoryContainer)
return;

inventoryContainer.innerHTML =
"";

playerInventory.items
.forEach(item=>{

if(!item.owned)
return;

const div =
document.createElement(
"div"
);

div.className = "item";

div.innerHTML =

`
<b>${item.name}</b>
<br>
Uses:
${item.uses}
<br>
Lvl:
${item.level}
`;

div.onclick = ()=>{

useGadget(
item.id
);

};

inventoryContainer
.appendChild(div);

});

}

// =========================
// FIND ITEM
// =========================

function getItem(id){

return playerInventory
.items
.find(
item =>
item.id === id
);

}

// =========================
// USE GADGET
// =========================

function useGadget(id){

const item =
getItem(id);

if(!item)
return;

if(item.uses <= 0){

showDialogue(
"Doraemon",
"No uses left!"
);

return;

}

item.uses--;

switch(id){

case
"anywhereDoor":

useAnywhereDoor();
break;

case
"bambooCopter":

useBambooCopter();
break;

case
"timeCloth":

useTimeCloth();
break;

case
"bigLight":

useBigLight();
break;

case
"smallLight":

useSmallLight();
break;

}

renderInventory();

}

// =========================
// ANYWHERE DOOR
// =========================

function useAnywhereDoor(){

player.x += 500;

showDialogue(

"Doraemon",

"Anywhere Door Activated!"

);

}

// =========================
// BAMBOO COPTER
// =========================

function useBambooCopter(){

player.vy = -20;

showDialogue(

"Doraemon",

"Bamboo Copter!"

);

}

// =========================
// TIME CLOTH
// =========================

function useTimeCloth(){

player.health += 25;

if(
player.health > 100
){

player.health = 100;

}

showDialogue(

"Doraemon",

"Time Cloth Restored Health"

);

}

// =========================
// BIG LIGHT
// =========================

function useBigLight(){

player.width = 90;

player.height = 90;

setTimeout(()=>{

player.width = 60;

player.height = 60;

},10000);

showDialogue(

"Doraemon",

"Big Light Activated"

);

}

// =========================
// SMALL LIGHT
// =========================

function useSmallLight(){

player.width = 30;

player.height = 30;

setTimeout(()=>{

player.width = 60;

player.height = 60;

},10000);

showDialogue(

"Doraemon",

"Small Light Activated"

);

}

// =========================
// DORAYAKI
// =========================

function addDorayaki(amount){

playerInventory
.dorayaki += amount;

}

// =========================
// SHOP
// =========================

const gadgetShop = [

{
id:"invisibleCape",
name:"Invisible Cape",
price:100
},

{
id:"memoryBread",
name:"Memory Bread",
price:150
},

{
id:"timeStopWatch",
name:"Time Stop Watch",
price:300
}

];

// =========================
// BUY ITEM
// =========================

function buyItem(id){

const item =
gadgetShop.find(
i => i.id === id
);

if(!item)
return;

if(

playerInventory
.dorayaki
<
item.price

){

showDialogue(

"Shop",

"Not enough Dorayaki"

);

return;

}

playerInventory
.dorayaki -=
item.price;

playerInventory
.items
.push({

id:item.id,

name:item.name,

uses:5,

level:1,

owned:true

});

showDialogue(

"Shop",

item.name +
" Purchased!"

);

renderInventory();

}

// =========================
// UPGRADES
// =========================

function upgradeItem(id){

const item =
getItem(id);

if(!item)
return;

const cost =
item.level * 50;

if(

playerInventory
.dorayaki
<
cost

){

showDialogue(

"Upgrade",

"Need More Dorayaki"

);

return;

}

playerInventory
.dorayaki -= cost;

item.level++;

item.uses += 3;

showDialogue(

"Upgrade",

item.name +
" Level " +
item.level

);

renderInventory();

}

// =========================
// CRAFTING
// =========================

const recipes = [

{

ingredients:[
"bambooCopter",
"timeCloth"
],

result:{

id:"timeCopter",

name:"Time Copter",

uses:10,

level:1,

owned:true

}

},

{

ingredients:[
"bigLight",
"smallLight"
],

result:{

id:"balanceLight",

name:"Balance Light",

uses:8,

level:1,

owned:true

}

}

];

// =========================
// CRAFT
// =========================

function craft(recipeIndex){

const recipe =
recipes[recipeIndex];

if(!recipe)
return;

let canCraft = true;

recipe.ingredients
.forEach(id=>{

const item =
getItem(id);

if(!item){

canCraft = false;

}

});

if(!canCraft){

showDialogue(

"Crafting",

"Missing Items"

);

return;

}

playerInventory
.items
.push(
recipe.result
);

showDialogue(

"Crafting",

recipe.result.name +
" Created!"

);

renderInventory();

}

// =========================
// DURABILITY RESTORE
// =========================

function restoreUses(id){

const item =
getItem(id);

if(!item)
return;

item.uses += 5;

renderInventory();

}

// =========================
// SAVE INVENTORY
// =========================

function saveInventory(){

localStorage.setItem(

"timeRiftInventory",

JSON.stringify(
playerInventory
)

);

}

// =========================
// LOAD INVENTORY
// =========================

function loadInventory(){

const save =

localStorage.getItem(
"timeRiftInventory"
);

if(!save)
return;

const data =
JSON.parse(save);

playerInventory
.dorayaki =
data.dorayaki;

playerInventory
.items =
data.items;

renderInventory();

}

// =========================
// AUTO SAVE
// =========================

setInterval(()=>{

saveInventory();

},30000);

// =========================
// INIT
// =========================

loadInventory();

renderInventory();