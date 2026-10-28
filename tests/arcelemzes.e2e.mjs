// Az arcelemző böngészős (end-to-end) tesztje valódi fotókkal — futtatás: node tests/arcelemzes.e2e.mjs
// Kell hozzá Playwright + Chromium (a felhőkörnyezetben előtelepítve; helyben: npm i -D playwright && npx playwright install chromium).
// A tesztfotók a repó saját, már publikus csapatfotói; a változatokat (tükrözött, forgatott, kicsi) a böngésző állítja elő.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import('playwright').catch(() => import('/opt/node-tools/node_modules/playwright/index.mjs'));

// ── mini statikus szerver (a cleanUrls-t is utánozza: /arcelemzes → arcelemzes.html)
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.mp4':'video/mp4' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(ROOT, p);
  if (!path.extname(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = 'http://localhost:' + server.address().port;

const results = []; let failed = 0;
const check = (name, ok, info = '') => { results.push({ name, ok, info }); if (!ok) failed++; console.log((ok ? '  ✓ ' : '  ✗ ') + name + (info ? '  — ' + info : '')); };

const browser = await chromium.launch({ args:['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });

async function freshPage(query = ''){
  const page = await browser.newPage({ viewport:{ width:390, height:860 } });
  page.external = new Set(); page.errors = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (u.origin !== BASE && u.protocol.startsWith('http')) page.external.add(u.host); });
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(BASE + '/arcelemzes' + query);
  return page;
}

// Kép betöltése a fájl-inputba, opcionális átalakítással (a böngésző canvasán)
async function upload(page, src, transform = 'none'){
  await page.evaluate(async ({ src, transform }) => {
    const img = new Image(); img.src = src; await img.decode();
    let w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'), x = c.getContext('2d');
    if (transform === 'rotate90') { c.width = h; c.height = w; x.translate(h, 0); x.rotate(Math.PI / 2); x.drawImage(img, 0, 0); }
    else if (transform === 'small') { c.width = 160; c.height = Math.round(160 * h / w); x.drawImage(img, 0, 0, c.width, c.height); }
    else { c.width = w; c.height = h; if (transform === 'mirror') { x.translate(w, 0); x.scale(-1, 1); } x.drawImage(img, 0, 0); }
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', .92));
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'teszt.jpg', { type:'image/jpeg' }));
    const input = document.getElementById('fa-file'); input.files = dt.files; input.dispatchEvent(new Event('change'));
  }, { src, transform });
  await page.waitForFunction(() => { const s = document.getElementById('fa-map-status').textContent; return s && !s.includes('felismerése'); }, null, { timeout:90000 });
  return page.evaluate(() => ({
    status: document.getElementById('fa-map-status').textContent,
    error: document.getElementById('fa-map-status').classList.contains('err'),
    hot: [...document.querySelectorAll('.fa-hot')].map((b) => [parseFloat(b.style.left), parseFloat(b.style.top), b.dataset.zone]),
    thirds: parseFloat(document.getElementById('fa-n-thirds').textContent.replace(',', '.').split(':')[1]),
    canvas: [document.getElementById('fa-canvas').width, document.getElementById('fa-canvas').height]
  }));
}
const consent = (page) => page.check('#fa-consent');

try {
  console.log('\n1 · Hozzájárulás, adatvédelem');
  { const p = await freshPage();
    check('a gombok le vannak tiltva hozzájárulás előtt', await p.isDisabled('#fa-cam') && await p.isDisabled('#fa-upload'));
    const before = await p.evaluate(() => performance.getEntriesByType('resource').some((r) => r.name.includes('face_landmarker')));
    check('a modell NEM töltődik le hozzájárulás előtt', !before);
    await consent(p);
    check('hozzájárulás után a gombok aktívak', !(await p.isDisabled('#fa-cam')) && !(await p.isDisabled('#fa-upload')));
    await p.close(); }

  console.log('\n2 · Arcfelismerés valódi fotókon');
  const FACES = ['/assets/images/team/heni-portrait.jpg', '/assets/images/team/doctor-portrait.jpg', '/assets/images/team/colleague-portrait.jpg', '/assets/images/heni-founder.jpg'];
  const base = {};
  for (const src of FACES) {
    const p = await freshPage(); await consent(p);
    const r = await upload(p, src); base[src] = r;
    const inside = r.hot.every(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100);
    check(path.basename(src) + ': arc felismerve, 13 pont a képen belül', !r.error && r.hot.length === 13 && inside, `archarmadok 1:${r.thirds}`);
    check(path.basename(src) + ': az arányok életszerű tartományban', r.thirds > .7 && r.thirds < 1.4);
    // anatómiai sorrend: homlok a szem fölött, szem az orr-száj redő fölött, az áll legalul
    const y = (z) => Math.min(...r.hot.filter((h) => h[2] === z).map((h) => h[1]));
    const yMax = (z) => Math.max(...r.hot.filter((h) => h[2] === z).map((h) => h[1]));
    check(path.basename(src) + ': a zónák anatómiai sorrendben (homlok → szem → orr-száj → áll)', yMax('homlok') < y('szemkornyek') && yMax('szemkornyek') < y('nasolabialis') && yMax('nasolabialis') < yMax('allkapocs'));
    p.errors.length && check(path.basename(src) + ': nincs JS-hiba', false, p.errors.join(' | '));
    await p.close();
  }

  console.log('\n3 · Mérés stabilitása');
  for (const src of FACES) {
    const a = base[src];
    for (const t of ['mirror', 'small']) {
      if (t === 'small') continue; // a 160 px-es változatot a 4. blokk nézi
      const p = await freshPage(); await consent(p); const m = await upload(p, src, t); await p.close();
      const dT = Math.abs(m.thirds - a.thirds) / a.thirds;
      check(path.basename(src) + ': tükrözve ugyanaz az archarmad-arány (±6%)', !m.error && dT < .06, `${a.thirds} → ${m.thirds} (${(dT * 100).toFixed(1)}%)`);
    }
  }
  check('a felületen nincs szimmetria-% és ajakarány (instabil mérés, kivezetve)', !fs.readFileSync(path.join(ROOT, 'arcelemzes.html'), 'utf8').match(/fa-n-sym|fa-n-lips/));

  { const p = await freshPage(); await consent(p); await upload(p, FACES[0]);
    await p.click('.fa-chip[data-zone="szemkornyek"]'); await p.click('#fa-to-result');
    const ids = await p.evaluate(() => [...document.querySelectorAll('#fa-r-vgrid video')].map((v) => v.dataset.clip));
    const pre = await p.evaluate(() => [...document.querySelectorAll('video[data-clip]')].every((v) => v.preload === 'none'));
    check('szemkörnyék → 2 szemkörnyéki videó, egyik sem töltődik előre', ids.join() === 'szembor,vitaran' && pre, ids.join());
    await p.close(); }

  console.log('\n4 · Rossz bemenetek');
  { const p = await freshPage(); await consent(p); const r = await upload(p, '/assets/images/clinic/waiting-room-1.jpg'); await p.close();
    check('arc nélküli kép (váróterem) → „nem találtunk arcot”, nincs ajánlás', r.error && r.hot.length === 0 && /Nem találtunk arcot/.test(r.status)); }
  { const p = await freshPage(); await consent(p); const r = await upload(p, FACES[0], 'rotate90'); await p.close();
    check('90°-ban elforgatott kép → nem omlik össze, érthető üzenet', typeof r.status === 'string' && r.status.length > 0, r.error ? 'nincs arc (elfogadható)' : 'arc felismerve'); }
  { const p = await freshPage(); await consent(p); const r = await upload(p, FACES[0], 'small'); await p.close();
    check('nagyon kicsi (160 px) kép → nem omlik össze', typeof r.status === 'string' && r.status.length > 0, r.error ? 'nincs arc' : `arc felismerve, vászon ${r.canvas.join('×')}`); }
  { const p = await freshPage(); await consent(p); const r = await upload(p, '/assets/images/team/team-together.jpg'); await p.close();
    check('csoportkép → egyetlen arcot elemez, nem keveri az arcokat', r.error || r.hot.length === 13, r.error ? 'nincs elég nagy arc' : '1 arc'); }
  { const p = await freshPage(); await consent(p);
    await p.click('#fa-cam'); await p.waitForTimeout(1200); await p.click('#fa-shot');
    await p.waitForFunction(() => document.getElementById('fa-map-status').classList.contains('err') || document.querySelector('.fa-hot'), null, { timeout:60000 });
    const live = await p.evaluate(() => [...document.querySelectorAll('video')].some((v) => v.srcObject));
    check('kamera-ág: fotó után a kamera leáll, arc nélküli képre hibaüzenet', !live && await p.evaluate(() => document.getElementById('fa-map-status').classList.contains('err')));
    await p.close(); }

  console.log('\n5 · Ajánlás a felületen + hirdetésmérés');
  { const p = await freshPage('?utm_source=facebook&utm_campaign=arcelemzo_teszt&fbclid=ABC&email=x@y.hu'); await consent(p);
    await upload(p, FACES[0]);
    check('ajánlás gomb tiltva, amíg nincs kijelölt zóna', await p.isDisabled('#fa-to-result'));
    await p.click('.fa-hot[data-zone="glabella"]'); await p.click('.fa-chip[data-zone="homlok"]'); await p.click('.fa-chip[data-zone="ajkak"]');
    await p.click('#fa-to-result');
    const title = await p.textContent('#fa-r-title'), href = await p.getAttribute('#fa-r-cta', 'href');
    check('szemöldökköz + homlok + ajkak → Anti-aging Komplex', title === 'Anti-aging Komplex', title);
    const q = new URL(href, BASE).searchParams;
    check('UTM + fbclid továbbmegy a konzultációra, más paraméter (e-mail) NEM', q.get('utm_source') === 'facebook' && q.get('utm_campaign') === 'arcelemzo_teszt' && q.get('fbclid') === 'ABC' && !q.has('email') && q.get('protocol') === 'anti', href);
    const ev = await p.evaluate(() => dataLayer.filter((e) => /^arcelemzes/.test(e.event)));
    const keys = new Set(ev.flatMap((e) => Object.keys(e)));
    check('mérési események: start + complete, csak zóna-kulcs és Protocol (nincs mért arány)', ev.map((e) => e.event).join() === 'arcelemzes_start,arcelemzes_complete' && ![...keys].some((k) => /sym|third|lip|landmark|image/i.test(k)), [...keys].join(','));
    const vids = await p.evaluate(() => [...document.querySelectorAll('#fa-r-vgrid video')].map((v) => v.getAttribute('src')));
    const okV = await Promise.all(vids.map((u) => fetch(BASE + u).then((r) => r.ok && r.headers.get('content-type') === 'video/mp4')));
    check('eredménynél megjelenik a zónához illő Heni-videó (ajkak/homlok → bevezető), a fájl elérhető', vids.length >= 1 && okV.every(Boolean), vids.join(', '));
    await p.click('[data-fa-restart] >> nth=1');
    check('„Fotó törlése” után a vászon üres, és vissza az elejére', await p.evaluate(() => document.getElementById('fa-canvas').width === 0 && document.querySelector('.fa-step.active').dataset.step === '1'));
    const ext = [...p.external].filter((h) => !/fonts\.(googleapis|gstatic)\.com/.test(h));
    check('a fotó / elemzés miatt nincs külső hálózati kérés (csak Google Fonts)', ext.length === 0, ext.join(', ') || 'ok');
    await p.close(); }
} finally {
  await browser.close(); server.close();
}
console.log(`\n${results.length - failed}/${results.length} ellenőrzés sikeres`);
fs.writeFileSync(path.join(ROOT, 'tests', 'arcelemzes-e2e-eredmeny.json'), JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
process.exit(failed ? 1 : 0);
