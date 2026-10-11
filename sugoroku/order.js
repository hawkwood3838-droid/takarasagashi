// なりたい自分すごろく 注文フォーム：入力 → 確認 → Stripeの支払い画面へ
(function () {
  const K = window.KIT;
  const G = window.SUGO;
  const $ = id => document.getElementById(id);
  const form = $('order-form');
  const confirmBox = $('confirm');
  const STORE = 'sugo-order-draft';
  const KANA = /^[ぁ-ゖァ-ヺー]+$/;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const squash = s => String(s || '').replace(/\s/g, '');
  const oneLine = s => String(s || '').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim();
  const honLabel = h => h || 'なし';
  const ageLabel = a => (a >= 16 ? '16さい以上・おとな' : a + 'さい');
  const diffOf = (plan, age) => (plan === 'yasashii' ? 'やさしい' : age >= G.HONKAKU_AGE ? 'ほんかく' : 'やさしい');
  const ageOptions = '<option value="">えらんでください</option>'
    + Array.from({ length: 13 }, (_, i) => i + 3).map(a => `<option value="${a}">${a}さい</option>`).join('')
    + '<option value="16">16さい以上・おとな</option>';

  // ── 種類 ──
  $('plan-list').innerHTML = G.PLANS.map(p => `<label class="plan-opt"><input type="radio" name="plan" value="${p.key}"${p.price ? '' : ' disabled'}>`
    + `<span><b>${esc(p.name)}</b><span class="yen">${p.price ? G.yen(p.price) + '円' : '準備中'}</span><small>${esc(p.note)}</small></span></label>`).join('');
  const plan = () => (form.querySelector('input[name="plan"]:checked') || {}).value || '';
  const isFam = () => plan() === 'family';

  // ── 主役（1人） ──
  $('me-hon').innerHTML = G.HONORIFICS.map((h, i) => `<label><input type="radio" name="me-hon" value="${h}"${i === 0 ? ' checked' : ''}><span>${honLabel(h)}</span></label>`).join('');
  $('me-age').innerHTML = ageOptions;
  $('job-list').innerHTML = G.JOBS.map(j => `<label class="job-opt" style="--jc:${j.color}"><input type="radio" name="job" value="${j.key}"><span>${esc(j.name)}</span></label>`).join('');

  // ── 家族 ──
  let memberSeq = 0;
  function memberRow(v = {}) {
    const n = ++memberSeq;
    const row = document.createElement('div');
    row.className = 'member';
    row.innerHTML = `<div class="member-head"><span class="mno"></span><button type="button" class="name-del" aria-label="この人を消す">×</button></div>
      <div class="grid">
        <div><label class="small" for="m${n}-name">名前</label><div class="name-row" style="margin:0"><input type="text" id="m${n}-name" class="m-name" inputmode="kana" autocomplete="off" placeholder="ゆうき" maxlength="16">
          <div class="seg seg-sm" role="radiogroup" aria-label="呼び方">${G.HONORIFICS.map(h => `<label><input type="radio" name="m${n}-hon" value="${h}"><span>${honLabel(h)}</span></label>`).join('')}</div></div></div>
        <div><label class="small" for="m${n}-age">年齢</label><select id="m${n}-age" class="m-age">${ageOptions}</select></div>
        <div><label class="small" for="m${n}-job">なりたい職業</label><select id="m${n}-job" class="m-job"><option value="">えらんでください</option>${G.JOBS.map(j => `<option value="${j.key}">${esc(j.name)}</option>`).join('')}</select></div>
        <div><label class="small" for="m${n}-likes">好きなもの（なくてもOK・「、」で区切って3つまで）</label><input type="text" id="m${n}-likes" class="m-likes" autocomplete="off" placeholder="サッカー、ねこ" maxlength="40"></div>
      </div>`;
    row.querySelector('.m-name').value = v.name || '';
    const hon = v.honorific === undefined ? 'くん' : v.honorific;
    (row.querySelector(`input[type="radio"][value="${hon}"]`) || row.querySelector('input[type="radio"]')).checked = true;
    if (v.age) row.querySelector('.m-age').value = String(v.age);
    if (v.job) row.querySelector('.m-job').value = v.job;
    row.querySelector('.m-likes').value = (v.likes || []).join('、');
    row.querySelector('.m-name').addEventListener('blur', e => { e.target.value = squash(e.target.value); });
    row.querySelector('.name-del').addEventListener('click', () => { row.remove(); refreshMembers(); });
    $('member-rows').appendChild(row);
    refreshMembers();
    return row;
  }
  function refreshMembers() {
    const rows = document.querySelectorAll('.member');
    rows.forEach((r, i) => { r.querySelector('.mno').textContent = (i + 1) + '人目'; r.querySelector('.name-del').hidden = rows.length <= G.MEMBERS_MIN; });
    $('add-member').hidden = rows.length >= G.MEMBERS_MAX;
  }
  $('add-member').addEventListener('click', () => { memberRow().querySelector('.m-name').focus(); });
  const splitLikes = s => String(s || '').split(/[、,，・\s]+/).map(x => x.trim()).filter(x => x);

  // ── 種類で 入力欄を 切りかえ、番号を ふり直す ──
  function refreshPlan() {
    $('single-block').hidden = isFam();
    $('family-block').hidden = !isFam();
    if (isFam() && !document.querySelector('.member')) { memberRow(); memberRow({ honorific: '' }); }
    let n = 0;
    form.querySelectorAll('.field').forEach(f => {
      const q = f.querySelector('.q-num');
      if (q) q.textContent = f.closest('[hidden]') ? '' : ++n;
    });
    const p = plan();
    $('age-hint').textContent = p === 'deluxe'
      ? `遊ぶときの年齢です。デラックス版では、${G.HONKAKU_AGE}さいから 主役の人生シートが「ほんかく」（中学生向け）になります。`
      : '遊ぶときの年齢です。';
  }

  // ── 文字数 ──
  function refreshCount() {
    const n = oneLine($('message').value).length;
    $('msg-count').textContent = `${n} / ${G.MESSAGE_MAX}文字`;
    $('msg-count').classList.toggle('over', n > G.MESSAGE_MAX);
  }
  $('message').addEventListener('input', refreshCount);
  ['me-name', 'fam-name'].forEach(id => $(id).addEventListener('blur', e => { e.target.value = squash(e.target.value); }));
  form.querySelectorAll('.like').forEach(el => el.addEventListener('blur', () => { el.value = squash(el.value); }));

  // ── 集める・確かめる ──
  function collect() {
    const base = { product: 'sugoroku', plan: plan(), message: oneLine($('message').value), from: oneLine($('from').value), job_request: oneLine($('job-request').value) };
    if (isFam()) {
      return Object.assign(base, {
        family: squash($('fam-name').value),
        members: Array.from(document.querySelectorAll('.member')).map(r => ({
          name: squash(r.querySelector('.m-name').value),
          honorific: (r.querySelector('input[type="radio"]:checked') || {}).value || '',
          age: Number(r.querySelector('.m-age').value || 0),
          job: r.querySelector('.m-job').value,
          likes: splitLikes(r.querySelector('.m-likes').value),
        })),
      });
    }
    return Object.assign(base, {
      name: squash($('me-name').value),
      honorific: (form.querySelector('input[name="me-hon"]:checked') || {}).value || '',
      age: Number($('me-age').value || 0),
      job: (form.querySelector('input[name="job"]:checked') || {}).value || '',
      likes: Array.from(form.querySelectorAll('.like')).map(el => squash(el.value)).filter(x => x),
    });
  }

  function showErr(id, msg, input) {
    const el = $(id);
    el.textContent = msg || '';
    el.hidden = !msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  const nameMsg = (n, max) => (!n ? '名前を入れてください' : !KANA.test(n) ? '名前は、ひらがな・カタカナで入れてください（漢字は使えません）'
    : n.length > max ? `名前は${max}文字までです` : '');
  const likesMsg = likes => (likes.length > G.LIKES_MAX ? `好きなものは${G.LIKES_MAX}つまでです`
    : likes.some(l => !KANA.test(l)) ? '好きなものは、ひらがな・カタカナで入れてください'
    : likes.some(l => l.length > G.LIKE_MAX) ? `好きなものは1つ${G.LIKE_MAX}文字までです` : '');

  function validate(o) {
    let first = null;
    const bad = (id, msg, input) => { showErr(id, msg, input); if (msg && !first) first = input || $(id); };
    const p = G.planOf(o.plan);
    bad('plan-err', !p ? '種類を選んでください' : !p.price ? 'この種類は、まだ販売していません' : '', form.querySelector('input[name="plan"]:not(:disabled)'));
    if (o.plan === 'family') {
      ['name-err', 'age-err', 'job-err', 'likes-err'].forEach(id => showErr(id, ''));
      const fam = !o.family ? 'みょうじを入れてください' : !KANA.test(o.family) ? 'みょうじは、ひらがな・カタカナで入れてください'
        : o.family.length > G.FAMILY_MAX ? `みょうじは${G.FAMILY_MAX}文字までです` : '';
      bad('fam-err', fam, $('fam-name'));
      const rows = Array.from(document.querySelectorAll('.member'));
      let msg = '', input = null;
      if (o.members.length < G.MEMBERS_MIN) msg = `家族は${G.MEMBERS_MIN}人から入れてください`;
      o.members.forEach((m, i) => {
        const r = rows[i];
        const nm = nameMsg(m.name, G.NAME_MAX);
        r.querySelector('.m-name').setAttribute('aria-invalid', nm ? 'true' : 'false');
        const e = nm || (!m.age ? '年齢を選んでください' : '') || (!G.jobOf(m.job) ? 'なりたい職業を選んでください' : '') || likesMsg(m.likes);
        if (e && !msg) {
          msg = `${i + 1}人目：${e}`;
          input = nm ? r.querySelector('.m-name') : !m.age ? r.querySelector('.m-age') : !G.jobOf(m.job) ? r.querySelector('.m-job') : r.querySelector('.m-likes');
        }
      });
      bad('members-err', msg, input);
    } else {
      ['fam-err', 'members-err'].forEach(id => showErr(id, ''));
      bad('name-err', nameMsg(o.name, G.NAME_MAX), $('me-name'));
      bad('age-err', o.age ? '' : '年齢を選んでください', $('me-age'));
      bad('job-err', G.jobOf(o.job) ? '' : 'なりたい職業を選んでください', form.querySelector('input[name="job"]'));
      bad('likes-err', likesMsg(o.likes), form.querySelector('.like'));
    }
    bad('req-err', o.job_request.length > G.REQUEST_MAX ? `リクエストは${G.REQUEST_MAX}文字までです` : '', $('job-request'));
    bad('msg-err', o.message.length > G.MESSAGE_MAX ? `メッセージは${G.MESSAGE_MAX}文字までです（いま${o.message.length}文字）`
      : o.from.length > G.FROM_MAX ? `贈る人は${G.FROM_MAX}文字までです` : '', o.message.length > G.MESSAGE_MAX ? $('message') : $('from'));
    bad('agree-err', $('agree').checked ? '' : '返品・キャンセルについて確認のうえ、チェックを入れてください', $('agree'));
    return first;
  }

  let tried = false;
  const recheck = () => { if (tried) validate(collect()); };
  form.addEventListener('input', recheck);
  form.addEventListener('change', e => {
    if (e.target.name === 'plan') refreshPlan();
    recheck();
  });

  // ── 入力 → 確認 ──
  let current = null;
  form.addEventListener('submit', e => {
    e.preventDefault();
    tried = true;
    const o = collect();
    const first = validate(o);
    if (first) { first.focus(); return; }
    current = o;
    try { sessionStorage.setItem(STORE, JSON.stringify(o)); } catch (err) { /* 保存できなくても続ける */ }
    const p = G.planOf(o.plan);
    const likes = l => (l.length ? l.join('、') : '（なし）');
    let rows;
    if (o.plan === 'family') {
      rows = [['種類', p.name], ['題', `〜${o.family}家の場合〜`]]
        .concat(o.members.map((m, i) => [`${i + 1}人目`, `${m.name}${m.honorific}（${ageLabel(m.age)}）・${G.jobOf(m.job).name}・${diffOf(o.plan, m.age)}／好きなもの：${likes(m.likes)}`]));
    } else {
      rows = [['種類', p.name], ['題', `〜${o.name}${o.honorific}の人生〜`], ['年齢', ageLabel(o.age) + `（人生シート：${diffOf(o.plan, o.age)}）`],
        ['なりたい職業', G.jobOf(o.job).name], ['好きなもの', likes(o.likes)]];
    }
    if (o.job_request) rows.push(['リクエスト', o.job_request]);
    rows.push(['メッセージ', o.message || '（なし）'], ['贈る人', o.from || '（なし）']);
    $('summary-order').innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    $('summary-plan').textContent = p.name;
    $('summary-price').textContent = G.yen(p.price);
    $('pay-price').textContent = G.yen(p.price);
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
  const canPay = () => !!K.API_URL && G.isOpen();
  $('pay-btn').addEventListener('click', async () => {
    if (!current || !canPay()) return;
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
  if (!canPay()) {
    notice('notice-info', 'ただいま販売の準備中です。入力と確認まではお試しいただけます。');
    $('pay-btn').disabled = true;
  }

  function restore(o) {
    const pl = form.querySelector(`input[name="plan"][value="${o.plan}"]:not(:disabled)`);
    if (pl) pl.checked = true;
    if (o.plan === 'family') {
      $('fam-name').value = o.family || '';
      $('member-rows').innerHTML = '';
      (o.members || []).slice(0, G.MEMBERS_MAX).forEach(m => memberRow(m));
    } else {
      $('me-name').value = o.name || '';
      const h = form.querySelector(`input[name="me-hon"][value="${o.honorific || ''}"]`);
      if (h) h.checked = true;
      if (o.age) $('me-age').value = String(o.age);
      const j = form.querySelector(`input[name="job"][value="${o.job}"]`);
      if (j) j.checked = true;
      form.querySelectorAll('.like').forEach((el, i) => { el.value = (o.likes || [])[i] || ''; });
    }
    $('job-request').value = o.job_request || '';
    $('message').value = o.message || '';
    $('from').value = o.from || '';
    refreshPlan();
  }

  // はじめの状態：?plan= で選んでおく。支払いを中断して戻ったら、入力を戻す
  const params = new URLSearchParams(location.search);
  let saved = null;
  if (params.get('canceled')) {
    notice('notice-warn', 'お支払いは完了していません。内容を確かめて、もう一度お進みください。');
    try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch (err) { /* 何もしない */ }
  }
  if (saved) {
    restore(saved);
  } else {
    const pl = form.querySelector(`input[name="plan"][value="${params.get('plan') || 'yasashii'}"]:not(:disabled)`)
      || form.querySelector('input[name="plan"]:not(:disabled)');
    if (pl) pl.checked = true;
    refreshPlan();
  }
  refreshCount();
})();
