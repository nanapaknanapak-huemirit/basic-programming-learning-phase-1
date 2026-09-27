'use strict';

const test = require('node:test');
const assert = require('node:assert');
const LearningLayer = require('../js/learning-layer.js');

test('builds a greeting with and without a saved name', () => {
    assert.strictEqual(LearningLayer.greeting('  Mira '), 'Welcome back, Mira! Ready to explore colors?');
    assert.strictEqual(LearningLayer.greeting(''), 'Welcome! Ready to explore colors?');
});

test('turns checker results into friendly learner language', () => {
    assert.match(LearningLayer.friendlyResult('Mira', false, 'Try a warmer color.'), /^Nice try, Mira!/);
    assert.match(LearningLayer.friendlyResult('', true, 'pass'), /^You did it!/);
});

test('includes a saved name in challenge speech', () => {
    const speech = LearningLayer.challengeSpeech({
        title: 'Color Naming',
        tagline: 'Five boxes',
        description: 'Use named colors.'
    }, 'Mira');
    assert.match(speech, /Mira/);
    assert.match(speech, /Color Naming/);
});
