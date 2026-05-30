// Service worker: network-first when online so updates show up straight away,
// with a cached fallback so the games still work with poor/no signal.
const CACHE = "queuequest-v3";
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
  "./js/recent.js",
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
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Allow the page to tell a waiting worker to take over immediately.
self.addEventListener("message", (e) => {
  if (e.data === "skip-waiting") self.skipWaiting();
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then((res) => { clearTimeout(t); resolve(res); }, (err) => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Only manage our own files; live wait-time/proxy calls go straight to network.
  if (url.origin !== location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Network-first: newest content when online (short timeout for slow signal).
      const fresh = await fetchWithTimeout(request, 3000);
      cache.put(request, fresh.clone());
      return fresh;
    } catch (err) {
      // Offline / too slow: fall back to cache, then to the app shell.
      const cached = await cache.match(request);
      return cached || (await cache.match("./index.html")) || Response.error();
    }
  })());
});
