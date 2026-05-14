const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=3600',
    ...(init.headers || {}),
  },
});

const FALLBACK_SHELTERS = [
  { name: 'Метро Хрещатик', address: 'Хрещатик, 1', city: 'Київ', region: 'Київ', lat: 50.447, lng: 30.522, capacity: null, type: 'Метро', description: 'Центральна станція метро.' },
  { name: 'Метро Майдан Незалежності', address: 'Майдан Незалежності', city: 'Київ', region: 'Київ', lat: 50.45, lng: 30.524, capacity: null, type: 'Метро', description: 'Станція метро у центрі Києва.' },
  { name: 'Підземний паркінг Globus', address: 'Майдан Незалежності, 1', city: 'Київ', region: 'Київ', lat: 50.449, lng: 30.524, capacity: null, type: 'Підземне', description: 'Підземний паркінг.' },
];

const SHELTER_SOURCES = [
  {
    name: 'gisserver.kyivcity.gov.ua Public_protection',
    url: 'https://gisserver.kyivcity.gov.ua/mayno/rest/services/KYIV_API/Public_protection/MapServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326',
  },
  {
    name: 'gisserver-stage.kyivcity.gov.ua Shelter',
    url: 'https://gisserver-stage.kyivcity.gov.ua/mayno/rest/services/KYIV_API/%D0%9A%D0%A6_%D0%92%D0%B5%D0%B1/MapServer/2/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326',
  },
];

const pick = (object, keys, fallback = '') => {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null && String(object[key]).trim()) {
      return String(object[key]).trim();
    }
  }
  return fallback;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const stripHtml = (value) => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getCoordinates = (feature, props) => {
  const coordinates = feature.geometry?.coordinates || [];
  let lng = toNumber(coordinates[0]);
  let lat = toNumber(coordinates[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    lat = toNumber(pick(props, ['lat', 'LAT', 'latitude', 'Latitude']));
    lng = toNumber(pick(props, ['long', 'lng', 'LNG', 'longitude', 'Longitude']));
  }

  return { lat, lng };
};

const normalizeFeature = (feature, index) => {
  const props = feature.properties || {};
  const { lat, lng } = getCoordinates(feature, props);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const address = pick(props, ['address', 'ADDRESS', 'addr', 'Адреса'], 'Адресу не вказано');
  const district = pick(props, ['district', 'DISTRICT', 'Район']);
  const type = pick(props, ['type', 'TYPE', 'kind', 'Тип укриття', 'Вид укриття'], 'Укриття');
  const buildingType = pick(props, ['type_building', 'Тип будівлі']);
  const owner = pick(props, ['owner', 'balance_holder', 'Власник']);
  const workingTime = pick(props, ['working_time', 'Режим роботи']);
  const accessibility = pick(props, ['invalid']);
  const rawDescription = pick(props, ['description', 'DESCRIPTION', 'Примітка', 'link_full']);

  const details = [
    buildingType && `Тип будівлі: ${buildingType}`,
    workingTime && `Режим роботи: ${workingTime}`,
    accessibility && `Доступність: ${accessibility}`,
    owner && `Балансоутримувач: ${owner}`,
    rawDescription,
  ].filter(Boolean).map(stripHtml);

  return {
    id: pick(props, ['objectid', 'id', 'ID', 'OBJECTID', 'globalid', 'guid'], `shelter-${index}`),
    name: pick(props, ['title', 'name', 'NAME', 'Назва'], district ? `Укриття, ${district}` : 'Укриття'),
    address,
    city: district || 'Київ',
    region: 'Київ',
    lat,
    lng,
    capacity: toNumber(pick(props, ['capacity', 'CAPACITY', 'Місткість'])) || null,
    type,
    description: details.length ? details.join('. ') : 'Захисна споруда цивільного захисту.',
    phone: pick(props, ['tel', 'phonenumb', 'Телефон']),
  };
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: 'application/geo+json, application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    throw new Error('The source returned non-JSON content');
  }

  return JSON.parse(trimmed);
};

const loadFromArcgis = async (source) => {
  const geojson = await fetchJson(source.url);
  const shelters = (geojson.features || [])
    .map(normalizeFeature)
    .filter(Boolean);

  if (!shelters.length) {
    throw new Error('No shelter features found');
  }

  return {
    source: source.name,
    shelters,
  };
};

const loadFromKyivOpenData = async () => {
  const catalogUrl = 'https://data.kyivcity.gov.ua/api/action/datastore_search?resource_id=379a7295-22ae-4031-8aaf-2a5e7c8df178';
  const catalog = await fetchJson(catalogUrl);
  const resourceUrl = catalog?.result?.records?.[0]?.resource_url;

  if (!resourceUrl) {
    throw new Error('Kyiv Open Data resource URL is missing');
  }

  const geojson = await fetchJson(resourceUrl);
  const shelters = (geojson.features || [])
    .map(normalizeFeature)
    .filter(Boolean);

  if (!shelters.length) {
    throw new Error('Kyiv Open Data returned no shelters');
  }

  return {
    source: 'data.kyivcity.gov.ua',
    shelters,
  };
};

export async function onRequestGet() {
  for (const source of SHELTER_SOURCES) {
    try {
      const result = await loadFromArcgis(source);
      return json({
        ...result,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(`Shelter source failed: ${source.name}`, error.message);
    }
  }

  try {
    const result = await loadFromKyivOpenData();
    return json({
      ...result,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Kyiv Open Data shelter source failed', error.message);
  }

  return json({
    source: 'fallback',
    updatedAt: new Date().toISOString(),
    shelters: FALLBACK_SHELTERS,
  });
}
