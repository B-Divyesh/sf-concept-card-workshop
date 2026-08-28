# Concept Card Workshop

Live: https://concept-card-workshop.sociobot.in — built by the Param Factory (`static-web`).

See `.factory/brief.json` for the researched problem this solves and `.factory/design.md` for the visual system.

## Run and verify

```
npm install
npm run dev
npm test
npm run build   # -> dist/
```

`npm run build` writes the static site to `dist/` with `index.html` at its
root. Use `npm run preview` to inspect the production build. The browser stores
your single workshop locally; clear browser site data to remove it.

## What is included

The free composer supports scenario, evidence, decision, and consequence cards,
browser print cut sheets, a 5–30 minute facilitator clock, and a shareable
projection link. It deliberately has no student accounts, scoreboards, or
analytics. A $12 one-time offline-template pack uses Sociobot’s hosted checkout;
no payment provider is embedded. See `/privacy/` and `/terms/` for details.

## Deploy

Deploy the contents of `dist/` to any static host (Azure Static Web Apps is the
target environment). No runtime CDNs, fonts, analytics, or server are needed.
