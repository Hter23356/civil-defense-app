const fallbackRegions = [
  'Київ',
  'Київська область',
  'Харківська область',
  'Дніпропетровська область',
  'Запорізька область',
  'Миколаївська область',
  'Херсонська область',
];

let shelters = [
  { name: 'Метро Хрещатик', address: 'Хрещатик, 1', city: 'Київ', region: 'Київ', lat: 50.447, lng: 30.522, capacity: null, type: 'Метро', description: 'Станція метро у центрі міста.' },
  { name: 'Метро Майдан Незалежності', address: 'Майдан Незалежності', city: 'Київ', region: 'Київ', lat: 50.45, lng: 30.524, capacity: null, type: 'Метро', description: 'Станція метро з кількома входами.' },
  { name: 'Підземний паркінг Globus', address: 'Майдан Незалежності, 1', city: 'Київ', region: 'Київ', lat: 50.449, lng: 30.524, capacity: null, type: 'Підземне', description: 'Підземний паркінг торгового центру.' },
];

let alerts = [
  { region: 'Київ', location: 'Київ', type: 'Повітряна тривога', active: true, start: new Date().toISOString(), description: 'Очікуємо актуальні дані з каналу єТривога.', url: 'https://t.me/UkraineAlarmSignal' },
];

const medical = [
  { title: 'Кровотеча', category: 'Перші хвилини', steps: ['Натисніть на рану чистою тканиною або стерильною серветкою.', 'Тримайте прямий тиск 10-15 хвилин.', 'Якщо можливо, підніміть поранену частину тіла вище рівня серця.', 'При сильній кровотечі телефонуйте 103.'] },
  { title: 'Опік', category: 'Охолодження', steps: ['Припиніть дію джерела опіку.', 'Охолоджуйте опік прохолодною проточною водою 10-20 хвилин.', 'Не наносіть масло або крем на свіжий опік.', 'При великих опіках або опіках обличчя зверніться до лікаря.'] },
  { title: 'Перелом', category: 'Фіксація', steps: ['Не переміщуйте постраждалого без потреби.', 'Зафіксуйте ушкоджену кінцівку в поточному положенні.', 'Прикладіть холод через тканину.', 'Не намагайтеся вправити кістку самостійно.'] },
  { title: 'Серцево-легенева реанімація', category: '103', steps: ['Перевірте свідомість і дихання.', 'Попросіть когось викликати 103.', 'Робіть 30 натискань на грудну клітку з темпом 100-120 на хвилину.', 'Продовжуйте до прибуття медиків або появи ознак життя.'] },
];

let updates = [
  { text: 'Останні новини Повітряних Сил завантажуються.', date: new Date().toISOString(), url: 'https://t.me/kpszsu' },
];

const state = {
  region: localStorage.getItem('civil-defense-region') || 'all',
  city: localStorage.getItem('civil-defense-city') || 'all',
  section: localStorage.getItem('civil-defense-section') || 'all',
  map: null,
  markers: [],
  userMarker: null,
  userLocation: null,
  dataLoadedAt: null,
};

const elements = {
  regionFilter: document.querySelector('#region-filter'),
  cityFilter: document.querySelector('#city-filter'),
  sectionFilter: document.querySelector('#section-filter'),
  alertsList: document.querySelector('#alerts-list'),
  sheltersList: document.querySelector('#shelters-list'),
  medicalList: document.querySelector('#medical-list'),
  updatesList: document.querySelector('#updates-list'),
  activeAlertsCount: document.querySelector('#active-alerts-count'),
  sheltersCount: document.querySelector('#shelters-count'),
  capacityCount: document.querySelector('#capacity-count'),
  headerStatus: document.querySelector('#header-status'),
  statusSubtitle: document.querySelector('#status-subtitle'),
  statusDot: document.querySelector('#status-dot'),
  lastUpdated: document.querySelector('#last-updated'),
  alertsSource: document.querySelector('#alerts-source'),
  nearestPanel: document.querySelector('#nearest-panel'),
};

function savePreferences() {
  localStorage.setItem('civil-defense-region', state.region);
  localStorage.setItem('civil-defense-city', state.city);
  localStorage.setItem('civil-defense-section', state.section);
}

function createOption(value, label) {
  const item = document.createElement('option');
  item.value = value;
  item.textContent = label;
  return item;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'uk'));
}

function formatDate(value) {
  return new Date(value).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRegions() {
  return unique([...fallbackRegions, ...alerts.map((alert) => alert.region)]);
}

function getFilteredAlerts() {
  return alerts.filter((alert) => state.region === 'all' || alert.region === state.region || alert.location === state.region);
}

function getFilteredShelters() {
  return shelters.filter((shelter) => {
    const cityMatches = state.city === 'all' || shelter.city === state.city;
    return cityMatches;
  });
}

function fillRegionFilter() {
  const current = state.region;
  elements.regionFilter.replaceChildren(createOption('all', 'Вся Україна'));
  getRegions().forEach((region) => elements.regionFilter.append(createOption(region, region)));
  elements.regionFilter.value = [...elements.regionFilter.options].some((option) => option.value === current) ? current : 'all';
  state.region = elements.regionFilter.value;
}

function fillCityFilter() {
  const current = state.city;
  elements.cityFilter.replaceChildren(createOption('all', 'Усі райони Києва'));
  unique(shelters.map((shelter) => shelter.city)).forEach((city) => elements.cityFilter.append(createOption(city, city)));
  elements.cityFilter.value = [...elements.cityFilter.options].some((option) => option.value === current) ? current : 'all';
  state.city = elements.cityFilter.value;
}

function setupControls() {
  elements.regionFilter.addEventListener('change', () => {
    state.region = elements.regionFilter.value;
    savePreferences();
    render();
  });

  elements.cityFilter.addEventListener('change', () => {
    state.city = elements.cityFilter.value;
    savePreferences();
    render();
  });

  elements.sectionFilter.value = state.section;
  elements.sectionFilter.addEventListener('change', () => {
    state.section = elements.sectionFilter.value;
    savePreferences();
    renderSections();
  });

  document.querySelector('#reset-filters').addEventListener('click', () => {
    state.region = 'all';
    state.city = 'all';
    state.section = 'all';
    savePreferences();
    render();
  });

  document.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(`#${button.dataset.jump}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelector('#locate-me').addEventListener('click', findNearestShelter);
  document.querySelector('#hero-locate').addEventListener('click', findNearestShelter);
}

function setupMap() {
  state.map = L.map('map', { scrollWheelZoom: false }).setView([50.4501, 30.5234], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(state.map);
}

function renderSummary() {
  const filteredShelters = getFilteredShelters();
  const filteredAlerts = getFilteredAlerts();
  const activeCount = filteredAlerts.filter((alert) => alert.active).length;
  const capacity = filteredShelters.reduce((sum, shelter) => sum + (Number(shelter.capacity) || 0), 0);

  elements.activeAlertsCount.textContent = activeCount;
  elements.sheltersCount.textContent = filteredShelters.length;
  elements.capacityCount.textContent = capacity ? capacity.toLocaleString('uk-UA') : 'невідомо';
  elements.headerStatus.textContent = activeCount > 0 ? `Зараз є тривоги: ${activeCount}` : 'Активних тривог не знайдено';
  elements.statusSubtitle.textContent = activeCount > 0 ? 'Перевірте локації нижче' : 'За поточним фільтром спокійно';
  elements.statusDot.className = `status-dot ${activeCount > 0 ? 'active' : 'clear'}`;
  elements.lastUpdated.textContent = state.dataLoadedAt ? formatDate(state.dataLoadedAt) : 'очікуємо';
}

function renderAlerts() {
  const filtered = getFilteredAlerts();

  if (!filtered.length) {
    elements.alertsList.innerHTML = '<article class="notice"><div><h3>Немає повідомлень за фільтром</h3><p>Змініть регіон або перевірте стрічку пізніше.</p></div><span class="badge green">ОК</span></article>';
    return;
  }

  elements.alertsList.innerHTML = filtered.map((alert) => `
    <article class="notice ${alert.active ? 'active' : ''}">
      <div>
        <h3>${alert.location || alert.region}</h3>
        <p>${alert.description}</p>
        <div class="meta">
          <span><strong>Тип:</strong> ${alert.type || alert.alert_type || 'Сповіщення'}</span>
          <span><strong>Час:</strong> ${formatDate(alert.start)}</span>
          ${alert.end ? `<span><strong>Відбій:</strong> ${formatDate(alert.end)}</span>` : ''}
          ${alert.url ? `<span><a href="${alert.url}" target="_blank" rel="noreferrer">Джерело</a></span>` : ''}
        </div>
      </div>
      <span class="badge ${alert.active ? 'red' : 'green'}">${alert.active ? 'Активна' : 'Завершена'}</span>
    </article>
  `).join('');
}

function badgeClass(type = '') {
  if (/метро/i.test(type)) return 'blue';
  if (/підзем/i.test(type)) return 'green';
  return 'amber';
}

function renderShelters() {
  const filtered = getFilteredShelters();

  if (!filtered.length) {
    elements.sheltersList.innerHTML = '<article class="shelter-card"><h3>Укриття не знайдено</h3><p>Спробуйте скинути фільтри або оновити сторінку.</p></article>';
    return;
  }

  const ordered = state.userLocation
    ? [...filtered].map((shelter) => ({ ...shelter, distance: distanceKm(state.userLocation, shelter) })).sort((a, b) => a.distance - b.distance)
    : filtered;

  elements.sheltersList.innerHTML = ordered.slice(0, 24).map((shelter) => `
    <article class="shelter-card">
      <span class="badge ${badgeClass(shelter.type)}">${shelter.type || 'Укриття'}</span>
      <h3>${shelter.name}</h3>
      <p>${shelter.description || 'Захисна споруда цивільного захисту.'}</p>
      <div class="meta">
        <span>${shelter.address || 'Адресу уточнюйте на карті'}</span>
        ${shelter.distance !== undefined ? `<span><strong>${shelter.distance.toFixed(2)} км від вас</strong></span>` : ''}
        ${shelter.capacity ? `<span>Місткість: ${shelter.capacity} осіб</span>` : ''}
      </div>
    </article>
  `).join('');
}

function renderMap() {
  const filtered = getFilteredShelters();
  state.markers.forEach((marker) => marker.remove());
  state.markers = filtered.map((shelter) => L.marker([shelter.lat, shelter.lng])
    .addTo(state.map)
    .bindPopup(`<strong>${shelter.name}</strong><br>${shelter.address || ''}<br>${shelter.type || 'Укриття'}`));

  if (filtered.length > 0) {
    const bounds = L.latLngBounds(filtered.map((shelter) => [shelter.lat, shelter.lng]));
    state.map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
  }
}

function renderMedical() {
  elements.medicalList.innerHTML = medical.map((item, index) => `
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

  elements.medicalList.querySelectorAll('.medical-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.medical-item');
      item.classList.toggle('open');
      button.setAttribute('aria-expanded', item.classList.contains('open'));
    });
  });
}

function renderUpdates() {
  elements.updatesList.innerHTML = updates.map((update) => `
    <article class="notice">
      <div>
        <h3>${formatDate(update.date)}</h3>
        <p>${update.text}</p>
        ${update.url ? `<p><a href="${update.url}" target="_blank" rel="noreferrer">Відкрити джерело</a></p>` : ''}
      </div>
      <span class="badge blue">Новини</span>
    </article>
  `).join('');
}

function renderSections() {
  elements.sectionFilter.value = state.section;
  document.querySelectorAll('[data-section]').forEach((section) => {
    section.classList.toggle('hidden', state.section !== 'all' && section.dataset.section !== state.section);
  });
}

function renderNearest(nearest) {
  elements.nearestPanel.classList.remove('hidden');
  elements.nearestPanel.innerHTML = `
    <strong>Найближче укриття: ${nearest.name}</strong>
    <p>${nearest.address || 'Адресу уточнюйте на карті'} · ${nearest.distance.toFixed(2)} км від вас</p>
  `;
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
    window.alert('Ваш браузер не підтримує геолокацію.');
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    state.userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const nearest = shelters
      .map((shelter) => ({ ...shelter, distance: distanceKm(state.userLocation, shelter) }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (!nearest) {
      window.alert('Не вдалося знайти укриття.');
      return;
    }

    if (state.userMarker) {
      state.userMarker.remove();
    }

    state.userMarker = L.circleMarker([state.userLocation.lat, state.userLocation.lng], {
      radius: 8,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.9,
    }).addTo(state.map).bindPopup('Ваша геолокація');

    state.map.setView([nearest.lat, nearest.lng], 15);
    L.popup()
      .setLatLng([nearest.lat, nearest.lng])
      .setContent(`<strong>${nearest.name}</strong><br>${nearest.address || ''}<br>${nearest.distance.toFixed(2)} км від вас`)
      .openOn(state.map);

    renderNearest(nearest);
    renderShelters();
    document.querySelector('#shelters').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    elements.alertsSource.textContent = alertsResult.value.source?.includes('UkraineAlarmSignal') ? 'єТривога' : 'Telegram';
  }

  if (newsResult.status === 'fulfilled' && Array.isArray(newsResult.value.posts) && newsResult.value.posts.length) {
    updates = newsResult.value.posts.map((post) => ({
      text: post.text,
      date: post.date,
      url: post.url,
    }));
  }

  state.dataLoadedAt = new Date().toISOString();
  fillRegionFilter();
  fillCityFilter();
  render();
}

function render() {
  fillRegionFilter();
  fillCityFilter();
  renderSummary();
  renderAlerts();
  renderShelters();
  renderMap();
  renderUpdates();
  renderSections();
}

setupControls();
setupMap();
renderMedical();
render();
loadLiveData();
