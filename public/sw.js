const CACHE = 'concept-card-workshop-v5';
const SHELL = ['/', '/index.html', '/tabletop.webp', '/favicon.svg', '/privacy/', '/terms/', '/legal.css'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(async cache => {
  await cache.addAll(SHELL);
  const html = await (await fetch('/index.html', { cache: 'no-store' })).text();
  const assets = [...html.matchAll(/(?:src|href)="([^\"]+)"/g)]
    .map(match => match[1])
    .filter(path => path.startsWith('/assets/'));
  await cache.addAll(assets);
}).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match('/', { ignoreVary: true }))));
});
