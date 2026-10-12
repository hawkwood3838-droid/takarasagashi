// 注文フォーム：入力 → 確認 → Stripeの支払い画面へ
(function () {
  const K = window.KIT;
  const $ = id => document.getElementById(id);
  const form = $('order-form');
  const confirmBox = $('confirm');
  const STORE = 'kit-order-draft';
  const HIRA = /^[ぁ-ゖー]+$/;
  const KANA = /^[ぁ-ゖァ-ヺー]+$/;
  const labelOf = key => (K.SPOTS.find(s => s.key === key) || {}).label || key;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // ── お話 ──
  K.STORIES.forEach(s => {
    const open = K.inSeason(s.occasions);
    const soon = (K.SEASONS[s.occasions[0]] || {}).soon || '';
    const el = document.createElement('label');
    el.className = 'story-opt';
    el.innerHTML = `<input type="radio" name="story" value="${esc(s.key)}"${open ? '' : ' disabled'}>`
      + `<span><img src="img/stories/${esc(s.key)}.webp" alt="" loading="lazy"><b>${K.rubyOf(s)}</b>`
      + `<small>${open ? esc(s.host) : esc(soon) + '販売'}</small></span>`;
    $('story-list').appendChild(el);
  });
  const story = () => (form.querySelector('input[name="story"]:checked') || {}).value || '';
  const occasion = () => (form.querySelector('input[name="occasion"]:checked') || {}).value || '';

  // ── いつ遊ぶか（お話で選べるものが変わる） ──
  function refreshOccasions() {
    const st = K.storyOf(story());
    const prev = occasion();
    const list = st ? st.occasions : ['birthday', 'everyday'];
    $('occasion-list').innerHTML = list.map(o =>
      `<label><input type="radio" name="occasion" value="${o}"><span>${esc(K.OCCASIONS[o].label)}</span></label>`).join('');
    const keep = form.querySelector(`input[name="occasion"][value="${prev}"]`);
    const pick = keep || (list.length === 1 ? form.querySelector('input[name="occasion"]') : null);
    if (pick) pick.checked = true;
    refreshOccasionNote();
  }
  function refreshOccasionNote() {
    const o = occasion();
    $('occasion-hint').textContent = o ? K.OCCASIONS[o].note : 'おたんじょうび用は、手紙にお祝いの言葉が入ります。';
    refreshBirthday();
  }

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
    rows.forEach((r, i) => { r.querySelector('.name-del').hidden = rows.length === 1; r.dataset.n = i + 1; });
    $('add-name').hidden = rows.length >= K.NAMES_MAX;
    $('age-multi').hidden = rows.length < 2;
    refreshBirthday();
  }
  $('add-name').addEventListener('click', () => { nameRow().querySelector('.kid-name').focus(); });

  // ── 年齢 ──
  $('age-list').innerHTML = K.AGES.map(a => `<label><input type="radio" name="age" value="${a}"><span>${a}さい</span></label>`).join('');
  for (let a = 1; a <= 15; a++) $('bday-age').insertAdjacentHTML('beforeend', `<option value="${a}">${a}さい</option>`);
  const age = () => Number((form.querySelector('input[name="age"]:checked') || {}).value || 0);
  const need = () => (age() && age() <= K.LITTLE_AGE ? 4 : 5);
  // おたんじょうびで2人以上のときだけ、おたんじょうびの子の年齢をたずねる（1人なら年齢と同じ）
  function refreshBirthday() {
    const multi = document.querySelectorAll('.name-row').length > 1;
    $('bday-note').hidden = !(occasion() === 'birthday' && multi);
    $('bday-age-box').hidden = !(occasion() === 'birthday' && multi);
    if (age() && !$('bday-age').dataset.touched) $('bday-age').value = String(age());
  }
  $('bday-age').addEventListener('change', () => { $('bday-age').dataset.touched = '1'; });

  // ── 隠し場所 ──
  function spotItem(s, type, name) {
    const wrap = document.createElement('label');
    wrap.className = 'spot' + (type === 'radio' ? ' treasure-spot' : '');
    wrap.innerHTML = `<input type="${type}" name="${name}" value="${s.key}"><span><b>${s.label}</b><small>${s.tip}</small></span>`;
    return wrap;
  }
  K.SPOTS.forEach(s => {
    $('treasure-list').appendChild(spotItem(s, 'radio', 'treasure'));
    $('card-list').appendChild(spotItem(s, 'checkbox', 'cards'));
  });
  const treasure = () => (form.querySelector('input[name="treasure"]:checked') || {}).value || '';
  const cards = () => Array.from(form.querySelectorAll('input[name="cards"]:checked')).map(i => i.value);

  // プレゼントの場所はカードの場所に選べない。必要な数を選んだら残りは選べない（3〜4さいは4つ、5さい以上は5つ）
  function refreshSpots() {
    const t = treasure();
    const n = need();
    form.querySelectorAll('input[name="cards"]').forEach(i => { if (i.value === t && i.checked) i.checked = false; });
    let now = cards();
    if (now.length > n) {  // 年齢を下げて、数が多くなったときは後ろから外す
      Array.from(form.querySelectorAll('input[name="cards"]:checked')).slice(n).forEach(i => { i.checked = false; });
      now = cards();
    }
    form.querySelectorAll('input[name="cards"]').forEach(i => { i.disabled = i.value === t || (!i.checked && now.length >= n); });
    $('need-n').textContent = n;
    const left = n - now.length;
    const c = $('card-counter');
    c.textContent = left > 0 ? `あと${left}つ選んでください` : `${n}つ選びました`;
    c.classList.toggle('done', left === 0);
  }

  form.addEventListener('change', e => {
    const nm = e.target.name;
    if (nm === 'story') refreshOccasions();
    if (nm === 'occasion') refreshOccasionNote();
    if (nm === 'age') { refreshBirthday(); refreshSpots(); }
    if (nm === 'treasure' || nm === 'cards') refreshSpots();
  });
  $('likes').addEventListener('blur', () => { $('likes').value = $('likes').value.trim().replace(/\s/g, ''); });

  // ── 入力のチェック ──
  function showErr(id, msg, input) {
    const el = $(id);
    el.textContent = msg || '';
    el.hidden = !msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function collect() {
    const ns = names();
    const multi = ns.length > 1;
    return {
      story: story(),
      occasion: occasion(),
      names: ns,
      age: age(),
      birthday_age: occasion() === 'birthday' ? (multi ? Number($('bday-age').value) : age()) : age(),
      likes: $('likes').value.trim().replace(/\s/g, ''),
      treasure: treasure(),
      card_spots: cards(),
    };
  }

  function validate(o) {
    let first = null;
    const bad = (id, msg, input) => { showErr(id, msg, input); if (msg && !first) first = input || $(id); };
    bad('story-err', o.story ? '' : 'お話を選んでください', form.querySelector('input[name="story"]:not(:disabled)'));
    bad('occasion-err', o.occasion ? '' : 'いつ遊ぶかを選んでください', form.querySelector('input[name="occasion"]'));
    const nameInputs = Array.from(document.querySelectorAll('.kid-name'));
    let nameMsg = '', nameInput = null;
    o.names.forEach((n, i) => {
      const msg = !n.name ? 'お子さまの名前を入れてください'
        : !HIRA.test(n.name) ? '名前は、ひらがなで入れてください（漢字は使えません）'
        : n.name.length > K.NAME_MAX ? `名前は${K.NAME_MAX}文字までです` : '';
      nameInputs[i].setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !nameMsg) { nameMsg = (o.names.length > 1 ? `${i + 1}人目：` : '') + msg; nameInput = nameInputs[i]; }
    });
    bad('name-err', nameMsg, nameInput);
    bad('age-err', o.age ? '' : '年齢を選んでください', form.querySelector('input[name="age"]'));
    bad('likes-err', !o.likes ? '' : !KANA.test(o.likes) ? '好きなものは、ひらがな・カタカナで入れてください'
      : o.likes.length > K.LIKES_MAX ? `好きなものは${K.LIKES_MAX}文字までです` : '', $('likes'));
    bad('treasure-err', o.treasure ? '' : 'プレゼントを隠す場所を選んでください', form.querySelector('input[name="treasure"]'));
    const n = need();
    bad('cards-err', o.card_spots.length === n ? '' : `カードを隠す場所を${n}つ選んでください（いま${o.card_spots.length}つ）`, form.querySelector('input[name="cards"]:not(:disabled)'));
    bad('agree-err', $('agree').checked ? '' : '返品・キャンセルについて確認のうえ、チェックを入れてください', $('agree'));
    return first;
  }

  // 一度「確認へ進む」を押したあとは、直したそばからエラー表示を消す
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
    const first = validate(o);
    if (first) { first.focus(); return; }
    current = o;
    try { sessionStorage.setItem(STORE, JSON.stringify(o)); } catch (err) { /* 保存できなくても続ける */ }
    const st = K.storyOf(o.story);
    const who = o.names.map(n => n.name + n.suffix).join('、');
    const rows = [
      ['お話', st.name],
      ['いつ遊ぶか', K.OCCASIONS[o.occasion].label],
      ['お子さまの名前', who],
      ['年齢', o.age + 'さい' + (o.names.length > 1 ? '（むずかしさ）' : '') + (o.age <= K.LITTLE_AGE ? '・字を読まない版' : '')],
    ];
    if (o.occasion === 'birthday' && o.names.length > 1) rows.push(['おたんじょうび', `${o.names[0].name}${o.names[0].suffix}・${o.birthday_age}さい`]);
    rows.push(['好きなもの', o.likes || '（なし）'], ['プレゼントの場所', labelOf(o.treasure)], ['カードの場所', o.card_spots.map(labelOf).join('、')]);
    $('summary-order').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
    $('summary-story').textContent = st.name;
    form.hidden = true;
    confirmBox.hidden = false;
    $('step-input').removeAttribute('aria-current');
    $('step-confirm').setAttribute('aria-current', 'step');
    showErr('submit-err', '');
    window.scrollTo({ top: 0 });
    $('confirm-title').setAttribute('tabindex', '-1');
    $('confirm-title').focus();
  });

  $('back-btn').addEventListener('click', () => {
    confirmBox.hidden = true;
    form.hidden = false;
    $('step-confirm').removeAttribute('aria-current');
    $('step-input').setAttribute('aria-current', 'step');
    window.scrollTo({ top: 0 });
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

  // ── お知らせ（準備中／支払いを中断して戻ってきた） ──
  const notice = (cls, text) => { $('notice-area').innerHTML = `<p class="notice ${cls}">${text}</p>`; };
  if (!K.API_URL) {
    notice('notice-info', 'ただいま販売の準備中です。入力と確認まではお試しいただけます。');
    $('pay-btn').disabled = true;
  }

  function restore(o) {
    const s = form.querySelector(`input[name="story"][value="${o.story}"]:not(:disabled)`);
    if (s) s.checked = true;
    refreshOccasions();
    const oc = form.querySelector(`input[name="occasion"][value="${o.occasion}"]`);
    if (oc) oc.checked = true;
    $('name-rows').innerHTML = '';
    (o.names && o.names.length ? o.names : [{}]).slice(0, K.NAMES_MAX).forEach(n => nameRow(n));
    const a = form.querySelector(`input[name="age"][value="${o.age}"]`);
    if (a) a.checked = true;
    if (o.birthday_age) { $('bday-age').value = String(o.birthday_age); $('bday-age').dataset.touched = '1'; }
    $('likes').value = o.likes || '';
    const t = form.querySelector(`input[name="treasure"][value="${o.treasure}"]`);
    if (t) t.checked = true;
    refreshSpots();
    (o.card_spots || []).forEach(k => {
      const c = form.querySelector(`input[name="cards"][value="${k}"]`);
      if (c && !c.disabled) c.checked = true;
      refreshSpots();
    });
    refreshOccasionNote();
  }

  // はじめの状態：トップページで選んだお話（?story=）を選んでおく
  const params = new URLSearchParams(location.search);
  let saved = null;
  if (params.get('canceled')) {
    notice('notice-warn', 'お支払いは完了していません。内容を確かめて、もう一度お進みください。');
    try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch (err) { /* 何もしない */ }
  }
  if (saved) {
    restore(saved);
  } else {
    const s = form.querySelector(`input[name="story"][value="${params.get('story') || ''}"]:not(:disabled)`);
    if (s) s.checked = true;
    refreshOccasions();
    nameRow();
    refreshSpots();
  }
})();
