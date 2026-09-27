'use strict';

const test = require('node:test');
const assert = require('node:assert');
const ShapeChallenges = require('../js/shape-challenges.js');

test('provides the requested 20 shape activities', () => {
    assert.strictEqual(ShapeChallenges.list.length, 20);
    const expected = [
        'circle', 'square', 'rounded-square', 'pill', 'triangle',
        'diamond', 'parallelogram', 'trapezoid', 'hexagon', 'octagon',
        'star', 'heart', 'crescent', 'ring', 'half-circle', 'cross',
        'arrow', 'speech-bubble', 'chevron', 'blob'
    ];
    assert.deepStrictEqual(ShapeChallenges.list.map((item) => item.id), expected);
});

test('each shape has four CSS choices and one valid answer', () => {
    for (const item of ShapeChallenges.list) {
        assert.strictEqual(item.choices.length, 4, item.id);
        assert.strictEqual(item.choices.filter((choice) => choice.correct).length, 1, item.id);
        assert.ok(item.answer >= 0 && item.answer < item.choices.length, item.id);
        assert.strictEqual(item.choices[item.answer].code, item.correctCss, item.id);
        assert.ok(item.hint && item.explanation, item.id);
    }
});

test('shape lookup and code data are usable', () => {
    assert.strictEqual(ShapeChallenges.getById('heart').name, 'Heart');
    assert.strictEqual(ShapeChallenges.getByIndex(0).id, 'circle');
    assert.strictEqual(ShapeChallenges.getById('missing'), null);
    assert.ok(ShapeChallenges.BASE_CSS.includes('.shape'));
});
