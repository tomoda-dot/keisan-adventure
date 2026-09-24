/* app.js - たしざん・ひきざんマスター けいさんアドベンチャー */

// Game State & Persistence Data Schema
const SAVE_KEY = 'KEISAN_ADVENTURE_SAVE_V1';

const defaultState = {
  playerName: 'プレーヤー',
  coins: 100,
  gems: 0,
  level: 0,
  stars: 0,
  totalPlays: 0,
  totalSolved: 0,
  totalCoinsEarned: 0,
  totalGemsEarned: 0,
  
  // Settings
  settings: {
    lang: 'ja', // 'ja' | 'en'
    readingMode: 'std', // 'std' (いちたすいち) | 'short' (1たす1)
    upOrderName: 'nobori', // 'nobori' | 'agari'
    downOrderName: 'kudari', // 'kudari' | 'sagari'
    randOrderName: 'bara', // 'bara' | 'rand'
    showMs: false,
    autoRead: true,
    leftHand: false,
    reverseKeys: false,
    bgmOn: true,
    sfxOn: true
  },
  
  // Records Matrix: { [stageId]: { nobori: { level, bestTime, clears, orb1, orb2, orb3 }, ... } }
  records: {},
  // Challenge Records: { [chalType]: { rank1: { grade, bestTime, clears }, ... } }
  challengeRecords: {}
};

let gameState = JSON.parse(JSON.stringify(defaultState));

// Current Session Game State
let currentSession = {
  mode: 'practice', // 'practice' | 'challenge'
  type: 'add', // 'add' | 'sub'
  stageId: 1, // 1..10
  order: 'nobori', // 'nobori' | 'kudari' | 'bara'
  chalType: 'normal',
  questions: [],
  qIndex: 0,
  correctCount: 0,
  wrongCount: 0,
  hearts: 5,
  startTime: 0,
  endTime: 0,
  typedVal: '',
  timerInterval: null
};

// Web Audio API Synthesizer for SFX & BGM
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.bgmPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKey() {
    if (!gameState.settings.sfxOn) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCorrect() {
    if (!gameState.settings.sfxOn) return;
    this.init();
    const now = this.ctx.currentTime;
    // Chime C5 -> G5
    [523.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    });
  }

  playWrong() {
    if (!gameState.settings.sfxOn) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playFanfare() {
    if (!gameState.settings.sfxOn) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.3, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.35);
    });
  }

  speak(text) {
    if ('speechSynthesis' in window && gameState.settings.autoRead) {
      window.speechSynthesis.cancel();
      const uttr = new SpeechSynthesisUtterance(text);
      uttr.lang = 'ja-JP';
      uttr.rate = 1.0;
      window.speechSynthesis.speak(uttr);
    }
  }
}

const audio = new SoundEngine();

// Load / Save Helpers
function loadData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      gameState = Object.assign({}, defaultState, parsed);
      gameState.settings = Object.assign({}, defaultState.settings, parsed.settings || {});
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  updateHeaderStats();
}

function saveData() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
  updateHeaderStats();
}

function updateHeaderStats() {
  document.getElementById('title-lv-count').innerText = gameState.level;
  document.getElementById('title-star-count').innerText = gameState.stars;
  document.getElementById('title-coin-count').innerText = gameState.coins;
  document.getElementById('title-gem-count').innerText = gameState.gems;

  document.getElementById('prac-lv-val').innerText = gameState.level;
  document.getElementById('prac-star-val').innerText = gameState.stars;
  document.getElementById('prac-coin-val').innerText = gameState.coins;
  document.getElementById('prac-gem-val').innerText = gameState.gems;

  document.getElementById('chal-lv-val').innerText = gameState.level;
  document.getElementById('chal-star-val').innerText = gameState.stars;

  document.getElementById('rec-lv-val').innerText = gameState.level;
  document.getElementById('rec-star-val').innerText = gameState.stars;
  document.getElementById('rec-coin-val').innerText = gameState.coins;
  document.getElementById('rec-gem-val').innerText = gameState.gems;

  document.getElementById('rec-total-plays').innerText = gameState.totalPlays;
  document.getElementById('rec-total-solved').innerText = gameState.totalSolved;
  document.getElementById('rec-total-coins').innerText = gameState.totalCoinsEarned;
  document.getElementById('rec-total-gems').innerText = gameState.totalGemsEarned;
}

// Navigation & Screen Management
function openScreen(screenId) {
  document.querySelectorAll('.screen-view').forEach(sc => sc.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
  }

  const backBtn = document.getElementById('btn-back');
  if (screenId === 'title') {
    backBtn.classList.add('hidden');
  } else {
    backBtn.classList.remove('hidden');
  }

  if (screenId === 'records') {
    renderRecordsScreen();
  } else if (screenId === 'settings') {
    syncSettingsUI();
  }
}

function goBack() {
  openScreen('title');
}

function toggleLanguage() {
  const chk = document.getElementById('lang-checkbox');
  gameState.settings.lang = chk.checked ? 'en' : 'ja';
  saveData();
}

function toggleBGM() {
  gameState.settings.bgmOn = !gameState.settings.bgmOn;
  const btn = document.getElementById('btn-bgm');
  btn.style.opacity = gameState.settings.bgmOn ? '1' : '0.4';
  saveData();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

/* ================= PRACTICE SCREEN LOGIC ================= */
let activePracticeTab = 'add'; // 'add' | 'sub'

function openPracticeSelect(type = 'add') {
  activePracticeTab = type;
  switchPracticeTab(type);
  openScreen('practice-select');
}

function switchPracticeTab(type) {
  activePracticeTab = type;
  document.getElementById('tab-add').classList.toggle('active', type === 'add');
  document.getElementById('tab-sub').classList.toggle('active', type === 'sub');
  renderPracticeStageGrid();
}

function renderPracticeStageGrid() {
  const container = document.getElementById('practice-grid-container');
  container.innerHTML = '';

  const isAdd = activePracticeTab === 'add';
  const stageCount = 10;

  for (let s = 1; s <= stageCount; s++) {
    const card = document.createElement('div');
    card.className = 'stage-card';

    let stageName = '';
    if (isAdd) {
      stageName = s <= 9 ? `${s} の たしざん` : 'くりあがりあり';
    } else {
      stageName = s <= 9 ? `${s} を ひく` : 'くりさがりあり';
    }

    const stageKey = `${activePracticeTab}_${s}`;
    const recData = gameState.records[stageKey] || {};

    let subButtonsHtml = '';
    ['nobori', 'kudari', 'bara'].forEach(order => {
      let lbl = order === 'nobori' ? 'のぼり' : (order === 'kudari' ? 'くだり' : 'ばらばら');
      const rec = recData[order] || { orb1: false, orb2: false, orb3: false };

      subButtonsHtml += `
        <button class="btn-sub-mode" onclick="startPractice('${activePracticeTab}', ${s}, '${order}')">
          <span class="sub-mode-lbl">${lbl}</span>
          <div class="sub-mode-dots">
            <span class="dot ${rec.orb1 ? 'cleared' : ''}"></span>
            <span class="dot ${rec.orb2 ? 'cleared' : ''}"></span>
            <span class="dot ${rec.orb3 ? 'cleared' : ''}"></span>
          </div>
        </button>
      `;
    });

    card.innerHTML = `
      <div class="stage-card-header">
        <div class="stage-title">${stageName}</div>
        <div class="stage-coin-reward">かくとくコイン 🪙 × 50</div>
      </div>
      <div class="stage-sub-buttons">
        ${subButtonsHtml}
      </div>
    `;

    container.appendChild(card);
  }
}

/* ================= GAMEPLAY ENGINE ================= */
function startPractice(type, stageId, order) {
  currentSession.mode = 'practice';
  currentSession.type = type;
  currentSession.stageId = stageId;
  currentSession.order = order;
  currentSession.qIndex = 0;
  currentSession.correctCount = 0;
  currentSession.wrongCount = 0;
  currentSession.hearts = 5;
  currentSession.typedVal = '';

  // Generate 10 Questions
  currentSession.questions = generateQuestions(type, stageId, order);
  currentSession.startTime = Date.now();

  openScreen('gameplay');
  renderGameplayQuestion();
}

function generateQuestions(type, stageId, order) {
  let list = [];
  const isAdd = type === 'add';

  if (isAdd) {
    if (stageId <= 9) {
      for (let i = 1; i <= 9; i++) {
        list.push({ n1: stageId, n2: i, op: '＋', ans: stageId + i });
      }
      list.push({ n1: stageId, n2: 10, op: '＋', ans: stageId + 10 });
    } else {
      // くりあがりあり (Carry sums e.g. 8+5=13)
      for (let i = 2; i <= 9; i++) {
        for (let j = 2; j <= 9; j++) {
          if (i + j > 10) list.push({ n1: i, n2: j, op: '＋', ans: i + j });
        }
      }
      list = list.sort(() => 0.5 - Math.random()).slice(0, 10);
    }
  } else {
    // Subtraction
    if (stageId <= 9) {
      for (let i = 1; i <= 10; i++) {
        const n1 = stageId + i;
        list.push({ n1: n1, n2: stageId, op: '－', ans: i });
      }
    } else {
      // くりさがりあり (Borrowing e.g. 14-8=6)
      for (let i = 11; i <= 18; i++) {
        for (let j = 2; j <= 9; j++) {
          if (i - j < 10 && i - j > 0) list.push({ n1: i, n2: j, op: '－', ans: i - j });
        }
      }
      list = list.sort(() => 0.5 - Math.random()).slice(0, 10);
    }
  }

  // Order sorting
  if (order === 'nobori') {
    list.sort((a, b) => a.n2 - b.n2);
  } else if (order === 'kudari') {
    list.sort((a, b) => b.n2 - a.n2);
  } else {
    list.sort(() => 0.5 - Math.random());
  }

  return list.slice(0, 10);
}

function renderGameplayQuestion() {
  const q = currentSession.questions[currentSession.qIndex];
  if (!q) {
    finishSession();
    return;
  }

  currentSession.typedVal = '';
  document.getElementById('lcd-value').innerText = '';
  document.getElementById('gameplay-feedback-msg').innerText = '';
  document.getElementById('gameplay-feedback-msg').className = 'feedback-msg';

  // Stage Title
  const isAdd = currentSession.type === 'add';
  let stageName = isAdd ? (currentSession.stageId <= 9 ? `${currentSession.stageId} の たしざん` : 'くりあがりあり') : (currentSession.stageId <= 9 ? `${currentSession.stageId} を ひく` : 'くりさがりあり');
  let orderLbl = currentSession.order === 'nobori' ? 'のぼり' : (currentSession.order === 'kudari' ? 'くだり' : 'ばらばら');

  document.getElementById('gameplay-stage-title').innerText = `${stageName} ${orderLbl}`;
  document.getElementById('q-curr').innerText = currentSession.qIndex + 1;
  document.getElementById('q-total').innerText = currentSession.questions.length;

  document.getElementById('formula-num1').innerText = q.n1;
  document.getElementById('formula-op').innerText = q.op;
  document.getElementById('formula-num2').innerText = q.n2;
  document.getElementById('formula-answer-box').innerText = '?';

  renderHearts();

  // Left hand keypad layout support
  const keypad = document.getElementById('keypad-panel');
  keypad.style.order = gameState.settings.leftHand ? '-1' : '1';

  // Speech TTS if auto-read is enabled
  if (gameState.settings.autoRead) {
    const opText = q.op === '＋' ? 'たす' : 'ひく';
    audio.speak(`${q.n1} ${opText} ${q.n2} は？`);
  }
}

function renderHearts() {
  const container = document.getElementById('hearts-container');
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += i < currentSession.hearts ? '❤️' : '🖤';
  }
  container.innerHTML = html;
}

function pressKey(key) {
  audio.playKey();

  if (key === 'C') {
    currentSession.typedVal = '';
  } else {
    if (currentSession.typedVal.length < 3) {
      currentSession.typedVal += key;
    }
  }

  document.getElementById('lcd-value').innerText = currentSession.typedVal;
  document.getElementById('formula-answer-box').innerText = currentSession.typedVal || '?';

  // Auto Check when typed digits equal answer length
  const q = currentSession.questions[currentSession.qIndex];
  const targetLen = String(q.ans).length;
  if (currentSession.typedVal.length >= targetLen) {
    checkAnswer();
  }
}

function checkAnswer() {
  const q = currentSession.questions[currentSession.qIndex];
  const val = parseInt(currentSession.typedVal, 10);

  const fb = document.getElementById('gameplay-feedback-msg');

  if (val === q.ans) {
    audio.playCorrect();
    fb.innerText = '⭕ せいかい！';
    fb.className = 'feedback-msg correct';
    currentSession.correctCount++;
    gameState.totalSolved++;

    setTimeout(() => {
      currentSession.qIndex++;
      renderGameplayQuestion();
    }, 600);
  } else {
    audio.playWrong();
    fb.innerText = `❌ おしい！ (こたえ: ${q.ans})`;
    fb.className = 'feedback-msg wrong';
    currentSession.wrongCount++;
    currentSession.hearts = Math.max(0, currentSession.hearts - 1);
    renderHearts();

    setTimeout(() => {
      currentSession.typedVal = '';
      document.getElementById('lcd-value').innerText = '';
      document.getElementById('formula-answer-box').innerText = '?';
      if (currentSession.hearts <= 0) {
        finishSession();
      }
    }, 1000);
  }
}

/* ================= RESULT SCREEN LOGIC ================= */
function finishSession() {
  currentSession.endTime = Date.now();
  const elapsedSec = Math.round((currentSession.endTime - currentSession.startTime) / 1000);
  gameState.totalPlays++;

  const isAdd = currentSession.type === 'add';
  const stageKey = `${currentSession.type}_${currentSession.stageId}`;
  if (!gameState.records[stageKey]) gameState.records[stageKey] = {};
  
  const orderKey = currentSession.order;
  const prevRec = gameState.records[stageKey][orderKey] || { level: 0, bestTime: 999, clears: 0, orb1: false, orb2: false, orb3: false };

  const isNoMiss = currentSession.wrongCount === 0;
  let coinsEarned = 25;
  if (isNoMiss) coinsEarned *= 2; // 50 coins

  const orb1 = elapsedSec <= 60;
  const orb2 = elapsedSec <= 30;
  const orb3 = elapsedSec <= 20;

  const isNewRecord = elapsedSec < prevRec.bestTime || !prevRec.clears;
  const newClears = prevRec.clears + 1;
  const newBestTime = Math.min(prevRec.bestTime, elapsedSec);

  gameState.records[stageKey][orderKey] = {
    level: Math.max(prevRec.level, isNoMiss ? 3 : 1),
    bestTime: newBestTime,
    clears: newClears,
    orb1: prevRec.orb1 || orb1,
    orb2: prevRec.orb2 || orb2,
    orb3: prevRec.orb3 || orb3
  };

  gameState.coins += coinsEarned;
  gameState.totalCoinsEarned += coinsEarned;
  gameState.level += 1;

  saveData();
  audio.playFanfare();

  renderResultBlackboardModal(elapsedSec, currentSession.questions.length, currentSession.wrongCount, coinsEarned, isNoMiss, isNewRecord, orb1, orb2, orb3);
}

function renderResultBlackboardModal(timeSec, qCount, wrongCount, coins, isNoMiss, isNewRecord, orb1, orb2, orb3) {
  const overlay = document.getElementById('modal-result-overlay');
  overlay.classList.remove('hidden');

  const card = overlay.querySelector('.modal-result');
  card.style.background = 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)';
  card.style.border = '6px solid #ffffff';
  card.style.borderRadius = '24px';
  card.style.color = '#ffffff';

  const isAdd = currentSession.type === 'add';
  let stageName = isAdd ? (currentSession.stageId <= 9 ? `${currentSession.stageId} の たしざん` : 'くりあがりあり') : (currentSession.stageId <= 9 ? `${currentSession.stageId} を ひく` : 'くりさがりあり');
  let orderLbl = currentSession.order === 'nobori' ? 'のぼり' : (currentSession.order === 'kudari' ? 'くだり' : 'ばらばら');

  card.innerHTML = `
    <div style="font-size:14px;font-weight:800;color:#c8e6c9">けっか はっぴょう</div>
    <h2 style="font-size:32px;font-weight:900;margin-bottom:12px">結果発表</h2>
    ${isNewRecord ? '<div style="position:absolute;top:16px;right:20px;background:#fbc02d;color:#1b5e20;font-size:12px;font-weight:900;padding:4px 12px;border-radius:12px;box-shadow:0 3px 6px rgba(0,0,0,0.3)">新記録達成！</div>' : ''}

    <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">
      <!-- Left side stage badge -->
      <div style="flex:1;background:rgba(255,255,255,0.15);border:3px solid #ff5252;border-radius:18px;padding:16px">
        <div style="font-size:20px;font-weight:900;color:#ff8a80">たしざんれんしゅう</div>
        <div style="font-size:16px;font-weight:800;margin-top:4px">${stageName} ${orderLbl}</div>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:800">
          <div><span style="color:${orb1 ? '#ff5252' : '#9e9e9e'}">🔴</span> 60秒以内にクリア</div>
          <div><span style="color:${orb2 ? '#ff5252' : '#9e9e9e'}">🔴</span> 30秒以内にクリア</div>
          <div><span style="color:${orb3 ? '#ff5252' : '#9e9e9e'}">🔴</span> 20秒以内にクリア</div>
        </div>
      </div>

      <!-- Right side stats -->
      <div style="flex:1;text-align:left;font-size:15px;font-weight:800;line-height:1.8">
        <div>クリアタイム： <span style="font-size:22px;color:#fff176">${timeSec} 秒</span></div>
        <div>もんだいの数： <span style="font-size:20px">${qCount}</span></div>
        <div>まちがえた数： <span style="font-size:20px">${wrongCount}</span></div>
        <hr style="border:1px dashed rgba(255,255,255,0.3);margin:8px 0">
        <div style="text-align:center;font-size:14px;color:#fff59d">かくとくコイン</div>
        <div style="text-align:center;font-size:12px;color:#a5d6a7">${isNoMiss ? 'ノーミス BONUS!' : ''}</div>
        <div style="text-align:center;font-size:26px;font-weight:900;color:#ffeb3b">🪙 25 × ${isNoMiss ? 2 : 1} ＝ ${coins}</div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.2);padding:10px 16px;border-radius:16px">
      <div style="font-size:18px;font-weight:900">🪙 × ${gameState.coins} &nbsp; 💎 × ${gameState.gems}</div>
      <button onclick="closeResultModal(); openPracticeSelect('${currentSession.type}');" style="background:#ffffff;color:#1b5e20;border:none;border-radius:20px;padding:8px 24px;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #c8e6c9">つぎへ ➔</button>
    </div>
  `;
}

function closeResultModal() {
  document.getElementById('modal-result-overlay').classList.add('hidden');
}

/* ================= SETTINGS & RECORDS MANAGEMENT ================= */
function syncSettingsUI() {
  document.getElementById('chk-show-ms').checked = gameState.settings.showMs;
  document.getElementById('chk-auto-read').checked = gameState.settings.autoRead;
  document.getElementById('chk-left-hand').checked = gameState.settings.leftHand;
  document.getElementById('chk-reverse-keys').checked = gameState.settings.reverseKeys;
}

function saveSettingsFromUI() {
  gameState.settings.showMs = document.getElementById('chk-show-ms').checked;
  gameState.settings.autoRead = document.getElementById('chk-auto-read').checked;
  gameState.settings.leftHand = document.getElementById('chk-left-hand').checked;
  gameState.settings.reverseKeys = document.getElementById('chk-reverse-keys').checked;
  saveData();
}

function setReadingMode(mode) {
  gameState.settings.readingMode = mode;
  document.getElementById('read-std').classList.toggle('active', mode === 'std');
  document.getElementById('read-short').classList.toggle('active', mode === 'short');
  saveData();
}

function setOrderName(type) {
  if (['nobori', 'agari'].includes(type)) gameState.settings.upOrderName = type;
  if (['kudari', 'sagari'].includes(type)) gameState.settings.downOrderName = type;
  if (['bara', 'rand'].includes(type)) gameState.settings.randOrderName = type;
  saveData();
}

function savePlayerName(val) {
  gameState.playerName = val || 'プレーヤー';
  saveData();
}

function renderRecordsScreen() {
  document.getElementById('player-name-input').value = gameState.playerName || 'プレーヤー';

  // Render Practice Table
  const tbody = document.getElementById('records-practice-tbody');
  tbody.innerHTML = '';

  ['add', 'sub'].forEach(type => {
    for (let s = 1; s <= 10; s++) {
      const stageKey = `${type}_${s}`;
      const recs = gameState.records[stageKey] || {};

      let title = type === 'add' ? (s <= 9 ? `${s}のたしざん` : 'くりあがりあり') : (s <= 9 ? `${s}をひく` : 'くりさがりあり');
      const tr = document.createElement('tr');

      const nob = recs.nobori || { level: '-', bestTime: '-', clears: '-' };
      const kud = recs.kudari || { level: '-', bestTime: '-', clears: '-' };
      const bar = recs.bara || { level: '-', bestTime: '-', clears: '-' };

      tr.innerHTML = `
        <td style="font-weight:800">${title}</td>
        <td>${nob.level}</td><td>${nob.bestTime === '-' ? '-' : nob.bestTime + 's'}</td><td>${nob.clears}</td>
        <td>${kud.level}</td><td>${kud.bestTime === '-' ? '-' : kud.bestTime + 's'}</td><td>${kud.clears}</td>
        <td>${bar.level}</td><td>${bar.bestTime === '-' ? '-' : bar.bestTime + 's'}</td><td>${bar.clears}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// Backup & Restore JSON
function exportDataJSON() {
  const jsonStr = JSON.stringify(gameState, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keisan_adventure_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImportJSON() {
  document.getElementById('import-file-input').click();
}

function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported && typeof imported === 'object') {
        gameState = Object.assign({}, defaultState, imported);
        saveData();
        alert('データを正常に読み込みました！');
        openScreen('title');
      }
    } catch (err) {
      alert('ファイルの読み込みに失敗しました: ' + err);
    }
  };
  reader.readAsText(file);
}

// Initial Launch
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  openScreen('title');
});
