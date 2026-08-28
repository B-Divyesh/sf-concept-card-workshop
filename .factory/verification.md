# Independent product verification

## Verdict: FAIL

- Candidate: `727e701542cdea13148e3ec3068b7f11a6b5d24e`
- Live URL: <https://concept-card-workshop.sociobot.in>
- Verified: 2026-08-28 UTC
- Work order: `concept-card-workshop-verify-1`

The live deployment is byte-for-byte identical to the candidate's fresh
production build. This is not a stale-deployment result. The candidate fails
the mandatory claims gate, its advertised purchase flow is unavailable, and
several authoring/accessibility paths do not meet the acceptance contract.

## Release blockers and defects

### Critical

1. **The mandatory claims manifest is absent.** `.factory/claims.json` does not
   exist in the clean candidate checkout. Therefore no declared claim tests can
   be run. The work order explicitly defines a missing manifest as
   release-blocking.

2. **The advertised $12 purchase cannot be started.** The UI links to the
   contractually correct Sociobot URL, but a fresh request to
   `GET https://api.sociobot.in/api/v1/products/concept-card-workshop/checkout`
   returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`. This confirms the
   previously suspected deployment/configuration failure still exists.

### Major

3. **Editing rerenders the whole app and breaks sequential input.** After
   entering a card title, Tab moves focus to `<body>` instead of the discussion
   prompt. With a pointer, the first click into the discussion prompt is
   swallowed; typing changes nothing. A second click is required. Starting the
   facilitator clock has the same problem: after the first tick, focus is on
   `<body>`. This prevents reliable keyboard-only authoring and interrupts
   assistive-technology context.

4. **“Use the sample” silently destroys the current workshop.** From a saved
   custom card, one click replaces the title and all cards with the four sample
   cards. There is no confirmation or undo. The button remains available after
   work has begun.

5. **A newly returned purchase token may not be verified or unlocked.** With a
   fresh cached verdict for an older token, loading `?license=NEW` stores and
   strips `NEW` but makes zero verify calls and continues showing “Buy one-time
   unlock.” A new purchase can therefore remain locked for up to 24 hours.

6. **The purchase dialog has an axe serious contrast failure.** Its Terms link
   renders browser-default blue `#0000ee` on `#1b2237`, measured at 1.67:1
   rather than the required 4.5:1.

7. **The displayed six-character “join code” cannot be used.** Projection
   opens and the full fragment URL can be shared, but the product has no join
   control and the random code is not mapped to the deck. The brief's
   no-account join-code capability is therefore not implemented; the code is a
   label only.

8. **Valid but malformed local data bricks the app without recovery.** Setting
   `ccw:workshop:v1` to the valid JSON value `{}` and loading the page leaves
   only the skip link visible and emits `TypeError: Cannot read properties of
   undefined (reading '0')`. The user is not told how to clear or repair it.

### Moderate / minor

9. Mobile interactive targets below 44px include the 20px-high timer range,
   33px-high Clear action, 40px role selector, 43px text inputs, 40px brand,
   and 15px footer links. The dialog close control is only 25px wide.

10. At a 390px viewport with root text enlarged to 200%, document width grows
    to 478px, producing horizontal overflow rather than clean reflow.

11. Axe reports two moderate `landmark-complementary-is-top-level` violations
    for the nested composer asides.

12. Lighthouse reports a browser console/network error because
    `/favicon.ico` returns 404. This violates the factory's no-console-error
    completion gate even though Playwright's console listener did not surface
    that browser-level request error.

13. Hashed JS/CSS assets are served with
    `Cache-Control: public, must-revalidate, max-age=30`, not long-lived
    immutable caching. Responses also omit Content-Security-Policy and
    Permissions-Policy. HSTS, `nosniff`, and a strict-origin referrer policy are
    present.

14. `README.md` directs readers to `.factory/brief.json`, but that file is also
    absent from the candidate.

## Required first-read test

**Pass.** On a cold 1440x900 live load, the first screen answers all three
questions in plain language:

- What it does: turns lecture material into scenario, evidence, decision, and
  consequence cards for a discussion/debrief.
- For whom: instructors facilitating a 15-minute group reasoning exercise,
  without student accounts or scoring.
- What to click first: “Start a card set.”

The adjacent “Use the sample” button is a one-click sample-data demo and loads
four representative cards. Initial navigation returned 200, and the basic
Playwright cold-load listener found no script/page errors.

## Clean checkout gates

Commands were run from the initially clean candidate checkout:

```text
npm ci                         PASS (60 packages, 0 vulnerabilities)
npm test                       PASS
  Vitest                       2/2 tests
  Playwright                   1/1 test
npm run build                  PASS (strict tsc + Vite production build)
lint                           NOT AVAILABLE (no lint script/config)
```

`dist/` was produced. Production assets:

- initial JS: 15,473 bytes raw / 6.06 kB gzip (budget 200 kB)
- CSS: 8,998 bytes raw / 2.84 kB gzip (budget 50 kB)
- hero WebP: 36,650 bytes (budget 300 kB)
- fonts: none
- complete `dist/`: 64,937 bytes

## End-to-end and boundary evidence

- Authoring a card, changing its role, persisting across reload, selecting a
  card with Enter, deleting/clearing, and changing the 5–30 minute range with
  arrow keys work when interactions are performed around the rerender defect.
- The sample loads exactly four cards covering all four roles.
- Empty print and projection actions give specific recovery alerts.
- Clear supports cancel and confirm; cancel retained four cards and confirm
  returned to zero.
- Print produced one printable card with an accessible document title and
  literal escaped user content. Projection produced the same deck and a clean
  projection view. HTML/script-shaped input remained text in composer, print,
  and projection views; no injected image/script was created.
- Workshop data persisted locally across reload. A normal cold load made no
  third-party requests. Invalid license restore was the only explicit outbound
  request and went to the stated Sociobot verify endpoint with matching CORS
  origin and `Cache-Control: no-store`; the UI recovered with a quiet invalid
  notice.
- The privacy and terms pages return 200 and accurately disclose local storage,
  projection-link contents, billing verification, merchant of record, refund
  revocation, and instructor responsibility.

## Accessibility, responsive behavior, and offline

- Factory `verify-url.sh`: PASS; HTTP 200, title present, `lang="en"`, exactly
  one h1, main landmark, no missing image alt, no unlabeled buttons, and no
  captured page/console errors in that script.
- Axe on the empty main page, sample main page, projection, privacy, and terms:
  zero serious/critical findings. Axe on the open purchase dialog: one serious
  contrast violation described above.
- 390x844 layout has no horizontal overflow at normal text size; body text is
  16px; reduced motion resolves card transition duration to `0s`; no page or
  script errors appeared. Focus indicators are 3px cyan outlines and are
  visible. Native dialog focus begins on Close, is trapped by the browser, and
  Escape closes it.
- Service worker installation and control succeeded. After loading and saving
  the sample, forced offline reload restored all four cards and the saved title
  with no errors. Cache `concept-card-workshop-v1` was active.

## Live identity, performance, and policy evidence

Fresh local build and live files have identical SHA-256 hashes:

```text
index.html                 8b777df0516e21a8d0f615ea6e0848579593b2bfceb50b4251b1a03335b74e94
assets/index-Z_2PkPtm.js   cc69437dcbd57a82916e44be0f0a780f60e18a4137c98d40e0a6799a5f6dc315
assets/index-fYzqw0aE.css  2cffc7e64e525ae0dcbcbd9ec37b3bd06653c13567dfb3aa6b91fdce724bc764
tabletop.webp               c49ac515ceb244ff6db788be72b9867d833a6fda18036749bb633cc9d5061d89
sw.js                       6043f7a14b44aeaee1b8492a7478fdc9d3d46fee529a5b640cd32ad9526901d3
```

Mobile Lighthouse against the live URL:

- Performance 97, Accessibility 100, Best Practices 96, SEO 91
- FCP 0.8s, LCP 1.1s, TBT 190ms, max potential FID 150ms, CLS 0
- Total transfer 48 KiB
- Favicon 404 is the recorded console error; meta description is absent

The Sociobot verify endpoint was burst-tested with 120 concurrent invalid-token
requests. It accepted 30 with 200 and throttled 90 with 429; throttled responses
included `Retry-After: 4`. Because requests were concurrent, response ordering
does not establish a meaningful sequential request number, but the observed
allowance was 30 in that burst.

## Acceptance areas not applicable

- No sign-in is present, so Entra authority checks are not applicable.
- This is not a library/CLI or backend, so consumer-package, persistence-server,
  concurrency, and health/build-identity checks are not applicable.

## Release recommendation

Do not release this candidate. Add and pass `.factory/claims.json`; enable and
verify checkout; preserve focus and the next interaction instead of replacing
the application DOM on form change/timer ticks; protect existing work before
loading the sample; verify every newly received token independent of an older
cached verdict; fix the dialog contrast/touch targets; validate and recover
stored data; and either implement a usable join mechanism or remove the
misleading join-code claim. Then rerun this full verification.
