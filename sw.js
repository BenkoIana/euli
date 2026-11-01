// Euli offline: App-Dateien zwischenspeichern, neue Version im Hintergrund holen
const CACHE = 'euli-c33f7cde98';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);  // nur App-Dateien und Schriften zwischenspeichern, nie den Spielstand-Abgleich
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  // Seite selbst: zuerst aus dem Internet (immer neueste Version), ohne Internet aus dem Zwischenspeicher
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then(c => fetch(e.request, { cache: 'no-store' }).then(r => { if (r.ok) c.put('./', r.clone()); return r; })
      .catch(() => c.match('./').then(h => h || c.match('index.html')))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
