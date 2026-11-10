/* KWANG (by ZOOTRONIA) service worker — ให้แอปเปิดได้แม้ไม่มีเน็ต */
const CACHE = 'zootronia-v6';
const SHELL = [
  './',
  './index.html',
  './app.html',
  './css/app.css',
  './js/db.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // ข้อมูลอากาศและ font ให้วิ่งเน็ตตรง (ถ้าออฟไลน์แอปจัดการ error เอง)
  if (url.origin !== location.origin) return;
  // network-first: ได้ไฟล์ล่าสุดเสมอเมื่อออนไลน์ (สำคัญช่วงพัฒนา/แก้บ่อย)
  // ตกไปใช้ cache เมื่อออฟไลน์เท่านั้น
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./app.html')))
  );
});
