// ATRIL DIGITAL - Service Worker v13.0
// Estrategia: siempre intenta traer la versión más nueva de internet.
// Si no hay internet, usa la copia guardada en el celular.
const CACHE_NAME = 'atril-v13.3';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon.png', './logo.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(ARCHIVOS.map(url => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(nombres.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Los datos de Google Sheets nunca se guardan en caché
  if (url.hostname.includes('script.google') || url.hostname.includes('googleusercontent')) return;
  // Solo se guardan los archivos propios de la app y las fuentes
  const propio = url.origin === self.location.origin;
  const fuente = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  if (!propio && !fuente) return;

  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp && (resp.ok || resp.type === 'opaque')) {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copia));
        }
        return resp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
