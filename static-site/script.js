const fallbackRegions = [
  'Київ',
  'Київська область',
  'Харківська область',
  'Дніпропетровська область',
  'Запорізька область',
  'Миколаївська область',
  'Херсонська область',
];

const regionAliases = new Map([
  ['Київ', 'Київ'],
  ['м. Київ', 'Київ'],
  ['Київська', 'Київська область'],
  ['Київська обл', 'Київська область'],
  ['Київська область', 'Київська область'],
  ['Вінницька', 'Вінницька область'],
  ['Вінницька область', 'Вінницька область'],
  ['Волинська', 'Волинська область'],
  ['Волинська область', 'Волинська область'],
  ['Дніпропетровська', 'Дніпропетровська область'],
  ['Дніпропетровська область', 'Дніпропетровська область'],
  ['Донецька', 'Донецька область'],
  ['Донецька область', 'Донецька область'],
  ['Житомирська', 'Житомирська область'],
  ['Житомирська область', 'Житомирська область'],
  ['Закарпатська', 'Закарпатська область'],
  ['Закарпатська область', 'Закарпатська область'],
  ['Запорізька', 'Запорізька область'],
  ['Запорізька область', 'Запорізька область'],
  ['Івано-Франківська', 'Івано-Франківська область'],
  ['Івано-Франківська область', 'Івано-Франківська область'],
  ['Кіровоградська', 'Кіровоградська область'],
  ['Кіровоградська область', 'Кіровоградська область'],
  ['Луганська', 'Луганська область'],
  ['Луганська область', 'Луганська область'],
  ['Львівська', 'Львівська область'],
  ['Львівська область', 'Львівська область'],
  ['Миколаївська', 'Миколаївська область'],
  ['Миколаївська область', 'Миколаївська область'],
  ['Одеська', 'Одеська область'],
  ['Одеська область', 'Одеська область'],
  ['Полтавська', 'Полтавська область'],
  ['Полтавська область', 'Полтавська область'],
  ['Рівненська', 'Рівненська область'],
  ['Рівненська область', 'Рівненська область'],
  ['Сумська', 'Сумська область'],
  ['Сумська область', 'Сумська область'],
  ['Тернопільська', 'Тернопільська область'],
  ['Тернопільська область', 'Тернопільська область'],
  ['Харківська', 'Харківська область'],
  ['Харківська область', 'Харківська область'],
  ['Херсонська', 'Херсонська область'],
  ['Херсонська область', 'Херсонська область'],
  ['Хмельницька', 'Хмельницька область'],
  ['Хмельницька область', 'Хмельницька область'],
  ['Черкаська', 'Черкаська область'],
  ['Черкаська область', 'Черкаська область'],
  ['Чернівецька', 'Чернівецька область'],
  ['Чернівецька область', 'Чернівецька область'],
  ['Чернігівська', 'Чернігівська область'],
  ['Чернігівська область', 'Чернігівська область'],
  ['Автономна Республіка Крим', 'Автономна Республіка Крим'],
]);

let regionsGeoJson = null;

let shelters = [
  { name: 'Метро Хрещатик', address: 'Хрещатик, 1', city: 'Київ', region: 'Київ', lat: 50.447, lng: 30.522, capacity: null, type: 'Метро', description: 'Станція метро у центрі міста.' },
  { name: 'Метро Майдан Незалежності', address: 'Майдан Незалежності', city: 'Київ', region: 'Київ', lat: 50.45, lng: 30.524, capacity: null, type: 'Метро', description: 'Станція метро з кількома входами.' },
  { name: 'Підземний паркінг Globus', address: 'Майдан Незалежності, 1', city: 'Київ', region: 'Київ', lat: 50.449, lng: 30.524, capacity: null, type: 'Підземне', description: 'Підземний паркінг торгового центру.' },
];

let alerts = [
  { region: 'Київ', location: 'Київ', type: 'Оновлення', active: false, start: new Date().toISOString(), description: 'Завантажуємо актуальні сповіщення з каналу єТривога.', url: 'https://t.me/UkraineAlarmSignal' },
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

const REALTIME_REFRESH_INTERVAL_MS = 30000;

const state = {
  region: localStorage.getItem('civil-defense-region') || 'all',
  city: localStorage.getItem('civil-defense-city') || 'all',
  section: localStorage.getItem('civil-defense-section') || 'all',
  map: null,
  alertMap: null,
  alertRegionLayer: null,
  shelterLayer: null,
  shelterRenderer: null,
  mapViewKey: '',
  mapRenderToken: 0,
  markers: [],
  userMarker: null,
  userLocation: null,
  userRegion: localStorage.getItem('civil-defense-user-region') || '',
  dataLoadedAt: null,
  isRefreshing: false,
  refreshTimer: null,
};

const elements = {
  regionFilter: document.querySelector('#region-filter'),
  cityFilter: document.querySelector('#city-filter'),
  sectionFilter: document.querySelector('#section-filter'),
  alertsList: document.querySelector('#alerts-list'),
  alertMapSummary: document.querySelector('#alert-map-summary'),
  checkMyRegion: document.querySelector('#check-my-region'),
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
  alertModal: document.querySelector('#alert-modal'),
  closeAlertModal: document.querySelector('#close-alert-modal'),
  modalLocate: document.querySelector('#modal-locate'),
  modalShowAlerts: document.querySelector('#modal-show-alerts'),
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

function normalizeRegionName(value = '') {
  const cleaned = String(value)
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\bобл\.?\b/gi, 'область')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return '';
  }

  if (regionAliases.has(cleaned)) {
    return regionAliases.get(cleaned);
  }

  const withoutRegionWord = cleaned.replace(/\s+область$/i, '').trim();
  if (regionAliases.has(withoutRegionWord)) {
    return regionAliases.get(withoutRegionWord);
  }

  return cleaned;
}

function getActiveRegionSet() {
  return new Set(alerts
    .filter((alert) => alert.active)
    .map((alert) => normalizeRegionName(alert.region || alert.location))
    .filter(Boolean));
}

function getRegions() {
  return unique([...fallbackRegions, ...alerts.map((alert) => normalizeRegionName(alert.region))]);
}

function getFilteredAlerts() {
  return alerts.filter((alert) => {
    const region = normalizeRegionName(alert.region || alert.location);
    return state.region === 'all' || region === state.region || alert.location === state.region;
  });
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
  elements.checkMyRegion.addEventListener('click', checkUserRegionAlert);
  elements.modalLocate.addEventListener('click', () => {
    hideAlertModal();
    findNearestShelter();
  });
  elements.modalShowAlerts.addEventListener('click', () => {
    hideAlertModal();
    document.querySelector('#alerts').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  elements.closeAlertModal.addEventListener('click', () => {
    sessionStorage.setItem('civil-defense-alert-modal-dismissed', 'true');
    hideAlertModal();
  });
  elements.alertModal.addEventListener('click', (event) => {
    if (event.target === elements.alertModal) {
      sessionStorage.setItem('civil-defense-alert-modal-dismissed', 'true');
      hideAlertModal();
    }
  });
}

function setupMap() {
  state.map = L.map('map', { scrollWheelZoom: false }).setView([50.4501, 30.5234], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(state.map);
  state.shelterRenderer = L.canvas({ padding: 0.5 });
  state.shelterLayer = L.layerGroup().addTo(state.map);

  state.alertMap = L.map('ukraine-alert-map', {
    attributionControl: false,
    scrollWheelZoom: false,
    zoomControl: false,
  }).setView([49.0, 31.3], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    opacity: 0.38,
  }).addTo(state.alertMap);
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

function getRegionFromFeature(feature) {
  return normalizeRegionName(feature?.properties?.ADM1_UA || feature?.properties?.name || feature?.properties?.NAME);
}

function getAlertMapStyle(feature) {
  const activeRegions = getActiveRegionSet();
  const region = getRegionFromFeature(feature);
  const active = activeRegions.has(region);
  const isUserRegion = state.userRegion && region === state.userRegion;

  return {
    className: active ? 'alert-region-active' : '',
    color: isUserRegion ? '#60a5fa' : active ? '#fecaca' : '#334155',
    weight: isUserRegion ? 3 : active ? 1.6 : 1,
    opacity: active ? 1 : 0.7,
    fillColor: active ? '#ef4444' : '#0f1b2d',
    fillOpacity: active ? 0.84 : 0.62,
  };
}

function renderAlertMap() {
  if (!state.alertMap || !regionsGeoJson) {
    return;
  }

  if (state.alertRegionLayer) {
    state.alertRegionLayer.remove();
  }

  const activeRegions = getActiveRegionSet();
  state.alertRegionLayer = L.geoJSON(regionsGeoJson, {
    style: getAlertMapStyle,
    onEachFeature: (feature, layer) => {
      const region = getRegionFromFeature(feature);
      const regionAlerts = alerts.filter((alert) => alert.active && normalizeRegionName(alert.region || alert.location) === region);
      layer.bindPopup(`<strong>${region}</strong><br>${regionAlerts.length ? `Активних повідомлень: ${regionAlerts.length}` : 'Активних тривог не знайдено'}`);
      layer.on('click', () => {
        state.region = region;
        savePreferences();
        render();
        document.querySelector('#alerts-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
  }).addTo(state.alertMap);

  state.alertMap.fitBounds(state.alertRegionLayer.getBounds(), { padding: [12, 12] });

  const activeList = [...activeRegions].sort((a, b) => a.localeCompare(b, 'uk'));
  const userText = state.userRegion ? ` Ваш регіон: ${state.userRegion}.` : ' Натисніть "Перевірити мій регіон", щоб звірити тривогу з вашою геолокацією.';
  elements.alertMapSummary.textContent = activeList.length
    ? `Червоним позначено: ${activeList.join(', ')}.${userText}`
    : `За поточними повідомленнями активних областей не знайдено.${userText}`;
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
      ${state.userLocation ? `<a class="small-route-action" href="${getGoogleRouteUrl(shelter)}" target="_blank" rel="noreferrer">Маршрут у Google Maps</a>` : ''}
    </article>
  `).join('');
}

function renderMap() {
  const filtered = getFilteredShelters();
  const token = state.mapRenderToken + 1;
  state.mapRenderToken = token;
  state.shelterLayer.clearLayers();
  state.markers = [];

  const routeSuffix = (shelter) => state.userLocation
    ? `<br><a href="${getGoogleRouteUrl(shelter)}" target="_blank" rel="noreferrer">Маршрут у Google Maps</a>`
    : '';

  if (filtered.length > 0) {
    const viewKey = `${state.city}|${filtered.length}|${state.userLocation ? 'geo' : 'no-geo'}`;
    if (state.mapViewKey !== viewKey) {
      state.mapViewKey = viewKey;
      const bounds = L.latLngBounds(filtered.map((shelter) => [shelter.lat, shelter.lng]));
      state.map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }

  let index = 0;
  const renderChunk = () => {
    if (state.mapRenderToken !== token) {
      return;
    }

    const end = Math.min(index + 500, filtered.length);
    for (; index < end; index += 1) {
      const shelter = filtered[index];
      const marker = L.circleMarker([shelter.lat, shelter.lng], {
        renderer: state.shelterRenderer,
        radius: 4,
        weight: 1,
        color: '#1d4ed8',
        fillColor: '#2563eb',
        fillOpacity: 0.68,
      }).bindPopup(`<strong>${shelter.name}</strong><br>${shelter.address || ''}<br>${shelter.type || 'Укриття'}${routeSuffix(shelter)}`);

      marker.addTo(state.shelterLayer);
      state.markers.push(marker);
    }

    if (index < filtered.length) {
      requestAnimationFrame(renderChunk);
    }
  };

  requestAnimationFrame(renderChunk);
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

function getGoogleRouteUrl(shelter) {
  const destination = `${shelter.lat},${shelter.lng}`;
  const origin = state.userLocation ? `${state.userLocation.lat},${state.userLocation.lng}` : '';
  const params = new URLSearchParams({
    api: '1',
    destination,
    travelmode: 'walking',
  });

  if (origin) {
    params.set('origin', origin);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function showAlertModalForRegion(region) {
  const normalizedRegion = normalizeRegionName(region);
  const activeRegionAlerts = alerts.filter((alert) => alert.active && normalizeRegionName(alert.region || alert.location) === normalizedRegion);

  if (!normalizedRegion || !activeRegionAlerts.length) {
    return;
  }

  if (sessionStorage.getItem('civil-defense-alert-modal-dismissed') === 'true') {
    return;
  }

  const latestAlert = activeRegionAlerts[0];
  document.querySelector('#alert-modal-title').textContent = `Тривога у вашому регіоні: ${normalizedRegion}`;
  document.querySelector('#alert-modal-text').textContent = latestAlert?.description || 'Є активне сповіщення у вашому регіоні. Можна швидко знайти найближче укриття та побудувати маршрут.';
  elements.alertModal.classList.remove('hidden');
}

function hideAlertModal() {
  elements.alertModal.classList.add('hidden');
}

function isPointInRing(point, ring) {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function isPointInPolygon(point, polygon) {
  if (!polygon?.length || !isPointInRing(point, polygon[0])) {
    return false;
  }

  return !polygon.slice(1).some((hole) => isPointInRing(point, hole));
}

function getRegionByLocation(location) {
  if (!regionsGeoJson?.features?.length || !location) {
    return '';
  }

  for (const feature of regionsGeoJson.features) {
    const geometry = feature.geometry;
    if (!geometry) {
      continue;
    }

    const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];
    if (polygons.some((polygon) => isPointInPolygon(location, polygon))) {
      return getRegionFromFeature(feature);
    }
  }

  return '';
}

function renderNearest(nearest) {
  elements.nearestPanel.classList.remove('hidden');
  elements.nearestPanel.innerHTML = `
    <strong>Найближче укриття: ${nearest.name}</strong>
    <p>${nearest.address || 'Адресу уточнюйте на карті'} · ${nearest.distance.toFixed(2)} км від вас</p>
    <a class="route-action" href="${getGoogleRouteUrl(nearest)}" target="_blank" rel="noreferrer">Прокласти маршрут у Google Maps</a>
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
  requestUserLocation((location) => {
    state.userLocation = location;
    state.userRegion = getRegionByLocation(location);
    if (state.userRegion) {
      localStorage.setItem('civil-defense-user-region', state.userRegion);
      showAlertModalForRegion(state.userRegion);
    }
    renderNearestShelterFromLocation();
  });
}

function checkUserRegionAlert() {
  requestUserLocation((location) => {
    state.userLocation = location;
    state.userRegion = getRegionByLocation(location);
    if (state.userRegion) {
      localStorage.setItem('civil-defense-user-region', state.userRegion);
    }
    renderAlertMap();

    const active = state.userRegion && getActiveRegionSet().has(state.userRegion);
    if (active) {
      showAlertModalForRegion(state.userRegion);
    } else {
      elements.alertMapSummary.textContent = state.userRegion
        ? `Ваш регіон: ${state.userRegion}. Активної тривоги для нього зараз не знайдено.`
        : 'Не вдалося визначити область за геолокацією.';
    }
  });
}

function requestUserLocation(onSuccess) {
  if (!navigator.geolocation) {
    window.alert('Ваш браузер не підтримує геолокацію.');
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    onSuccess({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  }, () => {
    window.alert('Дозвольте доступ до геолокації, щоб перевірити ваш регіон.');
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
  });
}

function renderNearestShelterFromLocation() {
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
    .setContent(`<strong>${nearest.name}</strong><br>${nearest.address || ''}<br>${nearest.distance.toFixed(2)} км від вас<br><a href="${getGoogleRouteUrl(nearest)}" target="_blank" rel="noreferrer">Маршрут у Google Maps</a>`)
    .openOn(state.map);

  renderNearest(nearest);
  renderShelters();
  renderAlertMap();
  document.querySelector('#shelters').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: options.revalidate ? 'no-cache' : 'default',
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

async function loadRegions() {
  try {
    const data = await fetchJson('/api/regions');
    if (data.regions?.features?.length) {
      return data.regions;
    }
  } catch (error) {
    console.warn('Live regions API unavailable, using bundled map data.');
  }

  return fetchJson('./data/ukraine-regions.geojson');
}

function applyRealtimeData(alertsResult, newsResult) {
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

  applyRealtimeData(alertsResult, newsResult);
  fillRegionFilter();
  fillCityFilter();
  render();
  if (state.userRegion) {
    showAlertModalForRegion(state.userRegion);
  }
  loadAlertMapData();
  setupRealtimeUpdates();
}

async function loadAlertMapData() {
  try {
    const regions = await loadRegions();
    if (regions?.features?.length) {
      regionsGeoJson = regions;
      renderAlertMap();
    }
  } catch (error) {
    elements.alertMapSummary.textContent = 'Карту областей тимчасово не вдалося завантажити.';
  }
}

async function refreshRealtimeData() {
  if (state.isRefreshing || document.hidden) {
    return;
  }

  state.isRefreshing = true;
  try {
    const [alertsResult, newsResult] = await Promise.allSettled([
      fetchJson('/api/alerts', { revalidate: true }),
      fetchJson('/api/news', { revalidate: true }),
    ]);

    applyRealtimeData(alertsResult, newsResult);
    fillRegionFilter();
    renderSummary();
    renderAlerts();
    renderAlertMap();
    renderUpdates();
    renderSections();

    if (state.userRegion) {
      showAlertModalForRegion(state.userRegion);
    }
  } finally {
    state.isRefreshing = false;
  }
}

function setupRealtimeUpdates() {
  if (state.refreshTimer) {
    return;
  }

  state.refreshTimer = window.setInterval(refreshRealtimeData, REALTIME_REFRESH_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      refreshRealtimeData();
    }
  });
}

function render() {
  fillRegionFilter();
  fillCityFilter();
  renderSummary();
  renderAlerts();
  renderShelters();
  renderMap();
  renderAlertMap();
  renderUpdates();
  renderSections();
}

setupControls();
setupMap();
renderMedical();
render();
loadLiveData();
