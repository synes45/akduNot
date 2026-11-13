const CACHE = 'akdutip-v4';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/icon-192.png', '/icon-180.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce ağ, olmazsa önbellek: güncellemeler hemen gelir, çevrimdışı da çalışır.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('/') : undefined)))
  );
});
