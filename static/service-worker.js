self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('vert-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/lettermark.jpg',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});