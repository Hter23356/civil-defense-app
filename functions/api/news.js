const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
    ...(init.headers || {}),
  },
});

const clean = (value) => value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&#33;/g, '!')
  .replace(/&#39;/g, "'")
  .replace(/\n{3,}/g, '\n\n')
  .trim();

export async function onRequestGet() {
  const response = await fetch('https://t.me/s/kpszsu', {
    headers: {
      'user-agent': 'Mozilla/5.0 civil-defense-site',
      accept: 'text/html',
    },
  });

  if (!response.ok) {
    return json({
      source: 't.me/kpszsu',
      updatedAt: new Date().toISOString(),
      posts: [],
      message: `Telegram page returned ${response.status}`,
    }, { status: 502 });
  }

  const html = await response.text();
  const messageBlocks = [...html.matchAll(/<div class="tgme_widget_message_wrap[\s\S]*?<\/time>[\s\S]*?<\/div>\s*<\/div>/g)]
    .slice(-8)
    .reverse();

  const posts = messageBlocks.map((match) => {
    const block = match[0];
    const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    const timeMatch = block.match(/datetime="([^"]+)"/);
    const linkMatch = block.match(/href="(https:\/\/t\.me\/kpszsu\/\d+)"/);
    return {
      text: textMatch ? clean(textMatch[1]) : 'Повідомлення без тексту',
      date: timeMatch ? timeMatch[1] : new Date().toISOString(),
      url: linkMatch ? linkMatch[1] : 'https://t.me/kpszsu',
    };
  }).filter((post) => post.text && post.text !== 'Повідомлення без тексту');

  return json({
    source: 't.me/kpszsu',
    updatedAt: new Date().toISOString(),
    posts,
  });
}
