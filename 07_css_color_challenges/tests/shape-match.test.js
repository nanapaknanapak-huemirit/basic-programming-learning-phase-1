'use strict';

const test = require('node:test');
const assert = require('node:assert');
const ShapeChallenges = require('../js/shape-challenges.js');
const ShapeMatch = require('../js/shape-match.js');

const IDS = [
    'panel', 'progress', 'position', 'title', 'prompt', 'skill', 'targetStyle',
    'choices', 'status', 'feedback', 'feedbackIcon', 'feedbackTitle',
    'feedbackMessage', 'feedbackHint', 'restart', 'read', 'next'
];

function fakeStorage(initial) {
    const data = Object.assign({}, initial);
    return {
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
        },
        setItem(key, value) {
            data[key] = String(value);
        },
        removeItem(key) {
            delete data[key];
        },
        dump() {
            return data;
        }
    };
}

class FakeElement {
    constructor(tag) {
        this.tagName = String(tag).toUpperCase();
        this.children = [];
        this.dataset = {};
        this.classes = new Set();
        this.listeners = {};
        this.text = '';
        this.hidden = false;
        this.disabled = false;
        this.focused = false;
    }

    get className() {
        return Array.from(this.classes).join(' ');
    }

    set className(value) {
        this.classes = new Set(String(value).split(/\s+/).filter(Boolean));
    }

    get classList() {
        const self = this;
        return {
            add(...names) {
                names.forEach((name) => self.classes.add(name));
            },
            remove(...names) {
                names.forEach((name) => self.classes.delete(name));
            },
            contains(name) {
                return self.classes.has(name);
            },
            toggle(name, force) {
                const on = force === undefined ? !self.classes.has(name) : !!force;
                if (on) self.classes.add(name);
                else self.classes.delete(name);
                return on;
            }
        };
    }

    get textContent() {
        return this.text;
    }

    set textContent(value) {
        this.text = String(value);
        this.children = [];
    }

    get innerHTML() {
        return this.children.length ? '' : this.text;
    }

    set innerHTML(value) {
        this.text = String(value);
        this.children = [];
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    addEventListener(type, handler) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(handler);
    }

    dispatch(type) {
        (this.listeners[type] || []).forEach((handler) => handler.call(this, { type }));
    }

    click() {
        this.dispatch('click');
    }

    focus() {
        this.focused = true;
    }

    descendants() {
        const found = [];
        const walk = (node) => {
            node.children.forEach((child) => {
                found.push(child);
                walk(child);
            });
        };
        walk(this);
        return found;
    }

    querySelectorAll(selector) {
        const wanted = selector.replace(/^\./, '');
        return this.descendants().filter((node) => node.classes.has(wanted));
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }
}

function buildDom() {
    const registry = {};
    const elements = {};
    IDS.forEach((id) => {
        const element = new FakeElement('div');
        element.id = id;
        registry[id] = element;
        elements[id] = element;
    });
    const document = {
        getElementById(id) {
            return registry[id] || null;
        },
        createElement(tag) {
            return new FakeElement(tag);
        }
    };
    const domMap = {};
    IDS.forEach((id) => {
        domMap[id] = id;
    });
    return { document, elements, domMap };
}

test.afterEach(() => {
    delete global.document;
    delete global.window;
});

function startShapeMatch() {
    const dom = buildDom();
    global.document = dom.document;
    const progress = [];
    ShapeMatch.init(dom.domMap, {
        onProgress(count) {
            progress.push(count);
        }
    });
    ShapeMatch.activate();
    return Object.assign(dom, { progress });
}

test('exposes the shape match API', () => {
    [
        'init', 'activate', 'deactivate', 'advance', 'reset',
        'getCompletedCount', 'getCurrentChallenge', 'readStored', 'challengeSpeech'
    ].forEach((name) => {
        assert.strictEqual(typeof ShapeMatch[name], 'function', name);
    });
    assert.ok(ShapeMatch.STORAGE_KEY);
    assert.notStrictEqual(ShapeMatch.STORAGE_KEY, 'cssChallenges_v1');
});

test('progress is stored under its own key, separate from the color challenges', () => {
    const storage = fakeStorage();
    assert.deepStrictEqual(ShapeMatch.readStored(storage), {
        completed: {},
        currentId: ShapeChallenges.list[0].id
    });
    assert.strictEqual(ShapeMatch.STORAGE_KEY, 'cssChallenges_shapes_v1');
});

test('readStored drops unknown shape ids and survives broken data', () => {
    const valid = JSON.stringify({
        completed: { heart: true, 'not-a-shape': true, circle: false },
        currentId: 'star'
    });
    const restored = ShapeMatch.readStored(fakeStorage({ [ShapeMatch.STORAGE_KEY]: valid }));
    assert.deepStrictEqual(restored.completed, { heart: true });
    assert.strictEqual(restored.currentId, 'star');

    const broken = ShapeMatch.readStored(fakeStorage({ [ShapeMatch.STORAGE_KEY]: '{not json' }));
    assert.deepStrictEqual(broken.completed, {});
    assert.strictEqual(broken.currentId, ShapeChallenges.list[0].id);
});

test('render shows the first shape, four choices, and no next button', () => {
    const dom = startShapeMatch();
    const { elements } = dom;
    assert.strictEqual(elements.title.textContent, 'Circle');
    assert.strictEqual(elements.position.textContent, 'Shape 1 of 20');
    assert.strictEqual(elements.progress.textContent, '0 / 20 complete');
    assert.strictEqual(elements.choices.querySelectorAll('.shape-choice').length, 4);
    assert.strictEqual(elements.next.hidden, true);
    assert.strictEqual(elements.feedback.hidden, true);
});

test('choosing the correct snippet completes the shape and reveals next', () => {
    const dom = startShapeMatch();
    const { elements } = dom;
    const current = ShapeMatch.getCurrentChallenge();
    const correctIndex = current.answer;

    elements.choices.children[correctIndex].click();

    assert.strictEqual(ShapeMatch.getCompletedCount(), 1);
    assert.strictEqual(elements.progress.textContent, '1 / 20 complete');
    assert.strictEqual(elements.next.hidden, false);
    assert.strictEqual(elements.feedback.hidden, false);
    assert.ok(elements.feedback.classList.contains('shape-feedback-pass'));
    assert.ok(elements.feedbackTitle.textContent.indexOf('Shape matched') === 0);
    assert.ok(elements.feedbackHint.textContent.indexOf(current.skill) !== -1);
    assert.ok(elements.choices.children[correctIndex].classList.contains('shape-choice-correct'));

    elements.choices.children.forEach((button) => {
        assert.strictEqual(button.disabled, true);
    });
    assert.ok(dom.progress.includes(1));
});

test('choosing a wrong snippet explains without marking it complete', () => {
    const dom = startShapeMatch();
    const { elements } = dom;
    const current = ShapeMatch.getCurrentChallenge();
    const wrongIndex = current.choices.findIndex((choice) => !choice.correct);

    elements.choices.children[wrongIndex].click();

    assert.strictEqual(ShapeMatch.getCompletedCount(), 0);
    assert.ok(elements.feedback.classList.contains('shape-feedback-fail'));
    assert.ok(elements.feedbackHint.textContent.indexOf(current.hint) !== -1);
    assert.ok(elements.choices.children[wrongIndex].classList.contains('shape-choice-wrong'));
    assert.strictEqual(elements.next.hidden, true);
});

test('advance moves to the next incomplete shape', () => {
    const dom = startShapeMatch();
    const { elements } = dom;
    const first = ShapeMatch.getCurrentChallenge();

    elements.choices.children[first.answer].click();
    dom.elements.next.click();

    assert.strictEqual(ShapeMatch.getCurrentChallenge().id, ShapeChallenges.list[1].id);
    assert.strictEqual(elements.title.textContent, 'Square');
    assert.strictEqual(elements.position.textContent, 'Shape 2 of 20');
    assert.strictEqual(ShapeMatch.getCompletedCount(), 1);
});

test('advance wraps backwards when only earlier shapes are left', () => {
    const dom = startShapeMatch();
    const ids = ShapeChallenges.list.map((item) => item.id);
    const first = ShapeMatch.getCurrentChallenge();
    const second = ShapeChallenges.getById(ids[1]);

    dom.elements.choices.children[first.answer].click();
    dom.elements.next.click();
    dom.elements.choices.children[second.answer].click();
    dom.elements.next.click();

    assert.strictEqual(ShapeMatch.getCurrentChallenge().id, ids[2]);
    assert.strictEqual(ShapeMatch.getCompletedCount(), 2);
});

test('finishing every shape reports completion and hides next', () => {
    const dom = startShapeMatch();
    const total = ShapeChallenges.list.length;

    for (let step = 0; step < total; step += 1) {
        const current = ShapeMatch.getCurrentChallenge();
        dom.elements.choices.children[current.answer].click();
        dom.elements.next.click();
    }

    assert.strictEqual(ShapeMatch.getCompletedCount(), total);
    assert.ok(dom.elements.status.textContent.indexOf('All 20 shapes complete') === 0);
    assert.strictEqual(dom.elements.next.hidden, true);
});

test('a completed shape reveals its CSS clue and a repeat attempt is allowed', () => {
    const dom = startShapeMatch();
    const current = ShapeMatch.getCurrentChallenge();

    assert.ok(dom.elements.skill.textContent.indexOf('CSS clue') === -1);
    dom.elements.choices.children[current.answer].click();
    assert.ok(dom.elements.skill.textContent.indexOf(current.skill) !== -1);
    assert.ok(dom.elements.skill.classList.contains('chip-revealed'));
    assert.ok(/Matched|makes the target/.test(dom.elements.status.textContent));

    dom.elements.choices.children[current.answer].click();
    assert.strictEqual(ShapeMatch.getCompletedCount(), 1);
});

test('reset clears progress back to the first shape', () => {
    const dom = startShapeMatch();
    const first = ShapeMatch.getCurrentChallenge();

    dom.elements.choices.children[first.answer].click();
    dom.elements.next.click();
    assert.strictEqual(ShapeMatch.getCompletedCount(), 1);

    dom.elements.restart.click();

    assert.strictEqual(ShapeMatch.getCompletedCount(), 0);
    assert.strictEqual(ShapeMatch.getCurrentChallenge().id, first.id);
    assert.strictEqual(dom.elements.progress.textContent, '0 / 20 complete');
});

test('progress is persisted to localStorage when the browser provides it', () => {
    const storage = fakeStorage();
    global.window = { localStorage: storage };
    const dom = startShapeMatch();
    const first = ShapeMatch.getCurrentChallenge();
    dom.elements.choices.children[first.answer].click();
    dom.elements.next.click();

    const saved = JSON.parse(storage.dump()[ShapeMatch.STORAGE_KEY]);
    assert.strictEqual(saved.completed[first.id], true);
    assert.strictEqual(saved.currentId, ShapeChallenges.list[1].id);
});

test('challengeSpeech names the shape and adds the clue once completed', () => {
    const dom = startShapeMatch();
    const current = ShapeMatch.getCurrentChallenge();

    const fresh = ShapeMatch.challengeSpeech(current);
    assert.ok(fresh.toLowerCase().indexOf('circle') !== -1);
    assert.strictEqual(fresh.indexOf(current.skill), -1);

    dom.elements.choices.children[current.answer].click();

    const done = ShapeMatch.challengeSpeech(current);
    assert.ok(done.indexOf(current.skill) !== -1);
});
