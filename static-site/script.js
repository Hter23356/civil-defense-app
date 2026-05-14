const regions = [
  'Київська область',
  'Харківська область',
  'Львівська область',
  'Одеська область',
  'Дніпропетровська область',
];

let shelters = [
  { name: 'Метро Хрещатик', address: 'Хрещатик, 1', city: 'Київ', region: 'Київська область', lat: 50.447, lng: 30.522, capacity: 500, type: 'Метро', description: 'Центральна станція метро у середмісті.' },
  { name: 'Метро Майдан Незалежності', address: 'Майдан Незалежності', city: 'Київ', region: 'Київська область', lat: 50.45, lng: 30.524, capacity: 600, type: 'Метро', description: 'Станція метро з кількома входами.' },
  { name: 'Підземний паркінг Globus', address: 'Майдан Незалежності, 1', city: 'Київ', region: 'Київська область', lat: 50.449, lng: 30.524, capacity: 300, type: 'Підземне', description: 'Підземний паркінг торгового центру.' },
  { name: 'Метро Університет', address: 'майдан Свободи', city: 'Харків', region: 'Харківська область', lat: 50.004, lng: 36.232, capacity: 400, type: 'Метро', description: 'Станція харківського метро.' },
  { name: 'Підвал школи №15', address: 'вул. Сумська, 45', city: 'Харків', region: 'Харківська область', lat: 50.002, lng: 36.23, capacity: 150, type: 'Будівля', description: 'Укриття у підвальному приміщенні.' },
  { name: 'Підземний перехід Площа Ринок', address: 'Площа Ринок', city: 'Львів', region: 'Львівська область', lat: 49.842, lng: 24.032, capacity: 200, type: 'Підземне', description: 'Підземний перехід у центрі міста.' },
  { name: 'Паркінг Victoria Gardens', address: 'вул. Кульпарківська, 226А', city: 'Львів', region: 'Львівська область', lat: 49.807, lng: 23.978, capacity: 250, type: 'Підземне', description: 'Підземний паркінг торгового центру.' },
  { name: 'Метро Центральна', address: 'Вокзальна площа', city: 'Дніпро', region: 'Дніпропетровська область', lat: 48.477, lng: 35.015, capacity: 500, type: 'Метро', description: 'Станція метро біля вокзалу.' },
  { name: 'Підвал адмінбудівлі', address: 'пр. Дмитра Яворницького, 1', city: 'Дніпро', region: 'Дніпропетровська область', lat: 48.459, lng: 35.039, capacity: 100, type: 'Будівля', description: 'Укриття в адміністративній будівлі.' },
  { name: 'Підземний паркінг Arkadia', address: 'вул. Генуезька, 24Д', city: 'Одеса', region: 'Одеська область', lat: 46.444, lng: 30.755, capacity: 350, type: 'Підземне', description: 'Підземний паркінг торгового центру.' },
];

let alerts = [
  { region: 'Київська область', type: 'Повітряна тривога', active: true, start: '2026-05-14T09:15:00.000Z', description: 'Повітряна тривога. Пройдіть до найближчого укриття.' },
  { region: 'Харківська область', type: 'БПЛА', active: true, start: '2026-05-14T08:40:00.000Z', description: 'Зафіксовано активність БПЛА. Залишайтеся в укритті.' },
  { region: 'Львівська область', type: 'Відбій', active: false, start: '2026-05-13T21:10:00.000Z', end: '2026-05-13T21:45:00.000Z', description: 'Тривогу завершено.' },
];

const medical = [
  { title: 'Зупинка кровотечі', category: 'Кровотеча', steps: ['Натисніть на рану чистою тканиною або стерильною серветкою.', 'Тримайте прямий тиск 10-15 хвилин.', 'Підніміть поранену частину тіла вище рівня серця, якщо це можливо.', 'При сильній кровотечі викличте швидку допомогу за номером 103.'] },
  { title: 'Перша допомога при переломах', category: 'Перелом', steps: ['Не переміщуйте постраждалого без потреби.', 'Зафіксуйте ушкоджену кінцівку в тому положенні, у якому вона є.', 'Прикладіть холод через тканину.', 'Не намагайтеся вправити кістку самостійно.'] },
  { title: 'Допомога при опіках', category: 'Опік', steps: ['Припиніть дію джерела опіку.', 'Охолоджуйте опік прохолодною проточною водою 10-20 хвилин.', 'Не наносіть масло, крем або мазь на свіжий опік.', 'При великих опіках негайно зверніться до лікаря.'] },
  { title: 'Серцево-легенева реанімація', category: 'СЛР', steps: ['Перевірте свідомість і дихання.', 'Попросіть когось викликати 103.', 'Робіть 30 натискань на грудну клітку з темпом 100-120 на хвилину.', 'Продовжуйте до прибуття медиків або появи ознак життя.'] },
];

let updates = [
  { text: 'У демо-сайті доступна карта укриттів, тривоги, інструкції першої допомоги та оновлення.', date: '2026-05-14T09:00:00.000Z' },
  { text: 'Ця версія не потребує сервера, бази даних або платного web service.', date: '2026-05-14T08:30:00.000Z' },
];

const state = {
  region: localStorage.getItem('civil-defense-region') || 'all',
  city: localStorage.getItem('civil-defense-city') || 'all',
  section: localStorage.getItem('civil-defense-section') || 'all',
  map: null,
  markers: [],
  userMarker: null,
};

const regionFilter = document.querySelector('#region-filter');
const cityFilter = document.querySelector('#city-filter');
const sectionFilter = document.querySelector('#section-filter');

function savePreferences() {
  localStorage.setItem('civil-defense-region', state.region);
  localStorage.setItem('civil-defense-city', state.city);
  localStorage.setItem('civil-defense-section', state.section);
}

function option(value, label) {
  const item = document.createElement('option');
  item.value = value;
  item.textContent = label;
  return item;
}

function setupFilters() {
  regionFilter.append(option('all', 'Всі регіони'));
  regions.forEach((region) => regionFilter.append(option(region, region)));
  cityFilter.append(option('all', 'Всі міста'));

  regionFilter.addEventListener('change', () => {
    state.region = regionFilter.value;
    state.city = 'all';
    savePreferences();
    render();
  });

  cityFilter.addEventListener('change', () => {
    state.city = cityFilter.value;
    savePreferences();
    render();
  });

  sectionFilter.addEventListener('change', () => {
    state.section = sectionFilter.value;
    savePreferences();
    renderSections();
  });

  document.querySelector('#reset-filters').addEventListener('click', () => {
    state.region = 'all';
    state.city = 'all';
    state.section = 'all';
    regionFilter.value = 'all';
    sectionFilter.value = 'all';
    savePreferences();
    render();
  });

  const locateButton = document.querySelector('#locate-me');
  if (locateButton) {
    locateButton.addEventListener('click', findNearestShelter);
  }
}

function getFilteredShelters() {
  return shelters.filter((shelter) => {
    const regionMatches = state.region === 'all' || shelter.region === state.region;
    const cityMatches = state.city === 'all' || shelter.city === state.city;
    return regionMatches && cityMatches;
  });
}

function getFilteredAlerts() {
  return alerts.filter((alert) => state.region === 'all' || alert.region === state.region);
}

function renderCityOptions() {
  const source = state.region === 'all' ? shelters : shelters.filter((shelter) => shelter.region === state.region);
  const cities = [...new Set(source.map((shelter) => shelter.city))];
  cityFilter.replaceChildren(option('all', 'Всі міста'));
  cities.forEach((city) => cityFilter.append(option(city, city)));
  cityFilter.value = state.city;
}

function renderSummary() {
  const filteredShelters = getFilteredShelters();
  const filteredAlerts = getFilteredAlerts();
  const activeCount = filteredAlerts.filter((alert) => alert.active).length;
  const capacity = filteredShelters.reduce((sum, shelter) => sum + shelter.capacity, 0);

  document.querySelector('#active-alerts-count').textContent = activeCount;
  document.querySelector('#shelters-count').textContent = filteredShelters.length;
  document.querySelector('#capacity-count').textContent = capacity.toLocaleString('uk-UA');
  document.querySelector('#header-status').textContent = `${activeCount} активні тривоги`;
}

function renderAlerts() {
  const list = document.querySelector('#alerts-list');
  const filtered = getFilteredAlerts();
  list.innerHTML = filtered.map((alert) => `
    <article class="notice ${alert.active ? 'active' : ''}">
      <div>
        <h3>${alert.location || alert.region}</h3>
        <p>${alert.description}</p>
        <div class="meta">
          <span><strong>Тип:</strong> ${alert.type || alert.alert_type}</span>
          <span><strong>Початок:</strong> ${new Date(alert.start).toLocaleString('uk-UA')}</span>
          ${alert.end ? `<span><strong>Завершення:</strong> ${new Date(alert.end).toLocaleString('uk-UA')}</span>` : ''}
          ${alert.url ? `<span><a href="${alert.url}" target="_blank" rel="noreferrer">Джерело</a></span>` : ''}
        </div>
      </div>
      <span class="badge ${alert.active ? 'red' : 'green'}">${alert.active ? 'Активна' : 'Завершена'}</span>
    </article>
  `).join('');
}

function renderShelters() {
  const filtered = getFilteredShelters();
  const list = document.querySelector('#shelters-list');
  list.innerHTML = filtered.map((shelter) => `
    <article class="shelter-card">
      <span class="badge ${shelter.type === 'Метро' ? 'blue' : shelter.type === 'Будівля' ? 'amber' : 'green'}">${shelter.type}</span>
      <h3>${shelter.name}</h3>
      <p>${shelter.description}</p>
      <div class="meta">
        <span>${shelter.address}, ${shelter.city}</span>
        <span>${shelter.region}</span>
        <span>Місткість: ${shelter.capacity} осіб</span>
      </div>
    </article>
  `).join('');
}

function setupMap() {
  state.map = L.map('map', { scrollWheelZoom: false }).setView([49.0, 31.0], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(state.map);
}

function renderMap() {
  const filtered = getFilteredShelters();
  state.markers.forEach((marker) => marker.remove());
  state.markers = filtered.map((shelter) => {
    return L.marker([shelter.lat, shelter.lng])
      .addTo(state.map)
      .bindPopup(`<strong>${shelter.name}</strong><br>${shelter.address}<br>Місткість: ${shelter.capacity} осіб`);
  });

  if (filtered.length > 0) {
    const bounds = L.latLngBounds(filtered.map((shelter) => [shelter.lat, shelter.lng]));
    state.map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }
}

function renderMedical() {
  const list = document.querySelector('#medical-list');
  list.innerHTML = medical.map((item, index) => `
    <article class="medical-item ${index === 0 ? 'open' : ''}">
      <button type="button" aria-expanded="${index === 0 ? 'true' : 'false'}">
        <span>${item.title}</span>
        <span class="badge green">${item.category}</span>
      </button>
      <ol class="medical-steps">
        ${item.steps.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </article>
  `).join('');

  list.querySelectorAll('.medical-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.medical-item');
      item.classList.toggle('open');
      button.setAttribute('aria-expanded', item.classList.contains('open'));
    });
  });
}

function renderUpdates() {
  const list = document.querySelector('#updates-list');
  list.innerHTML = updates.map((update) => `
    <article class="notice">
      <div>
        <h3>${new Date(update.date).toLocaleString('uk-UA')}</h3>
        <p>${update.text}</p>
        ${update.url ? `<p><a href="${update.url}" target="_blank" rel="noreferrer">Відкрити джерело</a></p>` : ''}
      </div>
      <span class="badge blue">Оновлення</span>
    </article>
  `).join('');
}

function renderSections() {
  document.querySelectorAll('[data-section]').forEach((section) => {
    section.classList.toggle('hidden', state.section !== 'all' && section.dataset.section !== state.section);
  });
}

function distanceKm(a, b) {
  const earthRadius = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function findNearestShelter() {
  if (!navigator.geolocation) {
    window.alert('Геолокація не підтримується цим браузером.');
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const user = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    const nearest = shelters
      .map((shelter) => ({ ...shelter, distance: distanceKm(user, shelter) }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (!nearest) {
      window.alert('Не вдалося знайти укриття.');
      return;
    }

    if (state.userMarker) {
      state.userMarker.remove();
    }

    state.userMarker = L.circleMarker([user.lat, user.lng], {
      radius: 8,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.85,
    }).addTo(state.map).bindPopup('Ваша геолокація');

    state.map.setView([nearest.lat, nearest.lng], 15);
    L.popup()
      .setLatLng([nearest.lat, nearest.lng])
      .setContent(`<strong>Найближче укриття</strong><br>${nearest.name}<br>${nearest.address}<br>${nearest.distance.toFixed(2)} км`)
      .openOn(state.map);
  }, () => {
    window.alert('Дозвольте доступ до геолокації, щоб знайти найближче укриття.');
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

async function loadLiveData() {
  const [sheltersResult, alertsResult, newsResult] = await Promise.allSettled([
    fetchJson('/api/shelters'),
    fetchJson('/api/alerts'),
    fetchJson('/api/news'),
  ]);

  if (sheltersResult.status === 'fulfilled' && Array.isArray(sheltersResult.value.shelters)) {
    shelters = sheltersResult.value.shelters;
  }

  if (alertsResult.status === 'fulfilled' && Array.isArray(alertsResult.value.alerts)) {
    alerts = alertsResult.value.alerts;
  }

  if (newsResult.status === 'fulfilled' && Array.isArray(newsResult.value.posts) && newsResult.value.posts.length) {
    updates = newsResult.value.posts.map((post) => ({
      text: post.text,
      date: post.date,
      url: post.url,
    }));
    renderUpdates();
  }

  render();
}

function render() {
  regionFilter.value = state.region;
  renderCityOptions();
  renderSummary();
  renderAlerts();
  renderShelters();
  renderMap();
  renderSections();
}

setupFilters();
setupMap();
renderMedical();
renderUpdates();
render();
loadLiveData();
