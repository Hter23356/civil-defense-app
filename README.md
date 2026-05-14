# Civil Defense App

Static civil defense dashboard for Kyiv: active alert messages, Air Force updates, first-aid guidance, and a shelter map with geolocation and Google Maps walking routes.

## Current Version

- Main site: `static-site`
- Cloudflare Pages Functions: `functions/api`
- Hosting target: Cloudflare Pages
- No MongoDB, paid backend, or extra server required

## Data Sources

- Alerts: public Telegram web feed from `t.me/UkraineAlarmSignal`
- News: public Telegram web feed from `t.me/kpszsu`
- Kyiv shelters: official Kyiv GIS ArcGIS GeoJSON layer, with Kyiv Open Data as a fallback

## Cloudflare Pages Settings

Use these values when deploying the GitHub repository:

```text
Framework preset: None
Build command:
Build output directory: static-site
Root directory:
Production branch: main
```

Leave `Build command` and `Root directory` empty.

## Local Preview

For a quick static preview, open:

```text
static-site/index.html
```

The live `/api/*` functions run on Cloudflare Pages after deployment.

## Deploy Updates

After changing files, run:

```powershell
git add .
git commit -m "Update civil defense site"
git push
```

Cloudflare Pages will automatically rebuild the site from the `main` branch.
