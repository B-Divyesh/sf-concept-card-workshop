# Make discussion cards after a lecture — verification 2

## Verdict: FAIL

- Verified: 2026-09-05 UTC
- Live URL: <https://concept-card-workshop.sociobot.in>
- Implementation candidate reviewed: `f4ea3f6021cacca6205c6a7e85e177eaebb300af`
- Documentation revision reviewed: `13bae7e48667cb2a2fb4c145b3b64925c4a367d5`
- Findings: 3 (1 critical, 1 moderate, 1 minor)
- Untested declared claims: 0

The live product is the candidate build: SHA-256 values match for `index.html`,
the JS and CSS assets, `tabletop.webp`, and `sw.js`. The product makes
discussion cards after a lecture for instructors running small-group reasoning
practice. Before scrolling on fresh 1440px desktop and 390px phone sessions,
the page showed that job, named the instructor audience, and offered **Start a
card set** with its outcome.

## Findings

### Critical — the advertised paid purchase cannot start

The **Buy one-time unlock** link correctly points to the Sociobot checkout URL,
but a live request to
`https://api.sociobot.in/api/v1/products/concept-card-workshop/checkout`
returned HTTP 404 with `{"error":"enabled factory product","status":404}`.
Visitors therefore cannot buy the publicly advertised optional $12 Offline Pack
Templates. This is an external billing-registration dependency, not a client
code defect, but it is still a failed paid user path and makes the public
purchase statement false in production.

The declared `paid-pack-price` command passes because it checks the dialog copy
and destination before navigation. It does not prove that checkout starts, so
it cannot substantiate the full public purchase claim. Register and enable the
existing offer, then verify a hosted checkout return and entitlement before
release.

### Moderate — legal and 404 pages omit the required shared site skeleton

`/privacy/`, `/terms/`, and the designed unknown-route 404 response each have
`main` and a footer but no `header`, `nav`, or skip link. This misses the
required consistent header/navigation/skip-link structure on every route and
the semantic landmark baseline for these pages. The titles, one h1, content,
and return links work, but the route structure is incomplete.

Add the product header (wordmark home link, compact navigation, skip link) and
the standard footer content to those three static pages.

### Minor — demo cards use an invalid ARIA role

Playwright axe found `aria-allowed-role` on all four sample cards at `/demo`.
Each is an `article` with `role="button"`; that role is not allowed on the
native `article` element. The cards are keyboard-operable, but this is invalid
semantics for assistive technology. Use a native `button` for selectable cards
or a valid wrapper/role pattern, then rerun axe.

## Declared claims

All nine declared commands were run separately from a fresh clone at
`13bae7e48667cb2a2fb4c145b3b64925c4a367d5` after `npm ci`; each passed. No
declared claim command is untested.

| Claim | Result | Evidence |
| --- | --- | --- |
| `sample-sandbox` | PASS | Separate real/demo namespaces, reset, and real-data preservation asserted. |
| `offline-reload` | PASS | Isolated browser context restored `/demo` offline after first visit. |
| `local-workshop` | PASS | Free authoring request log stayed same-origin. |
| `projection-join` | PASS | A `CCW1` code opened the same four-card projection. |
| `browser-print` | PASS | Printable popup contained the titled four-card sheet. |
| `free-core` | PASS | A new local card printed without a license. |
| `timer-range` | PASS | Both 5 and 30 minute endpoints produced the visible values. |
| `four-card-roles` | PASS | The realistic sample contains scenario, evidence, decision, and consequence. |
| `paid-pack-price` | PASS, limited | Dialog displays the $12 one-time copy and correct checkout destination; live checkout availability is the critical finding above. |

## Independent runtime checks

- Clean install: `npm ci` passed (60 packages, no vulnerabilities).
- `npm test` passed: 3 Vitest tests and 14 Playwright tests.
- `npm run build` passed and produced `dist/`; initial JS is 21.36 kB raw / 7.63 kB gzip and CSS is 10.75 kB raw / 3.13 kB gzip.
- Fresh live desktop and phone loads had no page or console errors. The factory URL verifier passed: title, `lang`, one h1, main landmark, image alt text, labelled buttons, and no captured errors. Evidence: `/work/.evidence/live-verify-2/`.
- Live demo check passed: four populated trail-condition cards, persistent **Demo — sample data, nothing is saved** label, reset to four cards, and return to real mode without changing the saved real card.
- Live offline reload of `/demo` passed after service-worker control and restored the four sample cards.
- Browser request logging during free authoring found only same-origin requests. No analytics or third-party assets loaded.
- Invalid local data presents the recovery control in the browser test. Empty print/projection, invalid join input, clear confirmation, timer endpoints, input escaping, returned-token verification, keyboard focus retention, touch targets, and 200% reflow are covered by the passing browser suite.
- Live route responses: `/`, `/demo`, `/privacy/`, and `/terms/` return 200; the unknown route returns the designed page with HTTP 404. The site 404 is expected and is not itself a defect.
- Security headers include CSP, Permissions-Policy, `nosniff`, and strict-origin referrer policy. Hashed assets and the hero image have immutable one-year cache headers.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s and CLS 0. The raw axe CLI could not locate Chrome in this container; Playwright axe was used instead and found the minor demo-card violation above (root, legal pages, and paid dialog had no axe violations).
- `robots.txt`, `sitemap.xml`, root assets, privacy/terms links, and the designed 404 route all resolve. The product has no product-owned backend, tenant, health, restart-persistence, or rate-limit surface; those backend checks are not applicable. The separately operated billing API was checked only for this product's checkout and invalid-license verification endpoints.

## Disposition of verification-1 findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest | Resolved: manifest exists and all nine commands pass separately. |
| Checkout 404 | Still open as the critical finding above. |
| Form/timer rerender lost focus | Resolved by the passing keyboard-focus and timer regression test. |
| Sample overwrote real work | Resolved: live real/demo namespace isolation, reset, and return check passed. |
| New returned license not verified | Resolved by the passing returned-token regression test. |
| Paid-dialog contrast | Resolved: paid dialog has no axe violations. |
| Decorative join code only | Resolved: projection join claim passes with a pasted `CCW1` code. |
| Malformed local data bricked the app | Resolved: recovery test passes. |
| Small mobile controls | Resolved by the passing live/browser target-size regression. |
| 200% text overflow | Resolved by the passing reflow regression. |
| Nested complementary landmark violations | Resolved; no such axe violation remains. New minor `aria-allowed-role` finding is recorded above. |
| Missing favicon | Resolved: fresh live console checks have no errors. |
| Missing immutable cache/CSP/Permissions-Policy | Resolved: live headers are present and hashed assets are immutable. |
| Missing brief | Resolved: `.factory/brief.json` is present. |

## Release decision

Do not declare this product accepted. The free product is verified and all
declared commands pass, but the unavailable paid checkout, missing route
skeleton, and minor ARIA error leave three findings. Re-run this verification
after the billing offer is registered and the two product-code findings are
repaired.
