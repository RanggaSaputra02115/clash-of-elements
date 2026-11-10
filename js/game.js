/* game.js - state machine, rendering, input, audio */
(function () {
  const { ELEMENTS, ICONS, createHand, resolveRound } = Cards;
  const WIN_SCORE = 3, HAND_SIZE = 6;
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let S = null;       // game state
  let runId = 0;      // bumped on every new game so stale async rounds stop
  let soundOn = true;

  /* ---------- audio (synthesised, no external files) ---------- */
  let ac = null;
  function tone(freq, dur, type = 'sine', delay = 0, vol = 0.08) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
    } catch (e) { /* audio is optional */ }
  }
  const sfx = {
    select: () => tone(520, 0.1, 'triangle'),
    reveal: () => { tone(300, 0.12, 'square', 0, 0.04); tone(450, 0.15, 'triangle', 0.08); },
    win:    () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.12)),
    lose:   () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'sawtooth', i * 0.14, 0.05))
  };

  /* ---------- rendering ---------- */
  const faceHTML = (c, extra = '') =>
    `<div class="card ${c.type} ${extra}" style="--c:${ELEMENTS[c.type].color}">
       <span class="corner">${c.value}</span>
       <div class="icon">${ICONS[c.type]}</div>
       <span class="cname">${ELEMENTS[c.type].name}</span>
       <span class="val">${c.value}</span>
     </div>`;
  const backHTML = (extra = '') => `<div class="card back ${extra}"><span>&#10022;</span></div>`;

  function renderHand() {
    const hand = $('hand');
    hand.innerHTML = '';
    S.player.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cardbtn'; b.dataset.id = c.id;
      b.setAttribute('aria-label', `${ELEMENTS[c.type].name} ${c.value}, key ${i + 1}`);
      b.innerHTML = faceHTML(c);
      b.disabled = S.busy || S.over;
      b.addEventListener('click', () => playCard(c.id));
      hand.appendChild(b);
    });
  }
  function renderStatus() {
    $('roundInd').textContent = `Round ${Math.min(S.round, HAND_SIZE)}`;
    $('playerScore').textContent = S.ps; $('botScore').textContent = S.bs;
    $('playerCount').textContent = `${S.player.length} cards left`;
    $('botCount').textContent = `${S.bot.length} cards left`;
    ['player', 'bot'].forEach((w) => {
      const s = w === 'player' ? S.ps : S.bs;
      $(w + 'Pips').innerHTML = Array.from({ length: WIN_SCORE }, (_, i) => `<i class="${i < s ? 'on' : ''}"></i>`).join('');
    });
  }
  const setStatus = (t, cls = '') => { const e = $('status'); e.textContent = t; e.className = 'status ' + cls; };
  function bump(id) { const e = $(id); e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }

  /* ---------- game flow ---------- */
  function newGame() {
    runId++;
    S = { player: createHand(HAND_SIZE), bot: createHand(HAND_SIZE), ps: 0, bs: 0, round: 1, busy: false, over: false };
    $('slotPlayer').innerHTML = '<div class="empty">Your card</div>';
    $('slotBot').innerHTML = '<div class="empty">Bot card</div>';
    $('over').classList.add('hidden');
    setStatus('Choose a card to start round 1');
    renderStatus(); renderHand();
    if (window.Fx) { Fx.clear(); Fx.roundChange(); }
  }

  async function playCard(id) {
    if (!S || S.busy || S.over) return;           // guards double clicks / double scoring
    const i = S.player.findIndex((c) => c.id === id);
    if (i < 0) return;                            // card already used
    S.busy = true;
    const my = runId;
    const pCard = S.player.splice(i, 1)[0];
    sfx.select();
    $('slotBot').innerHTML = '<div class="empty">Bot card</div>';
    $('slotPlayer').innerHTML = backHTML('enter');
    renderStatus(); renderHand();
    setStatus('Bot is choosing...', 'thinking');

    await sleep(900); if (my !== runId) return;
    const bCard = Bot.pick(S.bot);
    S.bot.splice(S.bot.indexOf(bCard), 1);
    $('slotBot').innerHTML = backHTML('enter');
    renderStatus();
    await sleep(450); if (my !== runId) return;

    $('slotPlayer').innerHTML = faceHTML(pCard, 'reveal');
    $('slotBot').innerHTML = faceHTML(bCard, 'reveal');
    sfx.reveal();
    await sleep(800); if (my !== runId) return;

    const r = resolveRound(pCard, bCard);
    const [pe, be] = [$('slotPlayer').firstElementChild, $('slotBot').firstElementChild];
    if (r === 'player') { S.ps++; pe.classList.add('winner'); be.classList.add('loser'); setStatus('You win the round!', 'win'); bump('playerScore'); }
    else if (r === 'bot') { S.bs++; be.classList.add('winner'); pe.classList.add('loser'); setStatus('Bot wins the round.', 'lose'); bump('botScore'); }
    else setStatus('Draw. Both cards are spent.', 'draw');
    renderStatus();
    if (window.Fx) Fx.flash(r);

    await sleep(1500); if (my !== runId) return;
    if (S.ps >= WIN_SCORE || S.bs >= WIN_SCORE || S.player.length === 0) return endGame();
    S.round++; S.busy = false;
    setStatus(`Round ${S.round}: choose your next card`);
    renderStatus(); renderHand();
    if (window.Fx) Fx.roundChange();
  }

  function endGame() {
    S.over = true; S.busy = true;
    const res = S.ps > S.bs ? 'win' : S.ps < S.bs ? 'lose' : 'draw';
    $('overTitle').textContent = { win: 'VICTORY', lose: 'DEFEAT', draw: 'DRAW' }[res];
    $('overPanel').className = 'panel ' + res;
    $('overScore').textContent = `Final score  You ${S.ps} : ${S.bs} Bot`;
    $('over').classList.remove('hidden');
    if (window.Fx) Fx.burst(res);
    renderHand();
    if (res === 'win') sfx.win(); else if (res === 'lose') sfx.lose();
  }

  /* ---------- controls ---------- */
  $('playBtn').addEventListener('click', () => { $('menu').classList.add('hidden'); newGame(); });
  $('againBtn').addEventListener('click', newGame);
  $('restartBtn').addEventListener('click', () => { if (S) newGame(); });
  $('soundBtn').addEventListener('click', () => {
    soundOn = !soundOn; $('soundBtn').textContent = 'Sound: ' + (soundOn ? 'On' : 'Off');
  });
  document.addEventListener('keydown', (e) => {
    if (!S || S.busy || S.over || e.ctrlKey || e.metaKey) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= S.player.length) playCard(S.player[n - 1].id);
  });
})();
