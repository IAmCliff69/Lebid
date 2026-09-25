const CACHE = 'lebid-v1'
const ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})

// Check tasks and fire notifications
function checkUpcomingTasks() {
  const data = null
  try {
    // We'll message the client to get tasks
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'CHECK_TASKS' }))
    })
  } catch (e) {}
}

self.addEventListener('message', e => {
  if (e.data?.type === 'NOTIFY') {
    const { title, body } = e.data
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: title,
      renotify: false,
    })
  }
})