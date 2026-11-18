// うちの かぞく かるた：注文ページ（入力 → 確認 → Stripe の支払い画面へ）
(function () {
  const K = window.KIT, G = window.KARUTA;
  const $ = id => document.getElementById(id);
  const STORE = 'karuta-order-draft';
  const KANA = /^[ぁ-ゖァ-ヺー]+$/;
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const flat = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // 家族の行
  const rows = $('member-rows');
  function addMember(name, pet) {
    if (rows.children.length >= G.MEMBERS_MAX) return;
    const div = document.createElement('div');
    div.className = 'member-row';
    div.innerHTML = '<input type="text" class="m-name" inputmode="kana" autocomplete="off" maxlength="20" placeholder="はると" aria-label="呼び名">'
      + '<label><input type="checkbox" class="m-pet">ペット</label>'
      + '<button class="btn btn-ghost btn-sm del" type="button" aria-label="この人を消す">×</button>';
    div.querySelector('.m-name').value = name || '';
    div.querySelector('.m-pet').checked = !!pet;
    div.querySelector('.del').onclick = () => { if (rows.children.length > G.MEMBERS_MIN) { div.remove(); refresh(); } };
    div.querySelector('.m-name').oninput = refreshHonoree;
    div.querySelector('.m-pet').onchange = refreshHonoree;
    rows.appendChild(div);
    refresh();
  }
  function refresh() {
    $('add-member').hidden = rows.children.length >= G.MEMBERS_MAX;
    refreshHonoree();
  }
  $('add-member').onclick = () => addMember('', false);

  // 思い出の行（10こ）
  const mrows = $('memory-rows');
  const ex = ['パパの たまごやき', 'うみで かいがらを ひろった', 'じいじの ラジオたいそう', 'みんなで どうぶつえん', 'コロの さんぽ'];
  for (let i = 0; i < G.MEMORIES_MAX; i++) {
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'mem'; inp.maxLength = 40; inp.autocomplete = 'off';
    inp.placeholder = (i < ex.length ? '例：' + ex[i] : '') ;
    inp.setAttribute('aria-label', '思い出 ' + (i + 1) + 'こ目');
    mrows.appendChild(inp);
  }

  // 年齢・お祝い
  G.AGES.forEach(a => {
    const o = document.createElement('option');
    o.value = typeof a === 'object' ? a.v : a; o.textContent = typeof a === 'object' ? a.label : a + 'さい';
    $('age').appendChild(o);
  });
  $('age').insertAdjacentHTML('afterbegin', '<option value="" selected>えらんでください</option>');
  G.OCCASIONS.forEach(x => { $('occasion').insertAdjacentHTML('beforeend', '<option value="' + x.key + '">' + esc(x.label) + '</option>'); });
  document.querySelectorAll('input[name="edition"]').forEach(r => { r.onchange = () => { $('oiwai-box').hidden = edition() !== 'oiwai'; refreshHonoree(); }; });
  const edition = () => document.querySelector('input[name="edition"]:checked').value;
  function refreshHonoree() {
    const sel = $('honoree'), keep = sel.value;
    sel.innerHTML = '';
    [...rows.querySelectorAll('.member-row')].forEach(r => {
      const n = r.querySelector('.m-name').value.replace(/[\s　]+/g, '');
      if (!n) return;
      // 値は呼び名（行を消しても、選んだ人がずれないように。番号は collect で決める）
      if (!r.querySelector('.m-pet').checked) sel.insertAdjacentHTML('beforeend', '<option value="' + esc(n) + '">' + esc(n) + '</option>');
    });
    if ([...sel.options].some(o => o.value === keep)) sel.value = keep;
  }

  // 同意
  G.CONSENTS.forEach(c => {
    $('consents').insertAdjacentHTML('beforeend', '<label class="agree"><input type="checkbox" class="consent" data-key="' + c.key + '"><span>' + esc(c.text) + '</span></label>');
  });

  function collect() {
    const members = [...rows.querySelectorAll('.member-row')].map(r => ({ name: r.querySelector('.m-name').value.replace(/[\s　]+/g, ''), pet: r.querySelector('.m-pet').checked }))
      .filter(m => m.name);
    const memories = [...mrows.querySelectorAll('.mem')].map(i => i.value.replace(/[\s　]+/g, ' ').trim()).filter(x => x);
    const consent = {};
    document.querySelectorAll('.consent').forEach(c => { consent[c.dataset.key] = c.checked; });
    const o = { product: 'karuta', members, memories, youngest_age: parseInt($('age').value, 10), edition: edition(), consent };
    if (o.edition === 'oiwai') { const hn = $('honoree').value; o.honoree = members.findIndex(m => m.name === hn && !m.pet); o.occasion = $('occasion').value; }
    return o;
  }

  function showErr(id, msg) { const e = $(id); e.textContent = msg || ''; e.hidden = !msg; }
  function validate(o) {
    let ok = true;
    const set = (id, msg) => { showErr(id, msg); if (msg) ok = false; };
    const names = o.members.map(m => flat(m.name));
    set('members-err', o.members.length < G.MEMBERS_MIN ? `呼び名を${G.MEMBERS_MIN}人以上 入れてください`
      : o.members.some(m => !KANA.test(m.name) || m.name.length > G.MEMBER_LEN) ? `呼び名は ひらがな・カタカナ${G.MEMBER_LEN}文字までで入れてください`
      : names.some((n, i) => names.indexOf(n) !== i) ? '同じ呼び名が2回入っています' : '');
    set('mem-err', o.memories.length < G.MEMORIES_MIN ? `思い出・すきなものを${G.MEMORIES_MIN}こ以上 入れてください`
      : o.memories.some(x => x.length > G.MEMORY_LEN) ? `思い出は1こ${G.MEMORY_LEN}文字までです`
      : o.memories.some(x => /https?:|www\.|@|[0-9０-９]{4,}/i.test(x)) ? 'URL・メールアドレス・長い数字は入れられません' : '');
    set('age-err', !(o.youngest_age >= 1) ? 'いちばん小さい子の年齢を選んでください' : '');
    set('ed-err', o.edition === 'oiwai' && !(o.honoree >= 0) ? 'お祝いする人を選んでください（ペット以外）' : '');
    set('consent-err', G.CONSENTS.some(c => !o.consent[c.key]) ? '5つの確認に ぜんぶチェックを入れてください' : '');
    return ok;
  }

  let current = null;
  $('order-form').onsubmit = e => {
    e.preventDefault();
    const o = collect();
    if (!validate(o)) { const f = document.querySelector('.err:not([hidden])'); if (f) f.scrollIntoView({ block: 'center' }); return; }
    current = o;
    try { sessionStorage.setItem(STORE, JSON.stringify(o)); } catch (err) { /* 保存できなくても続ける */ }
    const dl = $('summary-order');
    const ageLabel = $('age').selectedOptions[0].textContent;
    dl.innerHTML = '<dt>家族</dt><dd>' + o.members.map(m => esc(m.name) + (m.pet ? '（ペット）' : '')).join('・') + '</dd>'
      + '<dt>思い出</dt><dd>' + o.memories.map(esc).join('<br>') + '</dd>'
      + '<dt>小さい子</dt><dd>' + esc(ageLabel) + (o.youngest_age <= G.LITTLE_AGE ? '（ひらがなだけ・短め）' : '') + '</dd>';
    const edText = o.edition === 'oiwai' ? 'お祝い版（' + esc(o.members[o.honoree].name) + 'の ' + esc($('occasion').selectedOptions[0].textContent.replace(/（.*）$/, '')) + '）' : 'ふつう';
    $('summary-ed').innerHTML = edText;
    $('summary-price').textContent = G.yen(G.PRICE);
    $('pay-price').textContent = G.yen(G.PRICE);
    $('order-form').hidden = true; $('confirm').hidden = false;
    $('step-input').removeAttribute('aria-current'); $('step-confirm').setAttribute('aria-current', 'step');
    $('pay-btn').disabled = !canPay();
    if (!canPay()) showErr('submit-err', 'ただいま販売の準備中です。');
    window.scrollTo(0, 0);
  };
  $('back-btn').onclick = () => {
    $('confirm').hidden = true; $('order-form').hidden = false;
    $('step-confirm').removeAttribute('aria-current'); $('step-input').setAttribute('aria-current', 'step');
  };
  const canPay = () => !!K.API_URL && G.isOpen();
  $('pay-btn').onclick = async () => {
    if (!current || !canPay()) return;
    $('pay-btn').disabled = true; showErr('submit-err', '');
    try {
      const res = await fetch(K.API_URL, { method: 'POST', body: JSON.stringify({ action: 'order', order: current }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'うまく受け付けられませんでした');
      window.location.href = data.url;
    } catch (err) {
      showErr('submit-err', err.message || 'うまく受け付けられませんでした。時間をおいてもう一度お試しください。');
      $('pay-btn').disabled = false;
    }
  };

  // はじめの表示（戻ってきたときは前の入力を出す）
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch (err) { /* 何もしない */ }
  if (saved && Array.isArray(saved.members)) {
    saved.members.forEach(m => addMember(m.name, m.pet));
    (saved.memories || []).forEach((x, i) => { if (mrows.children[i]) mrows.children[i].value = x; });
    if (saved.youngest_age) $('age').value = String(saved.youngest_age);
    if (saved.edition === 'oiwai') { document.querySelector('input[value="oiwai"]').checked = true; $('oiwai-box').hidden = false; refreshHonoree(); if (saved.members[saved.honoree]) $('honoree').value = saved.members[saved.honoree].name; $('occasion').value = saved.occasion || 'kanreki'; }
  }
  while (rows.children.length < 3) addMember('', false);
  if (new URLSearchParams(location.search).get('canceled') === '1') {
    $('notice-area').innerHTML = '<p class="notice notice-warn">お支払いは まだ済んでいません。内容を確かめて、もう一度お進みください。</p>';
  }
  if (!G.isOpen()) $('notice-area').insertAdjacentHTML('beforeend', '<p class="notice notice-info">ただいま販売の準備中です（入力と確認は ためせます）。</p>');
})();
