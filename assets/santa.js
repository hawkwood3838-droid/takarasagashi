// サンタからの手紙（santa.html）：入力 → 確認 → Stripeの支払い画面へ（2026-10-27）
(function () {
  const K = window.KIT;
  const A = K.ADVENT;
  const $ = id => document.getElementById(id);
  const form = $('santa-form');
  const confirmBox = $('confirm');
  const STORE = 'santa-order-draft';
  const HIRA = /^[ぁ-ゖー]+$/;
  const KANA = /^[ぁ-ゖァ-ヺー]+$/;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const labelOf = key => (K.SPOTS.find(s => s.key === key) || {}).label || key;
  const first = 24 - A.LETTERS + 1;

  // 通数・始まる日・値段（設定から）
  document.querySelectorAll('.js-letters').forEach(el => { el.textContent = A.LETTERS; });
  document.querySelectorAll('.js-first').forEach(el => { el.textContent = first; });
  document.querySelectorAll('.js-price').forEach(el => { el.textContent = A.PRICE.toLocaleString('ja-JP'); });

  // ── 名前（1〜4人） ──
  function nameRow(v = {}) {
    const row = document.createElement('div');
    row.className = 'name-row';
    row.innerHTML = `<input type="text" class="kid-name" inputmode="kana" autocomplete="off" placeholder="ゆうき" maxlength="16" aria-label="お子さまの名前">`
      + `<div class="seg seg-sm" role="radiogroup" aria-label="呼び方">`
      + ['くん', 'ちゃん', ''].map(s => `<label><input type="radio" value="${s}"><span>${s || 'なし'}</span></label>`).join('')
      + `</div><button type="button" class="name-del" aria-label="この名前を消す">×</button>`;
    const uid = 'suf' + Math.random().toString(36).slice(2, 8);
    row.querySelectorAll('input[type="radio"]').forEach(r => { r.name = uid; });
    row.querySelector('.kid-name').value = v.name || '';
    (row.querySelector(`input[type="radio"][value="${v.suffix === undefined ? 'くん' : v.suffix}"]`) || row.querySelector('input[type="radio"]')).checked = true;
    row.querySelector('.kid-name').addEventListener('blur', e => { e.target.value = toHira(e.target.value.trim().replace(/\s/g, '')); });
    row.querySelector('.name-del').addEventListener('click', () => { row.remove(); refreshNames(); });
    $('name-rows').appendChild(row);
    refreshNames();
    return row;
  }
  const names = () => Array.from(document.querySelectorAll('.name-row')).map(r => ({
    name: toHira(r.querySelector('.kid-name').value.trim().replace(/\s/g, '')),
    suffix: (r.querySelector('input[type="radio"]:checked') || {}).value || '',
  }));
  function refreshNames() {
    const rows = document.querySelectorAll('.name-row');
    rows.forEach(r => { r.querySelector('.name-del').hidden = rows.length === 1; });
    $('add-name').hidden = rows.length >= K.NAMES_MAX;
    $('age-multi').hidden = rows.length < 2;
  }
  $('add-name').addEventListener('click', () => { nameRow().querySelector('.kid-name').focus(); });

  // ── 年齢とむずかしさ（3〜8さい と 9〜12さい は またがない。4さい以下の むずかしさは 字を読まない絵のなぞ） ──
  $('age-list').innerHTML = A.AGES.map(a => `<label><input type="radio" name="age" value="${a}"><span>${a}さい</span></label>`).join('');
  $('level-list').innerHTML = K.LEVELS.map(l => `<label><input type="radio" name="level" value="${l.key}"${l.key === 'normal' ? ' checked' : ''}><span>${l.label}</span></label>`).join('');
  const age = () => Number((form.querySelector('input[name="age"]:checked') || {}).value || 0);
  const levelOf = key => K.LEVELS.find(l => l.key === key) || K.LEVELS[1];
  const level = () => (form.querySelector('input[name="level"]:checked') || {}).value || 'normal';
  const OLDER = K.OLDER_AGE || 9;  // 9〜12さい（なぞときチャレンジ）
  const band = a => A.AGES.filter(x => (x >= OLDER) === (a >= OLDER));
  const puzzleAgeOf = (a, lv) => (a ? Math.min(Math.max(a + levelOf(lv).shift, Math.min(...band(a))), Math.max(...band(a))) : 0);
  function refreshLevel() {
    const a = age();
    form.querySelectorAll('input[name="level"]').forEach(i => {
      i.disabled = !!a && i.value !== 'normal' && puzzleAgeOf(a, i.value) === a;
      if (i.disabled && i.checked) form.querySelector('input[name="level"][value="normal"]').checked = true;
    });
    $('level-note').textContent = !a ? 'やさしめは1さい下、むずかしめは1さい上の暗号になります。'
      : `${levelOf(level()).label}：${puzzleAgeOf(a, level())}さい向けの${puzzleAgeOf(a, level()) <= (K.LITTLE_AGE || 4) ? '絵のなぞ（字を読まない版）' : '暗号'}になります。`;
  }
  refreshLevel();

  // ── プレゼントの場所 ──
  K.SPOTS.forEach(s => {
    const wrap = document.createElement('label');
    wrap.className = 'spot treasure-spot';
    wrap.innerHTML = `<input type="radio" name="treasure" value="${esc(s.key)}"><span><b>${esc(s.label)}</b><small>この近くに置く</small></span>`;
    $('treasure-list').appendChild(wrap);
  });
  const treasure = () => (form.querySelector('input[name="treasure"]:checked') || {}).value || '';

  form.addEventListener('change', e => { if (e.target.name === 'age' || e.target.name === 'level') refreshLevel(); });
  $('likes').addEventListener('blur', () => { $('likes').value = $('likes').value.trim().replace(/\s/g, ''); });

  // ── 入力のチェック ──
  function showErr(id, msg, input) {
    const el = $(id);
    el.textContent = msg || '';
    el.hidden = !msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  const collect = () => ({ product: 'advent', names: names(), age: age(), level: level(), likes: $('likes').value.trim().replace(/\s/g, ''), treasure: treasure() });
  function validate(o) {
    let firstBad = null;
    const bad = (id, msg, input) => { showErr(id, msg, input); if (msg && !firstBad) firstBad = input || $(id); };
    const inputs = Array.from(document.querySelectorAll('.kid-name'));
    let nameMsg = '', nameInput = null;
    o.names.forEach((n, i) => {
      const msg = !n.name ? 'お子さまの名前を入れてください'
        : !HIRA.test(n.name) ? '名前は、ひらがなで入れてください（漢字は使えません）'
        : n.name.length > K.NAME_MAX ? `名前は${K.NAME_MAX}文字までです` : '';
      inputs[i].setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !nameMsg) { nameMsg = (o.names.length > 1 ? `${i + 1}人目：` : '') + msg; nameInput = inputs[i]; }
    });
    bad('name-err', nameMsg, nameInput);
    bad('age-err', o.age ? '' : '年齢を選んでください', form.querySelector('input[name="age"]'));
    bad('likes-err', !o.likes ? '' : !KANA.test(o.likes) ? '好きなものは、ひらがな・カタカナで入れてください'
      : o.likes.length > K.LIKES_MAX ? `好きなものは${K.LIKES_MAX}文字までです` : '', $('likes'));
    bad('treasure-err', o.treasure ? '' : 'プレゼントを置く場所を選んでください', form.querySelector('input[name="treasure"]'));
    bad('agree-err', $('agree').checked ? '' : '返品・キャンセルについて確認のうえ、チェックを入れてください', $('agree'));
    return firstBad;
  }
  let tried = false;
  const recheck = () => { if (tried) validate(collect()); };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);

  // ── 入力 → 確認 ──
  let current = null;
  form.addEventListener('submit', e => {
    e.preventDefault();
    tried = true;
    const o = collect();
    document.querySelectorAll('.kid-name').forEach((el, i) => { el.value = o.names[i].name; });
    const bad = validate(o);
    if (bad) { bad.focus(); return; }
    current = o;
    try { sessionStorage.setItem(STORE, JSON.stringify(o)); } catch (err) { /* 保存できなくても続ける */ }
    const rows = [
      ['商品', `サンタからの${A.LETTERS}通の手紙（12月${first}日〜24日）`],
      ['お子さまの名前', o.names.map(n => n.name + n.suffix).join('、')],
      ['年齢', o.age + 'さい' + (o.names.length > 1 ? '（むずかしさ）' : '') + (o.level !== 'normal' ? '・' + levelOf(o.level).label : '')],
      ['好きなもの', o.likes || '（なし）'],
      ['プレゼントを置く場所', labelOf(o.treasure) + 'の近く'],
    ];
    $('summary-order').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
    form.hidden = true;
    confirmBox.hidden = false;
    $('step-input').removeAttribute('aria-current');
    $('step-confirm').setAttribute('aria-current', 'step');
    showErr('submit-err', '');
    $('santa-order').scrollIntoView();
    $('confirm-title').setAttribute('tabindex', '-1');
    $('confirm-title').focus();
  });
  $('back-btn').addEventListener('click', () => {
    confirmBox.hidden = true;
    form.hidden = false;
    $('step-confirm').removeAttribute('aria-current');
    $('step-input').setAttribute('aria-current', 'step');
    $('santa-order').scrollIntoView();
  });

  // ── 確認 → 支払い画面 ──
  $('pay-btn').addEventListener('click', async () => {
    if (!current) return;
    const btn = $('pay-btn');
    btn.disabled = true;
    const label = btn.innerHTML;
    btn.textContent = '支払い画面を用意しています…';
    showErr('submit-err', '');
    try {
      const res = await fetch(K.API_URL, { method: 'POST', body: JSON.stringify({ action: 'order', order: current }) });
      const data = await res.json();
      if (!data.ok || !data.url) throw new Error(data.error || '支払い画面を用意できませんでした');
      window.location.href = data.url;
    } catch (err) {
      showErr('submit-err', (err && err.message && !/fetch|network/i.test(err.message) ? err.message : '通信がうまくいきませんでした。電波のよい所で、もう一度お試しください。'));
      btn.disabled = false;
      btn.innerHTML = label;
    }
  });

  // ── お知らせ（売る期間の外・準備中・支払いを中断して戻ってきた） ──
  const notice = (cls, text) => { $('notice-area').innerHTML = `<p class="notice ${cls}">${esc(text)}</p>`; };
  const now = new Date();
  const md = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const open = md >= A.SALE_FROM && md <= A.SALE_UNTIL;
  const mdText = s => `${Number(s.slice(0, 2))}月${Number(s.slice(3))}日`;
  if (!K.API_URL) {
    notice('notice-info', 'ただいま販売の準備中です。入力と確認まではお試しいただけます。');
    $('pay-btn').disabled = true;
  } else if (!open) {
    notice('notice-info', `${mdText(A.SALE_FROM)}から${mdText(A.SALE_UNTIL)}まで販売します。入力と確認まではお試しいただけます。`);
    $('pay-btn').disabled = true;
  }
  const params = new URLSearchParams(location.search);
  let saved = null;
  if (params.get('canceled')) {
    notice('notice-warn', 'お支払いは完了していません。内容を確かめて、もう一度お進みください。');
    try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch (err) { /* 何もしない */ }
  }
  if (saved) {
    (saved.names && saved.names.length ? saved.names : [{}]).slice(0, K.NAMES_MAX).forEach(n => nameRow(n));
    const a = form.querySelector(`input[name="age"][value="${saved.age}"]`);
    if (a) a.checked = true;
    const lv = form.querySelector(`input[name="level"][value="${saved.level || 'normal'}"]`);
    if (lv) lv.checked = true;
    refreshLevel();
    $('likes').value = saved.likes || '';
    const t = form.querySelector(`input[name="treasure"][value="${saved.treasure}"]`);
    if (t) t.checked = true;
    $('santa-order').scrollIntoView();
  } else {
    nameRow();
  }
})();
