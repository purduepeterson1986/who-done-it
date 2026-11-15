/* Who Done It? - game screens, turns and sounds. */
(function () {
  'use strict';

  var KEY = 'whodoneit-settings';
  var LEVEL_INFO = {
    1: { title: 'Level 1', sub: 'Quick. 6 suspects, 3 traits, one-trait clues.' },
    2: { title: 'Level 2', sub: '9 suspects, 4 traits. Adds AND clues.' },
    3: { title: 'Level 3', sub: '12 suspects, 5 traits. Adds OR clues and where they stand.' }
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- saved settings ---------- */
  var settings = { level: 1, theme: 'random', names: ['', ''], sound: true, players: 2 };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) for (var k in saved) settings[k] = saved[k];
  } catch (e) { /* storage blocked: use defaults */ }

  function saveSettings() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
  }

  /* ---------- sound (synthesized, no files) ---------- */
  var AC = null;
  function audio() {
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
    } catch (e) { AC = null; }
    return AC;
  }
  function note(freq, start, dur, type, vol, slideTo, filtered) {
    if (!settings.sound || !audio()) return;
    var t0 = AC.currentTime + start;
    var osc = AC.createOscillator();
    var gain = AC.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    var out = gain;
    if (filtered) {
      var lp = AC.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 900;
      gain.connect(lp); out = lp;
    }
    osc.connect(gain);
    out.connect(AC.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  function sfxTap() { note(660, 0, 0.09, 'triangle', 0.15); }
  function sfxPass() { note(520, 0, 0.12, 'sine', 0.18); note(780, 0.1, 0.16, 'sine', 0.18); }
  function sfxWrong() {
    // Trombone-style "wah wah wahhh"
    note(466, 0, 0.35, 'sawtooth', 0.18, 415, true);
    note(440, 0.4, 0.35, 'sawtooth', 0.18, 392, true);
    note(392, 0.8, 0.8, 'sawtooth', 0.2, 300, true);
  }
  function sfxWin() {
    var seq = [523.25, 659.25, 783.99, 1046.5];
    seq.forEach(function (f, i) { note(f, i * 0.14, 0.2, 'square', 0.12); });
    [1046.5, 1318.5, 1568].forEach(function (f) { note(f, 0.62, 1.4, 'triangle', 0.14); });
    note(261.6, 0.62, 1.4, 'sine', 0.12);
  }

  /* ---------- setup screen ---------- */
  var levelChoice = settings.level;
  var themeChoice = settings.theme;
  var playersChoice = settings.players === 1 ? 1 : 2;

  function summaryText() {
    var who = playersChoice === 1
      ? (settings.names[0] || 'Solo practice')
      : (settings.names[0] || 'Player 1') + ' vs ' + (settings.names[1] || 'Player 2');
    return 'Level ' + levelChoice + ' · ' + who;
  }

  function renderSetup() {
    var players = $('player-count');
    players.innerHTML = '';
    [{ n: 1, title: '1 Player', sub: 'Practice on your own.' }, { n: 2, title: '2 Players', sub: 'Take turns.' }].forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'seg';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(p.n === playersChoice));
      b.innerHTML = '<span class="seg-title">' + p.title + '</span><span class="seg-sub">' + p.sub + '</span>';
      b.addEventListener('click', function () { playersChoice = p.n; renderSetup(); });
      players.appendChild(b);
    });
    $('name-b-field').hidden = playersChoice === 1;
    $('h-players').textContent = playersChoice === 1 ? 'Your name' : 'Players';

    var levels = $('levels');
    levels.innerHTML = '';
    [1, 2, 3].forEach(function (lv) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'seg';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(lv === levelChoice));
      b.innerHTML = '<span class="seg-title">' + LEVEL_INFO[lv].title + '</span><span class="seg-sub">' + LEVEL_INFO[lv].sub + '</span>';
      b.addEventListener('click', function () {
        levelChoice = lv;
        renderSetup();
      });
      levels.appendChild(b);
    });

    var themes = $('themes');
    themes.innerHTML = '';
    var options = [{ id: 'random', name: 'Surprise me', sub: 'A random mystery every time.' }].concat(
      WhoDoneIt.THEMES.map(function (t) { return { id: t.id, name: t.name, sub: t.question }; })
    );
    options.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(o.id === themeChoice));
      b.innerHTML = '<span class="t-title">' + o.name + '</span><span class="t-sub">' + o.sub + '</span>';
      b.addEventListener('click', function () { themeChoice = o.id; renderSetup(); });
      themes.appendChild(b);
    });

    $('summary').textContent = summaryText();
    $('name-a').value = settings.names[0] || '';
    $('name-b').value = settings.names[1] || '';
  }

  $('start-btn').addEventListener('click', function () {
    settings.level = levelChoice;
    settings.theme = themeChoice;
    settings.names = [$('name-a').value.trim(), $('name-b').value.trim()];
    settings.players = playersChoice;
    saveSettings();
    startGame();
  });

  $('name-a').addEventListener('input', function () { settings.names[0] = this.value.trim(); $('summary').textContent = summaryText(); });
  $('name-b').addEventListener('input', function () { settings.names[1] = this.value.trim(); $('summary').textContent = summaryText(); });

  /* ---------- game state ---------- */
  var G = null;
  // G = { m: mystery, names: [a, b], turn: 0|1, clueIdx, selected, over, flip: {id: 'gray'} }  (flip marks suspects the player crossed off)

  function nameOf(i) {
    if (G.players === 1) return G.names[0] || 'You';
    return G.names[i] || ('Player ' + (i + 1));
  }

  function startGame() {
    var mystery = WhoDoneIt.generate({
      level: levelChoice,
      theme: themeChoice === 'random' ? undefined : themeChoice
    });
    G = {
      m: mystery,
      players: settings.players === 1 ? 1 : 2,
      names: [settings.names[0], settings.names[1]],
      turn: 0,
      clueIdx: 0,
      selected: null,
      over: false,
      flip: {}
    };
    closeModal();
    show('game');
    $('level-label').textContent = 'Level ' + mystery.level + ' · ' + mystery.theme.name;
    $('question').innerHTML = '<span class="story-intro">' + escapeHtml(mystery.theme.intro) + '</span>' +
      '<span class="story-ask">' + escapeHtml(mystery.theme.question) + '</span>';
    renderGame(true);
  }

  function show(which) {
    $('setup').classList.toggle('active', which === 'setup');
    $('game').classList.toggle('active', which === 'game');
  }

  function isGray(s) {
    return G.flip[s.id] === 'gray';
  }

  function renderGame(fresh) {
    var m = G.m;
    var total = m.clues.length;
    var clue = m.clues[G.clueIdx];
    var last = G.clueIdx === total - 1;

    $('progress-label').textContent = 'Clue ' + (G.clueIdx + 1) + ' of ' + total;
    $('progress-fill').style.width = (((G.clueIdx + 1) / total) * 100) + '%';

    var pill = $('turn-pill');
    var dot = $('turn-dot');
    dot.className = 'name-dot ' + (G.turn === 0 ? 'dot-a' : 'dot-b');
    if (G.players === 1 && !G.names[0]) {
      $('turn-text').textContent = 'Your turn';
    } else {
      $('turn-text').textContent = nameOf(G.turn) + '’s turn';
    }
    pill.style.background = G.turn === 0 ? '#c4541c' : '#2168a8';

    var clueEl = $('clue-text');
    clueEl.textContent = clue.text;
    if (fresh) {
      clueEl.parentElement.style.animation = 'none';
      void clueEl.parentElement.offsetWidth;
      clueEl.parentElement.style.animation = '';
    }

    var board = $('board');
    board.style.setProperty('--cols', m.cols);
    board.innerHTML = '';
    m.suspects.forEach(function (s) {
      var gray = isGray(s);
      var card = document.createElement('div');
      card.className = 'suspect' + (gray ? ' is-gray' : '') + (G.selected === s.id ? ' is-sel' : '');
      card.dataset.id = s.id;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', (G.selected === s.id ? 'Picked. ' : '') + (gray ? 'Flipped down. ' : '') + 'Suspect');
      card.innerHTML = WhoArt.suspect(s) +
        '<span class="species-tag">' + escapeHtml(s.traits.species) + '</span>' +
        '<button class="flip" type="button" aria-label="' + (gray ? 'Flip up' : 'Flip down') + '">' + (gray ? '&#8634;' : '&#10005;') + '</button>';
      board.appendChild(card);
    });

    var passBtn = $('pass-btn');
    passBtn.disabled = G.over || last;
    var guessBtn = $('guess-btn');
    guessBtn.disabled = G.over || G.selected === null;
    $('guess-hint').textContent = G.over
      ? ''
      : last
        ? 'This is the last clue. Pick a suspect and make your guess!'
        : 'Tap a suspect to pick them. Tap the little badge to flip them down.';
  }

  // In a 1-player game the same player always keeps the turn; the next clue just appears.
  function otherTurn() {
    if (G.players === 2) G.turn = 1 - G.turn;
    G.selected = null;
  }

  function effectiveDescribe() { return G.m.describeCulprit(); }

  $('board').addEventListener('click', function (e) {
    if (G.over) return;
    var card = e.target.closest('.suspect');
    if (!card) return;
    var id = +card.dataset.id;
    var s = G.m.suspects[id];
    if (e.target.closest('.flip')) {
      G.flip[id] = isGray(s) ? 'open' : 'gray';
      sfxTap();
      renderGame(false);
      return;
    }
    G.selected = G.selected === id ? null : id;
    sfxTap();
    renderGame(false);
  });

  $('board').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest && e.target.closest('.suspect');
    if (!card) return;
    e.preventDefault();
    card.click();
  });

  $('pass-btn').addEventListener('click', function () {
    if (G.over || G.clueIdx >= G.m.clues.length - 1) return;
    G.clueIdx++;
    otherTurn();
    sfxPass();
    toast(G.players === 1 ? 'Here is the next clue.' : nameOf(G.turn) + ' gets the next clue.');
    renderGame(true);
  });

  $('guess-btn').addEventListener('click', function () {
    if (G.over || G.selected === null) return;
    var s = G.m.suspects[G.selected];
    if (s.id === G.m.culprit.id) {
      win();
      return;
    }
    // Wrong guess: that suspect is flipped down and the turn passes.
    G.flip[s.id] = 'gray';
    sfxWrong();
    var board = $('board');
    board.classList.remove('shake');
    void board.offsetWidth;
    board.classList.add('shake');
    if (G.clueIdx < G.m.clues.length - 1) G.clueIdx++;
    var loser = nameOf(G.turn);
    otherTurn();
    toast(G.players === 1 ? 'Not them! Here is the next clue.' : 'Not them! ' + loser + ' loses the turn.');
    renderGame(true);
  });

  function win() {
    G.over = true;
    sfxWin();
    var winner = nameOf(G.turn);
    renderGame(false);
    var culprit = G.m.suspects[G.m.culprit.id];
    var heading = G.players === 1 ? (G.names[0] ? escapeHtml(winner) + ' solved it!' : 'You solved it!') : escapeHtml(winner) + ' solved it!';
    showModal(
      '<div class="trophy" aria-hidden="true">&#127942;</div>' +
      '<h3>' + heading + '</h3>' +
      '<div class="culprit">' + WhoArt.suspect(culprit) + '</div>' +
      '<p>It was ' + escapeHtml(effectiveDescribe()) + '.</p>' +
      '<p class="story-end">' + escapeHtml(G.m.theme.ending) + '</p>' +
      '<p>Solved with clue ' + (G.clueIdx + 1) + ' of ' + G.m.clues.length + '.</p>',
      [
        { label: 'Play again', cls: 'primary', fn: function () { startGame(); } },
        { label: 'Settings', cls: 'ghost', fn: function () { closeModal(); show('setup'); renderSetup(); } }
      ]
    );
  }

  $('new-btn').addEventListener('click', function () {
    if (!G || G.over) { startGame(); return; }
    showModal(
      '<h3>Start a new game?</h3><p>This mystery will be lost.</p>',
      [
        { label: 'Yes, new game', cls: 'primary', fn: function () { startGame(); } },
        { label: 'Keep playing', cls: 'ghost', fn: closeModal }
      ]
    );
  });

  $('settings-btn').addEventListener('click', function () {
    if (G && !G.over) {
      showModal(
        '<h3>Leave this game?</h3><p>Your mystery will be lost.</p>',
        [
          { label: 'Yes, go to settings', cls: 'primary', fn: function () { closeModal(); show('setup'); renderSetup(); } },
          { label: 'Keep playing', cls: 'ghost', fn: closeModal }
        ]
      );
      return;
    }
    show('setup');
    renderSetup();
  });

  /* ---------- sound and full screen buttons ---------- */
  function paintSound() {
    var b = $('sound-btn');
    b.classList.toggle('off', !settings.sound);
    b.setAttribute('aria-label', settings.sound ? 'Sound on' : 'Sound off');
  }
  $('sound-btn').addEventListener('click', function () {
    settings.sound = !settings.sound;
    saveSettings();
    paintSound();
    if (settings.sound) sfxTap();
  });
  $('full-btn').addEventListener('click', function () {
    var el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });

  /* ---------- modal and toast ---------- */
  function showModal(bodyHtml, actions) {
    $('modal-body').innerHTML = bodyHtml;
    var wrap = $('modal-actions');
    wrap.innerHTML = '';
    actions.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn big ' + (a.cls || '');
      b.textContent = a.label;
      b.addEventListener('click', a.fn);
      wrap.appendChild(b);
    });
    $('modal-layer').hidden = false;
  }
  function closeModal() { $('modal-layer').hidden = true; }

  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- start ---------- */
  paintSound();
  renderSetup();
})();
