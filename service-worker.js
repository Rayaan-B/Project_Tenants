// Basic service worker for PWA
const CACHE_NAME = 'tenant-manager-v1';
const BASE_PATH = self.location.pathname.replace('service-worker.js', '');
const OFFLINE_URL = `${BASE_PATH}#/offline`;

// Resources to pre-cache
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}favicon.ico`,
  `${BASE_PATH}logo192.png`,
  `${BASE_PATH}logo512.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add each resource individually to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => 
              console.warn(`Failed to cache ${url}:`, err)
            )
          )
        );
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove hash from URL for caching
    urlObj.hash = '';
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL) || caches.match(`${BASE_PATH}index.html`);
        })
    );
    return;
  }

  const normalizedUrl = normalizeUrl(event.request.url);
  
  event.respondWith(
    caches.match(normalizedUrl)
      .then((response) => {
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }

            // Don't cache API responses
            if (event.request.url.includes('/api/')) {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            // Cache the new resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(normalizedUrl, responseToCache);
              })
              .catch(err => console.warn('Failed to cache response:', err));

            return response;
          })
          .catch(() => {
            // If offline and it's an API request, return a custom response
            if (event.request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ error: 'You are offline' }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            // For other resources, try to return the offline page
            return caches.match(OFFLINE_URL);
          });
      })
  );
});
