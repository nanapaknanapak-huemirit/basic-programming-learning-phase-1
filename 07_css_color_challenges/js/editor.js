/**
 * Editor — code textareas + dual iframes (target vs live preview).
 *
 * Builds a self-contained srcdoc for each iframe from the challenge's
 * HTML scaffold plus CSS/JS, debounces live updates, and exposes the
 * current sources for checkers.
 */
(function (root) {
    'use strict';

    const UPDATE_DEBOUNCE_MS = 250;

    let state = {
        challenge: null,
        previewReady: Promise.resolve()
    };
    let debounceTimer = null;
    let quizAnswers = [];
    let activeCodeTab = 'css';

    let els = {
        targetFrame: null,
        previewFrame: null,
        cssEditor: null,
        codePane: null,
        jsPane: null,
        jsEditor: null,
        jsTab: null,
        cssTab: null,
        quizPane: null,
        quizList: null
    };

    /**
     * Caches DOM references and binds input/tab listeners.
     * @param {object} domMap - element ids
     */
    function init(domMap) {
        els.targetFrame = document.getElementById(domMap.targetFrame);
        els.previewFrame = document.getElementById(domMap.previewFrame);
        els.cssEditor = document.getElementById(domMap.cssEditor);
        els.codePane = document.getElementById(domMap.codePane);
        els.jsPane = document.getElementById(domMap.jsPane);
        els.jsEditor = document.getElementById(domMap.jsEditor);
        els.jsTab = document.getElementById(domMap.jsTab);
        els.cssTab = document.getElementById(domMap.cssTab);
        els.quizPane = document.getElementById(domMap.quizPane);
        els.quizList = document.getElementById(domMap.quizList);

        els.cssEditor.addEventListener('input', schedulePreviewUpdate);
        els.jsEditor.addEventListener('input', schedulePreviewUpdate);

        if (els.cssTab) {
            els.cssTab.addEventListener('click', function () {
                activateCodeTab('css');
            });
        }
        if (els.jsTab) {
            els.jsTab.addEventListener('click', function () {
                activateCodeTab('js');
            });
        }
    }

    function activateCodeTab(which) {
        activeCodeTab = which;
        const needsJs = state.challenge && state.challenge.type === 'js';
        if (els.cssTab) {
            els.cssTab.classList.toggle('active', which === 'css');
            els.cssTab.setAttribute('aria-selected', which === 'css' ? 'true' : 'false');
        }
        if (els.jsTab) {
            els.jsTab.classList.toggle('active', which === 'js');
            els.jsTab.setAttribute('aria-selected', which === 'js' ? 'true' : 'false');
            els.jsTab.hidden = !needsJs;
        }
        if (els.codePane) els.codePane.hidden = which !== 'css';
        if (els.jsPane) els.jsPane.hidden = which !== 'js' || !needsJs;
    }

    /**
     * Builds a full HTML document string.
     * @param {object} challenge
     * @param {string} css
     * @param {string} js
     * @returns {string}
     */
    function buildSrcdoc(challenge, css, js) {
        const escapedJs = String(js || '').replace(/<\/script/gi, '<\\/script');
        const scriptTag = challenge && challenge.type === 'js' && escapedJs.trim()
            ? '<scr' + 'ipt>\n' + escapedJs + '\n</scr' + 'ipt>'
            : '';
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
            '<meta charset="utf-8">\n' +
            '<style>\n' + css + '\n</style>\n' +
            '</head>\n<body>\n' +
            (challenge ? challenge.targetHtml : '') +
            '\n' + scriptTag + '\n</body>\n</html>';
    }

    function schedulePreviewUpdate() {
        if (debounceTimer) clearTimeout(debounceTimer);
        state.previewReady = new Promise(function (resolve) {
            debounceTimer = setTimeout(function () {
                updatePreview();
                resolve();
            }, UPDATE_DEBOUNCE_MS);
        });
    }

    function updatePreview() {
        if (!state.challenge) return Promise.resolve();
        return new Promise(function (resolve) {
            const onLoad = function () {
                els.previewFrame.removeEventListener('load', onLoad);
                resolve();
            };
            els.previewFrame.addEventListener('load', onLoad);
            els.previewFrame.srcdoc = buildSrcdoc(
                state.challenge,
                els.cssEditor.value,
                state.challenge.type === 'js' ? els.jsEditor.value : ''
            );
            // Safety net if load never fires (empty doc edge cases)
            setTimeout(function () {
                els.previewFrame.removeEventListener('load', onLoad);
                resolve();
            }, 800);
        });
    }

    /** Resolves once the pending debounce + iframe load have settled. */
    function whenReady() {
        return state.previewReady.then(function () {
            return new Promise(function (resolve) {
                setTimeout(resolve, 30);
            });
        });
    }

    /**
     * Loads a challenge: resets editors to starter code and renders both frames.
     * @param {object} challenge
     * @param {{css?:string, js?:string}} [saved] - optional restored code
     */
    function load(challenge, saved) {
        state.challenge = challenge;
        quizAnswers = [];

        const isQuiz = challenge.type === 'quiz';
        const needsJs = challenge.type === 'js';

        els.quizPane.hidden = !isQuiz;
        if (els.codePane) {
            els.codePane.hidden = isQuiz;
        }
        if (els.jsPane) els.jsPane.hidden = isQuiz || !needsJs;
        if (els.jsTab) els.jsTab.hidden = isQuiz || !needsJs;
        if (els.cssTab) els.cssTab.hidden = isQuiz;

        const css = saved && saved.css !== undefined ? saved.css : challenge.starterCss;
        const js = saved && saved.js !== undefined ? saved.js : (challenge.starterJs || '');
        els.cssEditor.value = css;
        els.jsEditor.value = js;

        activateCodeTab('css');

        if (isQuiz) renderQuiz(challenge);

        if (!isQuiz) {
            els.targetFrame.srcdoc = buildSrcdoc(
                challenge,
                challenge.solutionCss || '',
                challenge.solutionJs || ''
            );
        }

        return updatePreview();
    }

    /**
     * Renders the quiz questions into the quiz pane.
     * @param {object} challenge
     */
    function renderQuiz(challenge) {
        const questions = (challenge.quiz && challenge.quiz.questions) || [];
        els.quizList.innerHTML = '';

        questions.forEach(function (q, qi) {
            const item = document.createElement('fieldset');
            item.className = 'quiz-q';
            item.dataset.q = String(qi);

            const legend = document.createElement('legend');
            legend.textContent = (qi + 1) + '. ' + q.q;
            item.appendChild(legend);

            q.options.forEach(function (opt, oi) {
                const label = document.createElement('label');
                label.className = 'quiz-opt';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'q' + qi;
                input.value = String(oi);

                input.addEventListener('change', function () {
                    quizAnswers[qi] = oi;
                    item.classList.remove('quiz-correct', 'quiz-wrong');
                    item.classList.add('quiz-answered');
                });

                const span = document.createElement('span');
                span.textContent = opt;

                label.appendChild(input);
                label.appendChild(span);
                item.appendChild(label);
            });

            const explain = document.createElement('p');
            explain.className = 'quiz-explain';
            explain.textContent = q.explain;
            explain.hidden = true;
            item.appendChild(explain);

            els.quizList.appendChild(item);
        });
    }

    /**
     * Reveals explanations and per-question correctness after a check.
     * @param {object} challenge
     */
    function revealQuizFeedback(challenge) {
        const questions = (challenge.quiz && challenge.quiz.questions) || [];
        questions.forEach(function (q, qi) {
            const item = els.quizList.querySelector('.quiz-q[data-q="' + qi + '"]');
            if (!item) return;
            const explain = item.querySelector('.quiz-explain');
            if (explain) explain.hidden = false;
            const given = quizAnswers[qi];
            item.classList.toggle('quiz-correct', given === q.answer);
            item.classList.toggle('quiz-wrong', given !== q.answer);
        });
    }

    function getCss() {
        return els.cssEditor.value;
    }

    function getJs() {
        return state.challenge && state.challenge.type === 'js' ? els.jsEditor.value : '';
    }

    function getQuizAnswers() {
        return quizAnswers.slice();
    }

    function getCurrentChallenge() {
        return state.challenge;
    }

    function resetToStarter() {
        if (!state.challenge) return Promise.resolve();
        return load(state.challenge);
    }

    function loadSolution() {
        if (!state.challenge) return Promise.resolve();
        return load(state.challenge, {
            css: state.challenge.solutionCss || '',
            js: state.challenge.solutionJs || ''
        });
    }

    root.Editor = {
        init: init,
        load: load,
        buildSrcdoc: buildSrcdoc,
        getCss: getCss,
        getJs: getJs,
        getQuizAnswers: getQuizAnswers,
        getCurrentChallenge: getCurrentChallenge,
        resetToStarter: resetToStarter,
        loadSolution: loadSolution,
        revealQuizFeedback: revealQuizFeedback,
        schedulePreviewUpdate: schedulePreviewUpdate,
        whenReady: whenReady
    };
})(typeof self !== 'undefined' ? self : this);
