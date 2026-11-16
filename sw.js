// Offline cache for ISP Abnahmeprüfung.
// Bump VERSION whenever any file changes so devices pick up the update.
const VERSION = "v1";
const CACHE = "isp-abnahme-" + VERSION;
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./xlsx.full.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("isp-abnahme-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first: the app opens instantly and works without network.
// Updates arrive through a new VERSION (new sw.js), which re-downloads everything.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
