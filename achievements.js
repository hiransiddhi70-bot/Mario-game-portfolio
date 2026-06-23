// =========================
// ACHIEVEMENTS UI
// =========================

function refreshAchievements(){

const list =
document.getElementById(
"achievementList"
);

if(!list)
return;

list.innerHTML = "";

Object.keys(
playerAchievements
)

.forEach(key=>{

const item =
document.createElement(
"div"
);

item.className =
"achievement";

item.innerHTML =

playerAchievements[key]

? "✅ " + key

: "🔒 " + key;

list.appendChild(
item
);

});

}

// =========================
// SHOW POPUP
// =========================

function showAchievementPopup(
name
){

const popup =
document.createElement(
"div"
);

popup.style.position =
"fixed";

popup.style.top =
"20px";

popup.style.right =
"20px";

popup.style.padding =
"15px";

popup.style.background =
"gold";

popup.style.color =
"black";

popup.style.zIndex =
9999;

popup.innerText =

"Achievement: " +
name;

document.body
.appendChild(
popup
);

setTimeout(()=>{

popup.remove();

},3000);

}