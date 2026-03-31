const CACHE_NAME = "player-ok-v1";
const OFFLINE_URL = "offline.html";

// Archivos que se guardan en cache
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  OFFLINE_URL
];

// INSTALAR
self.addEventListener("install", event => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVAR
self.addEventListener("activate", event => {
  console.log("Service Worker activado");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH (manejo de peticiones)
self.addEventListener("fetch", event => {
  const request = event.request;

  // ⚠️ No cachear streaming de audio
  if (request.url.includes(".mp3") || request.url.includes("stream")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(request).then(response => {
          return response || caches.match(OFFLINE_URL);
        });
      })
  );
});