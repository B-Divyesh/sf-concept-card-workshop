# Concept Card Workshop handoff

## Shipped

- A local-first composer for instructor-authored **scenario, evidence, decision,
  and consequence** cards, with a usable empty state and a short sample round.
- Browser-native printable two-up cut sheets, plus a facilitator timer (5–30
  minutes) and a clean projection page. Projection serialises the deck into the
  shared URL so it requires no account or data service; instructors should not
  put private student data in that URL.
- A no-account $12 one-time **Offline Pack Templates** unlock using the required
  Sociobot checkout/verify endpoints, query-token capture, local license cache,
  daily background verification, and restore-token flow. The paid feature is a
  print-ready blank field pack; no core authoring, printing, or accessibility
  feature is gated.
- `/privacy/` and `/terms/`, MIT licensing, local service worker caching, and
  an original factory-generated hero illustration.

## Design and assets

The product-specific pixel/demoscene visual system, palette, type choices,
motion treatment, and original-image prompt/provenance are in
`.factory/design.md`. The reviewed source PNG and prompt sidecar remain in
`assets/src/`; the shipped `public/tabletop.webp` is 36 KB (under the 300 KB
hero limit). The UI uses system fonts and makes no runtime third-party requests
apart from an explicit license verify/checkout action.

## Verification

Ran on 2026-08-28:

```bash
npm test
npm run build
```

Both pass. `npm test` includes model tests and a Playwright Chromium smoke test
at 390px/desktop-capable layout that creates/edits cards, starts the timer,
checks the page console, and runs axe: **0 serious/critical violations**.
`npm run build` outputs `dist/index.html` as required. Production asset sizes:
15.5 KB JS raw (6.1 KB gzip), 9.0 KB CSS raw (2.8 KB gzip), 36 KB hero WebP.
The small local bundle, explicit image dimensions, no web fonts, and cacheable
service worker are intended to meet Lighthouse-class performance; a full hosted
Lighthouse run was not available in this container.

## Known limits / next steps

- A static product cannot resolve a short join code across separate devices
  without a service. The generated code labels the projector and the exact
  share link carries the deck, preserving the no-account/no-server promise.
- License verification is only exercised against the production contract in a
  browser; use the factory’s registered staging product/base URL before staging
  checkout verification.
- Add test coverage for popup printing and a real paid-token fixture once the
  product is registered.
