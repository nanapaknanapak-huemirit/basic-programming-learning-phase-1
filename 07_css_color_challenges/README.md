# CSS Color Challenges 🎨

Progressive CSS challenges to learn through colors: 12 exercises across 3 levels, plus a separate 20-shape code-matching activity. The app includes a live editor, target previews, automatic checking, friendly feedback, and browser-based read-aloud support.

## Learning tools

- Save an optional first name for a personal greeting and encouragement.
- Clear the name at any time without changing challenge or Shape Match progress.
- Read the greeting or a challenge aloud with an English browser voice and adjustable volume.
- Get a colorful, encouraging explanation after an incorrect check, with technical details kept in a separate section.
- All personal data and progress stay in the browser's local storage.

## How to play

1. Pick a level (Basics → Intermediate → Applied).
2. Read the challenge and study the **Target** pane.
3. Edit **CSS** (and **JS** where needed); your preview updates live.
4. Press **Check solution** to validate your work.
5. Use **Read challenge aloud** whenever you want to hear the instructions.
6. Stuck? Use **Peek solution** (marked 👁); press Check to complete it.
7. Open **Shape Match** for 20 visual CSS matching activities.

## The 12 color challenges

| # | Level | Challenge | Skills |
|---|-------|-----------|--------|
| 1 | 1 · Basics | Color Naming | Named CSS colors |
| 2 | 1 · Basics | Hex Hunt | `#rrggbb` matching |
| 3 | 1 · Basics | RGB Mixer | `linear-gradient` + `rgb()` |
| 4 | 2 · Intermediate | Color Palette | CSS variables, warm hues |
| 5 | 2 · Intermediate | HSL Rainbow | `hsl()` hue sweep |
| 6 | 2 · Intermediate | Dark Mode Toggle | `:checked`, themes, WCAG |
| 7 | 2 · Intermediate | Accessible Contrast | WCAG AA (≥ 4.5:1) |
| 8 | 3 · Applied | Color Theory Quiz | Complementary / analogous / triads |
| 9 | 3 · Applied | Dynamic Palette Generator | JS → CSS variables |
| 10 | 3 · Applied | Traffic Light | CSS-only `@keyframes` |
| 11 | 3 · Applied | Mood Page | 4 themes via CSS variables |
| 12 | 3 · Applied | Color Blind Mode | Deuteranopia simulation |

## Shape Match

Shape Match is a bonus activity with 20 targets: circle, square, rounded square, pill, triangle, diamond, parallelogram, trapezoid, hexagon, octagon, star, heart, crescent, ring, half-circle, cross, arrow, speech bubble, chevron, and blob.

Each round shows a visual target and four CSS snippets. Choose the snippet that creates the target. Shape Match has its own progress counter and local storage, so the original 12-challenge progress remains unchanged.

## Local development

No build step is required. Serve this folder and open `index.html`:

```bash
python3 -m http.server --directory . 8000
```

Then visit `http://localhost:8000/`.

### Tests

```bash
node --test tests/*.test.js
```

The tests cover color utilities, challenge/checker wiring, profiles, audio voice selection, friendly messages, the 20-shape data set, and the Shape Match flow (answering, advancing, wrapping, reset, and localStorage progress). A browser harness at `tests/browser-harness.html` checks the official color challenge solutions in a real browser.

## Project structure

```
07_css_color_challenges/
├── index.html
├── styles.css
├── js/
│   ├── color-utils.js
│   ├── challenges.js
│   ├── checkers.js
│   ├── editor.js
│   ├── profile.js
│   ├── audio.js
│   ├── learning-layer.js
│   ├── shape-challenges.js
│   ├── shape-match.js
│   └── app.js
├── tests/
│   ├── audio.test.js
│   ├── challenges.test.js
│   ├── color-utils.test.js
│   ├── learning-layer.test.js
│   ├── profile.test.js
│   ├── shape-challenges.test.js
│   └── shape-match.test.js
├── qrcode.svg
└── README.md
```

## Technologies

- HTML5, CSS3, and JavaScript
- Browser Web Speech API for optional English read-aloud
- Browser `localStorage` for progress and the optional name
- `node --test` for unit tests

## Checking

Color challenge checkers inspect the live preview iframe, source rules, color math, WCAG contrast, and interactions where needed. Shape Match validates the selected snippet against its local shape definition. Passing a color challenge marks it complete and triggers a confetti celebration.

## License

MIT
