/* Who Done It? - mystery maker.
   Builds one mystery: a set of suspects, a secret culprit, and a list of clues
   that narrows the suspects down to exactly one by the last clue. */
var WhoDoneIt = (function () {
  'use strict';

  var THEMES = [
    {
      id: 'cake',
      name: 'The Missing Birthday Cake',
      intro: 'The party starts soon, but the giant strawberry cake has vanished!',
      question: 'Who ate the giant strawberry cake before the party?',
      ending: 'The cake is back on the table, and the party can start. Everyone gets a slice!',
      species: ['Fox', 'Bear', 'Owl', 'Rabbit', 'Cat', 'Dog']
    },
    {
      id: 'gift',
      name: 'The Secret Gift Giver',
      intro: 'A wrapped present was waiting on the doorstep, with no name on it.',
      question: 'Who left the mystery present on the doorstep?',
      ending: 'The mystery is solved, and the present can finally be opened!',
      species: ['Fox', 'Bear', 'Owl', 'Rabbit', 'Cat', 'Dog']
    },
    {
      id: 'pet',
      name: 'The Runaway Pet',
      intro: 'A mischievous puppy has run away, and someone knows where it went.',
      question: 'Who is hiding the mischievous puppy in their treehouse?',
      ending: 'The puppy is home safe, wagging its tail. Good detective work!',
      species: ['Fox', 'Bear', 'Owl', 'Rabbit', 'Cat', 'Dog']
    },
    {
      id: 'clown',
      name: 'The Circus Balloon',
      intro: 'The big circus balloon floated away, and the clowns all say it wasn’t them.',
      question: 'Which clown let the balloon get away?',
      ending: 'The balloon is back at the circus, and the show can go on!',
      species: ['Red Clown', 'Blue Clown', 'Green Clown', 'Yellow Clown', 'Purple Clown', 'Orange Clown']
    }
  ];

  var TRAIT_VALUES = {
    headwear: ['None', 'Crown', 'Party Hat', 'Wizard Hat', 'Baseball Cap'],
    eyewear: ['None', 'Sunglasses', 'Round Glasses', 'Monocle'],
    shirt: ['Solid Red', 'Solid Blue', 'Striped', 'Polka-dot', 'Star Shirt'],
    item: ['None', 'Balloon', 'Magnifying Glass', 'Ice Cream Cone', 'Book', 'Flashlight'],
    expression: ['Happy smile', 'Surprised', 'Winking']
  };

  // What each trait value says about a suspect. Used to write the clue sentences.
  var PHRASE = {
    headwear: {
      'None': 'is NOT wearing a hat',
      'Crown': 'is wearing a crown',
      'Party Hat': 'is wearing a party hat',
      'Wizard Hat': 'is wearing a wizard hat',
      'Baseball Cap': 'is wearing a baseball cap'
    },
    eyewear: {
      'None': 'is NOT wearing glasses',
      'Sunglasses': 'is wearing sunglasses',
      'Round Glasses': 'is wearing round glasses',
      'Monocle': 'is wearing a monocle'
    },
    shirt: {
      'Solid Red': 'has a solid red shirt',
      'Solid Blue': 'has a solid blue shirt',
      'Striped': 'has a striped shirt',
      'Polka-dot': 'has a polka-dot shirt',
      'Star Shirt': 'has a star shirt'
    },
    item: {
      'None': 'is NOT holding anything',
      'Balloon': 'is holding a balloon',
      'Magnifying Glass': 'is holding a magnifying glass',
      'Ice Cream Cone': 'is holding an ice cream cone',
      'Book': 'is holding a book',
      'Flashlight': 'is holding a flashlight'
    },
    expression: {
      'Happy smile': 'has a happy smile',
      'Surprised': 'looks surprised',
      'Winking': 'is winking'
    }
  };

  // Level 1: 6 suspects, 3 traits, single-trait clues.
  // Level 2: 9 suspects, 4 traits, adds AND clues.
  // Level 3: 12 suspects, 5 traits, adds OR clues and grid position clues.
  var LEVELS = {
    1: { suspects: 6, rows: 2, cols: 3, traits: 3 },
    2: { suspects: 9, rows: 3, cols: 3, traits: 4 },
    3: { suspects: 12, rows: 3, cols: 4, traits: 5 }
  };

  // Traits a level does not use are fixed, so they never show up in a clue.
  var FIXED = { headwear: 'None', eyewear: 'None', shirt: 'Solid Blue', item: 'None', expression: 'Happy smile' };
  var OPTIONAL_TRAITS = ['headwear', 'eyewear', 'shirt', 'item', 'expression'];

  function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }

  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function article(word) { return /^[AEIOU]/i.test(word) ? 'an' : 'a'; }

  // "is a Fox" -> "is NOT a Fox", "has a striped shirt" -> "does NOT have a striped shirt"
  function negate(phrase) {
    return phrase
      .replace(/^is /, 'is NOT ')
      .replace(/^has /, 'does NOT have ')
      .replace(/^looks /, 'does NOT look ');
  }

  // Build a single clue atom: one trait value, possibly negated.
  function atom(trait, value, neg, theme) {
    var phrase;
    if (trait === 'species') phrase = 'is ' + article(value) + ' ' + value;
    else if (trait === 'position') phrase = value.phrase;
    else phrase = PHRASE[trait][value];
    if (neg) phrase = negate(phrase);
    return {
      trait: trait,
      phrase: phrase,
      test: trait === 'position'
        ? function (s) { return value.test(s) !== neg; }
        : function (s) { return (s.traits[trait] === value) !== neg; }
    };
  }

  function sentence(parts) {
    return 'The culprit ' + parts.join(' ') + '.';
  }

  // Short noun phrases for the "who is it?" reveal, e.g. "a Fox with a crown and a striped shirt".
  var NOUN = {
    headwear: { 'Crown': 'a crown', 'Party Hat': 'a party hat', 'Wizard Hat': 'a wizard hat', 'Baseball Cap': 'a baseball cap' },
    eyewear: { 'Sunglasses': 'sunglasses', 'Round Glasses': 'round glasses', 'Monocle': 'a monocle' },
    shirt: { 'Solid Red': 'a red shirt', 'Solid Blue': 'a blue shirt', 'Striped': 'a striped shirt', 'Polka-dot': 'a polka-dot shirt', 'Star Shirt': 'a star shirt' },
    item: { 'Balloon': 'a balloon', 'Magnifying Glass': 'a magnifying glass', 'Ice Cream Cone': 'an ice cream cone', 'Book': 'a book', 'Flashlight': 'a flashlight' },
    expression: { 'Happy smile': 'a happy smile', 'Surprised': 'a surprised face', 'Winking': 'a wink' }
  };

  function describe(s, active) {
    var species = s.traits.species;
    var parts = [];
    active.forEach(function (t) {
      if (t === 'species' || active.indexOf(t) < 0) return;
      var v = s.traits[t];
      if (v === 'None') return;
      var words = NOUN[t][v];
      parts.push(t === 'item' ? 'holding ' + words : words);
    });
    var base = /^[AEIOU]/i.test(species) ? 'an ' + species : 'a ' + species;
    if (!parts.length) return base;
    return base + ' with ' + parts.join(', ').replace(/, ([^,]*)$/, ' and $1');
  }

  function buildSuspects(theme, active, cfg, rnd) {
    var values = function (t) { return t === 'species' ? theme.species : TRAIT_VALUES[t]; };
    var suspects = [];
    var seen = {};
    var tries = 0;
    while (suspects.length < cfg.suspects) {
      if (++tries > 20000) throw new Error('Could not make distinct suspects');
      var traits = {};
      Object.keys(FIXED).forEach(function (k) { traits[k] = FIXED[k]; });
      active.forEach(function (t) { traits[t] = pick(values(t), rnd); });
      var key = active.map(function (t) { return traits[t]; }).join('|');
      if (seen[key]) continue;
      seen[key] = true;
      suspects.push({ id: suspects.length, traits: traits, row: 0, col: 0 });
    }
    // Every active trait must vary, otherwise it cannot help narrow things down.
    var varies = active.every(function (t) {
      var first = suspects[0].traits[t];
      return suspects.some(function (s) { return s.traits[t] !== first; });
    });
    if (!varies) return buildSuspects(theme, active, cfg, rnd);

    var cells = shuffle(suspects.map(function (s, i) { return i; }), rnd);
    cells.forEach(function (suspectIndex, cell) {
      suspects[suspectIndex].row = Math.floor(cell / cfg.cols);
      suspects[suspectIndex].col = cell % cfg.cols;
    });
    // Put the suspects in grid order so the board shows them where the clues say they are.
    suspects.sort(function (a, b) { return a.row - b.row || a.col - b.col; });
    suspects.forEach(function (s, i) { s.id = i; });
    return suspects;
  }

  function candidateClues(level, active, suspects, cfg, rnd) {
    var list = [];
    var atoms = [];
    var seenAtom = {};

    active.forEach(function (t) {
      var vals = [];
      suspects.forEach(function (s) { if (vals.indexOf(s.traits[t]) < 0) vals.push(s.traits[t]); });
      vals.forEach(function (v) {
        atoms.push(atom(t, v, false));
        if (v !== 'None') atoms.push(atom(t, v, true));
      });
    });

    if (level >= 3) {
      var lastRow = cfg.rows - 1;
      var half = Math.ceil(cfg.cols / 2);
      var posAtoms = [
        { phrase: 'is in the top row', test: function (s) { return s.row === 0; } },
        { phrase: 'is in the bottom row', test: function (s) { return s.row === lastRow; } },
        { phrase: 'is on the left side', test: function (s) { return s.col < half; } },
        { phrase: 'is on the right side', test: function (s) { return s.col >= half; } }
      ];
      posAtoms.forEach(function (p) {
        atoms.push(atom('position', p, false));
        atoms.push(atom('position', p, true));
      });
    }

    atoms.forEach(function (a) {
      if (seenAtom[a.phrase]) return;
      seenAtom[a.phrase] = true;
      list.push({ text: sentence([a.phrase]), test: a.test });
    });

    if (level >= 2) {
      // AND clues, with any mix of "is" and "is NOT": "...is wearing sunglasses AND has a striped shirt."
      for (var i = 0; i < 60; i++) {
        var a = pick(atoms, rnd), b = pick(atoms, rnd);
        if (a.trait === b.trait || a.trait === 'position' || b.trait === 'position') continue;
        list.push({
          text: sentence([a.phrase, 'AND', b.phrase]),
          test: (function (x, y) { return function (s) { return x.test(s) && y.test(s); }; })(a, b)
        });
      }
    }

    if (level >= 3) {
      // OR clues. "OR, but NOT both" stops the culprit from matching both halves.
      for (var j = 0; j < 60; j++) {
        var c = pick(atoms, rnd), d = pick(atoms, rnd);
        if (c.trait === d.trait) continue;
        if (rnd() < 0.5) {
          list.push({
            text: sentence([c.phrase, 'OR', d.phrase]) ,
            test: (function (x, y) { return function (s) { return x.test(s) || y.test(s); }; })(c, d)
          });
        } else {
          list.push({
            text: sentence([c.phrase, 'OR', d.phrase]).replace(/\.$/, ', but NOT both.'),
            test: (function (x, y) { return function (s) { return x.test(s) !== y.test(s); }; })(c, d)
          });
        }
      }
    }
    return list;
  }

  /* Make a new mystery.
     opts.level: 1, 2 or 3
     opts.theme: a theme id, or omit for a random one
     opts.rnd: optional random function returning 0..1 (defaults to Math.random) */
  function generate(opts) {
    var rnd = opts.rnd || Math.random;
    var level = opts.level || 1;
    var cfg = LEVELS[level];
    var theme = THEMES.filter(function (t) { return t.id === opts.theme; })[0] || pick(THEMES, rnd);

    var optional = shuffle(OPTIONAL_TRAITS, rnd).slice(0, cfg.traits - 1);
    var active = ['species'].concat(optional);

    var suspects = buildSuspects(theme, active, cfg, rnd);
    var culpritIndex = Math.floor(rnd() * suspects.length);
    var culprit = suspects[culpritIndex];

    var pool = candidateClues(level, active, suspects, cfg, rnd);
    var remaining = suspects.slice();
    var clues = [];

    while (remaining.length > 1) {
      var valid = pool.filter(function (c) {
        return c.test(culprit) && remaining.some(function (s) { return !c.test(s); });
      });
      if (!valid.length) throw new Error('No clue narrows the suspects');
      // Prefer clues that rule out at most about half the suspects left, so the
      // game takes several turns instead of ending on the first clue.
      var half = Math.max(1, Math.floor(remaining.length / 2));
      var gentle = valid.filter(function (c) {
        return remaining.filter(function (s) { return !c.test(s); }).length <= half;
      });
      var clue = pick(gentle.length ? gentle : valid, rnd);
      clues.push(clue);
      remaining = remaining.filter(clue.test);
      pool = pool.filter(function (c) { return c !== clue; });
    }

    return {
      level: level,
      theme: theme,
      rows: cfg.rows,
      cols: cfg.cols,
      active: active,
      suspects: suspects,
      culprit: culprit,
      clues: clues,
      describeCulprit: function () { return describe(culprit, active); }
    };
  }

  return {
    THEMES: THEMES,
    LEVELS: LEVELS,
    TRAIT_VALUES: TRAIT_VALUES,
    generate: generate,
    describe: describe
  };
})();
