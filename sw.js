// Offline-first service worker so the games keep working with bad signal.
const CACHE = "queuequest-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./js/main.js",
  "./js/state.js",
  "./js/audio.js",
  "./js/ui.js",
  "./js/rewards.js",
  "./js/data/trivia.js",
  "./js/data/emoji.js",
  "./js/data/scavenger.js",
  "./js/data/wyr.js",
  "./js/data/stickers.js",
  "./js/data/parks.js",
  "./js/screens/home.js",
  "./js/screens/trivia.js",
  "./js/screens/emoji.js",
  "./js/screens/scavenger.js",
  "./js/screens/wyr.js",
  "./js/screens/spinner.js",
  "./js/screens/stickers.js",
  "./js/screens/waittimes.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Only handle our own files. Let live wait-time calls hit the network.
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
