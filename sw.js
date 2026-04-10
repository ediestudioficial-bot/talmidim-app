const CACHE_NAME = "talmidim-v21";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./pages/radar.html",
  "./pages/radar-pausa.html",
  "./pages/resultado.html",
  "./pages/pdd.html",
  "./pages/jornada.html",
  "./pages/mapa.html",
  "./pages/estacao.html",
  "./manifest.json",
  "./sw.js",
  "./css/home.css",
  "./css/mapa.css",
  "./css/radar.css",
  "./css/resultado.css",
  "./css/pdd.css",
  "./css/radar-pausa.css",
  "./css/jornada.css",
  "./css/estacao.css",
  "./js/radar.js",
  "./js/radar-chart.js",
  "./js/resultado.js",
  "./js/pdd.js",
  "./js/jornada.js",
  "./js/mapa-ui.js",
  "./js/mapa-peregrino-3d.js",
  "./js/mapa.js",
  "./js/jornada-dias.json",
  "./assets/logo.png",
  "./assets/mapa-novo.png",
  "./assets/peregrino.svg",
  "./assets/peregrino-walking.glb",
  "./assets/peregrino-running.glb",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        PRECACHE_URLS.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            return cache.put(event.request, copy).catch(function () {});
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          if (cached) {
            return cached;
          }
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
