# Concept Card Workshop

Concept Card Workshop helps instructors make, print, and project discussion
cards for a small-group reasoning activity after a lecture. It is for
instructors, not student accounts, scoring, or profiling.

Live site: <https://concept-card-workshop.sociobot.in>

## Start with the demo

Open [the demo](https://concept-card-workshop.sociobot.in/demo), or select
**Try it with sample data** on the landing page. It loads a realistic four-card
trail-conditions round in separate demo storage. The persistent demo banner can
reset it or return to real work without changing the real workshop.

## Run and verify

Use Node.js 20 or newer.

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm run build` writes the static site to `dist/` with `index.html` at its
root. `npm test` runs model checks and browser checks. Every public claim has a
separate clean command recorded in [`.factory/claims.json`](.factory/claims.json).

The browser stores real work locally under `ccw:workshop:v1`; demo work uses
`demo:ccw:workshop:v1`. Clear a set from the app or clear browser site data to
remove it. The free composer sends no workshop data to a server. Projection
links and join codes contain the cards, so do not share private student data.

## What is included

The free core provides one local card set, four roles (scenario, evidence,
decision, consequence), browser print cut sheets, a 5–30 minute facilitator
clock, and no-account projection join codes. It works offline after the first
visit.

Offline Pack Templates is an optional $12 one-time purchase through Sociobot's
hosted checkout. It adds downloadable blank facilitation-pack templates and
does not gate cards, printing, accessibility, or export. Sociobot/Dodo is the
merchant of record. License verification uses the Sociobot billing API only
when a license is supplied. See [Privacy](https://concept-card-workshop.sociobot.in/privacy/)
and [Terms](https://concept-card-workshop.sociobot.in/terms/).

## Deploy

Azure Static Web Apps is the target host. Build first, then use the factory
static deployment helper from the repository root:

```sh
npm ci && npm test && npm run build
/opt/fleet/lib/deploy-static.sh concept-card-workshop dist
```

`public/staticwebapp.config.json` supplies the navigation fallback, designed
404 page, security headers, and immutable caching for hashed assets. The
factory controls DNS and billing registration; no credentials are stored here.

## Project records

The researched brief is [`.factory/brief.json`](.factory/brief.json), the
visual system is [`.factory/design.md`](.factory/design.md), the demo boundary
is [`.factory/demo.md`](.factory/demo.md), and the license is MIT in
[`LICENSE`](LICENSE).
