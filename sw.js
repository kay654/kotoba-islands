// Bump this version whenever shipped assets or question data change.
const VERSION = "v1";
const SCOPE = new URL(self.registration.scope);
const CACHE_PREFIX = `kotoba-islands-${encodeURIComponent(SCOPE.pathname)}-`;
const CACHE = CACHE_PREFIX + VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./src/style.css",
  "./src/app.js",
  "./src/engine.js",
  "./src/art.js",
  "./src/sound.js",
  "./data/questions.json",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/KleeOne-Regular.ttf",
  "./assets/KleeOne-SemiBold.ttf",
  "./assets/OFL-Klee.txt",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  // Let an active journey finish; activate the update on the next app launch.
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin ||
    !new URL(event.request.url).pathname.startsWith(SCOPE.pathname)
  )
    return;
  // A version-consistent shell; the next worker install downloads the whole update.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === "navigate")
          return cache.match("./index.html");
        throw error;
      }
    }),
  );
});
