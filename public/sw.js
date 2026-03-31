const CACHE_NAME = 'figma-flow-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

const API_CACHE_NAME = 'figma-flow-api-v1';
const API_CACHE_DURATION = 5 * 60 * 1000;

const IMAGE_CACHE_NAME = 'figma-flow-images-v1';
const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const MAX_IMAGE_CACHE_SIZE = 100;

const EXTERNAL_IMAGE_DOMAINS = [
  'unsplash.com',
  'images.unsplash.com',
  'pexels.com',
  'picsum.photos',
  'via.placeholder.com',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name !== CACHE_NAME && 
            name !== API_CACHE_NAME &&
            name !== IMAGE_CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

function isExternalImage(url) {
  return EXTERNAL_IMAGE_DOMAINS.some(domain => url.hostname.includes(domain));
}

async function trimImageCache() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const keys = await cache.keys();
  
  if (keys.length > MAX_IMAGE_CACHE_SIZE) {
    const deleteCount = keys.length - MAX_IMAGE_CACHE_SIZE;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(cacheFirstWithExpiry(request, API_CACHE_NAME, API_CACHE_DURATION));
    return;
  }

  if (isExternalImage(url) || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithExpiry(request, IMAGE_CACHE_NAME, IMAGE_CACHE_DURATION, true));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirstWithExpiry(request, cacheName, maxAge, isImage = false) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('sw-cached-time');
    if (cachedTime) {
      const age = Date.now() - parseInt(cachedTime, 10);
      if (age < maxAge) {
        return cachedResponse;
      }
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      let body = await responseClone.blob();
      
      if (isImage && networkResponse.headers.get('content-type')?.includes('image')) {
        body = await optimizeImage(body);
      }
      
      const modifiedResponse = new Response(body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers,
      });
      
      cache.put(request, modifiedResponse);
      
      if (isImage) {
        trimImageCache();
      }
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function optimizeImage(blob) {
  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return blob;
    
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    
    const webpBlob = await canvas.convertToBlob({ 
      type: 'image/webp', 
      quality: 0.8 
    });
    
    if (webpBlob.size < blob.size) {
      return webpBlob;
    }
    
    const jpegBlob = await canvas.convertToBlob({ 
      type: 'image/jpeg', 
      quality: 0.8 
    });
    
    if (jpegBlob.size < blob.size) {
      return jpegBlob;
    }
    
    return blob;
  } catch (error) {
    return blob;
  }
}

async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.mode === 'navigate') {
      return cache.match('/');
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  return cachedResponse || fetchPromise;
}

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
