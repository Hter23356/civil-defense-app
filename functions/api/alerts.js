const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=30',
    ...(init.headers || {}),
  },
});

const clean = (value = '') => value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&#33;/g, '!')
  .replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const getRegion = (location = '') => {
  const match = location.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].replace(/\s*обл\.?\s*/i, ' область').trim();
  }
  if (/Київ/i.test(location)) return 'Київ';
  return location.split(',')[0].trim() || 'Україна';
};

const getAlertType = (text) => {
  if (/відбій/i.test(text)) return 'Відбій';
  if (/бпла|дрон/i.test(text)) return 'Загроза БПЛА';
  if (/ракет/i.test(text)) return 'Ракетна небезпека';
  if (/повітряна тривога/i.test(text)) return 'Повітряна тривога';
  return 'Небезпека';
};

const isActiveAlert = (text) => {
  if (/відбій/i.test(text)) return false;
  return /повітряна тривога|загроза|бпла|дрон|ракет/i.test(text);
};

const parseTelegramMessages = (html) => {
  const blocks = [...html.matchAll(/<div class="tgme_widget_message_wrap[\s\S]*?<\/time>[\s\S]*?<\/div>\s*<\/div>/g)];
  return blocks.map((match) => {
    const block = match[0];
    const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const timeMatch = block.match(/datetime="([^"]+)"/);
    const linkMatch = block.match(/href="(https:\/\/t\.me\/UkraineAlarmSignal\/\d+)"/);
    const text = textMatch ? clean(textMatch[1]) : '';
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    const location = lines[0] || 'Україна';
    const description = lines.slice(1).join('\n') || text;

    return {
      id: linkMatch?.[1] || `${location}-${timeMatch?.[1] || Date.now()}`,
      region: getRegion(location),
      location,
      type: getAlertType(text),
      active: isActiveAlert(text),
      start: timeMatch?.[1] || new Date().toISOString(),
      end: /відбій/i.test(text) ? (timeMatch?.[1] || new Date().toISOString()) : null,
      description,
      url: linkMatch?.[1] || 'https://t.me/UkraineAlarmSignal',
    };
  }).filter((alert) => alert.description && !/евакуюватися|гаряча лінія/i.test(alert.description));
};

export async function onRequestGet() {
  const response = await fetch('https://t.me/s/UkraineAlarmSignal', {
    headers: {
      'user-agent': 'Mozilla/5.0 civil-defense-site',
      accept: 'text/html',
    },
  });

  if (!response.ok) {
    return json({
      source: 't.me/UkraineAlarmSignal',
      updatedAt: new Date().toISOString(),
      alerts: [],
      message: `Telegram page returned ${response.status}`,
    }, { status: 502 });
  }

  const html = await response.text();
  const parsed = parseTelegramMessages(html);
  const latestByLocation = new Map();

  for (const alert of parsed) {
    latestByLocation.set(alert.location, alert);
  }

  const alerts = [...latestByLocation.values()]
    .sort((a, b) => Number(b.active) - Number(a.active) || new Date(b.start) - new Date(a.start))
    .slice(0, 40);

  return json({
    source: 't.me/UkraineAlarmSignal',
    updatedAt: new Date().toISOString(),
    alerts,
  });
}
