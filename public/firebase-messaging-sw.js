// public/firebase-messaging-sw.js
// Este archivo es el Service Worker para notificaciones push de Firebase

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRkOtit8t4q4PGgli0CgHQrcMS039i_8c",
  authDomain: "crm-miguel.firebaseapp.com",
  projectId: "crm-miguel",
  storageBucket: "crm-miguel.firebasestorage.app",
  messagingSenderId: "818098683659",
  appId: "1:818098683659:web:689db1bd0ffb45bbb72c0e",
  measurementId: "G-KC2CK3JL40"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Cuando el usuario toca la notificación, abrir la vista entregas
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Si ya hay una ventana abierta, enfócala y navega a /entregas?fromNotif=1
        if (client.url && 'focus' in client) {
          client.focus();
          client.navigate && client.navigate('/entregas?fromNotif=1');
          return;
        }
      }
      // Si no hay ventana, abre una nueva en /entregas?fromNotif=1
      if (self.clients.openWindow) {
        return self.clients.openWindow('/entregas?fromNotif=1');
      }
    })
  );
});
