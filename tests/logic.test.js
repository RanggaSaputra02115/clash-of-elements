/* Run: node tests/logic.test.js  (tests pure logic only, not the DOM) */
const assert = require('assert');
const C = require('../js/cards.js'), Bot = require('../js/bot.js');
let n = 0; const ok = (c, m) => { assert(c, m); n++; };

for (let g = 0; g < 2000; g++) {
  const h = C.createHand(6);
  ok(h.length === 6, 'hand has 6');
  ok(h.every(c => c.value >= 1 && c.value <= 9 && Number.isInteger(c.value) && C.TYPES.includes(c.type)), 'card range');
  ok(new Set(h.map(c => c.id)).size === 6, 'unique ids');
}
const mk = (type, value) => ({ type, value });
const exp = { 'rock,scissors': 'player', 'scissors,paper': 'player', 'paper,rock': 'player',
              'scissors,rock': 'bot', 'paper,scissors': 'bot', 'rock,paper': 'bot' };
for (const k in exp) { const [a, b] = k.split(','); ok(C.resolveRound(mk(a, 1), mk(b, 9)) === exp[k], k); }
ok(C.resolveRound(mk('rock', 7), mk('rock', 4)) === 'player', 'same type higher');
ok(C.resolveRound(mk('paper', 2), mk('paper', 8)) === 'bot', 'same type lower');
ok(C.resolveRound(mk('scissors', 5), mk('scissors', 5)) === 'draw', 'draw');

let wins = { player: 0, bot: 0, none: 0 };
for (let g = 0; g < 5000; g++) {
  const p = C.createHand(6), b = C.createHand(6); let ps = 0, bs = 0, rounds = 0; const used = new Set();
  while (ps < 3 && bs < 3 && p.length) {
    const pc = p.splice(Math.floor(Math.random() * p.length), 1)[0], bc = Bot.pick(b);
    ok(!used.has(bc.id), 'bot reused a card'); used.add(bc.id); b.splice(b.indexOf(bc), 1);
    const r = C.resolveRound(pc, bc); if (r === 'player') ps++; else if (r === 'bot') bs++; rounds++;
  }
  ok(ps <= 3 && bs <= 3 && rounds <= 6, 'game bounded');
  wins[ps > bs ? 'player' : bs > ps ? 'bot' : 'none']++;
}
ok(Bot.pick([]) === null, 'bot empty hand');
console.log(`${n} assertions passed`, wins);
