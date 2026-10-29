// /arcelemzes — AI arcelemző. MediaPipe Face Landmarker (helyben hosztolva: /vendor/mediapipe, /assets/models).
// ADATVÉDELEM: a fotó és az arcpontok KIZÁRÓLAG a böngészőben léteznek — nincs feltöltés, nincs tárolás.
// A mérésből semmi nem megy analitikába; a dataLayer csak a választott zónák kulcsát és az ajánlott Protocolt kapja.
import { FaceLandmarker, FilesetResolver } from '/vendor/mediapipe/vision_bundle.mjs';
import { ZONES, PROTOS, VIDEOS, recommend, measure, videosFor } from '/js/arcelemzes-rules.js';

const root = document.getElementById('arcelemzo');
if (root) init();

function init(){
  const $ = (s) => root.querySelector(s);
  const steps = root.querySelectorAll('.fa-step');
  const consent = $('#fa-consent'), btnCam = $('#fa-cam'), btnUpload = $('#fa-upload'), fileIn = $('#fa-file');
  const video = $('#fa-video'), btnShot = $('#fa-shot'), camStatus = $('#fa-cam-status');
  const map = $('#fa-map'), canvas = $('#fa-canvas'), mapStatus = $('#fa-map-status'), chipsBox = $('#fa-chips'), btnResult = $('#fa-to-result');

  let landmarker = null, loading = null, stream = null, selected = new Set();

  const track = (name, data) => {
    if (typeof window.tubEvent === 'function') window.tubEvent(name, data);
    else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event:name }, data));
  };
  const show = (n) => steps.forEach((s) => s.classList.toggle('active', s.dataset.step === String(n)));
  const setStatus = (el, msg, err) => { el.textContent = msg || ''; el.classList.toggle('err', !!err); };

  function loadModel(){
    if (!loading) loading = (async () => {
      const files = await FilesetResolver.forVisionTasks('/vendor/mediapipe/wasm');
      landmarker = await FaceLandmarker.createFromOptions(files, {
        baseOptions:{ modelAssetPath:'/assets/models/face_landmarker.task', delegate:'GPU' },
        runningMode:'IMAGE', numFaces:1
      });
      return landmarker;
    })();
    return loading;
  }

  // 1 · Hozzájárulás
  consent.addEventListener('change', () => {
    btnCam.disabled = btnUpload.disabled = !consent.checked;
    if (consent.checked) loadModel().catch(() => {}); // előtöltés a hozzájárulás után, hogy gyors legyen
  });

  // 2a · Kamera
  btnCam.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { fileIn.click(); return; }
    const iv = $('#fa-intro-video'); if (iv) iv.pause();
    show(2); setStatus(camStatus, 'Kamera indítása…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ ideal:1280 }, height:{ ideal:960 } }, audio:false });
      video.srcObject = stream; await video.play();
      btnShot.disabled = false; setStatus(camStatus, '');
      track('arcelemzes_start', { method:'camera' });
    } catch (e) {
      setStatus(camStatus, 'A kamerához nem kaptunk hozzáférést. Tölts fel inkább egy fotót.', true);
    }
  });
  btnShot.addEventListener('click', () => {
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    const ctx = c.getContext('2d');
    ctx.translate(c.width, 0); ctx.scale(-1, 1); // tükrözve, ahogy a felhasználó látta
    ctx.drawImage(video, 0, 0);
    stopCam(); analyse(c);
  });
  $('#fa-cam-back').addEventListener('click', () => { stopCam(); show(1); });
  function stopCam(){ if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } video.srcObject = null; btnShot.disabled = true; }

  // 2b · Fotó feltöltése
  btnUpload.addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', () => {
    const f = fileIn.files && fileIn.files[0]; fileIn.value = '';
    if (!f) return;
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); track('arcelemzes_start', { method:'upload' }); analyse(img); };
    img.onerror = () => { URL.revokeObjectURL(url); show(3); setStatus(mapStatus, 'Ezt a képet nem tudtuk megnyitni. Próbáld JPG vagy PNG fotóval.', true); };
    img.src = url;
  });

  // 3 · Elemzés + arctérkép
  async function analyse(source){
    show(3); clearMap(); setStatus(mapStatus, 'Arcpontok felismerése az eszközödön…');
    const W0 = source.naturalWidth || source.width, H0 = source.naturalHeight || source.height;
    const k = Math.min(1, 1080 / Math.max(W0, H0));
    canvas.width = Math.round(W0 * k); canvas.height = Math.round(H0 * k);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    let res;
    try { await loadModel(); res = landmarker.detect(canvas); }
    catch (e) {
      // Tartalék: ha az arcpont-felismerés nem indul el (régi böngésző, tiltott WebAssembly), a fotó és a zónalista akkor is működik
      renderHotspots(null);
      setStatus(mapStatus, 'Az automatikus arcpont-felismerés ezen a böngészőn nem indult el, de a zónákat itt is kiválaszthatod.');
      track('arcelemzes_fallback', { reason: 'model' });
      return;
    }
    let lm = res && res.faceLandmarks && res.faceLandmarks[0];
    if (!lm) { clearMap(); setStatus(mapStatus, 'Nem találtunk arcot a képen. Jó fényben, szemből készült, szemüveg nélküli fotóval próbáld újra.', true); return; }

    // Kivágás az arcra (3:4), hogy a térkép az arcot mutassa, ne az egész képet — majd újra-felismerés a kivágáson
    const xs = lm.map((p) => p.x * canvas.width), ys = lm.map((p) => p.y * canvas.height);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const ch = Math.min(canvas.height, Math.max(Math.max(...ys) - Math.min(...ys), (Math.max(...xs) - Math.min(...xs)) * 4 / 3) * 1.55), cw = Math.min(canvas.width, ch * 3 / 4);
    const sx = Math.max(0, Math.min(canvas.width - cw, cx - cw / 2)), sy = Math.max(0, Math.min(canvas.height - ch, cy - ch * .52));
    const crop = document.createElement('canvas'), ck = Math.min(4, 900 / ch);
    crop.width = Math.round(cw * ck); crop.height = Math.round(ch * ck);
    crop.getContext('2d').drawImage(canvas, sx, sy, cw, ch, 0, 0, crop.width, crop.height);
    canvas.width = crop.width; canvas.height = crop.height; ctx.drawImage(crop, 0, 0);
    crop.width = crop.height = 0;
    const res2 = landmarker.detect(canvas);
    if (res2 && res2.faceLandmarks && res2.faceLandmarks[0]) lm = res2.faceLandmarks[0];

    drawMesh(ctx, lm, canvas.width, canvas.height);
    const m = measure(lm, canvas.width, canvas.height);
    renderNotes(m);
    renderHotspots(lm);
    setStatus(mapStatus, m.frontal ? 'Kész. Koppints azokra a pontokra, amelyek zavarnak — többet is választhatsz.' : 'Kész — a fejed kissé oldalra fordult, ezért az arányok pontatlanabbak. Koppints a zavaró pontokra.');
  }

  function drawMesh(ctx, lm, W, H){
    const line = (set, style, w) => {
      ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath();
      for (const c of set) { const a = lm[c.start], b = lm[c.end]; ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); }
      ctx.stroke();
    };
    const s = Math.max(W, H) / 1080;
    line(FaceLandmarker.FACE_LANDMARKS_TESSELATION, 'rgba(212,176,119,.28)', .6 * s);
    line(FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, 'rgba(212,176,119,.9)', 1.6 * s);
  }

  function renderNotes(m){
    $('#fa-n-thirds').textContent = '1 : ' + m.thirds.toFixed(2).replace('.', ',');
  }

  function renderHotspots(lm){
    if (lm) for (const [key, z] of Object.entries(ZONES)) {
      for (const i of z.pts) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'fa-hot'; b.dataset.zone = key;
        b.style.left = (lm[i].x * 100) + '%'; b.style.top = (lm[i].y * 100) + '%';
        b.setAttribute('aria-label', z.label); b.title = z.label;
        b.addEventListener('click', () => toggle(key));
        map.appendChild(b);
      }
    }
    chipsBox.innerHTML = '';
    for (const [key, z] of Object.entries(ZONES)) {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'fa-chip'; c.dataset.zone = key; c.textContent = z.label;
      c.addEventListener('click', () => toggle(key));
      chipsBox.appendChild(c);
    }
    sync();
    root.querySelector('.fa-analysis').hidden = false;
  }

  function toggle(key){ selected.has(key) ? selected.delete(key) : selected.add(key); sync(); }
  function sync(){
    root.querySelectorAll('[data-zone]').forEach((el) => el.setAttribute('aria-pressed', selected.has(el.dataset.zone) ? 'true' : 'false'));
    btnResult.disabled = selected.size === 0;
  }

  function clearMap(){
    map.querySelectorAll('.fa-hot').forEach((b) => b.remove());
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.height = 0;
    chipsBox.innerHTML = ''; selected = new Set();
    root.querySelector('.fa-analysis').hidden = true; btnResult.disabled = true;
  }

  // 4 · Ajánlás
  btnResult.addEventListener('click', () => {
    const best = recommend(selected);
    const r = PROTOS[best];
    $('#fa-r-title').textContent = r.title;
    $('#fa-r-proto').textContent = r.proto;
    $('#fa-r-sub').textContent = r.sub;
    ['#fa-r1', '#fa-r2', '#fa-r3'].forEach((id, i) => { $(id).textContent = r.r[i]; });
    const ul = $('#fa-r-zones'); ul.innerHTML = '';
    selected.forEach((k) => { const li = document.createElement('li'); li.textContent = ZONES[k].label; ul.appendChild(li); });
    renderVideos(videosFor([...selected]));
    $('#fa-r-more').href = r.href;
    $('#fa-r-cta').href = consultUrl(best);
    show(4);
    track('arcelemzes_complete', { zones: Array.from(selected).join(','), zone_count: selected.size, result: best });
    root.scrollIntoView({ behavior:'smooth', block:'start' });
  });
  $('#fa-r-cta').addEventListener('click', () => track('arcelemzes_cta', { result: $('#fa-r-cta').dataset.result || '' }));

  // Heni szakmai videói a megjelölt zónákhoz — csak koppintásra töltődnek (preload=none), egyszerre egy szól
  function renderVideos(ids){
    const grid = $('#fa-r-vgrid'); grid.innerHTML = '';
    for (const id of ids) {
      const v = VIDEOS[id]; if (!v) continue;
      const fig = document.createElement('figure'), vid = document.createElement('video'), cap = document.createElement('figcaption');
      vid.controls = true; vid.playsInline = true; vid.preload = 'none'; vid.poster = v.poster; vid.src = v.src; vid.dataset.clip = id;
      cap.textContent = v.title;
      fig.append(vid, cap); grid.appendChild(fig);
    }
    $('#fa-r-videos').hidden = !grid.children.length;
  }
  const played = new Set();
  root.addEventListener('play', (e) => {
    const v = e.target; if (!(v instanceof HTMLVideoElement)) return;
    root.querySelectorAll('video').forEach((o) => { if (o !== v && !o.paused && o.id !== 'fa-video') o.pause(); });
    if (v.dataset.clip && !played.has(v.dataset.clip)) { played.add(v.dataset.clip); track('arcelemzes_video_play', { clip: v.dataset.clip }); }
  }, true);

  // A hirdetési UTM-paraméterek továbbvitele a konzultáció-foglalásra (kampány-attribúció)
  function consultUrl(result){
    const out = new URLSearchParams(), inp = new URLSearchParams(location.search);
    inp.forEach((v, k) => { if (/^(utm_|fbclid$|gclid$|ttclid$)/.test(k)) out.set(k, v); });
    out.set('forras', 'arcelemzes'); out.set('protocol', result);
    $('#fa-r-cta').dataset.result = result;
    return '/konzultacio?' + out.toString();
  }

  // Törlés / újrakezdés — a fotó minden nyoma eltűnik a memóriából
  root.querySelectorAll('[data-fa-restart]').forEach((b) => b.addEventListener('click', () => { stopCam(); clearMap(); setStatus(mapStatus, ''); show(1); }));
  window.addEventListener('pagehide', stopCam);
}
