/* fx.js - visual effects only (particles, rune ring, transitions). Contains no game logic;
   game.js calls these hooks and works the same if this file is missing. */
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- rune ring (generated SVG) ---------- */
  (function buildRing() {
    const svg = $('ringSvg'); if (!svg) return;
    const glyphs = ['M0-6V6M0-6L4-2M0 0L4 4', 'M-3-6V6M-3-6L3 0L-3 6', 'M0-6V6M-4-3L4 3M4-3L-4 3', 'M-3-6L3-6L-3 6L3 6', 'M0-6L4 0L0 6L-4 0Z', 'M-3-6V6M3-6V6M-3 0H3'];
    let g = '<circle r="97"/><circle r="94" stroke-dasharray="1 3" opacity=".7"/><circle r="64" opacity=".8"/><circle r="40" stroke-dasharray="6 4" opacity=".6"/>';
    g += '<polygon points="0,-64 55.4,32 -55.4,32" opacity=".45"/><polygon points="0,64 55.4,-32 -55.4,-32" opacity=".45"/>';
    let spin = '<circle r="82" opacity=".5"/>';
    for (let i = 0; i < 12; i++) spin += `<path transform="rotate(${i * 30}) translate(0 -76) scale(.8)" d="${glyphs[i % glyphs.length]}" stroke-width="1.2" opacity=".85"/>`;
    for (let i = 0; i < 60; i++) spin += `<path transform="rotate(${i * 6})" d="M0-97V-${i % 5 ? 94 : 90}" opacity=".6"/>`;
    svg.innerHTML = g + `<g class="spin">${spin}</g>`;
  })();

  /* ---------- particle layers ---------- */
  function Layer(id) {
    const c = $(id), x = c && c.getContext('2d'); const L = { c, x, ps: [], w: 0, h: 0 };
    L.size = () => { if (!c) return; const d = Math.min(window.devicePixelRatio || 1, 2); L.w = c.clientWidth; L.h = c.clientHeight; c.width = L.w * d; c.height = L.h * d; x.setTransform(d, 0, 0, d, 0, 0); };
    L.size(); return L;
  }
  const bg = Layer('fx'), top = Layer('fxTop');
  addEventListener('resize', () => { bg.size(); top.size(); });

  const seedBg = () => { bg.ps = Array.from({ length: bg.w < 500 ? 22 : 40 }, () => ({ x: rnd(0, bg.w), y: rnd(0, bg.h), vx: rnd(-.08, .08), vy: -rnd(.08, .3), r: rnd(.6, 1.8), t: rnd(0, 6.3), col: '214,173,99' })); };
  seedBg();

  function step(L, bgMode) {
    if (!L.c) return; const x = L.x; x.clearRect(0, 0, L.w, L.h);
    for (let i = L.ps.length - 1; i >= 0; i--) {
      const p = L.ps[i]; p.x += p.vx; p.y += p.vy; if (p.g) p.vy += p.g; p.t += .03;
      let a;
      if (bgMode) { if (p.y < -5) { p.y = L.h + 5; p.x = rnd(0, L.w); } a = .1 + .25 * (Math.sin(p.t) + 1) / 2; }
      else { p.life--; if (p.life <= 0) { L.ps.splice(i, 1); continue; } a = Math.min(1, p.life / 50) * p.a; }
      x.fillStyle = `rgba(${p.col},${a})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
    }
  }
  function loop() { if (!document.hidden) { step(bg, true); step(top, false); } requestAnimationFrame(loop); }
  if (reduce) step(bg, true); else requestAnimationFrame(loop);

  function emit(n, make) { for (let i = 0; i < n; i++) top.ps.push(make()); }
  function burst(res) {
    const over = $('over'); if (over) over.dataset.res = res;
    if (reduce || !top.c) return;
    if (res === 'win') {
      const shot = () => emit(70, () => { const a = rnd(0, 6.283), s = rnd(1, 4.2); return { x: top.w / 2, y: top.h * .38, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, g: .05, r: rnd(1, 2.8), t: 0, a: .9, life: rnd(90, 190), col: Math.random() < .3 ? '255,236,190' : '214,173,99' }; });
      shot(); setTimeout(shot, 650);
    } else if (res === 'lose') {
      emit(55, () => ({ x: rnd(0, top.w), y: top.h + 10, vx: rnd(-.2, .2), vy: -rnd(.4, 1.1), g: 0, r: rnd(1, 2.4), t: 0, a: .6, life: rnd(150, 260), col: '150,30,45' }));
    }
  }
  function clear() { top.ps.length = 0; const o = $('over'); if (o) delete o.dataset.res; if (top.x) top.x.clearRect(0, 0, top.w, top.h); }

  function flag(el, cls, ms) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
  window.Fx = {
    burst, clear,
    flash: (r) => flag($('ringBox'), r === 'player' ? 'win' : r === 'bot' ? 'lose' : 'draw', 1500),
    roundChange: () => { flag($('hand'), 'deal', 900); flag($('roundInd'), 'pulse', 800); flag($('field'), 'fresh', 700); }
  };
})();
