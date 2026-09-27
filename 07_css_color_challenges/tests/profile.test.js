'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Profile = require('../js/profile.js');

function storageWith(value) {
    const values = new Map();
    if (value !== undefined) values.set(Profile.STORAGE_KEY, value);
    return {
        getItem: function (key) { return values.has(key) ? values.get(key) : null; },
        setItem: function (key, value) { values.set(key, value); },
        removeItem: function (key) { values.delete(key); },
        values: values
    };
}

test('normalizes a first name and limits its length', () => {
    assert.strictEqual(Profile.normalizeName('  Ada   Lovelace  '), 'Ada Lovelace');
    assert.strictEqual(Profile.normalizeName('x'.repeat(60)).length, Profile.MAX_LENGTH);
    assert.strictEqual(Profile.normalizeName(null), '');
});

test('saves, loads, and clears a name without other progress keys', () => {
    const storage = storageWith();
    assert.strictEqual(Profile.save('  Sam  ', storage), 'Sam');
    assert.strictEqual(Profile.load(storage), 'Sam');
    assert.strictEqual(storage.values.size, 1);
    Profile.clear(storage);
    assert.strictEqual(Profile.load(storage), '');
    assert.strictEqual(storage.values.size, 0);
});

test('ignores malformed profile data', () => {
    assert.strictEqual(Profile.load(storageWith('{bad json')), '');
    assert.strictEqual(Profile.load(storageWith('null')), '');
});
