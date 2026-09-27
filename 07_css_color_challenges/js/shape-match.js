(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            typeof require === 'function' ? require('./shape-challenges.js') : root.ShapeChallenges
        );
    } else {
        root.ShapeMatch = factory(root.ShapeChallenges);
    }
})(typeof self !== 'undefined' ? self : this, function (ShapeChallenges) {
    'use strict';

    const STORAGE_KEY = 'cssChallenges_shapes_v1';

    let state = { completed: {}, currentId: ShapeChallenges.list[0].id };
    let els = {};
    let onProgress = function () {};
    let onRead = function () {};
    let active = false;

    function getStorage(storage) {
        if (storage) return storage;
        if (typeof window === 'undefined' || !window.localStorage) return null;
        try {
            return window.localStorage;
        } catch (err) {
            return null;
        }
    }

    function readStored(storage) {
        const target = getStorage(storage);
        if (!target) return { completed: {}, currentId: ShapeChallenges.list[0].id };
        try {
            const data = JSON.parse(target.getItem(STORAGE_KEY) || '{}');
            const completed = {};
            if (data && data.completed && typeof data.completed === 'object') {
                Object.keys(data.completed).forEach(function (id) {
                    if (ShapeChallenges.getById(id) && data.completed[id]) completed[id] = true;
                });
            }
            return {
                completed: completed,
                currentId: typeof data.currentId === 'string' ? data.currentId : ShapeChallenges.list[0].id
            };
        } catch (err) {
            return { completed: {}, currentId: ShapeChallenges.list[0].id };
        }
    }

    function writeStored(storage) {
        const target = getStorage(storage);
        if (!target) return false;
        try {
            target.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (err) {
            return false;
        }
    }

    function completedCount() {
        return Object.keys(state.completed).filter(function (id) { return state.completed[id]; }).length;
    }

    function paintProgress() {
        if (els.progress) els.progress.textContent = completedCount() + ' / ' + ShapeChallenges.list.length + ' complete';
    }

    function paintClue(challenge, done) {
        if (!els.skill) return;
        els.skill.textContent = done ? 'CSS clue: ' + challenge.skill : 'Choose the matching CSS';
        els.skill.classList.toggle('chip-revealed', done);
    }

    function currentChallenge() {
        return ShapeChallenges.getById(state.currentId) || ShapeChallenges.list[0];
    }

    function notifyProgress() {
        if (typeof onProgress === 'function') onProgress(completedCount());
    }

    function setFeedback(kind, title, message, hint) {
        if (!els.feedback) return;
        els.feedback.hidden = false;
        els.feedback.className = 'shape-feedback ' + (kind === 'pass' ? 'shape-feedback-pass' : 'shape-feedback-fail');
        if (els.feedbackIcon) els.feedbackIcon.textContent = kind === 'pass' ? '★' : '↻';
        if (els.feedbackTitle) els.feedbackTitle.textContent = title;
        if (els.feedbackMessage) els.feedbackMessage.textContent = message;
        if (els.feedbackHint) {
            els.feedbackHint.textContent = hint || '';
            els.feedbackHint.hidden = !hint;
        }
    }

    function clearFeedback() {
        if (els.feedback) {
            els.feedback.hidden = true;
            els.feedback.className = 'shape-feedback';
        }
    }

    function render() {
        if (!els.panel) return;
        const challenge = currentChallenge();
        const index = ShapeChallenges.list.indexOf(challenge);
        const done = !!state.completed[challenge.id];
        if (els.progress) els.progress.textContent = completedCount() + ' / ' + ShapeChallenges.list.length + ' complete';
        if (els.position) els.position.textContent = 'Shape ' + (index + 1) + ' of ' + ShapeChallenges.list.length;
        if (els.title) els.title.textContent = challenge.name;
        if (els.prompt) els.prompt.textContent = challenge.prompt;
        paintClue(challenge, done);
        if (els.next) els.next.hidden = true;
        if (els.targetStyle) {
            els.targetStyle.textContent = challenge.correctCss + '\n' +
                '.shape-target-canvas { display: flex; align-items: center; justify-content: center; min-height: 220px; }';
        }
        if (els.choices) {
            els.choices.innerHTML = '';
            challenge.choices.forEach(function (choice, choiceIndex) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'shape-choice';
                button.dataset.index = String(choiceIndex);
                const code = document.createElement('code');
                code.textContent = choice.code;
                button.appendChild(code);
                button.addEventListener('click', function () { choose(choiceIndex); });
                els.choices.appendChild(button);
            });
        }
        if (els.status) {
            els.status.textContent = done ? 'Completed — try it again or move on.' : 'Choose the CSS that matches the target.';
        }
        clearFeedback();
    }

    function focusFirstChoice() {
        if (!els.choices) return;
        const first = els.choices.querySelector('.shape-choice');
        if (first && typeof first.focus === 'function') first.focus();
    }

    function choose(choiceIndex) {
        if (!active) return;
        const challenge = currentChallenge();
        const choice = challenge.choices[choiceIndex];
        if (!choice) return;
        const buttons = els.choices ? Array.prototype.slice.call(els.choices.querySelectorAll('.shape-choice')) : [];
        if (choice.correct) {
            state.completed[challenge.id] = true;
            const saved = writeStored();
            notifyProgress();
            paintProgress();
            paintClue(challenge, true);
            buttons.forEach(function (button, index) {
                button.disabled = true;
                if (index === choiceIndex) button.classList.add('shape-choice-correct');
            });
            setFeedback('pass', 'Shape matched!', challenge.explanation, 'The CSS clue was: ' + challenge.skill);
            if (els.next) {
                els.next.hidden = false;
                els.next.focus();
            }
            if (!saved && els.status) {
                els.status.textContent = 'Matched! This browser could not save the progress.';
            } else if (els.status) {
                els.status.textContent = 'That CSS makes the target.';
            }
            return;
        }
        buttons.forEach(function (button, index) {
            if (index === choiceIndex) button.classList.add('shape-choice-wrong');
        });
        setFeedback('fail', 'Not quite yet', 'Nice try! Compare the shape and the CSS one detail at a time.', 'Hint: ' + challenge.hint);
    }

    function advance() {
        if (!active) return;
        const challenge = currentChallenge();
        const currentIndex = indexOfChallenge(challenge);
        const later = ShapeChallenges.list.slice(currentIndex + 1).find(function (item) {
            return !state.completed[item.id];
        });
        const earlier = ShapeChallenges.list.slice(0, currentIndex).find(function (item) {
            return !state.completed[item.id];
        });
        const next = later || earlier;
        if (!next) {
            if (els.next) els.next.hidden = true;
            if (els.status) els.status.textContent = 'All 20 shapes complete — amazing work!';
            return;
        }
        state.currentId = next.id;
        writeStored();
        render();
        setTimeout(focusFirstChoice, 0);
    }

    function indexOfChallenge(challenge) {
        return ShapeChallenges.list.findIndex(function (item) { return item.id === challenge.id; });
    }

    function reset() {
        state = { completed: {}, currentId: ShapeChallenges.list[0].id };
        writeStored();
        render();
        notifyProgress();
    }

    function init(domMap, callbacks) {
        els = {
            panel: document.getElementById(domMap.panel),
            progress: document.getElementById(domMap.progress),
            position: document.getElementById(domMap.position),
            title: document.getElementById(domMap.title),
            prompt: document.getElementById(domMap.prompt),
            skill: document.getElementById(domMap.skill),
            targetStyle: document.getElementById(domMap.targetStyle),
            choices: document.getElementById(domMap.choices),
            status: document.getElementById(domMap.status),
            feedback: document.getElementById(domMap.feedback),
            feedbackIcon: document.getElementById(domMap.feedbackIcon),
            feedbackTitle: document.getElementById(domMap.feedbackTitle),
            feedbackMessage: document.getElementById(domMap.feedbackMessage),
            feedbackHint: document.getElementById(domMap.feedbackHint),
            restart: document.getElementById(domMap.restart),
            read: document.getElementById(domMap.read),
            next: document.getElementById(domMap.next)
        };
        onProgress = callbacks && callbacks.onProgress ? callbacks.onProgress : onProgress;
        onRead = callbacks && callbacks.onRead ? callbacks.onRead : onRead;
        state = readStored();
        if (!ShapeChallenges.getById(state.currentId)) state.currentId = ShapeChallenges.list[0].id;
        if (els.restart) els.restart.addEventListener('click', reset);
        if (els.next) els.next.addEventListener('click', advance);
        if (els.read) {
            els.read.addEventListener('click', function () {
                const challenge = currentChallenge();
                if (typeof onRead === 'function') onRead(challengeSpeech(challenge));
            });
        }
        render();
        notifyProgress();
    }

    function challengeSpeech(challenge) {
        const completed = state.completed[challenge.id]
            ? ' You already matched this one. The CSS clue was ' + challenge.skill + '.'
            : '';
        return 'Shape match. Which CSS makes this ' + challenge.name.toLowerCase() + '?' + completed;
    }

    function activate() {
        active = true;
        render();
        notifyProgress();
        if (els.panel && typeof els.panel.focus === 'function') els.panel.focus();
    }

    function deactivate() {
        active = false;
    }

    return {
        STORAGE_KEY: STORAGE_KEY,
        init: init,
        activate: activate,
        deactivate: deactivate,
        advance: advance,
        reset: reset,
        getCompletedCount: completedCount,
        getCurrentChallenge: currentChallenge,
        readStored: readStored,
        challengeSpeech: challengeSpeech
    };
});
