/**
 * Service Worker for ParkSathi PWA
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Advanced caching and offline functionality
 */

const CACHE_NAME = 'parksathi-v1.0.0';
const STATIC_CACHE = 'parksathi-static-v1.0.0';
const DYNAMIC_CACHE = 'parksathi-dynamic-v1.0.0';
const API_CACHE = 'parksathi-api-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/locations',
  '/api/search',
  '/api/auth/me'
];

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.includes('/static/')) {
    event.respondWith(handleStaticAssets(request));
  } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for API calls
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('📡 Network failed for API, trying cache:', url.pathname);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical endpoints
    if (url.pathname.includes('/locations') || url.pathname.includes('/search')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'You are currently offline. Showing cached data.',
          data: []
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('📦 Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return cached version or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    return caches.match('/offline.html') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle dynamic requests with stale-while-revalidate
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Return cached response if network fails
    return cachedResponse;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Running background sync');
  
  try {
    // Sync offline bookings
    const offlineBookings = await getOfflineBookings();
    for (const booking of offlineBookings) {
      await syncBooking(booking);
    }
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have a new notification from ParkSathi',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'ParkSathi';
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('ParkSathi', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.payload)
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      clearAllCaches()
    );
  }
});

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return cache.addAll(urls);
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Offline storage helpers
async function getOfflineBookings() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline_bookings'], 'readonly');
    const store = transaction.objectStore('offline_bookings');
    return store.getAll();
  } catch (error) {
    console.error('Failed to get offline bookings:', error);
    return [];
  }
}


async function syncBooking(booking) {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking)
    });
    
    if (response.ok) {
      // Remove from offline storage
      const db = await openDB();
      const transaction = db.transaction(['offline_bookings'], 'readwrite');
      const store = transaction.objectStore('offline_bookings');
      store.delete(booking.id);
    }
  } catch (error) {
    console.error('Failed to sync booking:', error);
  }
}


// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ParkSathiDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline_bookings')) {
        db.createObjectStore('offline_bookings', { keyPath: 'id' });
      }
    };
  });
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  const start = performance.now();
  
  event.respondWith(
    handleRequest(event.request).then((response) => {
      const duration = performance.now() - start;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow request: ${event.request.url} took ${duration}ms`);
      }
      
      return response;
    })
  );
});

// Default request handler
async function handleRequest(request) {
  // Implement the main fetch logic here
  return fetch(request);
}

console.log('🚀 ParkSathi Service Worker loaded successfully');
console.log('© 2025 1Ox4Fox LLC - Conceptualized by Shreeraj Tuladhar');