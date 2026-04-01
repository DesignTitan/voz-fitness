// VOZ FITNESS Service Worker — Push Notifications
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Meal messages keyed by type
const MEALS = {
  breakfast:   { title: 'Meal 1 — Breakfast', body: 'Cream of rice + protein + peanut butter', tag: 'meal-1' },
  lunch:       { title: 'Meal 2 — Lunch',     body: 'Turkey/chicken + rice + veggies',        tag: 'meal-2' },
  preworkout:  { title: 'Pre-Workout Fuel',    body: 'Rice cakes + PB + honey',               tag: 'pre' },
  postworkout: { title: 'Post-Workout',        body: 'Protein shake + rice cake',              tag: 'post' },
  dinner:      { title: 'Meal 3 — Dinner',     body: 'Fish/chicken + rice + greens',           tag: 'meal-3' },
  evening:     { title: 'Meal 4 — Evening',    body: 'Yogurt + protein + berries',             tag: 'meal-4' },
};

self.addEventListener('push', event => {
  let data = { title: 'VOZ FITNESS', body: 'Time to eat!', tag: 'meal' };

  if (event.data) {
    try {
      const json = event.data.json();
      if (json.meal && MEALS[json.meal]) data = MEALS[json.meal];
      else if (json.title) data = json;
    } catch (_) {
      const text = event.data.text();
      // Try to match a meal key
      const key = Object.keys(MEALS).find(k => text.includes(k));
      if (key) data = MEALS[key];
    }
  }

  // Determine which meal is next based on current hour (fallback)
  if (data.tag === 'meal') {
    const h = new Date().getHours();
    if (h < 8)       data = MEALS.breakfast;
    else if (h < 13) data = MEALS.lunch;
    else if (h < 16) data = MEALS.preworkout;
    else if (h < 19) data = MEALS.postworkout;
    else if (h < 21) data = MEALS.dinner;
    else              data = MEALS.evening;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODAgMTgwIj48cmVjdCB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzExMSIvPjx0ZXh0IHg9IjkwIiB5PSI5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSI1MiIgZmlsbD0iI2ZmZiIgbGV0dGVyLXNwYWNpbmc9IjYiPlZPWjwvdGV4dD48L3N2Zz4=',
      badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxODAgMTgwIj48cmVjdCB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzExMSIvPjx0ZXh0IHg9IjkwIiB5PSI5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSI1MiIgZmlsbD0iI2ZmZiIgbGV0dGVyLXNwYWNpbmc9IjYiPlZPWjwvdGV4dD48L3N2Zz4=',
      renotify: true,
      requireInteraction: false,
    })
  );
});

// Open app when notification is tapped
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/voz-fitness/');
    })
  );
});
