# Clash of Elements — A Strategic Card Battle
Browser card game (Rock Paper Scissors with card values). HTML5 + CSS3 + Vanilla JS, no libraries, no external assets.

## Run
- Locally: open `index.html` in a browser (no server needed).
- GitHub Pages: push the folder to a repo, then Settings > Pages > Deploy from branch (root). All paths are relative.

## Rules
Rock > Scissors > Paper > Rock. Same element: higher number wins; equal = draw (no point, both cards spent).
Each side gets 6 random cards (value 1-9). First to 3 points wins. If all 6 cards are played with nobody at 3 (possible with draws), the higher score wins, equal scores = draw.

## Controls
Mouse click, touch tap, or keyboard (keys 1-6 pick the nth remaining card; Tab + Enter/Space also works).

## Files
- `index.html` — page structure, menu and game-over overlays.
- `css/style.css` — theme, card design, responsive layout, animations.
- `js/cards.js` — element rules, random hand creation, round resolution (pure logic).
- `js/bot.js` — bot picks randomly from its own remaining cards; never sees the player's card.
- `js/game.js` — state, round flow, scoring, win check, rendering, input, synthesised sound.
- `tests/logic.test.js` — Node test of cards/bot logic (`node tests/logic.test.js`).
- `assets/` — empty; all visuals are inline SVG/CSS, audio is generated with WebAudio.

## Manual test checklist
1. Press PLAY: 6 cards each side, values 1-9, scores 0:0.
2. Click a card: it leaves your hand, "Bot is choosing...", then both reveal. Mash-click other cards during the round: ignored.
3. Check each result (type win, same-type value, draw) and that the score changes by at most 1 per round.
4. Reach 3 points: game-over panel with final score and PLAY AGAIN.
5. Restart mid-game and during a round: new hands, 0:0, no leftover round continues.
6. Resize to ~375px wide: cards in 3x2 grid, nothing overflows. Test touch on a phone.
7. Toggle Sound; refresh the page returns to the menu.

## Visual revision v2
Visual-only update: lattice/vignette background, rune arena ring behind VS, floating gold particles, ornamented player/bot panels, reveal shine, winner glow, round-change deal animation, gold/red victory/defeat screens. New file `js/fx.js` (effects only). Game logic files are unchanged. Effects respect `prefers-reduced-motion`.
