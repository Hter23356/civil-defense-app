const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=30',
    ...(init.headers || {}),
  },
});

export async function onRequestGet({ env }) {
  if (!env.ALERTS_IN_UA_TOKEN) {
    return json({
      source: 'not_configured',
      updatedAt: new Date().toISOString(),
      alerts: [],
      message: 'ALERTS_IN_UA_TOKEN is not configured',
    });
  }

  const response = await fetch('https://api.alerts.in.ua/v1/alerts/active.json', {
    headers: {
      Authorization: `Bearer ${env.ALERTS_IN_UA_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return json({
      source: 'alerts.in.ua',
      updatedAt: new Date().toISOString(),
      alerts: [],
      message: `Alerts API returned ${response.status}`,
    }, { status: 502 });
  }

  const data = await response.json();
  const alerts = (data.alerts || []).map((alert) => ({
    id: String(alert.id || `${alert.location_uid}-${alert.started_at}`),
    region: alert.location_oblast || alert.location_title,
    location: alert.location_title,
    type: alert.alert_type,
    active: !alert.finished_at,
    start: alert.started_at,
    end: alert.finished_at,
    description: alert.notes || 'Активна повітряна тривога або інша загроза.',
  }));

  return json({
    source: 'alerts.in.ua',
    updatedAt: new Date().toISOString(),
    alerts,
  });
}
