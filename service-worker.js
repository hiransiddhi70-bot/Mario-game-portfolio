const CACHE_NAME =
"timerift-v1";

const urlsToCache = [

"/",

"/index.html",

"/style.css",
"/main.js",
"/world.js",
"/inventory.js",
"/enemies.js",
"/save.js",
"/audio.js",
"/weather.js",
"/achievements.js",

];

self.addEventListener(

"install",

event=>{

event.waitUntil(

caches.open(
CACHE_NAME
)

.then(cache=>{

return cache.addAll(
urlsToCache
);

})

);

}

);

self.addEventListener(

"fetch",

event=>{

event.respondWith(

caches.match(
event.request
)

.then(response=>{

return response ||
fetch(
event.request
);

})

);

}

);