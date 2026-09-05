# Concept Card Workshop handoff

## Status

The implementation is deployed to
<https://concept-card-workshop.sociobot.in>.

- Implementation SHA: `f4ea3f6021cacca6205c6a7e85e177eaebb300af`
- Documentation handoff SHA: `e4fb172b37890274dd11fc372702ec37d23427f5`
- Static deployment: Azure Static Web Apps production deployment
  `2016a1eb-f8f2-4c78-b4af-dfd0ffb40428`
- Artifact: Vite + TypeScript static site, with `dist/index.html` at its root.

## What changed

- Added the required researched brief, claims manifest, demo documentation,
  copy audit, catalog description, and billing-offer handoff metadata.
- Reworked saving so title/body changes and timer ticks update only the needed
  DOM. Focus stays in the next field and on the timer control.
- Made sample use a true `/demo` sandbox with `demo:ccw:workshop:v1`, a
  persistent status banner, reset, and a return to real work that does not copy
  or overwrite real data.
- Validated local workshop data before use. Bad JSON or wrong-shaped data now
  shows a recovery action instead of leaving the app blank.
- Replaced the decorative six-character code with a working `CCW1` join code.
  It contains the card deck, can be pasted into **Join projection**, and needs
  no account or server storage.
- Tied license verdicts to their token and force-verifies every returned or
  restored token, even when another verdict is fresh.
- Fixed paid-dialog contrast, 44px control sizing, 200% text reflow,
  complementary-landmark nesting, favicon, metadata, route titles, legal page
  styling, service-worker cache updates, immutable asset caching, CSP,
  Permissions-Policy, and the designed HTTP 404 page.

## Verification

From a clean dependency install:

```sh
npm ci
npm test
npm run build
```

Passed on 2026-09-05:

- `npm test`: 3 Vitest model tests and 14 Playwright browser tests.
- `npm run build`: production `dist/` output.
- Every command in [`.factory/claims.json`](claims.json) passed individually:
  sample sandbox, offline reload, local-only authoring, projection join,
  browser print, free core, 5–30 minute clock, four roles, and paid-pack copy.
- The factory URL verifier passed on the live root: HTTPS 200, title, `lang`,
  one h1, main landmark, alt text, labelled buttons, and no page or console
  errors. Evidence is in `/work/.evidence/live-verify/`.
- Live axe browser check reported zero serious/critical findings on the landing
  page. The paid dialog is covered by the same axe assertion in the browser
  suite.
- Fresh desktop and 390px phone sessions both showed, before scroll: **Make
  discussion cards after a lecture**; the instructor audience; and **Start a
  card set** with its outcome. No errors occurred.
- Live demo loaded four realistic cards with the persistent sample label;
  reset restored four cards; returning to real mode left real storage unchanged.
  A live offline reload after the first visit restored the demo. A live pasted
  `CCW1` code opened the same four-card projection.
- Live route checks: `/`, `/demo`, `/privacy/`, and `/terms/` return 200;
  an unknown path returns the designed 404 page with HTTP 404.
- Live Lighthouse mobile report: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.1 s; CLS 0. The first-load JS is 21.36 kB raw
  (7.63 kB gzip), CSS is 10.75 kB raw (3.13 kB gzip), and the hero WebP is
  36.65 kB.

## Known dependency

The optional **Offline Pack Templates** purchase is preserved at its existing
one-time $12 offer and the client-side return/verification behavior is fixed.
At final verification, the separately operated production checkout endpoint
still returned HTTP 404 (`enabled factory product`). The invalid-license verify
endpoint returns HTTP 200 with `valid: false`, so the client integration is
reachable. Billing registration is required before a customer can complete a
purchase; it is not changed from this repository. Public registration metadata
is at `/work/.evidence/billing-offer.json` and uses the exact product origin.

## Next step

The billing-registration operator should enable the existing
`concept-card-workshop` one-time offer, then verify a real checkout return and
entitlement. No other product functionality is blocked.

## Verification 2 (2026-09-05)

Independent verification reviewed implementation `f4ea3f6021cacca6205c6a7e85e177eaebb300af`
and documentation `13bae7e48667cb2a2fb4c145b3b64925c4a367d5`. It is **FAIL**,
with three findings recorded in `.factory/verification-2.md`:

- The external Sociobot checkout URL still returns HTTP 404, so the advertised
  optional $12 paid purchase cannot start.
- Privacy, Terms, and the designed 404 page lack the required shared header,
  navigation, and skip link.
- Axe reports a minor invalid `role="button"` on demo-card `article` elements.

Clean verification used `npm ci`, `npm test`, `npm run build`, every declared
claim command individually, live desktop/phone/demo/offline checks, headers,
Playwright axe, and Lighthouse (100/100/100/100). All nine declared command
tests pass; no declared claim is untested. The product must not be marked PASS
until the three findings are resolved.
