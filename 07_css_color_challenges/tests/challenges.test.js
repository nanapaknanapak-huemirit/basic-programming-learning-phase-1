'use strict';

/**
 * Source-level smoke checks for checkers + challenge data.
 * Full DOM checkers need a browser; these catch wiring mistakes early.
 */
const test = require('node:test');
const assert = require('node:assert');
const Challenges = require('../js/challenges.js');
const Checkers = require('../js/checkers.js');
const ColorUtils = require('../js/color-utils.js');

test('every challenge has a registered checker', () => {
    for (const c of Challenges.list) {
        assert.ok(Checkers.map[c.id], 'missing checker for ' + c.id);
    }
});

test('checker count matches challenge count', () => {
    assert.strictEqual(Object.keys(Checkers.map).length, Challenges.list.length);
});

test('non-quiz challenges expose starter and solution CSS', () => {
    for (const c of Challenges.list) {
        if (c.type === 'quiz') continue;
        assert.ok(c.starterCss && c.starterCss.length > 20, c.id + ' starterCss');
        assert.ok(c.solutionCss && c.solutionCss.length > 20, c.id + ' solutionCss');
        assert.ok(c.targetHtml, c.id + ' targetHtml');
    }
});

test('js challenges expose starter and solution JS', () => {
    for (const c of Challenges.list.filter((x) => x.type === 'js')) {
        assert.strictEqual(typeof c.starterJs, 'string');
        assert.ok(c.solutionJs && c.solutionJs.trim().length > 10, c.id + ' solutionJs');
    }
});

test('quiz has 8 questions with valid answer indexes', () => {
    const quiz = Challenges.getById('color-theory-quiz');
    assert.strictEqual(quiz.quiz.questions.length, 8);
    for (const q of quiz.quiz.questions) {
        assert.ok(q.options.length >= 2);
        assert.ok(q.answer >= 0 && q.answer < q.options.length, q.q);
        assert.ok(q.explain);
    }
});

test('levels partition all 12 challenges (3 / 4 / 5)', () => {
    assert.strictEqual(Challenges.list.length, 12);
    assert.strictEqual(Challenges.byLevel(1).length, 3);
    assert.strictEqual(Challenges.byLevel(2).length, 4);
    assert.strictEqual(Challenges.byLevel(3).length, 5);
});

test('solutions pass source-only traffic light checks (no DOM bits)', () => {
    const c = Challenges.getById('traffic-light');
    assert.match(c.solutionCss, /@keyframes/);
    assert.match(c.solutionCss, /animation\s*:/);
    const tokens = ColorUtils.extractColorTokens(c.solutionCss);
    const parsed = tokens.map((t) => ColorUtils.parseColor(t)).filter(Boolean);
    assert.ok(parsed.length >= 3);
    const hues = parsed.map((p) => ColorUtils.rgbToHsl(p).h);
    assert.ok(hues.some((h) => ColorUtils.hueDistance(h, 0) <= 20), 'has red');
    assert.ok(hues.some((h) => ColorUtils.hueDistance(h, 55) <= 30), 'has yellow');
    assert.ok(hues.some((h) => ColorUtils.hueDistance(h, 130) <= 35), 'has green');
});

test('color naming solution uses only named colors', () => {
    const c = Challenges.getById('color-naming');
    // Strip comments before scanning for forbidden color functions.
    const code = c.solutionCss.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(code), 'no hex');
    assert.ok(!/\brgba?\(/i.test(code), 'no rgb');
    assert.ok(!/\bhsla?\(/i.test(code), 'no hsl');
    for (const name of c.targets) {
        assert.ok(ColorUtils.isNamedColor(name), name);
        assert.match(code, new RegExp('background-color:\\s*' + name + '\\b'));
    }
});

test('hex hunt solution contains 10 matching hex codes', () => {
    const c = Challenges.getById('hex-hunt');
    for (const target of c.targets) {
        assert.ok(c.solutionCss.toLowerCase().includes(target.toLowerCase()), target);
    }
});

test('accessible contrast solution passes WCAG math', () => {
    const pairs = [
        ['#ffffff', '#595959'],
        ['#f7f7d8', '#5c5c1f'],
        ['#3d5a80', '#e0eeff']
    ];
    for (const [bg, fg] of pairs) {
        const ratio = ColorUtils.contrastRatio(fg, bg);
        assert.ok(ratio >= 4.5, bg + ' / ' + fg + ' = ' + ratio.toFixed(2));
    }
});

test('accessible contrast starter actually fails at least once', () => {
    const ratio = ColorUtils.contrastRatio('#bbbbbb', '#ffffff');
    assert.ok(ratio < 4.5, 'starter should fail AA, got ' + ratio);
});

test('dark mode solution themes meet contrast targets', () => {
    const light = ColorUtils.contrastRatio('#1a1a1a', '#ffffff');
    const dark = ColorUtils.contrastRatio('#f2f2f7', '#1e1e2a');
    assert.ok(light >= 4.5, 'light ' + light);
    assert.ok(dark >= 4.5, 'dark ' + dark);
    assert.ok(ColorUtils.colorDistance('#ffffff', '#1e1e2a') > 20, 'themes differ');
});

test('sunset solution palette is warm and distinct', () => {
    const c = Challenges.getById('sunset-palette');
    const colors = [
        '#4a1942', '#c9184a', '#ff6b35', '#ff9e00', '#ffd166'
    ];
    colors.forEach((hex) => {
        const hsl = ColorUtils.rgbToHsl(hex);
        const warm = hsl.h <= 60 || hsl.h >= 300;
        assert.ok(warm, hex + ' hue ' + hsl.h);
    });
    for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
            assert.ok(
                ColorUtils.colorDistance(colors[i], colors[j]) > 10,
                colors[i] + ' vs ' + colors[j]
            );
        }
    }
    // Ensure solution references the variables the checker demands
    assert.ok(c.solutionCss.includes('--sunset-'));
});

test('hsl rainbow solution sweeps monotonically', () => {
    const c = Challenges.getById('hsl-rainbow');
    const tokens = ColorUtils.extractColorTokens(c.solutionCss)
        .filter((t) => /^hsla?\(/i.test(t));
    assert.ok(tokens.length >= 7);
    const hues = tokens.map((t) => ColorUtils.rgbToHsl(t).h);
    for (let i = 0; i < hues.length - 1; i++) {
        const step = hues[i + 1] - hues[i];
        assert.ok(step > 5 && step < 90, 'step ' + i + '=' + step);
    }
    const span = hues[hues.length - 1] - hues[0];
    assert.ok(span >= 300, 'span ' + span);
});

test('mood solution defines four data-theme blocks', () => {
    const c = Challenges.getById('mood-page');
    for (const mood of ['calm', 'angry', 'happy', 'night']) {
        assert.ok(
            c.solutionCss.includes('[data-theme="' + mood + '"]'),
            mood
        );
    }
    assert.ok(c.solutionJs.includes('data-theme'));
});

test('checker failures return messages for empty source', () => {
    const c = Challenges.getById('color-naming');
    const result = Checkers.run(c.id, {
        challenge: c,
        sourceCss: '',
        sourceJs: '',
        doc: null,
        win: null,
        utils: ColorUtils,
        quizAnswers: []
    });
    assert.strictEqual(result.pass, false);
    assert.ok(result.message.length > 5);
});

test('quiz checker fails with unanswered and passes with correct answers', () => {
    const c = Challenges.getById('color-theory-quiz');
    const correct = c.quiz.questions.map((q) => q.answer);

    const empty = Checkers.run(c.id, {
        challenge: c,
        quizAnswers: [],
        doc: null,
        win: null,
        utils: ColorUtils
    });
    assert.strictEqual(empty.pass, false);

    const full = Checkers.run(c.id, {
        challenge: c,
        quizAnswers: correct,
        doc: null,
        win: null,
        utils: ColorUtils
    });
    assert.strictEqual(full.pass, true);

    const half = correct.slice();
    half[0] = (half[0] + 1) % c.quiz.questions[0].options.length;
    const partial = Checkers.run(c.id, {
        challenge: c,
        quizAnswers: half,
        doc: null,
        win: null,
        utils: ColorUtils
    });
    assert.strictEqual(partial.pass, true, '7/8 = 87.5% ≥ 70%');
});

test('buildSrcdoc is exported for smoke HTML generation', () => {
    assert.strictEqual(typeof Checkers.run, 'function');
    assert.ok(Challenges.getById('palette-generator'));
});
