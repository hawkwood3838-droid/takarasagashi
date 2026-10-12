// クリア証：お話と名前を選ぶと、その場でクリア証を作る。名前はどこにも送らない
(function () {
  const K = window.KIT;
  const $ = id => document.getElementById(id);
  // お話ごとの「〇〇と みとめます」と、案内役の名前（子どもが読むので ひらがな・カタカナ）
  const RANK = {
    kaizoku: 'りっぱな かいぞく', ninja: 'いちにんまえの にんじゃ', mahou: 'まほうつかいの でし', kyouryuu: 'きょうりゅう はかせ',
    uchuu: 'うちゅうの ぼうけんか', tantei: 'めいたんてい', yousei: 'もりの ともだち', ningyo: 'うみの ゆうしゃ',
    okashi: 'おかしの くにの ゆうしゃ', xmas_minarai: 'サンタの おてつだい めいじん', xmas_tonakai: 'トナカイ はかせ',
    xmas_santa: 'サンタの なかま', other: 'ぼうけんの たつじん',
  };
  const kana = s => s.title.replace(/\{([^|}]+)\|([^}]+)\}/g, '$2');  // {海賊|かいぞく} → かいぞく
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  $('c-story').innerHTML = K.STORIES.map(s => `<option value="${s.key}">${s.name}</option>`).join('')
    + '<option value="other">そのほか（名前なし版など）</option>';
  const params = new URLSearchParams(location.search);
  if (params.get('story') && K.storyOf(params.get('story'))) $('c-story').value = params.get('story');

  function draw() {
    const key = $('c-story').value;
    const st = K.storyOf(key);
    const raw = toHira($('c-name').value.trim().replace(/\s/g, ''));
    const ok = !raw || /^[ぁ-ゖー]+$/.test(raw);
    $('c-name-err').hidden = ok;
    $('c-name-err').textContent = ok ? '' : '名前は ひらがなで入れてください';
    const name = ok && raw ? raw : 'ゆうき';
    const suffix = (document.querySelector('input[name="c-suffix"]:checked') || {}).value || '';
    $('cert-who').textContent = name + suffix;
    const n = (name + suffix).length;  // 長い名前は字を小さくして1行に
    $('cert-who').style.fontSize = (n <= 6 ? 6 : n <= 9 ? 4.8 : 4) + 'cqw';
    $('cert-body').textContent = st
      ? `は 「${kana(st)}」の ぼうけんを みごとに クリアしました。その ちえと ゆうきを たたえて、`
      : 'は おうちクエストの ぼうけんを みごとに クリアしました。その ちえと ゆうきを たたえて、';
    $('cert-rank').textContent = `「${RANK[key] || RANK.other}」と みとめます`;
    $('cert-img').src = st ? `img/stories/${st.key}.webp` : 'img/stories/kaizoku.webp';
    $('cert-from').textContent = st ? `${st.host} より` : 'おうちクエスト より';
    const d = new Date();
    $('cert-date').textContent = `${d.getFullYear()}ねん ${d.getMonth() + 1}がつ ${d.getDate()}にち`;
  }
  ['c-story', 'c-name'].forEach(id => $(id).addEventListener('input', draw));
  document.querySelectorAll('input[name="c-suffix"]').forEach(r => r.addEventListener('change', draw));
  draw();

  $('print-btn').addEventListener('click', () => window.print());
  $('save-btn').addEventListener('click', async () => {
    const btn = $('save-btn');
    if (!window.html2canvas) { btn.textContent = '保存できませんでした（印刷をお使いください）'; return; }
    btn.disabled = true;
    try {
      const canvas = await window.html2canvas($('cert'), { scale: 3, backgroundColor: '#FFFBF2', useCORS: true });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'クリア証_' + $('cert-who').textContent + '.png';
      a.click();
    } catch (err) {
      btn.textContent = '保存できませんでした（印刷をお使いください）';
    } finally {
      btn.disabled = false;
    }
  });
})();
