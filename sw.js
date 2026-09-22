const CACHE_NAME = "buzz-pwa-v27";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css?v=27",
  "./app.js?v=27",
  "./manifest.json",
  "./icon.svg"
];

// Install: Cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for fresh updates with cache fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignore non-http/https schemes (e.g. chrome-extension, moz-extension, data)
  if (!url.protocol.startsWith("http")) return;

  // Only intercept and cache same-origin local application resources
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
