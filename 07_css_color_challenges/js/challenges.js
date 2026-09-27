/**
 * Challenges — data for all 12 CSS Color Challenges.
 *
 * Each entry describes the UI metadata, the HTML scaffold shared by the
 * target and live-preview iframes, starter/solution code, and optional
 * quiz questions. Validation lives in checkers.js.
 *
 * Types:
 *   'css'  — CSS-only editor
 *   'js'   — CSS + JS editor
 *   'quiz' — built-in multiple-choice panel (no code editor)
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Challenges = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const LEVELS = [
        { id: 1, name: 'Basics', days: 'Days 1–3' },
        { id: 2, name: 'Intermediate', days: 'Days 4–7' },
        { id: 3, name: 'Applied', days: 'Days 8–12' }
    ];

    const BASE_SCAFFOLD_CSS = `
* { box-sizing: border-box; }
body {
    margin: 0;
    padding: 16px;
    font-family: system-ui, sans-serif;
    background: #f4f4f8;
    color: #222;
}
`;

    /* Named-color-only scaffold for challenge 1 (hex/rgb/hsl are forbidden). */
    const NAMED_ONLY_CSS = `
* { box-sizing: border-box; }
body {
    margin: 0;
    padding: 16px;
    font-family: system-ui, sans-serif;
    background: white;
    color: black;
}
.row { display: flex; gap: 12px; flex-wrap: wrap; }
.box { width: 72px; height: 72px; border-radius: 8px; border: 2px solid silver; }
`;

    const list = [
        /* ---------- Level 1 — Basics ---------- */
        {
            id: 'color-naming',
            level: 1,
            order: 1,
            type: 'css',
            title: 'Color Naming',
            tagline: 'Five boxes, five named colors',
            description:
                'Recreate the target using only CSS named colors (red, teal, coral…). ' +
                'No hex, rgb(), or hsl() allowed.',
            concepts: ['named colors', 'background-color'],
            targets: ['red', 'teal', 'coral', 'gold', 'plum'],
            targetHtml: `
<div class="row">
    <div class="box" id="box1"></div>
    <div class="box" id="box2"></div>
    <div class="box" id="box3"></div>
    <div class="box" id="box4"></div>
    <div class="box" id="box5"></div>
</div>
<style>
.row { display: flex; gap: 12px; flex-wrap: wrap; }
.box { width: 72px; height: 72px; border-radius: 8px; border: 2px solid #ccc; }
</style>`,
            starterCss: NAMED_ONLY_CSS + `
/* Style each box with a named color only.
   #box1 red · #box2 teal · #box3 coral · #box4 gold · #box5 plum */
`,
            solutionCss: NAMED_ONLY_CSS + `
#box1 { background-color: red; }
#box2 { background-color: teal; }
#box3 { background-color: coral; }
#box4 { background-color: gold; }
#box5 { background-color: plum; }
`
        },

        {
            id: 'hex-hunt',
            level: 1,
            order: 2,
            type: 'css',
            title: 'Hex Hunt',
            tagline: 'Match 10 targets with #hex only',
            description:
                'Match each swatch to its target color using hex codes only. ' +
                'Aim for a near-perfect match (small rounding differences are OK).',
            concepts: ['#rrggbb', 'background'],
            targets: [
                '#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#264653',
                '#8338ec', '#ff006e', '#3a86ff', '#06d6a0', '#fb5607'
            ],
            targetHtml: `
<div class="grid" id="grid">
    <div class="swatch" id="sw1"></div>
    <div class="swatch" id="sw2"></div>
    <div class="swatch" id="sw3"></div>
    <div class="swatch" id="sw4"></div>
    <div class="swatch" id="sw5"></div>
    <div class="swatch" id="sw6"></div>
    <div class="swatch" id="sw7"></div>
    <div class="swatch" id="sw8"></div>
    <div class="swatch" id="sw9"></div>
    <div class="swatch" id="sw10"></div>
</div>
<style>
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 420px; }
.swatch { aspect-ratio: 1; border-radius: 8px; border: 2px solid #ccc; }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 420px; }
.swatch { aspect-ratio: 1; border-radius: 8px; border: 2px solid #ccc; }

/* Match targets with hex codes:
   #e63946 #f4a261 #e9c46a #2a9d8f #264653
   #8338ec #ff006e #3a86ff #06d6a0 #fb5607 */
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 420px; }
.swatch { aspect-ratio: 1; border-radius: 8px; border: 2px solid #ccc; }

#sw1  { background: #e63946; }
#sw2  { background: #f4a261; }
#sw3  { background: #e9c46a; }
#sw4  { background: #2a9d8f; }
#sw5  { background: #264653; }
#sw6  { background: #8338ec; }
#sw7  { background: #ff006e; }
#sw8  { background: #3a86ff; }
#sw9  { background: #06d6a0; }
#sw10 { background: #fb5607; }
`
        },

        {
            id: 'rgb-mixer',
            level: 1,
            order: 3,
            type: 'css',
            title: 'RGB Mixer',
            tagline: 'Build a gradient with rgb() values',
            description:
                'Create the target gradient using only rgb() color values — no hex, no hsl(), no named colors.',
            concepts: ['linear-gradient', 'rgb()'],
            targets: ['rgb(255, 94, 58)', 'rgb(255, 195, 110)', 'rgb(89, 56, 214)'],
            targetHtml: `
<div class="bar" id="bar"></div>
<style>
.bar {
    height: 90px;
    width: min(420px, 100%);
    border-radius: 12px;
    border: 2px solid #ccc;
}
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.bar {
    height: 90px;
    width: min(420px, 100%);
    border-radius: 12px;
    border: 2px solid #ccc;
    /* background: linear-gradient(…rgb stops…); */
}
/* Stops: rgb(255, 94, 58) → rgb(255, 195, 110) → rgb(89, 56, 214) */
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.bar {
    height: 90px;
    width: min(420px, 100%);
    border-radius: 12px;
    border: 2px solid #ccc;
    background: linear-gradient(
        90deg,
        rgb(255, 94, 58),
        rgb(255, 195, 110),
        rgb(89, 56, 214)
    );
}
`
        },

        /* ---------- Level 2 — Intermediate ---------- */
        {
            id: 'sunset-palette',
            level: 2,
            order: 4,
            type: 'css',
            title: 'Color Palette',
            tagline: 'Design a 5-color sunset theme',
            description:
                'Build a 5-color sunset palette stored in CSS custom properties and applied via var(). ' +
                'Every color should feel warm (red / orange / pink hues).',
            concepts: ['CSS variables', 'var()', 'warm hues'],
            targetHtml: `
<div class="palette">
    <div class="swatch" id="s1"></div>
    <div class="swatch" id="s2"></div>
    <div class="swatch" id="s3"></div>
    <div class="swatch" id="s4"></div>
    <div class="swatch" id="s5"></div>
</div>
<style>
.palette { display: flex; gap: 10px; }
.swatch { width: 64px; height: 64px; border-radius: 8px; border: 2px solid #ccc; }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.palette { display: flex; gap: 10px; }
.swatch { width: 64px; height: 64px; border-radius: 8px; border: 2px solid #ccc; }

:root {
    /* Define five warm sunset colors: */
    /* --sunset-1: …; */
    /* --sunset-2: …; */
    /* --sunset-3: …; */
    /* --sunset-4: …; */
    /* --sunset-5: …; */
}

#s1 { background: var(--sunset-1); }
#s2 { background: var(--sunset-2); }
#s3 { background: var(--sunset-3); }
#s4 { background: var(--sunset-4); }
#s5 { background: var(--sunset-5); }
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.palette { display: flex; gap: 10px; }
.swatch { width: 64px; height: 64px; border-radius: 8px; border: 2px solid #ccc; }

:root {
    --sunset-1: #4a1942;
    --sunset-2: #c9184a;
    --sunset-3: #ff6b35;
    --sunset-4: #ff9e00;
    --sunset-5: #ffd166;
}

#s1 { background: var(--sunset-1); }
#s2 { background: var(--sunset-2); }
#s3 { background: var(--sunset-3); }
#s4 { background: var(--sunset-4); }
#s5 { background: var(--sunset-5); }
`
        },

        {
            id: 'hsl-rainbow',
            level: 2,
            order: 5,
            type: 'css',
            title: 'HSL Rainbow',
            tagline: 'Seven strips via hsl()',
            description:
                'Paint a rainbow with seven hsl() strips. Sweep the hue across (almost) the full circle with a loop-like structure.',
            concepts: ['hsl()', 'hue wheel'],
            targetHtml: `
<div class="rainbow">
    <div class="strip" id="r1"></div>
    <div class="strip" id="r2"></div>
    <div class="strip" id="r3"></div>
    <div class="strip" id="r4"></div>
    <div class="strip" id="r5"></div>
    <div class="strip" id="r6"></div>
    <div class="strip" id="r7"></div>
</div>
<style>
.rainbow { display: flex; flex-direction: column; width: min(320px, 100%); border-radius: 8px; overflow: hidden; border: 2px solid #ccc; }
.strip { height: 36px; }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.rainbow { display: flex; flex-direction: column; width: min(320px, 100%); border-radius: 8px; overflow: hidden; border: 2px solid #ccc; }
.strip { height: 36px; }

/* Sweep hue across ~360° with hsl():
   #r1 hsl(0, …)  #r2 hsl(≈51, …)  …  #r7 hsl(≈308, …) */
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.rainbow { display: flex; flex-direction: column; width: min(320px, 100%); border-radius: 8px; overflow: hidden; border: 2px solid #ccc; }
.strip { height: 36px; }

#r1 { background: hsl(0, 85%, 55%); }
#r2 { background: hsl(51, 85%, 55%); }
#r3 { background: hsl(103, 85%, 55%); }
#r4 { background: hsl(154, 85%, 55%); }
#r5 { background: hsl(206, 85%, 55%); }
#r6 { background: hsl(257, 85%, 55%); }
#r7 { background: hsl(308, 85%, 55%); }
`
        },

        {
            id: 'dark-mode-toggle',
            level: 2,
            order: 6,
            type: 'css',
            title: 'Dark Mode Toggle',
            tagline: 'CSS variables + a light/dark switch',
            description:
                'Wire the toggle so it swaps CSS variables between a light and a dark theme. ' +
                'Both themes must keep body text at WCAG AA contrast (≥ 4.5:1) against the card background.',
            concepts: [':checked', 'custom properties', 'themes'],
            targetHtml: `
<input type="checkbox" id="darkToggle" class="toggle-input">
<label for="darkToggle" class="toggle-btn">Toggle dark mode</label>
<div class="card" id="card">
    <h2>Readable in both themes</h2>
    <p>Body copy must stay at least 4.5:1 against the card background — light and dark.</p>
</div>
<style>
.toggle-input { position: absolute; opacity: 0; pointer-events: none; }
.toggle-btn {
    display: inline-block;
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #888;
    cursor: pointer;
    user-select: none;
    margin-bottom: 14px;
    font-weight: 600;
}
.card { padding: 16px; border-radius: 12px; max-width: 420px; }
.card h2 { margin-top: 0; }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.toggle-input { position: absolute; opacity: 0; pointer-events: none; }
.toggle-btn {
    display: inline-block;
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #888;
    cursor: pointer;
    user-select: none;
    margin-bottom: 14px;
    font-weight: 600;
}
.card { padding: 16px; border-radius: 12px; max-width: 420px; }
.card h2 { margin-top: 0; }

:root {
    --page-bg: #f4f4f8;
    --page-text: #222222;
    --card-bg: #ffffff;
    --card-text: #1a1a1a;
    --accent: #3a86ff;
}

body { background: var(--page-bg); color: var(--page-text); }

.card {
    background: var(--card-bg);
    color: var(--card-text);
}

/* TODO: dark theme when #darkToggle is checked — swap the variables. */
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.toggle-input { position: absolute; opacity: 0; pointer-events: none; }
.toggle-btn {
    display: inline-block;
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #888;
    cursor: pointer;
    user-select: none;
    margin-bottom: 14px;
    font-weight: 600;
}
.card { padding: 16px; border-radius: 12px; max-width: 420px; }
.card h2 { margin-top: 0; }

:root {
    --page-bg: #f4f4f8;
    --page-text: #222222;
    --card-bg: #ffffff;
    --card-text: #1a1a1a;
    --accent: #3a86ff;
}

body { background: var(--page-bg); color: var(--page-text); }

.card {
    background: var(--card-bg);
    color: var(--card-text);
}

.toggle-input:checked ~ .toggle-btn {
    border-color: var(--accent);
}

body:has(.toggle-input:checked) {
    --page-bg: #12121a;
    --page-text: #e8e8f0;
    --card-bg: #1e1e2a;
    --card-text: #f2f2f7;
    --accent: #7aa2ff;
}
`
        },

        {
            id: 'accessible-contrast',
            level: 2,
            order: 7,
            type: 'css',
            title: 'Accessible Contrast',
            tagline: 'Fix3 sections failing WCAG AA',
            description:
                'Three sections fail the WCAG AA contrast check (text vs background must be ≥ 4.5:1). ' +
                'Adjust colors until every heading and paragraph passes.',
            concepts: ['WCAG', 'contrast ratio', 'accessibility'],
            targetHtml: `
<section class="section" id="sec1">
    <h2>Morning briefing</h2>
    <p>Clear headlines and body text help everyone read the news.</p>
</section>
<section class="section" id="sec2">
    <h2>Trail notes</h2>
    <p>Bring water, a map, and a charged phone for the hike.</p>
</section>
<section class="section" id="sec3">
    <h2>Recipe card</h2>
    <p>Simmer the sauce for twenty minutes, stirring often.</p>
</section>
<style>
.section { padding: 14px 16px; border-radius: 10px; margin-bottom: 12px; max-width: 460px; }
.section h2 { margin: 0 0 6px; font-size: 1.15rem; }
.section p { margin: 0; }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.section { padding: 14px 16px; border-radius: 10px; margin-bottom: 12px; max-width: 460px; }
.section h2 { margin: 0 0 6px; font-size: 1.15rem; }
.section p { margin: 0; }

/* Failing combos to fix (make each ≥ 4.5:1): */
#sec1 { background: #ffffff; color: #bbbbbb; }
#sec2 { background: #f7f7d8; color: #e0e0a0; }
#sec3 { background: #3d5a80; color: #4f6fa5; }
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.section { padding: 14px 16px; border-radius: 10px; margin-bottom: 12px; max-width: 460px; }
.section h2 { margin: 0 0 6px; font-size: 1.15rem; }
.section p { margin: 0; }

#sec1 { background: #ffffff; color: #595959; }
#sec2 { background: #f7f7d8; color: #5c5c1f; }
#sec3 { background: #3d5a80; color: #e0eeff; }
`
        },

        /* ---------- Level 3 — Applied ---------- */
        {
            id: 'color-theory-quiz',
            level: 3,
            order: 8,
            type: 'quiz',
            title: 'Color Theory Quiz',
            tagline: 'Complementary · analogous · triads',
            description:
                'Answer the multiple-choice questions on color relationships. ' +
                'You need at least 70% to pass.',
            concepts: ['color wheel', 'harmony'],
            passScore: 0.7,
            quiz: {
                questions: [
                    {
                        q: 'On the color wheel, the complement of blue is…',
                        options: ['Green', 'Orange', 'Yellow', 'Red'],
                        answer: 1,
                        explain: 'Blue sits opposite orange on the traditional RYB wheel.'
                    },
                    {
                        q: 'An analogous palette uses colors that are…',
                        options: [
                            'Opposite each other',
                            'Neighbours on the wheel',
                            'Only primary colors',
                            'Black, white, gray'
                        ],
                        answer: 1,
                        explain: 'Analogous = side-by-side hues, e.g. blue, blue-green, green.'
                    },
                    {
                        q: 'A triadic harmony divides the wheel into…',
                        options: ['2 parts', '3 equal parts', '4 equal parts', '12 parts'],
                        answer: 1,
                        explain: 'Triads are three hues 120° apart (e.g. red, yellow, blue).'
                    },
                    {
                        q: 'Which pair is a classic complementary match?',
                        options: ['Red & green', 'Blue & purple', 'Yellow & orange', 'Red & orange'],
                        answer: 0,
                        explain: 'Red and green sit opposite on the RYB wheel.'
                    },
                    {
                        q: 'Warm colors generally lean toward…',
                        options: ['Blue / green', 'Red / orange / yellow', 'Purple only', 'Gray only'],
                        answer: 1,
                        explain: 'Sunset hues feel warm; ocean hues feel cool.'
                    },
                    {
                        q: 'Split-complementary means one base color plus…',
                        options: [
                            'Its direct complement',
                            'The two hues beside its complement',
                            'Three random hues',
                            'Only black and white'
                        ],
                        answer: 1,
                        explain: 'Split-comp keeps contrast but softens clash vs. direct complement.'
                    },
                    {
                        q: 'A tint is made by adding…',
                        options: ['Black', 'White', 'Gray', 'Blue'],
                        answer: 1,
                        explain: 'Tint = color + white; shade = color + black; tone = color + gray.'
                    },
                    {
                        q: 'The triad of the primaries in light (RGB) is…',
                        options: [
                            'Red, yellow, blue',
                            'Red, green, blue',
                            'Cyan, magenta, yellow',
                            'Orange, green, violet'
                        ],
                        answer: 1,
                        explain: 'Additive light primaries are red, green, blue.'
                    }
                ]
            }
        },

        {
            id: 'palette-generator',
            level: 3,
            order: 9,
            type: 'js',
            title: 'Dynamic Palette Generator',
            tagline: 'JS button → harmonious CSS variables',
            description:
                'Write JavaScript so the button generates 5 random but harmonious colors ' +
                'and writes them into CSS custom properties on :root.',
            concepts: ['CSS variables from JS', 'color harmony', 'events'],
            targetHtml: `
<button id="generateBtn" class="btn">Generate palette</button>
<div class="palette" id="palette">
    <div class="swatch" id="p1"></div>
    <div class="swatch" id="p2"></div>
    <div class="swatch" id="p3"></div>
    <div class="swatch" id="p4"></div>
    <div class="swatch" id="p5"></div>
</div>
<style>
.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #3a86ff;
    background: #3a86ff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
}
.palette { display: flex; gap: 10px; }
.swatch {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    border: 2px solid #ccc;
    background: var(--palette-1, #ddd);
}
#p1 { background: var(--palette-1, #ddd); }
#p2 { background: var(--palette-2, #ddd); }
#p3 { background: var(--palette-3, #ddd); }
#p4 { background: var(--palette-4, #ddd); }
#p5 { background: var(--palette-5, #ddd); }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #3a86ff;
    background: #3a86ff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
}
.palette { display: flex; gap: 10px; }
.swatch {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    border: 2px solid #ccc;
}
#p1 { background: var(--palette-1, #ddd); }
#p2 { background: var(--palette-2, #ddd); }
#p3 { background: var(--palette-3, #ddd); }
#p4 { background: var(--palette-4, #ddd); }
#p5 { background: var(--palette-5, #ddd); }
`,
            starterJs: `
// TODO: on #generateBtn click, create 5 harmonious colors
// (e.g. one base hue + analogous offsets) and set
// --palette-1 … --palette-5 on document.documentElement.
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #3a86ff;
    background: #3a86ff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
}
.palette { display: flex; gap: 10px; }
.swatch {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    border: 2px solid #ccc;
}
#p1 { background: var(--palette-1, #ddd); }
#p2 { background: var(--palette-2, #ddd); }
#p3 { background: var(--palette-3, #ddd); }
#p4 { background: var(--palette-4, #ddd); }
#p5 { background: var(--palette-5, #ddd); }
`,
            solutionJs: `
(function () {
    const btn = document.getElementById('generateBtn');
    if (!btn) return;

    function analogousPalette(baseHue, count) {
        const spread = 36;
        const colors = [];
        for (let i = 0; i < count; i++) {
            const h = (baseHue + i * spread) % 360;
            const s = 65 + (i % 3) * 10;
            const l = 45 + (i % 2) * 15;
            colors.push('hsl(' + h + ', ' + s + '%, ' + l + '%)');
        }
        return colors;
    }

    btn.addEventListener('click', function () {
        const base = Math.floor(Math.random() * 360);
        const colors = analogousPalette(base, 5);
        colors.forEach(function (c, i) {
            document.documentElement.style.setProperty('--palette-' + (i + 1), c);
        });
    });
})();
`
        },

        {
            id: 'traffic-light',
            level: 3,
            order: 10,
            type: 'css',
            title: 'Traffic Light',
            tagline: 'CSS-only red → yellow → green',
            description:
                'Animate the light with pure CSS keyframes so it cycles red → yellow → green. ' +
                'No JavaScript allowed.',
            concepts: ['@keyframes', 'animation', 'CSS-only'],
            targetHtml: `
<div class="pole">
    <div class="light" id="light"></div>
</div>
<style>
.pole {
    width: 84px;
    padding: 14px;
    background: #1a1a1a;
    border-radius: 16px;
    display: flex;
    justify-content: center;
}
.light {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #333;
}
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.pole {
    width: 84px;
    padding: 14px;
    background: #1a1a1a;
    border-radius: 16px;
    display: flex;
    justify-content: center;
}
.light {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #333;
    /* TODO: @keyframes cycling red → yellow → green,
       then animation: … infinite; */
}
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.pole {
    width: 84px;
    padding: 14px;
    background: #1a1a1a;
    border-radius: 16px;
    display: flex;
    justify-content: center;
}
.light {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #333;
    animation: go 3s steps(1, end) infinite;
}

@keyframes go {
    0%   { background: red; }
    33%  { background: yellow; }
    66%  { background: green; }
    100% { background: red; }
}
`
        },

        {
            id: 'mood-page',
            level: 3,
            order: 11,
            type: 'js',
            title: 'Mood Page',
            tagline: '4 moods · CSS variables',
            description:
                'One page, four themes (calm, angry, happy, night) switched via CSS variables. ' +
                'Each mood should feel distinct.',
            concepts: ['theming', 'data attributes', 'CSS variables'],
            targetHtml: `
<nav class="themes" id="themes">
    <button type="button" class="theme-btn" data-theme="calm">Calm</button>
    <button type="button" class="theme-btn" data-theme="angry">Angry</button>
    <button type="button" class="theme-btn" data-theme="happy">Happy</button>
    <button type="button" class="theme-btn" data-theme="night">Night</button>
</nav>
<main class="page" id="page" data-theme="calm">
    <h1 id="pageTitle">How does this page feel?</h1>
    <p id="pageBody">Switch moods and watch the CSS variables repaint the scene.</p>
    <button type="button" class="cta" id="cta">Primary action</button>
</main>
<style>
.themes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.theme-btn {
    padding: 8px 14px;
    border-radius: 999px;
    border: 2px solid currentColor;
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    color: inherit;
}
.page {
    padding: 18px;
    border-radius: 14px;
    max-width: 460px;
}
.cta {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
}
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.themes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.theme-btn {
    padding: 8px 14px;
    border-radius: 999px;
    border: 2px solid currentColor;
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    color: inherit;
}
.page {
    padding: 18px;
    border-radius: 14px;
    max-width: 460px;
    background: var(--bg, #eef6ff);
    color: var(--text, #14304a);
}
.cta {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    background: var(--accent, #3a86ff);
    color: var(--cta-text, #fff);
}

/* TODO: mood themes via data-theme on #page */
/* [data-theme="calm"]  { --bg / --text / --accent : … blue, low sat … } */
/* [data-theme="angry"] { … red, high sat … } */
/* [data-theme="happy"] { … yellow … } */
/* [data-theme="night"] { … dark background … } */
`,
            starterJs: `
// TODO: when a .theme-btn is clicked, set data-theme on #page
// to that button's data-theme value.
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.themes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; color: var(--text, #14304a); }
.theme-btn {
    padding: 8px 14px;
    border-radius: 999px;
    border: 2px solid currentColor;
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    color: inherit;
}
.page {
    padding: 18px;
    border-radius: 14px;
    max-width: 460px;
    background: var(--bg, #eef6ff);
    color: var(--text, #14304a);
}
.cta {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    background: var(--accent, #3a86ff);
    color: var(--cta-text, #fff);
}

.page[data-theme="calm"] {
    --bg: #d8ecf8;
    --text: #1c3d5a;
    --accent: #4a90c2;
    --cta-text: #ffffff;
}
.page[data-theme="angry"] {
    --bg: #3a0a0a;
    --text: #ffe2e2;
    --accent: #d7263d;
    --cta-text: #ffffff;
}
.page[data-theme="happy"] {
    --bg: #fff6cc;
    --text: #4a3800;
    --accent: #ffb703;
    --cta-text: #1a1a1a;
}
.page[data-theme="night"] {
    --bg: #0d0d14;
    --text: #cfcfe0;
    --accent: #5e60ce;
    --cta-text: #ffffff;
}
`,
            solutionJs: `
(function () {
    const page = document.getElementById('page');
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            page.setAttribute('data-theme', btn.getAttribute('data-theme'));
        });
    });
})();
`
        },

        {
            id: 'color-blind-mode',
            level: 3,
            order: 12,
            type: 'js',
            title: 'Color Blind Mode',
            tagline: 'Simulate deuteranopia',
            description:
                'Add a toggle that simulates deuteranopia (red-green color blindness) on the palette. ' +
                'When active, the swatch colors must visibly change.',
            concepts: ['accessibility', 'color vision deficiency', 'filters / palettes'],
            targetHtml: `
<button id="cvdToggle" class="btn" type="button">Simulate deuteranopia</button>
<div class="palette" id="palette">
    <div class="swatch" id="c1"><span>Red</span></div>
    <div class="swatch" id="c2"><span>Green</span></div>
    <div class="swatch" id="c3"><span>Brown</span></div>
    <div class="swatch" id="c4"><span>Blue</span></div>
</div>
<style>
.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #3a86ff;
    background: #3a86ff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
}
.palette { display: flex; gap: 10px; }
.swatch {
    width: 72px;
    height: 72px;
    border-radius: 10px;
    border: 2px solid #ccc;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
.swatch span { pointer-events: none; }
#c1 { background: #d7263d; }
#c2 { background: #2a9d3a; }
#c3 { background: #8b5a2b; }
#c4 { background: #2d6cdf; }
</style>`,
            starterCss: BASE_SCAFFOLD_CSS + `
.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #3a86ff;
    background: #3a86ff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
}
.palette { display: flex; gap: 10px; }
.swatch {
    width: 72px;
    height: 72px;
    border-radius: 10px;
    border: 2px solid #ccc;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
.swatch span { pointer-events: none; }
#c1 { background: #d7263d; }
#c2 { background: #2a9d3a; }
#c3 { background: #8b5a2b; }
#c4 { background: #2d6cdf; }

/* TODO: .cvd-on (or similar) simulated-deuteranopia palette / filter */
`,
            starterJs: `
// TODO: toggle a "cvd" class (or SVG filter) on #cvdToggle click
// so the red/green/brown swatches shift toward the deuteranopia view.
`,
            solutionCss: BASE_SCAFFOLD_CSS + `
.btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: 2px solid #3a86ff;
    background: #3a86ff;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 14px;
}
.palette { display: flex; gap: 10px; }
.swatch {
    width: 72px;
    height: 72px;
    border-radius: 10px;
    border: 2px solid #ccc;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
.swatch span { pointer-events: none; }
#c1 { background: #d7263d; }
#c2 { background: #2a9d3a; }
#c3 { background: #8b5a2b; }
#c4 { background: #2d6cdf; }

/* Deuteranopia simulation: reds and greens collapse toward olive/khaki. */
.palette.cvd-on #c1 { background: #a8a030; }
.palette.cvd-on #c2 { background: #a8a030; }
.palette.cvd-on #c3 { background: #8f8a55; }
.palette.cvd-on #c4 { background: #3e6dbf; }
`,
            solutionJs: `
(function () {
    const btn = document.getElementById('cvdToggle');
    const palette = document.getElementById('palette');
    if (!btn || !palette) return;

    btn.addEventListener('click', function () {
        const on = palette.classList.toggle('cvd-on');
        btn.textContent = on ? 'Reset colors' : 'Simulate deuteranopia';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
})();
`
        }
    ];

    /**
     * Returns one challenge by id, or null.
     * @param {string} id
     */
    function getById(id) {
        return list.find((c) => c.id === id) || null;
    }

    /**
     * Challenges for a level (1–3), ordered.
     * @param {number} level
     */
    function byLevel(level) {
        return list.filter((c) => c.level === level)
            .sort((a, b) => a.order - b.order);
    }

    return {
        LEVELS: LEVELS,
        list: list,
        getById: getById,
        byLevel: byLevel
    };
});
