// sw.js - Service Worker para ATRIL DIGITAL v8.0
const CACHE_NAME = 'atril-digital-cache-v8.41';
const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
  'https://github.com/pandemiaproducciones/atril-app/blob/main/logo.png?raw=true'
];

// Instalación: Guarda los archivos esenciales en la caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache v8.0 abierta con éxito');
        return cache.addAll(assets);
      })
  );
});

// Activación: Limpia versiones antiguas de caché
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Estrategia: Network First (Prioriza internet para datos frescos, si falla usa caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
