import './style.css';
import { blankWorkshop, exampleWorkshop, isWorkshop, roles, type Card, type Role, type Workshop } from './types';

const REAL_KEY = 'ccw:workshop:v1';
const DEMO_KEY = 'demo:ccw:workshop:v1';
const LICENSE_KEY = 'sb_license:concept-card-workshop';
const VERDICT_KEY = 'sb_license_verdict:concept-card-workshop';
const BILLING_ORIGIN = 'https://api.sociobot.in';
const PRODUCT_SLUG = 'concept-card-workshop';
const app = document.querySelector<HTMLDivElement>('#app')!;
const demoMode = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const storageKey = demoMode ? DEMO_KEY : REAL_KEY;

const q = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const esc = (value: string) => {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
};

let recoveryMessage = '';
let workshop = loadWorkshop();
let selected: string | null = workshop.cards[0]?.id ?? null;
let elapsed = 0;
let ticking: number | undefined;

function loadWorkshop(): Workshop {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return demoMode ? exampleWorkshop() : blankWorkshop();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isWorkshop(parsed)) return parsed;
  } catch {
    // The recovery notice below gives the instructor a safe next action.
  }
  recoveryMessage = 'Saved workshop data could not be read. It has not been changed.';
  return blankWorkshop();
}

function persist(message = 'Saved on this device') {
  if (recoveryMessage) {
    localStorage.removeItem(storageKey);
    recoveryMessage = '';
  }
  localStorage.setItem(storageKey, JSON.stringify(workshop));
  const status = q('#save-note');
  if (status) status.textContent = demoMode ? 'Demo change saved separately' : message;
}

function selectedCard() {
  return workshop.cards.find(card => card.id === selected);
}

function cardMarkup(card: Card, projection = false) {
  const role = roles[card.role];
  const selectable = projection ? '' : ` data-card="${esc(card.id)}" tabindex="0" role="button" aria-label="Edit ${esc(card.title || 'untitled')} ${role.label} card"`;
  return `<article class="concept-card ${card.role} ${!projection && selected === card.id ? 'selected' : ''}"${selectable}>
    <span class="role-mark" aria-hidden="true">${role.mark}</span>
    <p class="eyebrow" data-card-role>${role.label}</p>
    <h3 data-card-title>${esc(card.title || 'Untitled card')}</h3>
    <p data-card-body>${esc(card.body || role.prompt)}</p>
    ${projection ? '' : '<span class="edit-hint">Edit card</span>'}
  </article>`;
}

function emptyMarkup() {
  return `<section class="empty" aria-label="Empty workshop">
    <span aria-hidden="true">▣</span>
    <h2>Build the first reasoning round</h2>
    <p>Add a scenario, then layer evidence, a decision, and a consequence. The cards stay in this browser.</p>
    <button class="primary" data-action="add" data-role="scenario">Add a scenario card</button>
    <a class="quiet linkbutton" href="/demo">Try it with sample data</a>
  </section>`;
}

function demoBanner() {
  if (!demoMode) return '';
  return `<section class="demo-banner" aria-label="Demo status"><p><strong>Demo — sample data, nothing is saved.</strong> Changes stay in separate demo storage.</p><div><button class="quiet" data-action="reset-demo">Reset demo</button><a class="primary linkbutton" href="/">Start for real</a></div></section>`;
}

function recoveryBanner() {
  if (!recoveryMessage) return '';
  return `<section class="recovery-banner" role="alert"><p><strong>Saved workshop needs recovery.</strong> ${esc(recoveryMessage)}</p><button class="quiet" data-action="discard-recovery">Remove unreadable saved data</button></section>`;
}

function render(focusId?: string) {
  const card = selectedCard();
  const empty = workshop.cards.length === 0;
  document.title = demoMode ? 'Demo — Concept Card Workshop' : 'Concept Card Workshop — make discussion cards';
  q<HTMLLinkElement>('link[rel="canonical"]')!.href = `${location.origin}${demoMode ? '/demo' : '/'}`;
  app.innerHTML = `
    <header class="top">
      <a class="brand" href="/" aria-label="Concept Card Workshop home"><span aria-hidden="true">▦</span> CONCEPT CARD<br><b>WORKSHOP</b></a>
      <nav aria-label="Product"><a href="/demo">Demo</a><a href="#how">How it works</a><button class="quiet" data-action="join">Join projection</button><button class="quiet" data-action="project">Project cards</button></nav>
    </header>
    <main id="main">
      ${demoBanner()}${recoveryBanner()}
      <section class="hero"><div>
        <p class="kicker">Discussion card builder</p>
        <h1>Make discussion cards after a lecture</h1>
        <p class="lede">For instructors running small-group reasoning practice. Start a card set or try a complete sample.</p>
        <div class="hero-actions"><button class="primary" data-action="add" data-role="scenario">${empty ? 'Start a card set' : 'Add a card'}</button><a class="quiet linkbutton" href="/demo">Try it with sample data</a></div>
        <p class="first-action">Start adds a scenario card. The sample opens separately.</p>
        <ul class="plain-facts"><li>One card set is free.</li><li>Cards stay in this browser.</li><li>Works offline after the first visit.</li></ul>
      </div><figure><img src="/tabletop.webp" width="960" height="640" fetchpriority="high" decoding="async" alt="Pixel-art tabletop with four colourful stacks of discussion cards and a timer"><figcaption>Original AI-generated illustration · cards are blank until you write them.</figcaption></figure></section>
      <section class="workbench" aria-label="Workshop composer">
        <div class="setup"><p class="eyebrow">Set up</p><label>Workshop title<input id="workshop-title" value="${esc(workshop.title)}" maxlength="80"></label><label>Discussion time <output id="minutes-value">${workshop.minutes} minutes</output><input id="minutes" type="range" min="5" max="30" step="5" value="${workshop.minutes}" aria-label="Discussion time in minutes"></label><div class="role-guide">${(Object.keys(roles) as Role[]).map(role => `<button class="role-key ${role}" data-action="add" data-role="${role}"><span>${roles[role].mark}</span><b>${roles[role].label}</b><small>${roles[role].prompt}</small></button>`).join('')}</div><button class="danger-link" data-action="clear">Clear this set</button></div>
        <section class="canvas" aria-labelledby="card-set-heading"><div class="canvas-head"><div><p class="eyebrow">Card set · ${workshop.cards.length} ${workshop.cards.length === 1 ? 'card' : 'cards'}</p><h2 id="card-set-heading" class="workshop-title-display">${esc(workshop.title)}</h2></div><div class="canvas-actions"><div class="save-note" id="save-note" aria-live="polite">${demoMode ? 'Demo sample loaded' : 'Saved on this device'}</div><button class="quiet" data-action="print">Print cards</button></div></div><div class="card-grid">${empty ? emptyMarkup() : workshop.cards.map(card => cardMarkup(card)).join('')}</div></section>
        <div class="editor">${card ? `<p class="eyebrow" id="editor-role">Editing ${roles[card.role].label}</p><label>Card role<select id="card-role">${(Object.keys(roles) as Role[]).map(role => `<option value="${role}" ${role === card.role ? 'selected' : ''}>${roles[role].mark} ${roles[role].label}</option>`).join('')}</select></label><label>Short title<input id="card-title" value="${esc(card.title)}" maxlength="60"></label><label>Discussion prompt<textarea id="card-body" rows="7" maxlength="480">${esc(card.body)}</textarea></label><p class="editor-tip">Ask for a choice and the evidence behind it. Keep one idea per card.</p><button class="danger" data-action="delete" data-id="${esc(card.id)}">Remove this card</button>` : `<p class="eyebrow">Card editor</p><p class="editor-placeholder">Select a card to revise it. Your materials never leave this device.</p>`}</div>
      </section>
      <section class="run-strip" id="how" aria-labelledby="run-heading"><div><p class="eyebrow">Facilitator clock</p><h2 id="run-heading" class="visually-hidden">Run the discussion</h2><output class="timer" id="timer" aria-live="off">${clock()}</output><p id="timer-status">${timerStatus()}</p></div><div class="timer-actions"><button class="primary" data-action="timer" id="timer-toggle">${ticking ? 'Pause clock' : elapsed ? 'Resume clock' : 'Start round'}</button><button class="quiet" data-action="reset">Reset clock</button></div><ol><li>Deal one scenario and evidence card.</li><li>Groups make a decision and defend it.</li><li>Use a consequence card to debrief.</li></ol></section>
      <section class="share-grid"><article><p class="eyebrow">Optional projection</p><h2>Show the cards on a shared screen</h2><p>Open a no-account projection. Share its join code or link. The card set is stored in the code, not on a server.</p><button class="primary" data-action="project">Open projection view</button><button class="quiet" data-action="join">Join a projection</button></article><article><p class="eyebrow">Free and paid tools</p><h2>Print, time, project, and keep one card set free</h2><p>A one-time $12 Offline Pack Templates unlock adds downloadable blank pack templates. Your cards, printing, and accessibility tools remain free.</p><button class="quiet" data-action="license">See Offline Pack Templates</button></article></section>
    </main>
    <footer><span>Discussion cards for instructor-led reasoning.</span><span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · Built by Param Factory · v1.1</span></footer>`;
  bind();
  if (focusId) requestAnimationFrame(() => q<HTMLElement>(focusId)?.focus());
}

function bind() {
  q<HTMLInputElement>('#workshop-title')?.addEventListener('input', event => {
    workshop.title = (event.target as HTMLInputElement).value || 'Untitled workshop';
    document.querySelectorAll('.workshop-title-display').forEach(node => { node.textContent = workshop.title; });
  });
  q<HTMLInputElement>('#workshop-title')?.addEventListener('change', () => persist());
  q<HTMLInputElement>('#minutes')?.addEventListener('input', event => { workshop.minutes = Number((event.target as HTMLInputElement).value); q('#minutes-value')!.textContent = `${workshop.minutes} minutes`; elapsed = 0; updateTimer(); });
  q<HTMLInputElement>('#minutes')?.addEventListener('change', () => persist());
  q<HTMLSelectElement>('#card-role')?.addEventListener('change', event => { const card = selectedCard(); if (!card) return; card.role = (event.target as HTMLSelectElement).value as Role; persist(); render('#card-role'); });
  for (const [id, key] of [['#card-title', 'title'], ['#card-body', 'body']] as const) {
    q<HTMLInputElement | HTMLTextAreaElement>(id)?.addEventListener('input', event => { const card = selectedCard(); if (!card) return; card[key] = (event.target as HTMLInputElement).value; const element = q<HTMLElement>(`[data-card="${CSS.escape(card.id)}"] [data-card-${key}]`); if (element) element.textContent = card[key] || (key === 'title' ? 'Untitled card' : roles[card.role].prompt); });
    q<HTMLInputElement | HTMLTextAreaElement>(id)?.addEventListener('change', () => persist());
  }
  document.querySelectorAll<HTMLElement>('[data-card]').forEach(element => { const selectCard = () => { selected = element.dataset.card!; render('#card-title'); }; element.addEventListener('click', selectCard); element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCard(); } }); });
  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => act(button.dataset.action!, button.dataset)));
}

function act(action: string, data: DOMStringMap) {
  if (action === 'add') { const role = data.role as Role; const card: Card = { id: uid(), role, title: '', body: roles[role].prompt }; workshop.cards.push(card); selected = card.id; persist(); render('#card-title'); return; }
  if (action === 'delete' && data.id) { workshop.cards = workshop.cards.filter(card => card.id !== data.id); selected = workshop.cards[0]?.id ?? null; persist(); render(selected ? '#card-title' : '.canvas'); return; }
  if (action === 'clear') { if (!workshop.cards.length || confirm(`Clear all ${workshop.cards.length} cards? This cannot be undone.`)) { workshop = blankWorkshop(); selected = null; elapsed = 0; persist(); render('.canvas'); } return; }
  if (action === 'reset-demo') { workshop = exampleWorkshop(); selected = workshop.cards[0].id; elapsed = 0; persist('Demo reset'); render('#card-title'); return; }
  if (action === 'discard-recovery') { localStorage.removeItem(storageKey); recoveryMessage = ''; workshop = blankWorkshop(); selected = null; render('.canvas'); return; }
  if (action === 'timer') { toggleTimer(); return; }
  if (action === 'reset') { elapsed = 0; stopTimer(); updateTimer(); return; }
  if (action === 'print') { printCards(); return; }
  if (action === 'project') { openProjector(); return; }
  if (action === 'join') { joinDialog(); return; }
  if (action === 'license') licenseDialog();
}

function clock() { const left = Math.max(0, workshop.minutes * 60 - elapsed); return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`; }
function timerStatus() { return ticking ? 'Round is running.' : elapsed ? 'Clock paused.' : `Set for ${workshop.minutes} minutes.`; }
function updateTimer() { const timer = q('#timer'); const status = q('#timer-status'); const toggle = q<HTMLButtonElement>('#timer-toggle'); if (timer) timer.textContent = clock(); if (status) status.textContent = timerStatus(); if (toggle) toggle.textContent = ticking ? 'Pause clock' : elapsed ? 'Resume clock' : 'Start round'; }
function toggleTimer() { if (ticking) { stopTimer(); updateTimer(); return; } ticking = window.setInterval(() => { elapsed += 1; if (elapsed >= workshop.minutes * 60) { stopTimer(); alert('Round complete. Bring the room back for the debrief.'); } updateTimer(); }, 1000); updateTimer(); }
function stopTimer() { if (ticking) window.clearInterval(ticking); ticking = undefined; }

function printCards() {
  if (!workshop.cards.length) { alert('Add at least one card before printing.'); return; }
  const printWindow = window.open('', '_blank');
  if (!printWindow) { alert('Your browser blocked the print window. Allow pop-ups and try again.'); return; }
  printWindow.document.write(`<!doctype html><html lang="en"><title>${esc(workshop.title)} cards</title><style>body{font-family:Arial,sans-serif;color:#171b2a;margin:20px}h1{font-size:22px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.card{border:2px solid #171b2a;padding:14px;min-height:180px;break-inside:avoid}.scenario{border-top:10px solid #29aebb}.evidence{border-top:10px solid #299c68}.decision{border-top:10px solid #cc9217}.consequence{border-top:10px solid #ce5748}small{text-transform:uppercase;font-weight:bold}@media print{body{margin:10mm}.card{min-height:72mm}}</style><h1>${esc(workshop.title)}</h1><p>Facilitator copy. Deal, discuss, defend, and debrief.</p><div class="grid">${workshop.cards.map(card => `<section class="card ${card.role}"><small>${roles[card.role].label}</small><h2>${esc(card.title || 'Untitled card')}</h2><p>${esc(card.body)}</p></section>`).join('')}</div><script>window.onload=()=>window.print()<\/script></html>`);
  printWindow.document.close();
}

function toBase64Url(value: string) { const bytes = new TextEncoder().encode(value); let binary = ''; bytes.forEach(byte => { binary += String.fromCharCode(byte); }); return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }
function fromBase64Url(value: string) { const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4); const binary = atob(padded); return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0))); }
function makeJoinCode(source: Workshop) { return `CCW1.${toBase64Url(JSON.stringify(source))}`; }
function decodeJoinCode(code: string): Workshop | null { if (!code.startsWith('CCW1.')) return null; try { const value: unknown = JSON.parse(fromBase64Url(code.slice(5))); return isWorkshop(value) ? value : null; } catch { return null; } }
function projectUrl(code: string) { return `${location.origin}/project?join=${encodeURIComponent(code)}`; }
function openProjector() { if (!workshop.cards.length) { alert('Add cards before opening a projection view.'); return; } window.open(projectUrl(makeJoinCode(workshop)), '_blank', 'noopener'); }

function joinDialog() {
  let dialog = q<HTMLDialogElement>('#join-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog'); dialog.id = 'join-dialog';
    dialog.innerHTML = `<form method="dialog"><button class="close" aria-label="Close">×</button><p class="eyebrow">Join projection</p><h2>Open shared discussion cards</h2><p>Paste the full join code or projection link from the facilitator. It contains the card set and does not need an account.</p><label>Join code or link<input id="join-input" autocomplete="off"></label><button class="primary" value="default" data-join-submit>Open projection</button><p id="join-status" aria-live="polite"></p></form>`;
    document.body.append(dialog);
    dialog.querySelector('[data-join-submit]')?.addEventListener('click', event => { event.preventDefault(); const supplied = q<HTMLInputElement>('#join-input', dialog!)?.value.trim() || ''; let code = supplied; try { if (/^https?:\/\//i.test(supplied)) code = new URL(supplied).searchParams.get('join') || ''; } catch { /* Use the typed code below. */ } if (!decodeJoinCode(code)) { q('#join-status', dialog!)!.textContent = 'That join code could not be read. Paste the complete code or link.'; return; } location.assign(`/project?join=${encodeURIComponent(code)}`); });
  }
  dialog.showModal();
}

function copyText(value: string, status: Element | null) { void navigator.clipboard?.writeText(value).then(() => { if (status) status.textContent = 'Copied.'; }).catch(() => { if (status) status.textContent = 'Copy the code from the field.'; }); }

function renderProjection() {
  const code = new URLSearchParams(location.search).get('join') || '';
  const deck = decodeJoinCode(code);
  document.title = 'Projection — Concept Card Workshop';
  q<HTMLLinkElement>('link[rel="canonical"]')!.href = `${location.origin}/project`;
  if (!deck) { app.innerHTML = `<main id="main" class="projection error-page"><p class="kicker">Projection unavailable</p><h1>Open a complete projection code</h1><p>The link is missing its cards or has been changed. Ask the facilitator for the complete join code.</p><a class="primary linkbutton" href="/">Return to the workshop</a></main>`; return; }
  workshop = deck; selected = null;
  app.innerHTML = `<header class="top"><a class="brand" href="/" aria-label="Concept Card Workshop home"><span aria-hidden="true">▦</span> CONCEPT CARD<br><b>WORKSHOP</b></a><nav aria-label="Product"><a href="/">Create cards</a></nav></header><main id="main" class="projection"><p class="kicker">CONCEPT CARD WORKSHOP · NO-ACCOUNT PROJECTION</p><h1>${esc(workshop.title)}</h1><p class="projection-lede">Deal a card. Name the evidence. Defend a decision.</p><div class="projection-cards">${workshop.cards.map(card => cardMarkup(card, true)).join('')}</div><section class="join-code" aria-labelledby="join-code-heading"><h2 id="join-code-heading">Join code</h2><p>Share this complete code or the page link. It contains the cards and is not stored on a server.</p><label>Projection join code<input id="projection-code" readonly value="${esc(code)}"></label><button class="quiet" id="copy-code">Copy join code</button><p id="copy-status" aria-live="polite"></p></section></main><footer><span>Discussion cards for instructor-led reasoning.</span><span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · Built by Param Factory · v1.1</span></footer>`;
  q('#copy-code')?.addEventListener('click', () => copyText(code, q('#copy-status')));
}

type LicenseVerdict = { token?: string; valid?: boolean; checked?: number; reason?: string };
function cachedVerdict(): LicenseVerdict | null { try { const parsed: unknown = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null'); return parsed && typeof parsed === 'object' ? parsed as LicenseVerdict : null; } catch { return null; } }
function unlocked() { const verdict = cachedVerdict(); return verdict?.valid === true && verdict.token === localStorage.getItem(LICENSE_KEY); }

function licenseDialog() {
  let dialog = q<HTMLDialogElement>('#license-dialog');
  if (!dialog) { dialog = document.createElement('dialog'); dialog.id = 'license-dialog'; document.body.append(dialog); }
  const pack = unlocked() ? '<button class="primary" value="default" data-pack>Download blank field pack</button>' : `<a class="primary linkbutton" href="${BILLING_ORIGIN}/api/v1/products/${PRODUCT_SLUG}/checkout">Buy one-time unlock</a>`;
  dialog.innerHTML = `<form method="dialog"><button class="close" aria-label="Close">×</button><p class="eyebrow">Offline Pack Templates</p><h2>Print-ready field kits for $12, once</h2><p>Get blank facilitation-pack layouts for offline professional training. Your free card set, printing, accessibility, and export remain available without it.</p>${pack}<label>Have a license? Paste it<input id="license-input" autocomplete="off"></label><button class="quiet" value="default" data-restore>Restore license</button><p id="license-status" aria-live="polite"></p><small>Sociobot / Dodo is merchant of record. Refunds revoke the unlock. <a href="/terms/">Terms</a></small></form>`;
  dialog.querySelector('[data-restore]')?.addEventListener('click', event => { event.preventDefault(); const token = q<HTMLInputElement>('#license-input', dialog!)?.value.trim(); if (!token) { q('#license-status', dialog!)!.textContent = 'Paste your license token first.'; return; } localStorage.setItem(LICENSE_KEY, token); localStorage.removeItem(VERDICT_KEY); q('#license-status', dialog!)!.textContent = 'License saved. Checking it now…'; void verifyLicense(token); });
  dialog.querySelector('[data-pack]')?.addEventListener('click', event => { event.preventDefault(); offlinePack(); });
  dialog.showModal();
}

function offlinePack() {
  const printWindow = window.open('', '_blank'); if (!printWindow) return;
  printWindow.document.write(`<!doctype html><html lang="en"><title>Blank facilitation field pack</title><style>body{font-family:Arial,sans-serif;margin:12mm;color:#171b2a}h1{font-size:22px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9mm}.card{min-height:78mm;border:2px solid #171b2a;padding:8mm}.scenario{border-top:9px solid #29aebb}.evidence{border-top:9px solid #299c68}.decision{border-top:9px solid #cc9217}.consequence{border-top:9px solid #ce5748}small{font-weight:bold;text-transform:uppercase}@media print{body{margin:8mm}}</style><h1>Blank facilitation field pack</h1><p>Write one idea per card. Deal, discuss, defend, and debrief.</p><div class="grid">${(['scenario', 'evidence', 'decision', 'consequence'] as Role[]).flatMap(role => Array.from({ length: 3 }, () => `<section class="card ${role}"><small>${roles[role].label}</small><h2>________________</h2><p>____________________________________________________</p><p>____________________________________________________</p></section>`)).join('')}</div><script>window.onload=()=>window.print()<\/script></html>`);
  printWindow.document.close();
}

async function verifyLicense(token: string) {
  try {
    const response = await fetch(`${BILLING_ORIGIN}/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    const answer = await response.json() as { valid?: boolean; reason?: string };
    const verdict: LicenseVerdict = { token, valid: answer.valid === true, reason: answer.reason, checked: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    const status = q('#license-status');
    if (status) status.textContent = verdict.valid ? 'Offline Pack Templates unlocked.' : 'License is not active. You can still use every free workshop tool.';
  } catch { /* Offline use remains available; cached access is not removed. */ }
}

function checkLicense() {
  const params = new URLSearchParams(location.search); const returnedToken = params.get('license');
  if (returnedToken) { localStorage.setItem(LICENSE_KEY, returnedToken); localStorage.removeItem(VERDICT_KEY); params.delete('license'); history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`); }
  const stored = localStorage.getItem(LICENSE_KEY); const verdict = cachedVerdict(); const stale = !verdict?.checked || Date.now() - verdict.checked > 86_400_000;
  if (stored && (returnedToken !== null || verdict?.token !== stored || stale)) void verifyLicense(stored);
}

if (location.pathname === '/project') renderProjection(); else { checkLicense(); render(); }
if ('serviceWorker' in navigator) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
