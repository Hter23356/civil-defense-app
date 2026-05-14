const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=86400',
    ...(init.headers || {}),
  },
});

const REGIONS_URL = 'https://services6.arcgis.com/ShS5lxe02g5rZbkL/arcgis/rest/services/UKR_Oblast_Boundaries/FeatureServer/1/query?where=1%3D1&outFields=ADM1_UA,ADM1_EN,ADM1_PCODE&returnGeometry=true&f=geojson&outSR=4326&geometryPrecision=3';

export async function onRequestGet() {
  const response = await fetch(REGIONS_URL, {
    headers: {
      accept: 'application/geo+json, application/json',
    },
  });

  if (!response.ok) {
    return json({
      source: 'ArcGIS Ukraine oblast boundaries',
      updatedAt: new Date().toISOString(),
      regions: null,
      message: `Region source returned ${response.status}`,
    }, { status: 502 });
  }

  const geojson = await response.json();

  return json({
    source: 'ArcGIS Ukraine oblast boundaries',
    updatedAt: new Date().toISOString(),
    regions: geojson,
  });
}
