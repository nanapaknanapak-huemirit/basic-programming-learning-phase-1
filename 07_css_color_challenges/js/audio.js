(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AudioLayer = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    let selectedVoiceURI = '';
    let volume = 0.9;
    let speaking = false;
    let voices = [];

    function getWindow() {
        return typeof window === 'undefined' ? null : window;
    }

    function getSynthesis() {
        const win = getWindow();
        return win && win.speechSynthesis ? win.speechSynthesis : null;
    }

    function getUtteranceConstructor() {
        const win = getWindow();
        return win && win.SpeechSynthesisUtterance ? win.SpeechSynthesisUtterance : null;
    }

    function isSupported() {
        return Boolean(getSynthesis() && getUtteranceConstructor());
    }

    function refreshVoices() {
        const synth = getSynthesis();
        if (!synth) {
            voices = [];
            return voices.slice();
        }
        try {
            voices = synth.getVoices() || [];
        } catch (err) {
            voices = [];
        }
        return voices.slice();
    }

    function getEnglishVoices(source) {
        const list = Array.isArray(source) ? source : refreshVoices();
        return list.filter(function (voice) {
            return voice && typeof voice.lang === 'string' && /^en(?:-|_|$)/i.test(voice.lang);
        });
    }

    function chooseVoice(source, uri) {
        const list = getEnglishVoices(source);
        if (uri) {
            const selected = list.find(function (voice) {
                return voice.voiceURI === uri;
            });
            if (selected) return selected;
        }
        return list[0] || null;
    }

    function setVoice(uri) {
        selectedVoiceURI = typeof uri === 'string' ? uri : '';
        return selectedVoiceURI;
    }

    function getSelectedVoiceURI() {
        return selectedVoiceURI;
    }

    function setVolume(value) {
        const number = Number(value);
        volume = Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0.9;
        return volume;
    }

    function getVolume() {
        return volume;
    }

    function isSpeaking() {
        return speaking;
    }

    function stop() {
        const synth = getSynthesis();
        if (synth) synth.cancel();
        speaking = false;
    }

    function speak(text, options) {
        const synth = getSynthesis();
        const Utterance = getUtteranceConstructor();
        const message = String(text || '').trim();
        const settings = options || {};
        if (!synth || !Utterance || !message) return false;

        try {
            synth.cancel();
        } catch (err) {
            return false;
        }
        refreshVoices();
        const utterance = new Utterance(message);
        const voice = chooseVoice(voices, settings.voiceURI ? settings.voiceURI : selectedVoiceURI);
        if (voice) utterance.voice = voice;
        utterance.lang = settings.lang || (voice && voice.lang) || 'en-US';
        utterance.rate = Number.isFinite(Number(settings.rate)) ? Number(settings.rate) : 0.95;
        utterance.pitch = Number.isFinite(Number(settings.pitch)) ? Number(settings.pitch) : 1;
        utterance.volume = Number.isFinite(Number(settings.volume)) ? Math.min(1, Math.max(0, Number(settings.volume))) : volume;
        utterance.onstart = function () {
            speaking = true;
            if (typeof settings.onStart === 'function') settings.onStart();
        };
        utterance.onend = function () {
            speaking = false;
            if (typeof settings.onEnd === 'function') settings.onEnd();
        };
        utterance.onerror = function (event) {
            speaking = false;
            if (typeof settings.onError === 'function') settings.onError(event);
        };
        speaking = true;
        try {
            synth.speak(utterance);
        } catch (err) {
            speaking = false;
            if (typeof settings.onError === 'function') settings.onError(err);
            return false;
        }
        return true;
    }

    function bindVoicesChanged(callback) {
        const win = getWindow();
        const synth = getSynthesis();
        if (!win || !synth) return function () {};
        const handler = function () {
            refreshVoices();
            if (typeof callback === 'function') callback(voices.slice());
        };
        if (typeof synth.addEventListener === 'function') {
            synth.addEventListener('voiceschanged', handler);
            return function () {
                synth.removeEventListener('voiceschanged', handler);
            };
        }
        const previous = synth.onvoiceschanged;
        synth.onvoiceschanged = handler;
        return function () {
            synth.onvoiceschanged = previous || null;
        };
    }

    return {
        isSupported: isSupported,
        refreshVoices: refreshVoices,
        getVoices: function () {
            return voices.slice();
        },
        getEnglishVoices: getEnglishVoices,
        chooseVoice: chooseVoice,
        setVoice: setVoice,
        getSelectedVoiceURI: getSelectedVoiceURI,
        setVolume: setVolume,
        getVolume: getVolume,
        speak: speak,
        stop: stop,
        isSpeaking: isSpeaking,
        bindVoicesChanged: bindVoicesChanged
    };
});
