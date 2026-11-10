/* cards.js - card data, deck creation, round resolution (pure logic, no DOM) */
(function (root) {
  const ELEMENTS = {
    rock:     { name: 'Rock',     beats: 'scissors', color: '#9299A5' },
    paper:    { name: 'Paper',    beats: 'rock',     color: '#4B9CD3' },
    scissors: { name: 'Scissors', beats: 'paper',    color: '#C75C5C' }
  };
  const TYPES = Object.keys(ELEMENTS);
  let uid = 0;

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function createCard() {
    return { id: ++uid, type: TYPES[randInt(0, 2)], value: randInt(1, 9) };
  }
  function createHand(n) {
    return Array.from({ length: n }, createCard);
  }

  /* Returns 'player', 'bot' or 'draw' */
  function resolveRound(p, b) {
    if (p.type !== b.type) return ELEMENTS[p.type].beats === b.type ? 'player' : 'bot';
    if (p.value === b.value) return 'draw';
    return p.value > b.value ? 'player' : 'bot';
  }

  const ICONS = {
    rock: '<svg viewBox="0 0 64 64"><path d="M10 44l6-20 14-12 18 6 8 18-6 16-24 4z" fill="currentColor" opacity=".9"/><path d="M16 24l14 8 18-14M30 32l-4 20M30 32l24 4" stroke="#101522" stroke-width="2" fill="none" opacity=".55"/></svg>',
    paper: '<svg viewBox="0 0 64 64"><path d="M16 8h24l12 12v36H16z" fill="currentColor" opacity=".9"/><path d="M40 8v12h12" fill="#101522" opacity=".35"/><path d="M24 30h20M24 38h20M24 46h13" stroke="#101522" stroke-width="3" opacity=".55"/></svg>',
    scissors: '<svg viewBox="0 0 64 64"><circle cx="18" cy="48" r="8" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="46" cy="48" r="8" fill="none" stroke="currentColor" stroke-width="5"/><path d="M23 41L46 8l4 3-22 34zM41 41L18 8l-4 3 22 34z" fill="currentColor"/></svg>'
  };

  const api = { ELEMENTS, TYPES, ICONS, createCard, createHand, resolveRound };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Cards = api;
})(typeof window !== 'undefined' ? window : globalThis);
