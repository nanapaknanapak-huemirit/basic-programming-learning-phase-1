(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            typeof require === 'function' ? require('./profile.js') : root.Profile,
            typeof require === 'function' ? require('./audio.js') : root.AudioLayer
        );
    } else {
        root.LearningLayer = factory(root.Profile, root.AudioLayer);
    }
})(typeof self !== 'undefined' ? self : this, function (Profile, AudioLayer) {
    'use strict';

    function greeting(name) {
        const clean = Profile.normalizeName(name);
        return clean ? 'Welcome back, ' + clean + '! Ready to explore colors?' : 'Welcome! Ready to explore colors?';
    }

    function friendlyResult(name, pass, message) {
        const clean = Profile.normalizeName(name);
        if (pass) return (clean ? 'You did it, ' + clean + '!' : 'You did it!') + ' Great work.';
        return (clean ? 'Nice try, ' + clean + '!' : 'Nice try!') + ' You are learning. ' + String(message || 'Try one small change and check again.');
    }

    function challengeSpeech(challenge, name) {
        const clean = Profile.normalizeName(name);
        const parts = [
            clean ? 'Here is your challenge, ' + clean + '.' : 'Here is your challenge.',
            challenge && challenge.title ? challenge.title : '',
            challenge && challenge.tagline ? challenge.tagline + '.' : '',
            challenge && challenge.description ? challenge.description : ''
        ];
        return parts.filter(Boolean).join(' ');
    }

    function init(domMap) {
        const els = {
            greeting: document.getElementById(domMap.greeting),
            profileForm: document.getElementById(domMap.profileForm),
            nameInput: document.getElementById(domMap.nameInput),
            profileStatus: document.getElementById(domMap.profileStatus),
            profileAction: document.getElementById(domMap.profileAction),
            readGreeting: document.getElementById(domMap.readGreeting),
            voiceSelect: document.getElementById(domMap.voiceSelect),
            volume: document.getElementById(domMap.volume),
            audioStatus: document.getElementById(domMap.audioStatus),
            feedback: document.getElementById(domMap.feedback),
            feedbackIcon: document.getElementById(domMap.feedbackIcon),
            feedbackTitle: document.getElementById(domMap.feedbackTitle),
            feedbackMessage: document.getElementById(domMap.feedbackMessage),
            feedbackHint: document.getElementById(domMap.feedbackHint),
            feedbackDetails: document.getElementById(domMap.feedbackDetails),
            feedbackDetailsWrap: document.getElementById(domMap.feedbackDetailsWrap)
        };
        let name = Profile.load();
        let voicesDirty = true;

        function setAudioStatus(message) {
            if (els.audioStatus) els.audioStatus.textContent = message;
        }

        function render() {
            if (els.greeting) els.greeting.textContent = greeting(name);
            if (els.nameInput) els.nameInput.value = name;
            if (els.profileStatus) {
                els.profileStatus.textContent = name ? 'Your name is saved on this device.' : 'No name saved. You can stay anonymous.';
            }
            if (els.profileAction) els.profileAction.textContent = name ? 'Clear name' : 'Skip name';
        }

        function refreshVoices() {
            if (!AudioLayer || !els.voiceSelect) return;
            const allVoices = AudioLayer.refreshVoices();
            const english = AudioLayer.getEnglishVoices(allVoices);
            const selected = AudioLayer.getSelectedVoiceURI();
            els.voiceSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = english.length ? 'Automatic English voice' : 'English voice unavailable';
            els.voiceSelect.appendChild(defaultOption);
            english.forEach(function (voice) {
                const option = document.createElement('option');
                option.value = voice.voiceURI || '';
                option.textContent = voice.name + (voice.lang ? ' (' + voice.lang + ')' : '');
                els.voiceSelect.appendChild(option);
            });
            const value = english.some(function (voice) { return voice.voiceURI === selected; }) ? selected : '';
            els.voiceSelect.value = value;
            AudioLayer.setVoice(value);
            els.voiceSelect.disabled = !AudioLayer.isSupported() || !english.length;
            voicesDirty = false;
            setAudioStatus(AudioLayer.isSupported() ? (english.length ? 'English voices ready.' : 'No English voice was found yet.') : 'Read-aloud is not supported by this browser.');
        }

        function speak(text) {
            if (!AudioLayer || !AudioLayer.isSupported()) {
                setAudioStatus('Read-aloud is not supported by this browser.');
                return false;
            }
            if (voicesDirty) refreshVoices();
            setAudioStatus('Reading now…');
            return AudioLayer.speak(text, {
                voiceURI: els.voiceSelect ? els.voiceSelect.value : '',
                volume: els.volume ? Number(els.volume.value) : AudioLayer.getVolume(),
                onEnd: function () { setAudioStatus('Finished reading.'); },
                onError: function () { setAudioStatus('The voice could not read that text.'); }
            });
        }

        function readGreeting() {
            const message = greeting(name) + ' You can read each challenge aloud whenever you need it.';
            speak(message);
        }

        function saveName() {
            name = Profile.save(els.nameInput ? els.nameInput.value : '');
            render();
            if (els.profileStatus) {
                els.profileStatus.textContent = name ? 'Name saved on this device.' : 'No name saved. You can stay anonymous.';
            }
        }

        function clearName() {
            Profile.clear();
            name = '';
            render();
            if (els.profileStatus) els.profileStatus.textContent = 'Name cleared. Your challenge progress is still safe.';
        }

        function showResult(pass, message, hint) {
            if (!els.feedback) return friendlyResult(name, pass, message);
            els.feedback.hidden = false;
            els.feedback.className = 'feedback-card ' + (pass ? 'feedback-pass' : 'feedback-fail');
            if (els.feedbackIcon) els.feedbackIcon.textContent = pass ? '★' : '↻';
            if (els.feedbackTitle) els.feedbackTitle.textContent = pass ? 'Great work!' : 'Keep learning!';
            if (els.feedbackMessage) els.feedbackMessage.textContent = friendlyResult(name, pass, message);
            if (els.feedbackHint) {
                els.feedbackHint.textContent = pass ? 'You found the important CSS clue.' : (hint || 'Compare the target and your preview one detail at a time.');
                els.feedbackHint.hidden = !els.feedbackHint.textContent;
            }
            if (els.feedbackDetailsWrap) {
                els.feedbackDetailsWrap.hidden = pass || !message;
            }
            if (els.feedbackDetails) els.feedbackDetails.textContent = message || '';
            return friendlyResult(name, pass, message);
        }

        function hideFeedback() {
            if (els.feedback) {
                els.feedback.hidden = true;
                els.feedback.className = 'feedback-card';
            }
        }

        if (els.profileForm) {
            els.profileForm.addEventListener('submit', function (event) {
                event.preventDefault();
                saveName();
            });
        }
        if (els.profileAction) els.profileAction.addEventListener('click', clearName);
        if (els.readGreeting) els.readGreeting.addEventListener('click', readGreeting);
        if (els.voiceSelect) {
            els.voiceSelect.addEventListener('change', function () {
                AudioLayer.setVoice(els.voiceSelect.value);
            });
        }
        if (els.volume) {
            els.volume.value = String(AudioLayer && AudioLayer.getVolume ? AudioLayer.getVolume() : 0.9);
            els.volume.addEventListener('input', function () {
                if (AudioLayer && AudioLayer.setVolume) AudioLayer.setVolume(els.volume.value);
            });
        }
        if (AudioLayer && AudioLayer.bindVoicesChanged) {
            AudioLayer.bindVoicesChanged(function () {
                voicesDirty = false;
                refreshVoices();
            });
        }

        render();
        refreshVoices();

        return {
            getName: function () { return name; },
            getGreeting: function () { return greeting(name); },
            render: render,
            readGreeting: readGreeting,
            readChallenge: function (challenge) { return speak(challengeSpeech(challenge, name)); },
            readText: function (text) { return speak(text); },
            showResult: showResult,
            hideFeedback: hideFeedback,
            refreshVoices: refreshVoices,
            friendlyResult: function (pass, message) { return friendlyResult(name, pass, message); }
        };
    }

    return {
        greeting: greeting,
        friendlyResult: friendlyResult,
        challengeSpeech: challengeSpeech,
        init: init
    };
});
