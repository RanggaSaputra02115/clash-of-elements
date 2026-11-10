/* bot.js - opponent. Picks uniformly at random from its own remaining cards.
   It never receives the player's card or hand, so it cannot cheat. */
(function (root) {
  function pick(hand) {
    if (!hand.length) return null;
    return hand[Math.floor(Math.random() * hand.length)];
  }
  const api = { pick };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Bot = api;
})(typeof window !== 'undefined' ? window : globalThis);
