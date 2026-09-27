(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Profile = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const STORAGE_KEY = 'cssChallenges_profile_v1';
    const MAX_LENGTH = 40;

    function normalizeName(value) {
        if (typeof value !== 'string') return '';
        return value.replace(/\s+/g, ' ').trim().slice(0, MAX_LENGTH);
    }

    function getStorage(storage) {
        if (storage) return storage;
        if (typeof window === 'undefined' || !window.localStorage) return null;
        try {
            return window.localStorage;
        } catch (err) {
            return null;
        }
    }

    function load(storage) {
        const target = getStorage(storage);
        if (!target) return '';
        try {
            const raw = target.getItem(STORAGE_KEY);
            if (!raw) return '';
            const data = JSON.parse(raw);
            return normalizeName(data && data.name);
        } catch (err) {
            return '';
        }
    }

    function saveWithStatus(name, storage) {
        const target = getStorage(storage);
        const normalized = normalizeName(name);
        if (!target) return { ok: false, name: normalized };
        try {
            if (normalized) {
                target.setItem(STORAGE_KEY, JSON.stringify({ name: normalized }));
            } else {
                target.removeItem(STORAGE_KEY);
            }
            return { ok: true, name: normalized };
        } catch (err) {
            return { ok: false, name: normalized };
        }
    }

    function save(name, storage) {
        return saveWithStatus(name, storage).name;
    }

    function clear(storage) {
        const target = getStorage(storage);
        if (!target) return;
        try {
            target.removeItem(STORAGE_KEY);
        } catch (err) {
            return;
        }
    }

    return {
        STORAGE_KEY: STORAGE_KEY,
        MAX_LENGTH: MAX_LENGTH,
        normalizeName: normalizeName,
        load: load,
        save: save,
        saveWithStatus: saveWithStatus,
        clear: clear
    };
});
