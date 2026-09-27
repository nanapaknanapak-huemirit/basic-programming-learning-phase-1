(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ShapeChallenges = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const BASE_CSS = '.shape { width: 120px; height: 120px; background: #ff6b6b; }';

    const definitions = [
        {
            id: 'circle',
            name: 'Circle',
            skill: 'border-radius: 50%',
            rule: '.shape { border-radius: 50%; }',
            wrong: ['.shape { border-radius: 0; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A circle is made by rounding all four corners until they form one smooth curve.',
            hint: 'Look for border-radius with a very large value.'
        },
        {
            id: 'square',
            name: 'Square',
            skill: 'equal width and height',
            rule: '.shape { border-radius: 0; }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { border-radius: 999px; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }'],
            explanation: 'A square has four straight sides and four sharp corners, so its corner radius stays at zero.',
            hint: 'Keep the corners sharp and make sure the box is as wide as it is tall.'
        },
        {
            id: 'rounded-square',
            name: 'Rounded square',
            skill: 'a small border-radius',
            rule: '.shape { border-radius: 18px; }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { border-radius: 0; }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A rounded square is still a square, but each corner is softened with a small radius.',
            hint: 'Use a medium-sized border-radius, not a circle-sized one.'
        },
        {
            id: 'pill',
            name: 'Pill',
            skill: 'a very large border-radius',
            rule: '.shape { width: 180px; border-radius: 999px; }',
            wrong: ['.shape { border-radius: 0; }', '.shape { border-radius: 8px; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }'],
            explanation: 'A pill is a long box whose rounded ends are much larger than its height.',
            hint: 'Make the box wider and round the ends almost completely.'
        },
        {
            id: 'triangle',
            name: 'Triangle',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { transform: rotate(45deg); }', '.shape { border: 20px solid #ff6b6b; }'],
            explanation: 'A triangle has three points. clip-path uses three points to cut the box into that shape.',
            hint: 'Look for a polygon with three corners.'
        },
        {
            id: 'diamond',
            name: 'Diamond',
            skill: 'transform: rotate(45deg)',
            rule: '.shape { transform: rotate(45deg); }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border-radius: 18px; }'],
            explanation: 'A diamond can be made by turning a square a quarter turn with a 45-degree rotation.',
            hint: 'Look for a transform that turns the box.'
        },
        {
            id: 'parallelogram',
            name: 'Parallelogram',
            skill: 'transform: skewX()',
            rule: '.shape { transform: skewX(-20deg); }',
            wrong: ['.shape { transform: rotate(45deg); }', '.shape { border-radius: 50%; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }'],
            explanation: 'A parallelogram has two slanted sides. Skewing the box sideways creates that slant.',
            hint: 'Look for skewX instead of rotate.'
        },
        {
            id: 'trapezoid',
            name: 'Trapezoid',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%); }',
            wrong: ['.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border-radius: 50%; }', '.shape { transform: skewX(-20deg); }'],
            explanation: 'A trapezoid has one short top side and one long bottom side with slanted sides.',
            hint: 'Look for a four-point polygon with a narrow top.'
        },
        {
            id: 'hexagon',
            name: 'Hexagon',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); }',
            wrong: ['.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border-radius: 50%; }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A hexagon has six straight sides and six corners.',
            hint: 'Count the points in the polygon and look for six.'
        },
        {
            id: 'octagon',
            name: 'Octagon',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%); }',
            wrong: ['.shape { clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); }', '.shape { border-radius: 50%; }', '.shape { border-radius: 18px; }'],
            explanation: 'An octagon has eight sides, like a stop sign.',
            hint: 'Look for a polygon with eight points.'
        },
        {
            id: 'star',
            name: 'Star',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A star has many points that alternate outward and inward.',
            hint: 'Look for a polygon with ten points, alternating wide and narrow.'
        },
        {
            id: 'heart',
            name: 'Heart',
            skill: 'two rounded pseudo-elements',
            rule: '.shape { position: relative; transform: rotate(-45deg); }\n.shape::before, .shape::after { content: ""; position: absolute; width: 80px; height: 80px; border-radius: 50%; background: #ff6b6b; }\n.shape::before { top: -40px; left: 0; }\n.shape::after { top: 0; right: -40px; }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border-radius: 999px; }'],
            explanation: 'A heart can be built from two rounded circles and a square turned on its corner.',
            hint: 'Look for ::before and ::after with rounded circles.'
        },
        {
            id: 'crescent',
            name: 'Crescent',
            skill: 'clip-path crescent polygon',
            rule: '.shape { clip-path: polygon(70% 0, 100% 0, 82% 25%, 100% 50%, 82% 75%, 100% 100%, 70% 100%, 45% 75%, 30% 50%, 45% 25%); }',
            wrong: ['.shape { border-radius: 50%; background: #ff6b6b; }', '.shape { border: 24px solid #ff6b6b; border-radius: 50%; }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A crescent has a curved outside edge and a curved bite taken from the other side.',
            hint: 'Look for a clip-path polygon with inward-curving points.'
        },
        {
            id: 'ring',
            name: 'Ring',
            skill: 'a thick transparent border',
            rule: '.shape { background: transparent; border: 24px solid #ff6b6b; border-radius: 50%; }',
            wrong: ['.shape { background: #ff6b6b; border-radius: 50%; }', '.shape { border-radius: 0; }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A ring is hollow. Its center is transparent while a thick border draws the circle.',
            hint: 'Look for a thick border and a transparent background.'
        },
        {
            id: 'half-circle',
            name: 'Half-circle',
            skill: 'one-sided border-radius',
            rule: '.shape { border-radius: 0 100% 100% 0; }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { border-radius: 0; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }'],
            explanation: 'A half-circle rounds only the two corners on one side of the box.',
            hint: 'Look for border-radius with zeroes on the left corners.'
        },
        {
            id: 'cross',
            name: 'Cross',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(38% 0, 62% 0, 62% 38%, 100% 38%, 100% 62%, 62% 62%, 62% 100%, 38% 100%, 38% 62%, 0 62%, 0 38%, 38% 38%); }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { transform: rotate(45deg); }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }'],
            explanation: 'A cross has a narrow vertical bar and a narrow horizontal bar joined in the middle.',
            hint: 'Look for a polygon that makes two bars meet.'
        },
        {
            id: 'arrow',
            name: 'Arrow',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(0 35%, 65% 35%, 65% 10%, 100% 50%, 65% 90%, 65% 65%, 0 65%); }',
            wrong: ['.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border-radius: 50%; }', '.shape { transform: skewX(-20deg); }'],
            explanation: 'An arrow has a long shaft and a pointed head on the right.',
            hint: 'Look for a polygon with a point at the far right.'
        },
        {
            id: 'speech-bubble',
            name: 'Speech bubble',
            skill: 'a triangular ::after',
            rule: '.shape { position: relative; border-radius: 18px; }\n.shape::after { content: ""; position: absolute; left: 24px; bottom: -24px; width: 0; height: 0; border-left: 16px solid transparent; border-right: 16px solid transparent; border-top: 24px solid #ff6b6b; }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border: 20px solid #ff6b6b; }'],
            explanation: 'A speech bubble is a rounded box with a small triangle below it.',
            hint: 'Look for a rounded box plus an ::after triangle.'
        },
        {
            id: 'chevron',
            name: 'Chevron',
            skill: 'clip-path polygon()',
            rule: '.shape { clip-path: polygon(0 0, 75% 0, 100% 50%, 75% 100%, 0 100%, 25% 50%); }',
            wrong: ['.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }', '.shape { border-radius: 50%; }', '.shape { transform: rotate(45deg); }'],
            explanation: 'A chevron is like a thick angle bracket with a notch cut from one side.',
            hint: 'Look for a six-point polygon with a notch.'
        },
        {
            id: 'blob',
            name: 'Blob',
            skill: 'uneven border-radius values',
            rule: '.shape { border-radius: 60% 40% 55% 45% / 45% 55% 40% 60%; }',
            wrong: ['.shape { border-radius: 50%; }', '.shape { border-radius: 0; }', '.shape { clip-path: polygon(50% 0, 100% 100%, 0 100%); }'],
            explanation: 'A blob has smooth but uneven curves, so its corners use different radius values.',
            hint: 'Look for several different percentages inside border-radius.'
        }
    ];

    function makeItem(index, definition) {
        const correct = { code: BASE_CSS + '\n' + definition.rule, correct: true };
        const wrong = definition.wrong.map(function (rule) {
            return { code: BASE_CSS + '\n' + rule, correct: false };
        });
        const raw = [correct].concat(wrong);
        const shift = index % raw.length;
        const choices = raw.slice(shift).concat(raw.slice(0, shift));
        return {
            id: definition.id,
            name: definition.name,
            skill: definition.skill,
            prompt: 'Which CSS makes this ' + definition.name.toLowerCase() + '?',
            correctCss: correct.code,
            choices: choices,
            answer: choices.findIndex(function (choice) { return choice.correct; }),
            explanation: definition.explanation,
            hint: definition.hint
        };
    }

    const list = definitions.map(function (definition, index) {
        return makeItem(index, definition);
    });

    function getByIndex(index) {
        return list[index] || null;
    }

    function getById(id) {
        return list.find(function (item) { return item.id === id; }) || null;
    }

    return {
        BASE_CSS: BASE_CSS,
        list: list,
        getByIndex: getByIndex,
        getById: getById
    };
});
