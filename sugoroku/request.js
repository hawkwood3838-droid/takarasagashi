// 「作ってほしい職業」アンケート：受付の仕組み（action: 'job_request'）に送る
(function () {
  const K = window.KIT;
  const G = window.SUGO;
  const $ = id => document.getElementById(id);
  const form = $('req-form');
  const MAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
  const oneLine = s => String(s || '').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim();
  const seg = (id, name, list) => {
    $(id).innerHTML = list.map(v => `<label><input type="radio" name="${name}" value="${v}"><span>${v}</span></label>`).join('');
  };

  $('now-jobs').textContent = G.JOBS.map(j => j.name).join('・');
  seg('age-list', 'age', G.REQ_AGES);
  seg('who-list', 'who', G.REQ_WHO);

  const LIMIT = { job: 20, detail: 200 };
  function refreshCount() {
    const n = oneLine($('detail').value).length;
    $('detail-count').textContent = `${n} / ${LIMIT.detail}文字`;
    $('detail-count').classList.toggle('over', n > LIMIT.detail);
  }
  $('detail').addEventListener('input', refreshCount);
  refreshCount();

  function showErr(id, msg, input) {
    $(id).textContent = msg || '';
    $(id).hidden = !msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  const picked = name => (form.querySelector(`input[name="${name}"]:checked`) || {}).value || '';

  function collect() {
    return {
      job: oneLine($('job').value),
      detail: oneLine($('detail').value),
      age: picked('age'),
      who: picked('who'),
      email: $('email').value.trim(),
      website: $('website').value,
    };
  }
  function validate(r) {
    let first = null;
    const bad = (id, msg, input) => { showErr(id, msg, input); if (msg && !first) first = input; };
    bad('job-err', !r.job ? '作ってほしい職業を入れてください' : r.job.length > LIMIT.job ? `職業は${LIMIT.job}文字までです` : '', $('job'));
    bad('detail-err', r.detail.length > LIMIT.detail ? `${LIMIT.detail}文字までです（いま${r.detail.length}文字）`
      : /https?:|www\./i.test(r.job + r.detail) ? 'URLは入れられません' : '', $('detail'));
    bad('email-err', r.email && (!MAIL.test(r.email) || r.email.length > 100) ? 'メールアドレスの形を確かめてください' : '', $('email'));
    return first;
  }

  let tried = false;
  form.addEventListener('input', () => { if (tried) validate(collect()); });

  if (!K.API_URL) {
    $('notice-area').innerHTML = '<p class="notice notice-info">ただいま準備中です。もうしばらくお待ちください。</p>';
    $('send-btn').disabled = true;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    tried = true;
    const r = collect();
    const first = validate(r);
    if (first) { first.focus(); return; }
    if (!K.API_URL) return;
    const btn = $('send-btn');
    btn.disabled = true;
    btn.textContent = '送っています…';
    showErr('submit-err', '');
    try {
      const res = await fetch(K.API_URL, { method: 'POST', body: JSON.stringify({ action: 'job_request', request: r }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '送れませんでした');
      $('done-job').textContent = r.job;
      form.hidden = true;
      $('done').hidden = false;
      window.scrollTo({ top: 0 });
    } catch (err) {
      showErr('submit-err', err && err.message && !/fetch|network/i.test(err.message) ? err.message : '通信がうまくいきませんでした。電波のよい所で、もう一度お試しください。');
    } finally {
      btn.disabled = false;
      btn.textContent = '送る';
    }
  });

  $('again-btn').addEventListener('click', () => {
    form.reset();
    tried = false;
    refreshCount();
    $('done').hidden = true;
    form.hidden = false;
    $('job').focus();
  });
})();
