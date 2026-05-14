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

const pick = (object, keys, fallback = '') => {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null && String(object[key]).trim()) {
      return String(object[key]).trim();
    }
  }
  return fallback;
};

const normalizeFeature = (feature, index) => {
  const props = feature.properties || {};
  const coordinates = feature.geometry?.coordinates || [];
  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: pick(props, ['id', 'ID', 'OBJECTID'], `shelter-${index}`),
    name: pick(props, ['name', 'NAME', 'title', 'Назва'], 'Укриття'),
    address: pick(props, ['address', 'ADDRESS', 'addr', 'Адреса'], 'Адресу не вказано'),
    city: 'Київ',
    region: 'Київ',
    lat,
    lng,
    capacity: Number(pick(props, ['capacity', 'CAPACITY', 'Місткість'], '')) || null,
    type: pick(props, ['type', 'TYPE', 'Тип'], 'Укриття'),
    description: pick(props, ['description', 'DESCRIPTION', 'Опис', 'balance_holder'], 'Захисна споруда цивільного захисту.'),
  };
};

export async function onRequestGet() {
  const catalogUrl = 'https://data.kyivcity.gov.ua/api/action/datastore_search?resource_id=379a7295-22ae-4031-8aaf-2a5e7c8df178';
  const catalog = await fetch(catalogUrl).then((res) => res.json());
  const resourceUrl = catalog?.result?.records?.[0]?.resource_url;

  if (!resourceUrl) {
    return json({ source: 'fallback', shelters: FALLBACK_SHELTERS });
  }

  const response = await fetch(resourceUrl, {
    headers: { accept: 'application/geo+json, application/json' },
  });

  if (!response.ok) {
    return json({ source: 'fallback', shelters: FALLBACK_SHELTERS });
  }

  const geojson = await response.json();
  const shelters = (geojson.features || [])
    .map(normalizeFeature)
    .filter(Boolean);

  return json({
    source: 'data.kyivcity.gov.ua',
    updatedAt: new Date().toISOString(),
    shelters: shelters.length ? shelters : FALLBACK_SHELTERS,
  });
}
