/* サンリオ調オリジナルパステルマスコットSVG & 応援ウィジェット */
(function () {
  const MASCOTS = {
    // 🎀 ミミちゃん（白うさぎ＋ピンクリボン）
    mimi: {
      name: 'ミミちゃん',
      lines: ['いっしょに がんばろう♪', 'すごいねっ！ そのちょうし♡', 'きらきら〜☆ できたかな？', 'えらいねっ！ もういっかい♪'],
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <!-- みみ -->
        <ellipse cx="34" cy="24" rx="10" ry="22" transform="rotate(-10 34 24)" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <ellipse cx="34" cy="25" rx="5" ry="14" transform="rotate(-10 34 25)" fill="#ffc1dc"/>
        <ellipse cx="66" cy="24" rx="10" ry="22" transform="rotate(10 66 24)" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <ellipse cx="66" cy="25" rx="5" ry="14" transform="rotate(10 66 25)" fill="#ffc1dc"/>
        <!-- かお -->
        <ellipse cx="50" cy="60" rx="34" ry="28" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <!-- リボン -->
        <path d="M62 34 C56 26, 48 34, 58 40 C50 44, 58 50, 64 42 Z" fill="#ff7eb3" stroke="#6b4c57" stroke-width="2.4"/>
        <path d="M68 36 C78 28, 84 38, 72 42 C82 48, 74 54, 66 44 Z" fill="#ff7eb3" stroke="#6b4c57" stroke-width="2.4"/>
        <circle cx="65" cy="40" r="5" fill="#ffb3d1" stroke="#6b4c57" stroke-width="2.4"/>
        <!-- め・ほっぺ・くち -->
        <circle cx="37" cy="58" r="3.6" fill="#6b4c57"/>
        <circle cx="36" cy="56.8" r="1.2" fill="#ffffff"/>
        <circle cx="63" cy="58" r="3.6" fill="#6b4c57"/>
        <circle cx="62" cy="56.8" r="1.2" fill="#ffffff"/>
        <ellipse cx="28" cy="65" rx="6" ry="3.8" fill="#ffb3d1" opacity="0.75"/>
        <ellipse cx="72" cy="65" rx="6" ry="3.8" fill="#ffb3d1" opacity="0.75"/>
        <ellipse cx="50" cy="63" rx="3" ry="2.2" fill="#ff8fb8"/>
        <path d="M45 67 Q50 71 55 67" fill="none" stroke="#6b4c57" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`
    },

    // ☁️ ふわわん（たれ耳白こいぬ＋水色リボン）
    fuwawan: {
      name: 'ふわわん',
      lines: ['ふわふわ〜♪ たのしいね！', 'わぁっ！ とってもじょうず♡', 'あせらず ゆっくりで いいよ☁️', 'いっしょに ぼうけんしよう！'],
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <!-- たれ耳 -->
        <ellipse cx="18" cy="58" rx="14" ry="20" transform="rotate(24 18 58)" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <ellipse cx="82" cy="58" rx="14" ry="20" transform="rotate(-24 82 58)" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <!-- かお -->
        <ellipse cx="50" cy="56" rx="33" ry="27" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <!-- 水色リボン -->
        <path d="M44 27 C34 19, 30 33, 44 33 Z" fill="#8fd3ff" stroke="#6b4c57" stroke-width="2.4"/>
        <path d="M56 27 C66 19, 70 33, 56 33 Z" fill="#8fd3ff" stroke="#6b4c57" stroke-width="2.4"/>
        <circle cx="50" cy="30" r="4.8" fill="#cceeff" stroke="#6b4c57" stroke-width="2.4"/>
        <!-- め・ほっぺ・くち -->
        <circle cx="36" cy="55" r="3.8" fill="#4aa8e0"/>
        <circle cx="35" cy="53.6" r="1.3" fill="#ffffff"/>
        <circle cx="64" cy="55" r="3.8" fill="#4aa8e0"/>
        <circle cx="63" cy="53.6" r="1.3" fill="#ffffff"/>
        <ellipse cx="28" cy="63" rx="6.5" ry="4" fill="#ffb3d1" opacity="0.75"/>
        <ellipse cx="72" cy="63" rx="6.5" ry="4" fill="#ffb3d1" opacity="0.75"/>
        <path d="M44 62 Q50 67 56 62" fill="none" stroke="#6b4c57" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`
    },

    // 🍓 みるく（白ねこ＋いちごリボン）
    milk: {
      name: 'みるく',
      lines: ['にゃん♪ ぴったり めざそう！', 'きらきら コイン 集めようね☆', 'やったねっ！ だいせいこう♡', 'つぎも がんばるにゃん♪'],
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <!-- ねこ耳 -->
        <path d="M22 48 L24 22 L44 36 Z" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M27 42 L28 28 L39 36 Z" fill="#ffc1dc"/>
        <path d="M78 48 L76 22 L56 36 Z" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M73 42 L72 28 L61 36 Z" fill="#ffc1dc"/>
        <!-- かお -->
        <ellipse cx="50" cy="58" rx="34" ry="27" fill="#ffffff" stroke="#6b4c57" stroke-width="3.2"/>
        <!-- ひげ -->
        <line x1="12" y1="56" x2="22" y2="58" stroke="#6b4c57" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="13" y1="64" x2="23" y2="63" stroke="#6b4c57" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="88" y1="56" x2="78" y2="58" stroke="#6b4c57" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="87" y1="64" x2="77" y2="63" stroke="#6b4c57" stroke-width="2.4" stroke-linecap="round"/>
        <!-- いちごリボン -->
        <ellipse cx="69" cy="34" rx="7" ry="5" transform="rotate(-20 69 34)" fill="#ff6b9d" stroke="#6b4c57" stroke-width="2.2"/>
        <ellipse cx="81" cy="39" rx="7" ry="5" transform="rotate(-20 81 39)" fill="#ff6b9d" stroke="#6b4c57" stroke-width="2.2"/>
        <circle cx="75" cy="36.5" r="4.2" fill="#ffe082" stroke="#6b4c57" stroke-width="2.2"/>
        <!-- め・はな・ほっぺ -->
        <circle cx="36" cy="57" r="3.6" fill="#6b4c57"/>
        <circle cx="35" cy="55.8" r="1.2" fill="#ffffff"/>
        <circle cx="64" cy="57" r="3.6" fill="#6b4c57"/>
        <circle cx="63" cy="55.8" r="1.2" fill="#ffffff"/>
        <ellipse cx="50" cy="62" rx="4" ry="2.8" fill="#ffd54f" stroke="#6b4c57" stroke-width="2"/>
        <ellipse cx="28" cy="65" rx="5.5" ry="3.4" fill="#ffb3d1" opacity="0.75"/>
        <ellipse cx="72" cy="65" rx="5.5" ry="3.4" fill="#ffb3d1" opacity="0.75"/>
      </svg>`
    },

    // 🌟 ぽむくま（クリームこぐま＋ベレー帽）
    pomkuma: {
      name: 'ぽむくま',
      lines: ['おほしさまみたいに キラキラ☆', 'すごいすごい！ はなまるだよ💮', 'ゆっくり かんがえてみよう♪', 'ぼくも おうえんしてるよ♡'],
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <!-- くま耳 -->
        <circle cx="24" cy="34" r="11" fill="#ffe7a8" stroke="#6b4c57" stroke-width="3.2"/>
        <circle cx="24" cy="34" r="5.5" fill="#ffd1dc"/>
        <circle cx="76" cy="34" r="11" fill="#ffe7a8" stroke="#6b4c57" stroke-width="3.2"/>
        <circle cx="76" cy="34" r="5.5" fill="#ffd1dc"/>
        <!-- かお -->
        <ellipse cx="50" cy="58" rx="34" ry="28" fill="#fff2c6" stroke="#6b4c57" stroke-width="3.2"/>
        <!-- ベレー帽 -->
        <ellipse cx="50" cy="31" rx="22" ry="9" fill="#c98a5b" stroke="#6b4c57" stroke-width="2.8"/>
        <line x1="50" y1="22" x2="50" y2="16" stroke="#6b4c57" stroke-width="3" stroke-linecap="round"/>
        <!-- め・くち・ほっぺ -->
        <circle cx="37" cy="56" r="3.6" fill="#6b4c57"/>
        <circle cx="36" cy="54.8" r="1.2" fill="#ffffff"/>
        <circle cx="63" cy="56" r="3.6" fill="#6b4c57"/>
        <circle cx="62" cy="54.8" r="1.2" fill="#ffffff"/>
        <ellipse cx="28" cy="64" rx="6" ry="3.6" fill="#ffb3d1" opacity="0.8"/>
        <ellipse cx="72" cy="64" rx="6" ry="3.6" fill="#ffb3d1" opacity="0.8"/>
        <ellipse cx="50" cy="63" rx="10" ry="7" fill="#ffffff"/>
        <ellipse cx="50" cy="61" rx="3.2" ry="2.2" fill="#6b4c57"/>
        <path d="M46 65 Q50 69 54 65" fill="none" stroke="#6b4c57" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`
    }
  };

  window.KAWAII_MASCOTS = MASCOTS;

  // 各ゲームページに自動で応援マスコットを配置（TOPページ以外）
  function mountBuddy() {
    const buddyKey = document.body.dataset.mascot;
    if (!buddyKey || !MASCOTS[buddyKey]) return;

    const m = MASCOTS[buddyKey];
    const wrap = document.createElement('div');
    wrap.className = 'kawaii-buddy';
    wrap.innerHTML = `
      <div class="kawaii-bubble" id="kawaii-bubble">${m.lines[0]}</div>
      <button type="button" class="kawaii-mascot-btn" id="kawaii-mascot-btn" title="${m.name}をタップ！">
        ${m.svg}
      </button>
    `;
    document.body.appendChild(wrap);

    const bubble = wrap.querySelector('#kawaii-bubble');
    const btn = wrap.querySelector('#kawaii-mascot-btn');
    let hideTimer = null;
    let lineIdx = 0;

    function speak(customText) {
      bubble.textContent = customText || m.lines[lineIdx % m.lines.length];
      lineIdx++;
      bubble.classList.add('show');
      btn.classList.remove('hop');
      void btn.offsetWidth;
      btn.classList.add('hop');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => bubble.classList.remove('show'), 2600);
    }

    btn.addEventListener('click', () => speak());
    setTimeout(() => speak(m.lines[0]), 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountBuddy);
  } else {
    mountBuddy();
  }
})();
