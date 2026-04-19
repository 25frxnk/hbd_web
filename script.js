/* ── CANDLES (original warm palette) ── */
const CC = [
  { b: '#F1DFA3', d: '#CDB872', fl: '#A4935A' },
  { b: '#F6C8CC', d: '#EF8F9B', fl: '#E7486A' },
  { b: '#3a3a36', d: '#BABEB5', fl: '#9BA3A8' },
  { b: '#2e2e2a', d: '#CAB6B1', fl: '#AF8D84' },
  { b: '#F1DFA3', d: '#A4935A', fl: '#807245' },
];

const WISHES = [
  'ขอให้มีสุขภาพแข็งแรง',
  'ขอให้ประสบความสำเร็จ',
  'ขอให้มีความสุขทุกวัน',
  'ขอให้ได้ทำในสิ่งที่รัก',
  'ขอให้ทุกอย่างดีขึ้น',
];

let blown = 0;

function buildCandles() {
  const row = document.getElementById('candles-row');
  CC.forEach((c, i) => {
    const w = document.createElement('div');
    w.className = 'c-wrap';
    w.onclick = () => blowCandle(i);
    w.innerHTML = `
      <div class="fl" id="fl${i}">
        <svg width="20" height="30" viewBox="0 0 20 30">
          <ellipse cx="10" cy="21" rx="7" ry="7" fill="#F1DFA3" opacity=".35"/>
          <path d="M10 2C10 2 17 11 16 18C15 23 5 23 4 18C3 11 10 2 10 2Z" fill="${c.fl}"/>
          <path d="M10 7C10 7 14 12 13.5 17C13 20 7 20 6.5 17C6 12 10 7 10 7Z" fill="#F1DFA3"/>
        </svg>
      </div>
      <div class="c-body" style="background:${c.b};border:.5px solid ${c.d}">
        <div class="c-stripe" style="top:13px"></div>
        <div class="c-stripe" style="top:28px"></div>
        <div class="c-stripe" style="top:43px"></div>
      </div>`;
    row.appendChild(w);
  });
}

function blowCandle(i) {
  const fl = document.getElementById('fl' + i);
  if (fl.classList.contains('out')) return;
  fl.classList.add('out');
  blown++;
  const m = document.getElementById('wish-msg');
  m.style.opacity = '0';
  setTimeout(() => {
    m.textContent = blown < 5 ? WISHES[blown - 1] : 'ขอให้ทุกคำอธิษฐานเป็นจริงนะ';
    m.style.opacity = '1';
    if (blown === 5) {
      shootConf('candle-conf', ['#F1DFA3', '#F6C8CC', '#CDB872', '#EF8F9B', '#CAB6B1']);
      setTimeout(showCard, 800);
    }
  }, 280);
}

function showCard() {
  const overlay = document.createElement('div');
  overlay.id = 'card-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 300;
    background: rgba(0,0,0,0.75);
    display: flex; align-items: center; justify-content: center;
  `;
  overlay.onclick = () => overlay.remove();

  const img = document.createElement('img');
  img.src = 'access/card.png';
  img.style.cssText = `
    max-width: 88vw; max-height: 88vh;
    border-radius: 12px;
    transform: scale(0) rotate(-8deg);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  `;

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.style.transform = 'scale(1) rotate(0deg)';
    });
  });
}

/* ── FILM STRIP ── */
const FRAMES = Array.from({ length: 98 }, (_, i) => ({
  src: `access/${i + 1}.jpg`,
  cap: `photo ${String(i + 1).padStart(2, '0')}`,
}));

const FRAME_W = window.innerWidth <= 600 ? 300 : window.innerWidth <= 900 ? 360 : 420;
const TOTAL_FRAMES = 98;
let filmOffset = 0;
let filmPlaying = false;
let filmRAF = null;
let filmSpeed = 2;
let filmDir = 1;

function buildFilm() {
  const track = document.getElementById('film-track');
  FRAMES.forEach((f, i) => {
    const holes = Array(7).fill(0).map(() => `<div class="hole"></div>`).join('');
    const frame = document.createElement('div');
    frame.className = 'film-frame';
    frame.id = `frame-${i}`;
    frame.innerHTML = `
      <div class="sprockets">${holes}</div>
      <div class="frame-photo" style="background:#1a1a18">
        <img
          data-src="${f.src}"
          alt="photo ${i + 1}"
          style="width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0"
          onerror="this.style.display='none'"
        />
        <div class="frame-caption">${f.cap}</div>
        <div class="frame-num">${String(i + 1).padStart(2, '0')}</div>
      </div>
      <div class="sprockets">${holes}</div>`;
    track.appendChild(frame);
  });
}

function lazyLoadFilm() {
  const stage = document.getElementById('film-stage');
  const viewStart = filmOffset - FRAME_W * 2;
  const viewEnd = filmOffset + stage.clientWidth + FRAME_W * 2;
  document.querySelectorAll('.film-frame').forEach((fr, i) => {
    const frameStart = i * FRAME_W;
    if (frameStart >= viewStart && frameStart <= viewEnd) {
      const img = fr.querySelector('img[data-src]');
      if (img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    }
  });
}

function updateFilmTransform() {
  const track = document.getElementById('film-track');
  const stage = document.getElementById('film-stage');
  const maxOffset = TOTAL_FRAMES * FRAME_W - stage.clientWidth;
  filmOffset = Math.max(0, Math.min(maxOffset, filmOffset));
  track.style.transform = `translateX(-${filmOffset}px)`;
  const pct = filmOffset / maxOffset;
  document.getElementById('progress-fill').style.width = (pct * 100) + '%';
  const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(filmOffset / FRAME_W));
  document.getElementById('frame-counter').textContent =
    String(frameIdx + 1).padStart(2, '0') + ' / ' + TOTAL_FRAMES;
  const stageCx = filmOffset + stage.clientWidth / 2;
  document.querySelectorAll('.film-frame').forEach((fr, i) => {
    const cx = i * FRAME_W + FRAME_W / 2;
    fr.classList.toggle('center-frame', Math.abs(cx - stageCx) < FRAME_W / 2);
  });
  lazyLoadFilm();
}

function filmLoop() {
  if (!filmPlaying) return;
  const maxOffset = TOTAL_FRAMES * FRAME_W - document.getElementById('film-stage').clientWidth;
  filmOffset += filmSpeed * filmDir;
  if (filmOffset >= maxOffset) { filmOffset = maxOffset; filmDir = -1; }
  if (filmOffset <= 0) { filmOffset = 0; filmDir = 1; }
  updateFilmTransform();
  filmRAF = requestAnimationFrame(filmLoop);
}

function togglePlay() {
  filmPlaying = !filmPlaying;
  const btn = document.getElementById('play-btn');
  const lbl = document.getElementById('play-label');
  const icon = document.getElementById('play-icon');
  if (filmPlaying) {
    btn.classList.add('playing');
    lbl.textContent = 'now playing';
    icon.innerHTML = `<div class="pause-bars"><div class="pause-bar"></div><div class="pause-bar"></div></div>`;
    icon.style.cssText = 'border:none;width:18px;height:20px;display:flex;align-items:center;justify-content:center;margin-left:0';
    filmRAF = requestAnimationFrame(filmLoop);
  } else {
    btn.classList.remove('playing');
    lbl.textContent = 'press play';
    icon.innerHTML = '';
    icon.style.cssText = 'width:0;height:0;border-style:solid;border-width:10px 0 10px 18px;border-color:transparent transparent transparent #CDB872;margin-left:4px';
    cancelAnimationFrame(filmRAF);
  }
}

function scrubFilm(e) {
  const wrap = document.getElementById('progress-wrap');
  const rect = wrap.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const maxOffset = TOTAL_FRAMES * FRAME_W - document.getElementById('film-stage').clientWidth;
  filmOffset = pct * maxOffset;
  updateFilmTransform();
}

/* ── POPUP MESSAGE ── */
function openMsg() {
  document.getElementById('popup-overlay').classList.add('open');
  setTimeout(() => {
    shootConf('popup-conf', ['#E50914', '#ffffff', '#b20710', '#ff6666', '#cc0000']);
    typePopupText();
  }, 400);
}

function typePopupText() {
  const body = document.querySelector('.popup-body');
  const text = `สุขสันต์วันเกิดนะ\n\nขอบคุณที่เป็นส่วนหนึ่ง\nในชีวิตเสมอมา\n\nขอให้มีแต่สิ่งดีๆ\nรออยู่ข้างหน้าเสมอ ✦`;
  body.innerHTML = '';
  let i = 0;
  const interval = setInterval(() => {
    if (i >= text.length) { clearInterval(interval); return; }
    const ch = text[i];
    body.innerHTML += ch === '\n' ? '<br>' : ch;
    i++;
  }, 40);
}

function closeMsg() {
  document.getElementById('popup-overlay').classList.remove('open');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMsg();
});

/* ── CONFETTI ── */
function shootConf(id, colors) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'conf-p';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: 0;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      background: ${colors[i % colors.length]};
      animation-delay: ${Math.random() * .8}s;
      animation-duration: ${1.6 + Math.random() * .8}s;
    `;
    wrap.appendChild(p);
    setTimeout(() => p.remove(), 3200);
  }
}

/* ── POLAROID WALL ── */
function buildPolaroid() {
  const wall = document.getElementById('polaroid-wall');
  const total = 98;
  const count = 18;

  const indices = [];
  while (indices.length < count) {
    const n = Math.floor(Math.random() * total) + 1;
    if (!indices.includes(n)) indices.push(n);
  }

  indices.forEach((n) => {
    const rot = (Math.random() * 14 - 7).toFixed(1);
    const div = document.createElement('div');
    div.className = 'polaroid';
    div.style.transform = `rotate(${rot}deg)`;
    div.innerHTML = `
      <img data-src="access/${n}.jpg" alt="photo ${n}"
           onerror="this.parentElement.style.display='none'"/>
      <div class="polaroid-label">${String(n).padStart(2, '0')}</div>
    `;
    div.onclick = () => showCardFromPolaroid(`access/${n}.jpg`);
    wall.appendChild(div);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target.querySelector('img[data-src]');
        if (img) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('.polaroid').forEach(p => observer.observe(p));
}

function showCardFromPolaroid(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 300;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
  `;
  overlay.onclick = () => overlay.remove();

  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = `
    max-width: 88vw; max-height: 88vh;
    border-radius: 4px;
    transform: scale(0.85);
    opacity: 0;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  `;
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.style.transform = 'scale(1)';
      img.style.opacity = '1';
    });
  });
}

/* ── INIT ── */
buildCandles();
buildFilm();
setTimeout(updateFilmTransform, 100);
buildPolaroid();

/* touch scrub support */
const progWrap = document.getElementById('progress-wrap');
if (progWrap) {
  progWrap.addEventListener('touchstart', scrubFilm, { passive: true });
  progWrap.addEventListener('touchmove', scrubFilm, { passive: true });
}

/* recompute on resize */
window.addEventListener('resize', () => {
  updateFilmTransform();
});

/* ── MUSIC ── */
let musicPlaying = false;

function toggleMusic() {
  const audio = document.getElementById('bgm');
  const btn   = document.getElementById('music-btn');

  if (musicPlaying) {
    audio.pause();
    btn.classList.remove('playing');
    musicPlaying = false;
  } else {
    audio.play().catch(() => {});
    btn.classList.add('playing');
    musicPlaying = true;
  }
}

/* ── VISIT COUNTER ── */
fetch('https://api.countapi.xyz/hit/25frxnk/hbd-web')
  .then(r => r.json())
  .then(data => {
    document.getElementById('visit-count').textContent = data.value.toLocaleString();
  })
  .catch(() => {
    document.getElementById('visit-count').textContent = '—';
  });