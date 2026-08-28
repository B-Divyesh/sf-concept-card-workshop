# Concept Card Workshop handoff

## Verification status: FAIL

Independent QA was completed on 2026-08-28 for candidate
`727e701542cdea13148e3ec3068b7f11a6b5d24e` and
<https://concept-card-workshop.sociobot.in>. The live HTML, JS, CSS, image, and
service worker exactly match the fresh candidate build, so the result is not a
stale-deployment mismatch.

Release blockers:

- `.factory/claims.json` is missing; the mandatory claim suite cannot run.
- The advertised purchase URL returns HTTP 404, so the $12 unlock cannot be
  purchased.
- Form changes and clock ticks replace the DOM, lose keyboard focus, and can
  swallow the next field interaction.
- “Use the sample” overwrites existing work with no confirmation or undo.
- A new checkout-return token is not verified when an older cached verdict is
  still fresh.
- The purchase dialog has a serious axe contrast failure (1.67:1 Terms link).
- The six-character join code is not usable; only the full fragment URL carries
  the deck.
- Malformed-but-valid stored JSON leaves a blank, unrecoverable app.

Additional findings include sub-44px mobile targets, horizontal overflow at
200% root text size, a 404 favicon console/network error, 30-second cache policy
on hashed assets, and missing CSP/Permissions-Policy. Full evidence and repro
details are in `.factory/verification.md`.

## What passed

- Cold first read clearly explains the product, audience, primary action, and
  offers a one-click sample.
- `npm ci`, `npm test` (2 Vitest + 1 Playwright), and `npm run build` pass. No
  lint task exists.
- Core sample, persistence, escaping, print, projection, clear recovery,
  reduced motion, normal 390px layout, privacy/terms, and offline reload work.
- Live mobile Lighthouse: performance 97, accessibility 100, best practices 96,
  SEO 91; LCP 1.1s, TBT 190ms, CLS 0. Production JS is 15,473 bytes, CSS 8,998
  bytes, hero 36,650 bytes.
- The billing verify endpoint has working CORS and rate limiting: a 120-request
  burst returned 30 HTTP 200 and 90 HTTP 429 responses with `Retry-After: 4`.

## Reproduce

```bash
npm ci
npm test
npm run build
npm run preview
```

Use the live URL for deployment checks. The exact command output, file hashes,
accessibility results, response policies, and remediation list are recorded in
`.factory/verification.md`.

## Next steps

Resolve every critical/major item above, add claim tests and missing brief
artifact, deploy the enabled billing product, then rerun independent QA against
the new candidate and live URL. Do not ship this candidate.
