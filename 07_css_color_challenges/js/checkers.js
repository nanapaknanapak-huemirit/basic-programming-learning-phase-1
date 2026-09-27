/**
 * Checkers — validation for each challenge against a live iframe.
 *
 * Every checker receives a context object:
 *   {
 *     challenge,   // entry from challenges.js
 *     doc,         // Document inside the preview iframe
 *     win,         // Window inside the preview iframe
 *     sourceCss,   // user's CSS text
 *     sourceJs,    // user's JS text ('' when not applicable)
 *     utils        // ColorUtils
 *   }
 *
 * Each returns { pass: boolean, message: string }.
 * DOM-free pieces (pure source checks) are factored so they stay testable.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            typeof require === 'function' ? require('./color-utils.js') : root.ColorUtils
        );
    } else {
        root.Checkers = factory(root.ColorUtils, root.Challenges);
    }
})(typeof self !== 'undefined' ? self : this, function (ColorUtils) {
    'use strict';

    const MIN_CONTRAST = 4.5;
    const HEX_DISTANCE_TOLERANCE = 10;
    const DISTINCT_DISTANCE = 10;
    const WARM_HUE_MAX = 60;
    const WARM_HUE_MIN = 300;
    const QUIZ_DEFAULT_PASS = 0.7;

    function fail(message) {
        return { pass: false, message: message };
    }

    function pass(message) {
        return { pass: true, message: message };
    }

    function bg(doc, id) {
        const el = doc.getElementById(id);
        if (!el) return null;
        return ColorUtils.parseColor(winGet(el, 'backgroundColor'));
    }

    function winGet(el, prop) {
        // getComputedStyle().getPropertyValue expects CSS kebab-case names.
        const cssName = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
        return el.ownerDocument.defaultView.getComputedStyle(el).getPropertyValue(cssName);
    }

    function isEffectivelyTransparent(color) {
        return !color || (color.a === 0) ||
            (color.r === 0 && color.g === 0 && color.b === 0 && color.a === 0);
    }

    function resolveBg(doc, el) {
        let node = el;
        while (node && node.nodeType === 1) {
            const c = ColorUtils.parseColor(winGet(node, 'backgroundColor'));
            if (c && c.a > 0.05) return c;
            node = node.parentElement;
        }
        return ColorUtils.rgba(255, 255, 255, 1);
    }

    function textColorFor(doc, el, bg) {
        let node = el;
        while (node && node.nodeType === 1) {
            const c = ColorUtils.parseColor(winGet(node, 'color'));
            if (c) {
                // Composite semi-transparent text roughly over bg
                if (c.a >= 0.99) return c;
                return ColorUtils.rgba(
                    c.r * c.a + bg.r * (1 - c.a),
                    c.g * c.a + bg.g * (1 - c.a),
                    c.b * c.a + bg.b * (1 - c.a)
                );
            }
            node = node.parentElement;
        }
        return ColorUtils.rgba(0, 0, 0, 1);
    }

    function extractRgbTriplet(str) {
        const m = str.match(/rgba?\(\s*([+-]?[\d.]+%?)[\s,]+([+-]?[\d.]+%?)[\s,]+([+-]?[\d.]+%?)/i);
        if (!m) return null;
        return ColorUtils.parseColor('rgb(' + m[1] + ', ' + m[2] + ', ' + m[3] + ')');
    }

    function hasHexColor(css) {
        return /#[0-9a-fA-F]{3,8}\b/.test(css);
    }

    function hasRgbFn(css) {
        return /\brgba?\(/i.test(css);
    }

    function hasHslFn(css) {
        return /\bhsla?\(/i.test(css);
    }

    /* ------------------------------------------------------------------ */
    /* 1 — Color Naming                                                    */
    /* ------------------------------------------------------------------ */
    function checkColorNaming(ctx) {
        // Ignore comments so starter hints mentioning hex don't trip the rule.
        const code = ctx.sourceCss.replace(/\/\*[\s\S]*?\*\//g, '');
        const forbidden = [];
        if (hasHexColor(code)) forbidden.push('hex (#…)');
        if (hasRgbFn(code)) forbidden.push('rgb()/rgba()');
        if (hasHslFn(code)) forbidden.push('hsl()/hsla()');
        if (forbidden.length) {
            return fail('Named colors only — remove ' + forbidden.join(', ') + '.');
        }

        const problems = [];
        ctx.challenge.targets.forEach((name, i) => {
            const id = 'box' + (i + 1);
            const color = bg(ctx.doc, id);
            const expected = ColorUtils.parseColor(name);
            if (!color) {
                problems.push(id + ' has no background');
                return;
            }
            if (ColorUtils.colorDistance(color, expected) > 1) {
                problems.push(id + ' should be "' + name + '"');
            }
        });

        if (problems.length) return fail(problems.join('; ') + '.');
        return pass('Five named colors match the target.');
    }

    /* ------------------------------------------------------------------ */
    /* 2 — Hex Hunt                                                        */
    /* ------------------------------------------------------------------ */
    function checkHexHunt(ctx) {
        const hexMatches = ctx.sourceCss.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
        if (hexMatches.length < 10) {
            return fail('Found ' + hexMatches.length + ' hex code(s) — you need one per swatch (10).');
        }

        const problems = [];
        ctx.challenge.targets.forEach((target, i) => {
            const color = bg(ctx.doc, 'sw' + (i + 1));
            if (!color) {
                problems.push('sw' + (i + 1) + ' missing');
                return;
            }
            const d = ColorUtils.colorDistance(color, target);
            if (d > HEX_DISTANCE_TOLERANCE) {
                problems.push('sw' + (i + 1) + ' is off by ' + Math.round(d));
            }
        });

        if (problems.length) return fail(problems.slice(0, 4).join('; ') + '.');
        return pass('All 10 hex matches are within tolerance.');
    }

    /* ------------------------------------------------------------------ */
    /* 3 — RGB Mixer                                                       */
    /* ------------------------------------------------------------------ */
    function checkRgbMixer(ctx) {
        const css = ctx.sourceCss;
        const gradientMatch = css.match(/linear-gradient\s*\(([^;]+)\)/i);
        if (!gradientMatch) {
            return fail('Add a linear-gradient(…) to .bar.');
        }
        const body = gradientMatch[1];
        if (hasHexColor(body)) {
            return fail('Use only rgb() values inside the gradient — remove hex codes.');
        }
        if (hasHslFn(body)) {
            return fail('Use only rgb() values inside the gradient — remove hsl().');
        }
        // Named colors (other than none/transparent keywords) are discouraged:
        // require at least one rgb() and no bare hex.
        if (!hasRgbFn(body)) {
            return fail('The gradient stops must use rgb(…).');
        }

        const found = [];
        const re = /rgba?\([^)]*\)/gi;
        let m;
        while ((m = re.exec(body)) !== null) {
            const c = ColorUtils.parseColor(m[0]);
            if (c) found.push(c);
        }
        if (found.length < 2) {
            return fail('Need at least two rgb() stops in the gradient.');
        }

        // Match first, middle-ish and last stops to targets (order-preserving).
        const targets = ctx.challenge.targets.map((t) => ColorUtils.parseColor(t));
        const first = found[0];
        const last = found[found.length - 1];
        const mid = found[Math.floor(found.length / 2)];

        const checks = [
            { label: 'first stop', actual: first, expected: targets[0] },
            { label: 'middle stop', actual: mid, expected: targets[1] },
            { label: 'last stop', actual: last, expected: targets[2] }
        ];
        const problems = checks
            .filter((c) => !c.actual || ColorUtils.colorDistance(c.actual, c.expected) > HEX_DISTANCE_TOLERANCE)
            .map((c, i) => c.label);

        if (problems.length) {
            return fail(
                'Gradient stops must be rgb(255, 94, 58), rgb(255, 195, 110), rgb(89, 56, 214). ' +
                'Off: ' + problems.join('; ') + '.'
            );
        }
        return pass('Gradient uses rgb() stops that match the target.');
    }

    /* ------------------------------------------------------------------ */
    /* 4 — Sunset Palette                                                  */
    /* ------------------------------------------------------------------ */
    function checkSunsetPalette(ctx) {
        const css = ctx.sourceCss;
        if (!css.includes('--sunset-')) {
            return fail('Define five custom properties named --sunset-1 … --sunset-5.');
        }
        if (!/var\s*\(\s*--sunset-/.test(css)) {
            return fail('Apply the variables with var(--sunset-…).');
        }

        const colors = [];
        for (let i = 1; i <= 5; i++) {
            const color = bg(ctx.doc, 's' + i);
            if (!color) return fail('#s' + i + ' has no background.');
            colors.push(color);
        }

        const problems = [];
        colors.forEach((c, i) => {
            const hsl = ColorUtils.rgbToHsl(c);
            const warm = hsl.h <= WARM_HUE_MAX || hsl.h >= WARM_HUE_MIN;
            if (!warm) {
                problems.push('swatch ' + (i + 1) + ' hue ' + Math.round(hsl.h) + '° is not warm (need ≤' +
                    WARM_HUE_MAX + '° or ≥' + WARM_HUE_MIN + '°)');
            }
            if (hsl.l < 8 || hsl.l > 95) {
                problems.push('swatch ' + (i + 1) + ' is too extreme (lightness ' + Math.round(hsl.l) + '%)');
            }
        });

        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                if (ColorUtils.colorDistance(colors[i], colors[j]) < DISTINCT_DISTANCE) {
                    problems.push('swatches ' + (i + 1) + ' and ' + (j + 1) + ' are too similar');
                }
            }
        }

        if (problems.length) return fail(problems.slice(0, 3).join('; ') + '.');
        return pass('Warm, distinct sunset palette in CSS variables.');
    }

    /* ------------------------------------------------------------------ */
    /* 5 — HSL Rainbow                                                     */
    /* ------------------------------------------------------------------ */
    function checkHslRainbow(ctx) {
        const hslCount = (ctx.sourceCss.match(/\bhsla?\(/gi) || []).length;
        if (hslCount < 7) {
            return fail('Use hsl() for all seven strips (found ' + hslCount + ').');
        }

        const hues = [];
        for (let i = 1; i <= 7; i++) {
            const color = bg(ctx.doc, 'r' + i);
            if (!color) return fail('#r' + i + ' has no background.');
            hues.push(ColorUtils.rgbToHsl(color).h);
        }

        // Circular steps must all go the same direction and not jump wildly.
        const steps = [];
        for (let i = 0; i < hues.length - 1; i++) {
            let d = hues[i + 1] - hues[i];
            while (d <= -180) d += 360;
            while (d > 180) d -= 360;
            steps.push(d);
        }

        const allPositive = steps.every((s) => s > 5 && s < 90);
        const allNegative = steps.every((s) => s < -5 && s > -90);
        if (!allPositive && !allNegative) {
            return fail('Hues must sweep smoothly in one direction (steps ≈ 30–60°).');
        }

        // Total span along the sweep direction ≥ 300°
        const total = steps.reduce((sum, s) => sum + Math.abs(s), 0);
        if (total < 300) {
            return fail('Sweep the hue across at least 300° (currently ' + Math.round(total) + '°).');
        }
        return pass('Seven hsl() strips sweep across the hue wheel.');
    }

    /* ------------------------------------------------------------------ */
    /* 6 — Dark Mode Toggle                                                */
    /* ------------------------------------------------------------------ */
    function checkDarkModeToggle(ctx) {
        const css = ctx.sourceCss;
        if (!/:checked/.test(css) && !/:has\(/.test(css)) {
            return fail('React to the toggle with :checked (or :has(:checked)).');
        }
        if (!css.includes('--') || !/var\s*\(/.test(css)) {
            return fail('Drive both themes with CSS custom properties and var().');
        }

        const toggle = ctx.doc.getElementById('darkToggle');
        const card = ctx.doc.getElementById('card');
        if (!toggle || !card) return fail('Missing #darkToggle or #card in the scaffold.');

        toggle.checked = false;
        const lightBg = resolveBg(ctx.doc, card);
        const lightFg = textColorFor(ctx.doc, card.querySelector('p') || card, lightBg);

        toggle.checked = true;
        const darkBg = resolveBg(ctx.doc, card);
        const darkFg = textColorFor(ctx.doc, card.querySelector('p') || card, darkBg);

        if (ColorUtils.colorDistance(lightBg, darkBg) < 20) {
            return fail('Toggling must visibly change the card background.');
        }

        const lightRatio = ColorUtils.contrastRatio(lightFg, lightBg);
        const darkRatio = ColorUtils.contrastRatio(darkFg, darkBg);
        if (lightRatio < MIN_CONTRAST) {
            return fail('Light theme contrast is ' + lightRatio.toFixed(2) + ':1 — need ≥ 4.5:1.');
        }
        if (darkRatio < MIN_CONTRAST) {
            return fail('Dark theme contrast is ' + darkRatio.toFixed(2) + ':1 — need ≥ 4.5:1.');
        }

        // Leave the toggle where the user left the preview (reset to light).
        toggle.checked = false;
        return pass('Both themes pass WCAG AA (light ' + lightRatio.toFixed(1) +
            ':1, dark ' + darkRatio.toFixed(1) + ':1).');
    }

    /* ------------------------------------------------------------------ */
    /* 7 — Accessible Contrast                                             */
    /* ------------------------------------------------------------------ */
    function checkAccessibleContrast(ctx) {
        const problems = [];
        for (let i = 1; i <= 3; i++) {
            const section = ctx.doc.getElementById('sec' + i);
            if (!section) {
                problems.push('#sec' + i + ' missing');
                continue;
            }
            const sectionBg = resolveBg(ctx.doc, section);
            const nodes = section.querySelectorAll('h2, p');
            if (!nodes.length) {
                problems.push('#sec' + i + ' has no text');
                continue;
            }
            nodes.forEach((node) => {
                const fg = textColorFor(ctx.doc, node, sectionBg);
                const ratio = ColorUtils.contrastRatio(fg, sectionBg);
                if (ratio < MIN_CONTRAST) {
                    const label = node.tagName.toLowerCase();
                    problems.push('#sec' + i + ' ' + label + ' is ' + ratio.toFixed(2) + ':1');
                }
            });
        }
        if (problems.length) {
            return fail(problems.slice(0, 5).join('; ') + ' — raise all to ≥ 4.5:1.');
        }
        return pass('All three sections pass WCAG AA (≥ 4.5:1).');
    }

    /* ------------------------------------------------------------------ */
    /* 8 — Color Theory Quiz                                               */
    /* ------------------------------------------------------------------ */
    function checkColorTheoryQuiz(ctx) {
        const quiz = ctx.challenge.quiz;
        if (!quiz || !quiz.questions.length) return fail('Quiz data missing.');

        const answers = ctx.quizAnswers || [];
        const total = quiz.questions.length;
        let correct = 0;
        let unanswered = 0;

        quiz.questions.forEach((q, i) => {
            const given = answers[i];
            if (given === undefined || given === null) {
                unanswered++;
                return;
            }
            if (given === q.answer) correct++;
        });

        if (unanswered) {
            return fail('Answer all questions first (' + unanswered + ' left).');
        }

        const score = correct / total;
        const needed = quiz.passScore !== undefined ? quiz.passScore : QUIZ_DEFAULT_PASS;
        const pct = Math.round(score * 100);
        if (score < needed) {
            return fail('Score ' + correct + '/' + total + ' (' + pct +
                '%) — need at least ' + Math.ceil(needed * 100) + '%.');
        }
        return pass('Score ' + correct + '/' + total + ' (' + pct + '%) — nice work!');
    }

    /* ------------------------------------------------------------------ */
    /* 9 — Dynamic Palette Generator                                       */
    /* ------------------------------------------------------------------ */
    function checkPaletteGenerator(ctx) {
        if (!/addEventListener\s*\(|\.onclick\s*=|btn\.onclick/.test(ctx.sourceJs)) {
            return fail('Attach a click listener to #generateBtn in your JavaScript.');
        }
        if (!/setProperty\s*\(\s*['"`]--palette-|--palette-/.test(ctx.sourceJs)) {
            return fail('Set --palette-1 … --palette-5 CSS variables in your JavaScript.');
        }

        const rootEl = ctx.doc.documentElement;
        const btn = ctx.doc.getElementById('generateBtn');
        if (!btn) return fail('Missing #generateBtn.');

        // Capture pre-click values (scaffold defaults → empty/d-dd fallbacks).
        const before = readPaletteVars(ctx, rootEl);

        btn.click();

        const after = readPaletteVars(ctx, rootEl);
        const missing = after.filter((c) => !c).length;
        if (missing) {
            return fail('After clicking, ' + missing + ' of 5 --palette- variables are still unset.');
        }

        const changed = after.filter((c, i) => !before[i] || ColorUtils.colorDistance(c, before[i]) > 5).length;
        if (changed < 5) {
            return fail('All five colors should change on each click (' + changed + ' did).');
        }

        for (let i = 0; i < after.length; i++) {
            for (let j = i + 1; j < after.length; j++) {
                if (ColorUtils.colorDistance(after[i], after[j]) < DISTINCT_DISTANCE) {
                    return fail('Colors ' + (i + 1) + ' and ' + (j + 1) +
                        ' are too similar — keep them distinct.');
                }
            }
        }

        return pass('Five distinct harmonious colors land in CSS variables.');
    }

    function readPaletteVars(ctx, rootEl) {
        const out = [];
        for (let i = 1; i <= 5; i++) {
            const raw = rootEl.style.getPropertyValue('--palette-' + i).trim() ||
                ctx.win.getComputedStyle(rootEl).getPropertyValue('--palette-' + i).trim();
            out.push(raw ? ColorUtils.parseColor(raw) : null);
        }
        return out;
    }

    /* ------------------------------------------------------------------ */
    /* 10 — Traffic Light                                                  */
    /* ------------------------------------------------------------------ */
    function checkTrafficLight(ctx) {
        const css = ctx.sourceCss;
        if (!/@keyframes/.test(css)) {
            return fail('Define an @keyframes animation.');
        }
        if (!/animation\s*:/.test(css)) {
            return fail('Apply the animation to .light with the animation property.');
        }
        if (ctx.sourceJs && ctx.sourceJs.trim()) {
            return fail('CSS-only challenge — clear the JavaScript pane.');
        }

        const keyframeBlocks = css.match(/@keyframes[^{]+\{[\s\S]*?\n\}/g) || [];
        const searchText = keyframeBlocks.join('\n') || css;

        const tokens = ColorUtils.extractColorTokens(searchText);
        const parsed = tokens.map((t) => ColorUtils.parseColor(t)).filter(Boolean);
        if (parsed.length < 3) {
            return fail('Keyframes need red, yellow, and green color stops.');
        }

        const hasRed = parsed.some((c) => {
            const h = ColorUtils.rgbToHsl(c).h;
            return ColorUtils.hueDistance(h, 0) <= 20 || ColorUtils.hueDistance(h, 360) <= 20;
        });
        const hasYellow = parsed.some((c) => {
            const hsl = ColorUtils.rgbToHsl(c);
            return ColorUtils.hueDistance(hsl.h, 55) <= 25 && hsl.s > 40;
        });
        const hasGreen = parsed.some((c) => {
            const h = ColorUtils.rgbToHsl(c).h;
            return ColorUtils.hueDistance(h, 130) <= 35;
        });

        const missing = [];
        if (!hasRed) missing.push('red');
        if (!hasYellow) missing.push('yellow');
        if (!hasGreen) missing.push('green');
        if (missing.length) {
            return fail('Keyframes are missing: ' + missing.join(', ') + '.');
        }

        const light = ctx.doc.getElementById('light');
        if (!light) return fail('Missing #light in the scaffold.');
        const anim = winGet(light, 'animationName');
        if (!anim || anim === 'none') {
            return fail('.light has no running animation — check your animation shorthand.');
        }

        return pass('Pure-CSS keyframes cycle red → yellow → green.');
    }

    /* ------------------------------------------------------------------ */
    /* 11 — Mood Page                                                      */
    /* ------------------------------------------------------------------ */
    function checkMoodPage(ctx) {
        const css = ctx.sourceCss;
        if (!/data-theme/.test(css)) {
            return fail('Style themes with [data-theme="…"] selectors.');
        }
        if (!css.includes('--') || !/var\s*\(/.test(css)) {
            return fail('Drive each mood with CSS custom properties.');
        }
        if (!/querySelectorAll|\.onclick|addEventListener/.test(ctx.sourceJs)) {
            return fail('Wire the mood buttons in JavaScript.');
        }

        const page = ctx.doc.getElementById('page');
        const buttons = ctx.doc.querySelectorAll('.theme-btn');
        if (!page || buttons.length < 4) return fail('Missing #page or mood buttons.');

        const moods = ['calm', 'angry', 'happy', 'night'];
        const snapshots = [];

        for (const mood of moods) {
            const btn = Array.from(buttons).find(
                (b) => b.getAttribute('data-theme') === mood
            );
            if (!btn) return fail('Missing a button for mood "' + mood + '".');
            btn.click();
            const active = page.getAttribute('data-theme');
            if (active !== mood) {
                return fail('Clicking "' + mood + '" set data-theme="' + active + '".');
            }
            const bg = resolveBg(ctx.doc, page);
            const text = textColorFor(ctx.doc, page, bg);
            snapshots.push({ mood: mood, bg: bg, text: text });
        }

        // All four backgrounds must be distinct enough.
        for (let i = 0; i < snapshots.length; i++) {
            for (let j = i + 1; j < snapshots.length; j++) {
                if (ColorUtils.colorDistance(snapshots[i].bg, snapshots[j].bg) < DISTINCT_DISTANCE) {
                    return fail('"' + snapshots[i].mood + '" and "' + snapshots[j].mood +
                        '" backgrounds look the same.');
                }
            }
        }

        const byMood = Object.fromEntries(snapshots.map((s) => [s.mood, s]));
        const problems = [];

        const calm = ColorUtils.rgbToHsl(byMood.calm.bg);
        const calmHueOk = calm.h >= 180 && calm.h <= 260;
        if (!calmHueOk) {
            problems.push('calm should feel blue-ish (hue ' + Math.round(calm.h) + '°)');
        }

        const angry = ColorUtils.rgbToHsl(byMood.angry.bg);
        const angryHueOk = angry.h <= 25 || angry.h >= 340;
        if (!angryHueOk) {
            problems.push('angry should feel red (hue ' + Math.round(angry.h) + '°)');
        }

        const happy = ColorUtils.rgbToHsl(byMood.happy.bg);
        const happyHueOk = happy.h >= 35 && happy.h <= 70;
        if (!happyHueOk) {
            problems.push('happy should feel yellow (hue ' + Math.round(happy.h) + '°)');
        }

        const nightLum = ColorUtils.relativeLuminance(byMood.night.bg);
        if (nightLum > 0.13) {
            problems.push('night background is too light (luminance ' + nightLum.toFixed(2) + ')');
        }

        // Every mood needs readable text.
        for (const s of snapshots) {
            const ratio = ColorUtils.contrastRatio(s.text, s.bg);
            if (ratio < MIN_CONTRAST) {
                problems.push(s.mood + ' text contrast ' + ratio.toFixed(2) + ':1');
            }
        }

        if (problems.length) return fail(problems.join('; ') + '.');
        return pass('Four distinct, readable moods switched via CSS variables.');
    }

    /* ------------------------------------------------------------------ */
    /* 12 — Color Blind Mode                                               */
    /* ------------------------------------------------------------------ */
    function checkColorBlindMode(ctx) {
        const source = ctx.sourceCss + '\n' + ctx.sourceJs;
        const mentionsCvd = /deuteran|protan|tritan|cvd|color[- ]?blind|feColorMatrix|color-blind/i
            .test(source);
        if (!mentionsCvd) {
            return fail('Reference the simulation (deuteranopia / CVD / feColorMatrix) in your code.');
        }
        if (!/classList|setAttribute|\.style\.|filter\s*:/.test(source)) {
            return fail('Toggle the simulation with a class, attribute, style, or filter.');
        }

        const btn = ctx.doc.getElementById('cvdToggle');
        const palette = ctx.doc.getElementById('palette');
        if (!btn || !palette) return fail('Missing #cvdToggle or #palette.');

        const ids = ['c1', 'c2', 'c3', 'c4'];
        const before = ids.map((id) => bg(ctx.doc, id));

        btn.click();

        const after = ids.map((id) => bg(ctx.doc, id));
        let changed = 0;
        for (let i = 0; i < ids.length; i++) {
            if (before[i] && after[i] &&
                ColorUtils.colorDistance(before[i], after[i]) > DISTINCT_DISTANCE) {
                changed++;
            }
        }

        if (changed < 2) {
            return fail('Clicking the toggle should change at least two swatch colors (' +
                changed + ' changed).');
        }

        // Red and green are the critical deuteranopia pair — at least one must move.
        const redMoved = before[0] && after[0] &&
            ColorUtils.colorDistance(before[0], after[0]) > DISTINCT_DISTANCE;
        const greenMoved = before[1] && after[1] &&
            ColorUtils.colorDistance(before[1], after[1]) > DISTINCT_DISTANCE;
        if (!redMoved && !greenMoved) {
            return fail('The red and green swatches should shift under deuteranopia.');
        }

        return pass('Toggle simulates deuteranopia (' + changed + ' swatches change).');
    }

    const map = {
        'color-naming': checkColorNaming,
        'hex-hunt': checkHexHunt,
        'rgb-mixer': checkRgbMixer,
        'sunset-palette': checkSunsetPalette,
        'hsl-rainbow': checkHslRainbow,
        'dark-mode-toggle': checkDarkModeToggle,
        'accessible-contrast': checkAccessibleContrast,
        'color-theory-quiz': checkColorTheoryQuiz,
        'palette-generator': checkPaletteGenerator,
        'traffic-light': checkTrafficLight,
        'mood-page': checkMoodPage,
        'color-blind-mode': checkColorBlindMode
    };

    /**
     * Runs the checker for a challenge id.
     * @param {string} id
     * @param {object} ctx
     * @returns {{pass:boolean, message:string}}
     */
    function run(id, ctx) {
        const fn = map[id];
        if (!fn) return fail('No checker for "' + id + '".');
        try {
            return fn(ctx);
        } catch (err) {
            return fail('Checker error: ' + (err && err.message ? err.message : String(err)));
        }
    }

    return {
        run: run,
        map: map
    };
});
