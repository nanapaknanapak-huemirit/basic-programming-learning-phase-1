'use strict';

const test = require('node:test');
const assert = require('node:assert');
const ColorUtils = require('../js/color-utils.js');

test('hexToRgb parses 6-digit hex', () => {
    const c = ColorUtils.hexToRgb('#ff8000');
    assert.deepStrictEqual({ r: c.r, g: c.g, b: c.b }, { r: 255, g: 128, b: 0 });
});

test('hexToRgb expands 3-digit hex', () => {
    const c = ColorUtils.hexToRgb('#f80');
    assert.deepStrictEqual({ r: c.r, g: c.g, b: c.b }, { r: 255, g: 136, b: 0 });
});

test('hexToRgb rejects garbage', () => {
    assert.strictEqual(ColorUtils.hexToRgb('#gg0000'), null);
    assert.strictEqual(ColorUtils.hexToRgb('not-a-color'), null);
});

test('parseColor handles rgb() and rgba()', () => {
    const a = ColorUtils.parseColor('rgb(255, 0, 0)');
    assert.strictEqual(a.r, 255);
    const b = ColorUtils.parseColor('rgba(0, 128, 255, 0.5)');
    assert.strictEqual(b.a, 0.5);
});

test('parseColor handles percentages in rgb()', () => {
    const c = ColorUtils.parseColor('rgb(100%, 0%, 50%)');
    assert.strictEqual(c.r, 255);
    assert.strictEqual(c.b, 128);
});

test('parseColor handles hsl()', () => {
    const c = ColorUtils.parseColor('hsl(0, 100%, 50%)');
    assert.deepStrictEqual({ r: c.r, g: c.g, b: c.b }, { r: 255, g: 0, b: 0 });
});

test('parseColor handles named colors and transparent', () => {
    const red = ColorUtils.parseColor('red');
    assert.strictEqual(red.r, 255);
    const t = ColorUtils.parseColor('transparent');
    assert.strictEqual(t.a, 0);
});

test('parseColor rejects invalid input', () => {
    assert.strictEqual(ColorUtils.parseColor('not-a-color'), null);
    assert.strictEqual(ColorUtils.parseColor(''), null);
    assert.strictEqual(ColorUtils.parseColor(null), null);
});

test('rgbToHex round-trips', () => {
    assert.strictEqual(ColorUtils.rgbToHex('#a1b2c3'), '#a1b2c3');
    assert.strictEqual(ColorUtils.rgbToHex(ColorUtils.hexToRgb('#00ff10')), '#00ff10');
});

test('rgbToHsl / hslToRgb round-trip within tolerance', () => {
    const hsl = ColorUtils.rgbToHsl('#3366cc');
    const rgb = ColorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
    assert.ok(ColorUtils.colorDistance(rgb, '#3366cc') < 3);
});

test('colorDistance is zero for identical colors', () => {
    assert.strictEqual(ColorUtils.colorDistance('#123456', '#123456'), 0);
});

test('colorDistance is Infinity for unparseable colors', () => {
    assert.strictEqual(ColorUtils.colorDistance('#123456', 'zzz'), Infinity);
});

test('contrastRatio black on white is 21', () => {
    const ratio = ColorUtils.contrastRatio('#000000', '#ffffff');
    assert.ok(Math.abs(ratio - 21) < 0.01, `got ${ratio}`);
});

test('contrastRatio same color is 1', () => {
    assert.ok(Math.abs(ColorUtils.contrastRatio('#444444', '#444444') - 1) < 0.01);
});

test('contrastRatio flags WCAG failures', () => {
    const ratio = ColorUtils.contrastRatio('#777777', '#ffffff');
    assert.ok(ratio < 4.5, `light gray on white should fail AA, got ${ratio}`);
});

test('isNamedColor accepts CSS names and rejects hex', () => {
    assert.strictEqual(ColorUtils.isNamedColor('teal'), true);
    assert.strictEqual(ColorUtils.isNamedColor(' rebeccapurple '), true);
    assert.strictEqual(ColorUtils.isNamedColor('#ff0000'), false);
    assert.strictEqual(ColorUtils.isNamedColor('chart'), false);
});

test('hueDistance wraps around 360', () => {
    assert.strictEqual(ColorUtils.hueDistance(10), 10);
    assert.strictEqual(ColorUtils.hueDistance(350), 10);
    assert.strictEqual(ColorUtils.hueDistance(-10), 10);
});

test('extractColorTokens finds hex, rgb, hsl and named colors', () => {
    const css = '.a { color: red; background: #ff0000; border-color: rgb(0, 128, 0); outline: hsl(200, 50%, 40%); }';
    const tokens = ColorUtils.extractColorTokens(css);
    assert.ok(tokens.some((t) => t === '#ff0000'));
    assert.ok(tokens.some((t) => t.startsWith('rgb(')));
    assert.ok(tokens.some((t) => t.startsWith('hsl(')));
    assert.ok(tokens.includes('red'));
});
