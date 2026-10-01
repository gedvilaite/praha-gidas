const CACHE_NAME = "praha-gidas-v2";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/css/guide.css",
  "assets/js/app.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-512-maskable.png",
  "assets/icons/apple-touch-icon.png",
  "assets/images/page-01.webp",
  "assets/images/page-02.webp",
  "assets/images/page-03.webp",
  "assets/images/page-04.webp",
  "assets/images/page-05.webp",
  "assets/images/page-06.webp",
  "assets/images/page-07.webp",
  "assets/images/page-08.webp",
  "assets/images/page-09.webp",
  "assets/images/page-10.webp",
  "assets/images/page-11.webp",
  "assets/images/page-12.webp",
  "assets/images/page-13.webp",
  "assets/images/page-14.webp"
];

function assetUrl(path) {
  return new URL(path, self.location.href).toString();
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS.map(assetUrl));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_NAME;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        return cached;
      }
      if (request.mode === "navigate" || url.pathname.endsWith("/")) {
        return caches.match(assetUrl("index.html")).then(function (page) {
          if (page) {
            return page;
          }
          return fetch(request);
        });
      }
      return fetch(request).catch(function () {
        if (request.mode === "navigate") {
          return caches.match(assetUrl("index.html"));
        }
        return cached;
      });
    })
  );
});
