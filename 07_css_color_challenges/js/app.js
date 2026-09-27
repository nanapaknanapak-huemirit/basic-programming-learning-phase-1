/**
 * App — level navigation, challenge selection, progress persistence,
 * check/peek/reset actions, and a lightweight confetti celebration.
 */
(function (root) {
    'use strict';

    const STORAGE_KEY = 'cssChallenges_progress_v1';
    const STORAGE_CODE_KEY = 'cssChallenges_code_v1';
    const CELEBRATION_PARTICLES = 28;
    const CELEBRATION_MS = 1200;
    const TOAST_MS = 5200;

    /** @type {{currentId: string|null, level: number, completed: object, peeked: object}} */
    let state = {
        currentId: null,
        level: 1,
        completed: {},
        peeked: {},
        mode: 'challenges'
    };

    /** Code drafts per challenge id: { css, js } */
    let drafts = {};
    let learningLayer = null;

    let toastTimer = null;
    let celebrationTimer = null;
    let completionTimer = null;

    const els = {};

    function cacheDom() {
        els.levelTabs = document.getElementById('levelTabs');
        els.challengeList = document.getElementById('challengeList');
        els.progressFill = document.getElementById('progressFill');
        els.progressLabel = document.getElementById('progressLabel');
        els.challengeTitle = document.getElementById('challengeTitle');
        els.challengeTagline = document.getElementById('challengeTagline');
        els.challengeDescription = document.getElementById('challengeDescription');
        els.conceptChips = document.getElementById('conceptChips');
        els.metaLevel = document.getElementById('metaLevel');
        els.checkBtn = document.getElementById('checkBtn');
        els.resetBtn = document.getElementById('resetBtn');
        els.peekBtn = document.getElementById('peekBtn');
        els.toast = document.getElementById('toast');
        els.celebration = document.getElementById('celebration');
        els.panes = document.getElementById('panes');
        els.editorBlock = document.getElementById('editorBlock');
        els.layout = document.querySelector('.layout');
        els.shapeModeBtn = document.getElementById('shapeModeBtn');
        els.shapePanel = document.getElementById('shapeMatchPanel');
        els.shapeModeCount = document.getElementById('shapeModeCount');
        els.backToChallengesBtn = document.getElementById('backToChallengesBtn');
        els.readChallengeBtn = document.getElementById('readChallengeBtn');
        els.fatalError = document.getElementById('fatalError');
        els.fatalErrorMsg = document.getElementById('fatalErrorMsg');
    }

    /* ---------------- persistence ---------------- */

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                state.completed = data.completed || {};
                state.peeked = data.peeked || {};
                state.currentId = data.currentId || null;
                state.level = data.level || 1;
            }
            const rawCode = localStorage.getItem(STORAGE_CODE_KEY);
            if (rawCode) drafts = JSON.parse(rawCode) || {};
        } catch (err) {
            state.completed = {};
            state.peeked = {};
            drafts = {};
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                completed: state.completed,
                peeked: state.peeked,
                currentId: state.currentId,
                level: state.level
            }));
        } catch (err) { /* storage may be unavailable */ }
    }

    function saveDraft(id) {
        if (!id) return;
        drafts[id] = {
            css: Editor.getCss(),
            js: Editor.getJs()
        };
        try {
            localStorage.setItem(STORAGE_CODE_KEY, JSON.stringify(drafts));
        } catch (err) { /* ignore */ }
    }

    /* ---------------- rendering ---------------- */

    function totalChallenges() {
        return Challenges.list.length;
    }

    function completedCount() {
        return Object.keys(state.completed).filter((k) => state.completed[k]).length;
    }

    function updateProgress() {
        const done = completedCount();
        const total = totalChallenges();
        const pct = total ? Math.round((done / total) * 100) : 0;
        els.progressFill.style.width = pct + '%';
        els.progressLabel.textContent = done + ' / ' + total + ' complete';
    }

    function renderLevelTabs() {
        els.levelTabs.innerHTML = '';
        Challenges.LEVELS.forEach((level) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'level-tab' + (state.level === level.id ? ' active' : '');
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-selected', state.level === level.id ? 'true' : 'false');

            const items = Challenges.byLevel(level.id);
            const done = items.filter((c) => state.completed[c.id]).length;

            btn.innerHTML =
                '<span class="level-tab-name">Level ' + level.id + ' · ' + escapeHtml(level.name) + '</span>' +
                '<span class="level-tab-days">' + escapeHtml(level.days) + '</span>' +
                '<span class="level-tab-count">' + done + '/' + items.length + '</span>';

            btn.addEventListener('click', function () {
                state.level = level.id;
                saveState();
                renderLevelTabs();
                renderChallengeList();
            });
            els.levelTabs.appendChild(btn);
        });
    }

    function renderChallengeList() {
        els.challengeList.innerHTML = '';
        const items = Challenges.byLevel(state.level);
        items.forEach((challenge) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'challenge-card';
            if (challenge.id === state.currentId) card.classList.add('active');
            if (state.completed[challenge.id]) card.classList.add('done');

            const badge = state.completed[challenge.id]
                ? '<span class="badge badge-done" title="Completed">✓</span>'
                : state.peeked[challenge.id]
                    ? '<span class="badge badge-peek" title="Solution peeked">👁</span>'
                    : '<span class="badge badge-num">' + challenge.order + '</span>';

            card.innerHTML =
                badge +
                '<span class="challenge-card-text">' +
                '<span class="challenge-card-title">' + escapeHtml(challenge.title) + '</span>' +
                '<span class="challenge-card-tag">' + escapeHtml(challenge.tagline) + '</span>' +
                '</span>';

            card.addEventListener('click', function () {
                selectChallenge(challenge.id);
            });
            els.challengeList.appendChild(card);
        });
    }

    function renderHeader(challenge) {
        els.challengeTitle.textContent = challenge.title;
        els.challengeTagline.textContent = challenge.tagline;
        els.challengeDescription.textContent = challenge.description;

        const levelInfo = Challenges.LEVELS.find((l) => l.id === challenge.level);
        els.metaLevel.textContent = 'Level ' + challenge.level +
            (levelInfo ? ' · ' + levelInfo.name + ' · ' + levelInfo.days : '');

        els.conceptChips.innerHTML = '';
        (challenge.concepts || []).forEach((c) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.textContent = c;
            els.conceptChips.appendChild(chip);
        });

        const isQuiz = challenge.type === 'quiz';
        els.peekBtn.hidden = isQuiz;
        els.resetBtn.hidden = false;
        els.peekBtn.textContent = state.peeked[challenge.id]
            ? '👁 Solution loaded'
            : '👁 Peek solution';
        els.peekBtn.disabled = state.peeked[challenge.id] === 'loaded';

        if (els.panes) els.panes.hidden = isQuiz;
        if (els.editorBlock) els.editorBlock.hidden = isQuiz;
    }

    function showShapeMode() {
        if (state.mode === 'shape') return;
        if (completionTimer) {
            clearTimeout(completionTimer);
            completionTimer = null;
        }
        state.mode = 'shape';
        if (els.levelTabs) els.levelTabs.hidden = true;
        if (els.layout) els.layout.hidden = true;
        if (els.shapePanel) els.shapePanel.hidden = false;
        if (els.shapeModeBtn) {
            els.shapeModeBtn.classList.add('active');
            els.shapeModeBtn.setAttribute('aria-pressed', 'true');
        }
        ShapeMatch.activate();
        hideToast();
        if (learningLayer) learningLayer.hideFeedback();
    }

    function showChallengeMode() {
        if (state.mode === 'challenges') return;
        state.mode = 'challenges';
        ShapeMatch.deactivate();
        if (els.shapePanel) els.shapePanel.hidden = true;
        if (els.layout) els.layout.hidden = false;
        if (els.levelTabs) els.levelTabs.hidden = false;
        if (els.shapeModeBtn) {
            els.shapeModeBtn.classList.remove('active');
            els.shapeModeBtn.setAttribute('aria-pressed', 'false');
        }
    }

    function updateShapeModeCount(count) {
        if (els.shapeModeCount) els.shapeModeCount.textContent = (count || 0) + '/' + ShapeChallenges.list.length;
    }

    /* ---------------- actions ---------------- */

    function selectChallenge(id) {
        if (completionTimer) {
            clearTimeout(completionTimer);
            completionTimer = null;
        }
        if (state.mode === 'shape') showChallengeMode();
        const current = Editor.getCurrentChallenge();
        if (current && current.id !== state.currentId) {
            saveDraft(state.currentId);
        }

        const challenge = Challenges.getById(id);
        if (!challenge) return;

        state.currentId = id;
        const levelInfo = Challenges.LEVELS.find((l) => l.id === challenge.level);
        if (levelInfo) state.level = levelInfo.id;
        saveState();

        const draft = drafts[id];
        Editor.load(challenge, draft);
        renderHeader(challenge);
        renderLevelTabs();
        renderChallengeList();
        hideToast();
        if (learningLayer) learningLayer.hideFeedback();
    }

    function runCheck() {
        const challenge = Editor.getCurrentChallenge();
        if (!challenge) return;

        if (challenge.type === 'quiz') {
            const answers = Editor.getQuizAnswers();
            const result = Checkers.run(challenge.id, {
                challenge: challenge,
                quizAnswers: answers,
                sourceCss: '',
                sourceJs: '',
                doc: document,
                win: window,
                utils: ColorUtils
            });
            Editor.revealQuizFeedback(challenge);
            const friendly = learningLayer
                ? learningLayer.showResult(result.pass, result.message, 'Read each explanation, then try the questions again.')
                : result.message;
            showToast(result.pass ? 'pass' : 'fail', friendly);
            if (result.pass) markCompleted(challenge);
            return;
        }

        saveDraft(challenge.id);
        els.checkBtn.disabled = true;

        Editor.whenReady().then(function () {
            const frame = document.getElementById('previewFrame');
            const doc = frame.contentDocument;
            const win = frame.contentWindow;
            els.checkBtn.disabled = false;

            if (!doc || !doc.body) {
                const message = 'Preview is still loading — try again in a moment.';
                const friendly = learningLayer
                    ? learningLayer.showResult(false, message, 'Wait for the preview pane to finish loading.')
                    : message;
                showToast('fail', friendly);
                return;
            }

            const result = Checkers.run(challenge.id, {
                challenge: challenge,
                doc: doc,
                win: win,
                sourceCss: Editor.getCss(),
                sourceJs: Editor.getJs(),
                utils: ColorUtils
            });

            const friendly = learningLayer
                ? learningLayer.showResult(result.pass, result.message, 'Compare the target and your preview one detail at a time.')
                : result.message;
            showToast(result.pass ? 'pass' : 'fail', friendly);
            if (result.pass) markCompleted(challenge);
        });
    }

    function markCompleted(challenge) {
        const already = !!state.completed[challenge.id];
        state.completed[challenge.id] = true;
        saveState();
        updateProgress();
        renderLevelTabs();
        renderChallengeList();
        if (!already) celebrate();

        // Advance to the next incomplete challenge after a short beat.
        if (!already) {
            if (completionTimer) clearTimeout(completionTimer);
            completionTimer = setTimeout(function () {
                completionTimer = null;
                const current = Editor.getCurrentChallenge();
                if (state.mode !== 'challenges' || !current || current.id !== challenge.id) return;
                const next = Challenges.list
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .find((c) => !state.completed[c.id]);
                if (next && next.id !== challenge.id) selectChallenge(next.id);
            }, 1600);
        }
    }

    function resetChallenge() {
        const challenge = Editor.getCurrentChallenge();
        if (!challenge) return;
        delete drafts[challenge.id];
        try {
            localStorage.setItem(STORAGE_CODE_KEY, JSON.stringify(drafts));
        } catch (err) { /* ignore */ }
        Editor.resetToStarter();
        if (learningLayer) learningLayer.hideFeedback();
        showToast('info', 'Reset to starter code.');
    }

    function peekSolution() {
        const challenge = Editor.getCurrentChallenge();
        if (!challenge || challenge.type === 'quiz') return;
        if (!window.confirm('Load the official solution into the editor?\n\n' +
            'It will be marked 👁 — you still need to press Check to complete it.')) {
            return;
        }
        Editor.loadSolution();
        state.peeked[challenge.id] = 'loaded';
        saveDraft(challenge.id);
        saveState();
        renderHeader(challenge);
        renderChallengeList();
        showToast('info', 'Solution loaded — press Check when you are ready.');
    }

    /* ---------------- UI feedback ---------------- */

    function showToast(kind, message) {
        els.toast.textContent = message;
        els.toast.className = 'toast toast-' + kind;
        els.toast.hidden = false;
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(hideToast, TOAST_MS);
    }

    function hideToast() {
        if (toastTimer) clearTimeout(toastTimer);
        els.toast.hidden = true;
    }

    function celebrate() {
        if (celebrationTimer) clearTimeout(celebrationTimer);
        els.celebration.innerHTML = '';
        els.celebration.hidden = false;

        const colors = ['#ff006e', '#3a86ff', '#06d6a0', '#ffb703', '#8338ec', '#fb5607'];
        for (let i = 0; i < CELEBRATION_PARTICLES; i++) {
            const p = document.createElement('span');
            p.className = 'confetti';
            p.style.left = Math.round(Math.random() * 100) + '%';
            p.style.background = colors[i % colors.length];
            p.style.animationDelay = Math.round(Math.random() * 250) + 'ms';
            p.style.animationDuration = (CELEBRATION_MS + Math.round(Math.random() * 400)) + 'ms';
            els.celebration.appendChild(p);
        }

        celebrationTimer = setTimeout(function () {
            els.celebration.hidden = true;
            els.celebration.innerHTML = '';
        }, CELEBRATION_MS + 700);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ---------------- init ---------------- */

    function hideSkeleton() {
        document.querySelectorAll('[data-skeleton]').forEach(function (node) {
            if (node.parentNode) node.parentNode.removeChild(node);
        });
    }

    function init() {
        cacheDom();
        loadState();
        Editor.init({
            targetFrame: 'targetFrame',
            previewFrame: 'previewFrame',
            cssEditor: 'cssEditor',
            codePane: 'codePane',
            jsPane: 'jsPane',
            jsEditor: 'jsEditor',
            jsTab: 'jsTab',
            cssTab: 'cssTab',
            quizPane: 'quizPane',
            quizList: 'quizList'
        });

        learningLayer = LearningLayer.init({
            greeting: 'greetingText',
            profileForm: 'profileForm',
            nameInput: 'nameInput',
            profileStatus: 'profileStatus',
            profileAction: 'profileAction',
            readGreeting: 'readGreetingBtn',
            voiceSelect: 'voiceSelect',
            volume: 'volumeControl',
            audioStatus: 'audioStatus',
            feedback: 'feedbackCard',
            feedbackIcon: 'feedbackIcon',
            feedbackTitle: 'feedbackTitle',
            feedbackMessage: 'feedbackMessage',
            feedbackHint: 'feedbackHint',
            feedbackDetails: 'feedbackDetails',
            feedbackDetailsWrap: 'feedbackDetailsWrap'
        });
        ShapeMatch.init({
            panel: 'shapeMatchPanel',
            progress: 'shapeProgress',
            position: 'shapePosition',
            title: 'shapeTitle',
            prompt: 'shapePrompt',
            skill: 'shapeSkill',
            targetStyle: 'shapeTargetStyle',
            choices: 'shapeChoices',
            status: 'shapeStatus',
            feedback: 'shapeFeedback',
            feedbackIcon: 'shapeFeedbackIcon',
            feedbackTitle: 'shapeFeedbackTitle',
            feedbackMessage: 'shapeFeedbackMessage',
            feedbackHint: 'shapeFeedbackHint',
            restart: 'shapeRestartBtn',
            read: 'shapeReadBtn',
            next: 'shapeNextBtn'
        }, {
            onProgress: updateShapeModeCount,
            onRead: function (text) {
                if (learningLayer) learningLayer.readText(text);
            }
        });

        els.checkBtn.addEventListener('click', runCheck);
        els.resetBtn.addEventListener('click', resetChallenge);
        els.peekBtn.addEventListener('click', peekSolution);
        if (els.readChallengeBtn) {
            els.readChallengeBtn.addEventListener('click', function () {
                if (learningLayer) learningLayer.readChallenge(Editor.getCurrentChallenge());
            });
        }
        if (els.shapeModeBtn) els.shapeModeBtn.addEventListener('click', showShapeMode);
        if (els.backToChallengesBtn) els.backToChallengesBtn.addEventListener('click', showChallengeMode);

        // Persist drafts when leaving the page.
        window.addEventListener('beforeunload', function () {
            saveDraft(state.currentId);
        });

        updateProgress();
        // Rebuild tabs/list (replaces static skeleton) then select the start challenge.
        renderLevelTabs();
        renderChallengeList();

        const startId = state.currentId && Challenges.getById(state.currentId)
            ? state.currentId
            : Challenges.list[0].id;
        selectChallenge(startId);

        // Refresh the live preview once the iframe has settled.
        setTimeout(function () {
            Editor.schedulePreviewUpdate();
        }, 100);

        window.__appBooted = true;
        hideSkeleton();
        const fatal = document.getElementById('fatalError');
        if (fatal) fatal.hidden = true;
    }

    function safeInit() {
        try {
            init();
        } catch (err) {
            const message = err && err.message ? err.message : String(err);
            if (typeof window.__showFatalError === 'function') {
                window.__showFatalError(message);
            } else {
                const banner = document.getElementById('fatalError');
                const msgEl = document.getElementById('fatalErrorMsg');
                if (banner) {
                    if (msgEl) msgEl.textContent = ' ' + message;
                    banner.hidden = false;
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }
})(typeof self !== 'undefined' ? self : this);
