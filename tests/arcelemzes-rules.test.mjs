// Az arcelemző ajánlási szabályainak tesztje — futtatás: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZONES, PROTOS, TIE_ORDER, recommend, measure } from '../js/arcelemzes-rules.js';

const KEYS = Object.keys(ZONES);
const subsets = () => { const out = []; for (let m = 1; m < 1 << KEYS.length; m++) out.push(KEYS.filter((_, i) => m & (1 << i))); return out; };

// Az orvos által jóváhagyandó elvárt hozzárendelés — ha a szabály változik, ez a teszt bukik, amíg itt is át nem írják
const EXPECTED_SINGLE = {
  homlok:'anti', glabella:'anti', szemkornyek:'hialuron', kozeparc:'hialuron',
  nasolabialis:'hialuron', ajkak:'hialuron', allkapocs:'lifting', borminoseg:'borminoseg'
};

test('egyetlen zóna → a jóváhagyott Protocol', () => {
  assert.deepEqual(Object.keys(EXPECTED_SINGLE).sort(), [...KEYS].sort());
  for (const [z, p] of Object.entries(EXPECTED_SINGLE)) assert.equal(recommend([z]), p, z);
});

test('mind a 255 kombináció ad érvényes, létező Protocolt (oldallal, 3 fázissal)', () => {
  const all = subsets(); assert.equal(all.length, 255);
  for (const s of all) {
    const r = recommend(s);
    assert.ok(PROTOS[r], s.join('+') + ' → ' + r);
    assert.equal(PROTOS[r].r.length, 3);
    assert.match(PROTOS[r].href, /^\/[a-z0-9-]+$/);
  }
});

test('az ajánlás mindig a többség, döntetlennél a TIE_ORDER szerint', () => {
  for (const s of subsets()) {
    const votes = {}; s.forEach((k) => { votes[ZONES[k].proto] = (votes[ZONES[k].proto] || 0) + 1; });
    const max = Math.max(...Object.values(votes));
    const expected = TIE_ORDER.find((p) => votes[p] === max);
    assert.equal(recommend(s), expected, s.join('+'));
    assert.ok(s.some((k) => ZONES[k].proto === recommend(s)), 'az ajánlás csak megjelölt zónából jöhet');
  }
});

test('a sorrend és a duplikáció nem számít; üres / ismeretlen bemenet → null', () => {
  for (const s of subsets()) assert.equal(recommend([...s].reverse()), recommend(new Set(s)));
  assert.equal(recommend([]), null);
  assert.equal(recommend(['nincs-ilyen']), null);
});

test('minden Protocol elérhető valamelyik zónából, és minden oldal létezik a repóban', async () => {
  const fs = await import('node:fs');
  for (const p of TIE_ORDER) assert.ok(KEYS.some((k) => ZONES[k].proto === p), p);
  for (const [k, p] of Object.entries(PROTOS)) assert.ok(fs.existsSync(new URL('..' + p.href + '.html', import.meta.url)), k + ': ' + p.href);
});

test('zóna-arcpontok a 468-as hálón belül vannak', () => {
  for (const [k, z] of Object.entries(ZONES)) for (const i of z.pts) assert.ok(Number.isInteger(i) && i >= 0 && i < 468, k + ':' + i);
});

// measure(): szintetikus arcpontokon pontos archarmad-arány és frontális-felismerés
test('measure — archarmad-arány és szemből / oldalról felismerés', () => {
  const lm = Array.from({ length: 478 }, () => ({ x: .5, y: .5 }));
  const set = (i, x, y) => { lm[i] = { x, y }; };
  set(9, .5, .3); set(2, .5, .6); set(152, .5, .9); set(1, .5, .55); set(234, .2, .5); set(454, .8, .5);
  let m = measure(lm, 600, 800);
  assert.ok(Math.abs(m.thirds - 1) < 1e-9); assert.equal(m.frontal, true);
  set(152, .5, .96); assert.ok(Math.abs(measure(lm, 600, 800).thirds - 1.2) < 1e-9);
  set(1, .3, .55); assert.equal(measure(lm, 600, 800).frontal, false);
});
