# Claude Concepts

A swipeable card app for AI and Claude fundamentals — 72 concepts across 6 categories
and 3 skill levels, with a study deck, five sandbox labs, and a quiz mode.

## Running it

```bash
bun run scripts/serve-concepts.ts     # http://localhost:3000
```

It is plain static files with no build step and no network calls, so opening
`docs/concepts/index.html` directly in a browser works too. Under GitHub Pages
(this repo serves `docs/`) it lives at `/concepts/`.

## Modes

| Mode | What it does |
| --- | --- |
| **Study** | A shuffled deck filtered by category and level. Swipe right for *got it*, left for *see it again*, tap to flip for the full explanation. Keyboard: `←` `→` to answer, `space` to flip, `S` to star, `U` to undo. |
| **Quiz me** | 5/10/20/all multiple-choice questions drawn from the same concepts, with immediate feedback and the reasoning behind each answer. Missed questions roll straight into a study deck. |
| **Sandbox** | Five interactive labs — tokenization, sampling, context budget, prompt anatomy, agent loop. Simulations, not model calls. |

Progress, starred cards, filters, and quiz bests persist in `localStorage`
under the `claude-concepts/v1` key. Getting a quiz question right marks the
concept mastered; getting it wrong marks it for review.

## Files

```
index.html     shell — topbar and script tags
styles.css     dark-first, follows prefers-color-scheme
concepts.js    the content: window.CATEGORIES, window.LEVELS, window.CONCEPTS
app.js         router, deck/swipe, quiz, and the five labs
```

Classic `<script>` tags rather than ES modules, so the app also runs from
`file://` where module imports would be blocked by CORS.

## Adding a concept

Append to `window.CONCEPTS` in `concepts.js`:

```js
{
  id: 'm13',                  // stable and unique — progress is keyed on it, never renumber
  cat: 'mechanics',           // one of window.CATEGORIES
  level: 2,                   // 1 beginner, 2 intermediate, 3 advanced
  term: 'Speculative Decoding',
  summary: 'One line, shown on the card front.',   // keep under ~110 chars
  body: 'Two to four sentences, shown when the card is flipped.',
  points: ['Two or three things', 'worth remembering.'],
  example: 'One concrete illustration.',
  quiz: {
    q: 'Question text',
    choices: ['A', 'B', 'C', 'D'],   // exactly four, all distinct
    a: 1,                            // index of the correct one
    why: 'Why that answer is right.',
  },
}
```

Choice order is shuffled at runtime, so the position of the correct answer in
the source array does not matter.
