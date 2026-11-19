/* Who Done It? - game screens, turns and sounds. */
(function () {
  'use strict';

  var KEY = 'whodoneit-settings';
  var GAME_KEY = 'whodoneit-game'; // the game in progress, so a refresh doesn't lose it
  var LEVEL_INFO = {
    1: { title: 'Level 1', sub: 'Quick. 6 suspects, 3 traits, one-trait clues.' },
    2: { title: 'Level 2', sub: '9 suspects, 4 traits. Adds AND clues.' },
    3: { title: 'Level 3', sub: '12 suspects, 5 traits. Adds OR clues and where they stand.' }
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- saved settings ---------- */
  var settings = { level: 1, theme: 'random', names: ['', ''], sound: true, players: 2, match: 1, score: true };
  var SOLVE_POINTS = 3;
  var MATCH_INFO = [
    { n: 1, title: '1 mystery', sub: 'One quick game.' },
    { n: 3, title: '3 mysteries', sub: 'Most points wins.' },
    { n: 5, title: '5 mysteries', sub: 'A longer match.' }
  ];
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
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ } // iPhone/iPad: play sound even with the silent switch on
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
  var matchChoice = [1, 3, 5].indexOf(settings.match) >= 0 ? settings.match : 1;
  var scoreChoice = settings.score !== false;

  function summaryText() {
    var who = playersChoice === 1
      ? (settings.names[0] || 'Solo practice')
      : (settings.names[0] || 'Player 1') + ' vs ' + (settings.names[1] || 'Player 2');
    var length = !scoreChoice ? 'No score' : matchChoice === 1 ? '1 mystery' : matchChoice + ' mysteries';
    return 'Level ' + levelChoice + ' · ' + length + ' · ' + who;
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

    var match = $('match');
    match.innerHTML = '';
    MATCH_INFO.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'seg';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(o.n === matchChoice));
      b.innerHTML = '<span class="seg-title">' + o.title + '</span><span class="seg-sub">' + o.sub + '</span>';
      b.addEventListener('click', function () { matchChoice = o.n; renderSetup(); });
      match.appendChild(b);
    });
    // Without a score, a match of several mysteries means nothing, so it is always 1.
    $('score-switch').checked = scoreChoice;
    match.hidden = !scoreChoice;

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
    settings.match = matchChoice;
    settings.score = scoreChoice;
    saveSettings();
    startMatch();
  });

  $('score-switch').addEventListener('change', function () { scoreChoice = this.checked; renderSetup(); });

  $('name-a').addEventListener('input', function () { settings.names[0] = this.value.trim(); $('summary').textContent = summaryText(); });
  $('name-b').addEventListener('input', function () { settings.names[1] = this.value.trim(); $('summary').textContent = summaryText(); });

  /* ---------- game state ---------- */
  var G = null;
  // G = { m: mystery, names: [a, b], turn: 0|1, clueIdx, selected, over, flip: {id: 'gray'} }  (flip marks suspects the player crossed off)

  function nameOf(i) {
    if (G.players === 1) return G.names[0] || 'You';
    return G.names[i] || ('Player ' + (i + 1));
  }

  // A match is 1, 3 or 5 mysteries. Points carry over between them.
  // With "Keep score" off there are no points and a match is always 1 mystery.
  var M = null; // { keep, length, played, scores: [a, b], level, theme }
  var nextStarter = 0; // who goes first in the next mystery; it switches every mystery

  function startMatch() {
    var keep = settings.score !== false;
    M = {
      keep: keep,
      length: keep ? (settings.match || 1) : 1,
      played: 0,
      scores: [0, 0],
      level: settings.level,
      theme: settings.theme
    };
    startGame();
  }

  function matchOver() { return M.played >= M.length; }
  // What solving this mystery is worth to a player: 3, minus 1 for each of their wrong guesses, never below 0.
  function prize(i) { return Math.max(0, SOLVE_POINTS - G.wrongBy[i]); }
  function matchInProgress() { return !!G && (!G.over || !matchOver()); }
  function lossText() { return M.length > 1 ? 'This match and its points will be lost.' : 'This mystery will be lost.'; }

  function startGame() {
    var starter = settings.players === 1 ? 0 : nextStarter;
    if (settings.players === 2) nextStarter = 1 - nextStarter;
    var mystery = WhoDoneIt.generate({
      level: M.level,
      theme: M.theme === 'random' ? undefined : M.theme
    });
    G = {
      m: mystery,
      players: settings.players === 1 ? 1 : 2,
      names: [settings.names[0], settings.names[1]],
      turn: starter,
      clueIdx: 0,
      selected: null,
      over: false,
      flip: {},
      bonus: false, // true when the player whose turn it is gets two clues in a row (the other player guessed wrong)
      wrong: 0,
      wrongBy: [0, 0] // wrong guesses each player made in this mystery; each one makes solving worth 1 point less
    };
    showMystery();
    if (G.players === 2) toast(nameOf(G.turn) + ' goes first.');
  }

  function showMystery() {
    var mystery = G.m;
    closeModal();
    show('game');
    $('level-label').textContent = 'Level ' + mystery.level + ' · ' + mystery.theme.name;
    $('question').innerHTML = '<span class="story-intro">' + escapeHtml(mystery.theme.intro) + '</span>' +
      '<span class="story-ask">' + escapeHtml(mystery.theme.question) + '</span>';
    renderGame(true);
  }

  /* ---------- saving the game in progress ----------
     Saved after every move, so refreshing the page (or the tablet closing the tab)
     brings the same game back. Clue checks are only needed while making the
     mystery, so just the clue sentences are saved. */
  function saveGame() {
    try {
      var m = G.m;
      localStorage.setItem(GAME_KEY, JSON.stringify({
        v: 2, // 2: the Winking face became Grumpy, so older saves are dropped
        M: M,
        nextStarter: nextStarter,
        G: {
          players: G.players, names: G.names, turn: G.turn, clueIdx: G.clueIdx, selected: G.selected,
          over: G.over, flip: G.flip, bonus: G.bonus, wrong: G.wrong, wrongBy: G.wrongBy
        },
        m: {
          level: m.level, theme: m.theme.id, rows: m.rows, cols: m.cols, active: m.active,
          suspects: m.suspects, culprit: m.culprit.id, clues: m.clues.map(function (c) { return c.text; })
        }
      }));
    } catch (e) { /* storage blocked: the game just isn't saved */ }
  }

  function forgetGame() {
    try { localStorage.removeItem(GAME_KEY); } catch (e) { /* ignore */ }
  }

  // Returns true if a saved game was brought back.
  function restoreGame() {
    try {
      var data = JSON.parse(localStorage.getItem(GAME_KEY) || 'null');
      if (!data || data.v !== 2) { forgetGame(); return false; }
      var sm = data.m;
      var theme = WhoDoneIt.THEMES.filter(function (t) { return t.id === sm.theme; })[0];
      if (!theme) return false;
      var culprit = sm.suspects[sm.culprit];
      M = data.M;
      nextStarter = data.nextStarter;
      G = data.G;
      if (!G.wrongBy) G.wrongBy = [0, 0];
      G.m = {
        level: sm.level, theme: theme, rows: sm.rows, cols: sm.cols, active: sm.active,
        suspects: sm.suspects, culprit: culprit,
        clues: sm.clues.map(function (text) { return { text: text }; }),
        describeCulprit: function () { return WhoDoneIt.describe(culprit, sm.active); }
      };
      if (G.over) {
        if (matchOver()) { forgetGame(); return false; } // that match was finished
        startGame(); // between mysteries: go on to the next one
      } else {
        showMystery();
      }
      toast('Welcome back! Here is your game.');
      return true;
    } catch (e) {
      forgetGame();
      return false;
    }
  }

  // "Mystery 2 of 3" and each player's points. bumpWho makes that player's points pop.
  function scoreboardHtml(bumpWho) {
    var html = '';
    if (M.length > 1) {
      html += '<span class="score-round">Mystery ' + Math.min(M.played + (G.over ? 0 : 1), M.length) + ' of ' + M.length + '</span>';
    }
    var who = G.players === 1 ? [0] : [0, 1];
    who.forEach(function (i) {
      var mine = !G.over && G.players === 2 && G.turn === i;
      html += '<span class="score-chip' + (mine ? ' is-turn' : '') + '">' +
        '<span class="name-dot ' + (i === 0 ? 'dot-a' : 'dot-b') + '"></span>' +
        escapeHtml(G.players === 1 ? (G.names[0] || 'You') : nameOf(i)) +
        ' <span class="score-pts' + (bumpWho === i ? ' bump' : '') + '">' + M.scores[i] + ' pt' + (M.scores[i] === 1 ? '' : 's') + '</span>' +
        // while playing, what solving is worth right now (it drops with each wrong guess)
        (G.over ? '' : '<span class="score-prize' + (prize(i) < SOLVE_POINTS ? ' low' : '') + '" title="Points for solving">+' + prize(i) + '</span>') +
        '</span>';
    });
    return html;
  }

  function show(which) {
    $('setup').classList.toggle('active', which === 'setup');
    $('game').classList.toggle('active', which === 'game');
  }

  function isGray(s) {
    return G.flip[s.id] === 'gray';
  }

  function renderGame(fresh, bumpWho) {
    var m = G.m;
    $('scoreboard').hidden = !M.keep;
    $('scoreboard').innerHTML = M.keep ? scoreboardHtml(bumpWho) : '';
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
    // Earlier clues stay on the card, because the answer needs all of them together.
    var log = $('clue-log');
    log.innerHTML = '';
    for (var i = 0; i < G.clueIdx; i++) {
      var li = document.createElement('li');
      li.textContent = m.clues[i].text.replace(/^The culprit /, ''); // the heading already says "The culprit…"
      log.appendChild(li);
    }
    $('clue-log-wrap').hidden = G.clueIdx === 0;

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
        : G.bonus
          ? 'Bonus! If you pass, you get the next clue too.'
          : 'Tap a suspect to pick them. Tap the little badge to flip them down.';
    saveGame(); // every move goes through here
  }

  // In a 1-player game the same player always keeps the turn; the next clue just appears.
  function otherTurn() {
    if (G.players === 2) G.turn = 1 - G.turn;
    G.selected = null;
  }

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
    sfxPass();
    if (G.bonus) {
      // The other player guessed wrong, so this player keeps the turn for one more clue.
      G.bonus = false;
      G.selected = null;
      toast(nameOf(G.turn) + ' gets one more clue.');
    } else {
      otherTurn();
      toast(G.players === 1 ? 'Here is the next clue.' : nameOf(G.turn) + ' gets the next clue.');
    }
    renderGame(true);
  });

  $('guess-btn').addEventListener('click', function () {
    if (G.over || G.selected === null) return;
    var s = G.m.suspects[G.selected];
    if (s.id === G.m.culprit.id) {
      win();
      return;
    }
    // Wrong guess: that suspect is flipped down, and the other player gets the next two clues.
    G.flip[s.id] = 'gray';
    G.wrong++;
    sfxWrong();
    var board = $('board');
    board.classList.remove('shake');
    void board.offsetWidth;
    board.classList.add('shake');
    // A wrong guess makes solving this mystery worth 1 point less for that player
    // (never less than 0). Points already won are never taken away.
    var guesser = G.turn;
    G.wrongBy[guesser]++;
    var worth = prize(guesser);
    var who = G.players === 1 ? '' : ' for ' + nameOf(guesser);
    var minus = !M.keep ? ''
      : worth === 0 ? ' No points left' + who + ' on this one.'
      : ' Solving is now worth ' + worth + ' point' + (worth === 1 ? '' : 's') + who + '.';
    if (G.clueIdx < G.m.clues.length - 1) G.clueIdx++;
    otherTurn();
    var moreClues = G.clueIdx < G.m.clues.length - 1;
    G.bonus = G.players === 2 && moreClues;
    toast(G.players === 1
      ? 'Not them!' + minus + ' Here is the next clue.'
      : moreClues
        ? 'Not them!' + minus + ' ' + nameOf(G.turn) + ' gets the next 2 clues.'
        : 'Not them!' + minus + ' ' + nameOf(G.turn) + '’s turn.');
    renderGame(true);
  });

  // Who won the whole match, for the last mystery's message.
  function matchResultHtml() {
    if (M.length === 1) return '';
    if (G.players === 1) {
      return '<p class="match-win">Match over! You scored ' + M.scores[0] + ' points.</p>';
    }
    if (M.scores[0] === M.scores[1]) return '<p class="match-win">Match over! It’s a tie!</p>';
    var best = M.scores[0] > M.scores[1] ? 0 : 1;
    return '<p class="match-win">' + escapeHtml(nameOf(best)) + ' wins the match!</p>';
  }

  function win() {
    G.over = true;
    $('toast').classList.remove('show'); // don't leave an old "Not them!" message over the win screen
    sfxWin();
    var solver = G.turn;
    var winner = nameOf(solver);
    var won = M.keep ? prize(solver) : 0;
    M.scores[solver] += won;
    M.played++;
    renderGame(false, solver);
    var culprit = G.m.suspects[G.m.culprit.id];
    var heading = G.players === 1 ? (G.names[0] ? escapeHtml(winner) + ' solved it!' : 'You solved it!') : escapeHtml(winner) + ' solved it!';
    var done = matchOver();
    var toSettings = { label: 'Settings', cls: 'ghost', fn: goToSetup };
    showModal(
      '<div class="trophy" aria-hidden="true">&#127942;</div>' +
      '<h3>' + heading + (M.keep ? (won ? ' +' + won + ' point' + (won === 1 ? '' : 's') : '') : '') + '</h3>' +
      (M.keep && !won ? '<p>No points this time: too many wrong guesses.</p>' : '') +
      '<div class="culprit">' + WhoArt.suspect(culprit) + '</div>' +
      '<p>It was ' + escapeHtml(G.m.describeCulprit()) + '.</p>' +
      '<p class="story-end">' + escapeHtml(G.m.theme.ending) + '</p>' +
      '<p>Solved with clue ' + (G.clueIdx + 1) + ' of ' + G.m.clues.length +
        (G.players === 1 ? (G.wrong === 0 ? ', with no wrong guesses!' : ', with ' + G.wrong + ' wrong guess' + (G.wrong === 1 ? '' : 'es') + '.') : '.') + '</p>' +
      (M.keep ? '<div class="scoreboard">' + scoreboardHtml() + '</div>' : '') +
      (done ? matchResultHtml() : ''),
      done
        ? [{ label: M.length === 1 ? 'Play again' : 'New match', cls: 'primary', fn: startMatch }, toSettings]
        : [{ label: 'Next mystery', cls: 'primary', fn: startGame }, toSettings]
    );
  }

  function goToSetup() {
    forgetGame();
    closeModal();
    show('setup');
    renderSetup();
  }

  $('new-btn').addEventListener('click', function () {
    if (!matchInProgress()) { startMatch(); return; }
    showModal(
      '<h3>Start a new game?</h3><p>' + lossText() + '</p>',
      [
        { label: 'Yes, new game', cls: 'primary', fn: startMatch },
        { label: 'Keep playing', cls: 'ghost', fn: closeModal }
      ]
    );
  });

  $('settings-btn').addEventListener('click', function () {
    if (matchInProgress()) {
      showModal(
        '<h3>Leave this game?</h3><p>' + lossText() + '</p>',
        [
          { label: 'Yes, go to settings', cls: 'primary', fn: goToSetup },
          { label: 'Keep playing', cls: 'ghost', fn: closeModal }
        ]
      );
      return;
    }
    goToSetup();
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
  restoreGame(); // go straight back into a game that was in progress
})();
