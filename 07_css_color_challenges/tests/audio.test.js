'use strict';

const test = require('node:test');
const assert = require('node:assert');
const AudioLayer = require('../js/audio.js');

test('keeps only English voices', () => {
    const voices = AudioLayer.getEnglishVoices([
        { name: 'Generic', lang: 'en', voiceURI: 'generic' },
        { name: 'US', lang: 'en-US', voiceURI: 'us' },
        { name: 'French', lang: 'fr-FR', voiceURI: 'fr' },
        { name: 'Broken', voiceURI: 'broken' }
    ]);
    assert.deepStrictEqual(voices.map((voice) => voice.voiceURI), ['generic', 'us']);
});

test('chooses a selected English voice and falls back automatically', () => {
    const voices = [
        { name: 'US', lang: 'en-US', voiceURI: 'us' },
        { name: 'UK', lang: 'en-GB', voiceURI: 'uk' }
    ];
    assert.strictEqual(AudioLayer.chooseVoice(voices, 'uk').voiceURI, 'uk');
    assert.strictEqual(AudioLayer.chooseVoice(voices, 'missing').voiceURI, 'us');
    assert.strictEqual(AudioLayer.chooseVoice([], 'uk'), null);
});

test('clamps volume to the browser speech range', () => {
    assert.strictEqual(AudioLayer.setVolume(-2), 0);
    assert.strictEqual(AudioLayer.setVolume(0.35), 0.35);
    assert.strictEqual(AudioLayer.setVolume(3), 1);
    assert.strictEqual(AudioLayer.setVolume('bad'), 0.9);
    assert.strictEqual(AudioLayer.getVolume(), 0.9);
});
