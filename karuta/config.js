// うちの かぞく かるた（名入れ・PDF）の設定。受付の仕組みのURL・連絡先は ../assets/config.js（window.KIT）を使う
// 数字は 受付の仕組み Code.gs の CONFIG.KARUTA・キット作成の karuta/data.py と同じにする
window.KARUTA = {
  PRODUCT_NAME: 'うちの かぞく かるた',
  PRICE: 1480,
  // 販売を始めたら true にする。false のあいだは「準備中」と出して、支払いボタンを押せなくする（?test=1 で ためせる）
  OPEN: false,
  MEMBERS_MIN: 2,
  MEMBERS_MAX: 6,
  MEMBER_LEN: 10,
  MEMORIES_MIN: 3,
  MEMORIES_MAX: 10,
  MEMORY_LEN: 20,
  AGES: [{ v: 2, label: '2さい以下' }, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, { v: 13, label: '13さい以上（おとなだけ）' }],
  LITTLE_AGE: 4,
  OCCASIONS: [
    { key: 'kanreki', label: 'かんれき（60さい）' }, { key: 'koki', label: 'こき（70さい）' }, { key: 'kiju', label: 'きじゅ（77さい）' },
    { key: 'sanju', label: 'さんじゅ（80さい）' }, { key: 'beiju', label: 'べいじゅ（88さい）' }, { key: 'sotsuju', label: 'そつじゅ（90さい）' },
    { key: 'hakuju', label: 'はくじゅ（99さい）' }, { key: 'tanjoubi', label: 'おたんじょうび' }, { key: 'other', label: 'そのほかの おいわい' },
  ],
  KEEP_DAYS: 30,
  // お届けの時期（特定商取引法の表示と同じ文。夜のうちに読み札を作って点検してから送るため）
  DELIVERY: 'ご注文の翌日の正午（12時）までに、PDFをメールでお送りします（夜のうちに読み札を作り、点検してからお送りします）',
  NEW_YEAR_NOTE: '12月20日までのご注文は、お正月に間に合います',
  // 注文の前の確認（5つ ぜんぶ必要）。キーは Code.gs の CONFIG.KARUTA.CONSENTS と同じ
  CONSENTS: [
    { key: 'use', text: '家族の呼び名と思い出は、このかるたを作るためだけに使い、お届けから30日で消すことを確認しました。' },
    { key: 'ai_us', text: '読み札の文を作るために、入力した呼び名と思い出を、米国のAIサービス（Anthropic社の Claude）に送ることに同意します。' },
    { key: 'guardian', text: '16歳未満の子の呼び名は、保護者の私が入力しています。' },
    { key: 'no_sensitive', text: '病気やけが・家庭の事情・住所・学校や園の名前・名字は入れていません。' },
    { key: 'no_return', text: '名前を入れて作るデジタル商品のため、お届け後の返品・キャンセルはできないことを確認しました。' },
  ],
};
window.KARUTA.isOpen = () => window.KARUTA.OPEN || new URLSearchParams(location.search).get('test') === '1';
window.KARUTA.yen = n => n.toLocaleString('ja-JP');
document.addEventListener('DOMContentLoaded', () => {
  const g = window.KARUTA;
  document.querySelectorAll('[data-karuta="price"]').forEach(el => { el.textContent = g.yen(g.PRICE); });
  document.querySelectorAll('[data-karuta="delivery"]').forEach(el => { el.textContent = g.DELIVERY; });
  document.querySelectorAll('[data-karuta="newyear"]').forEach(el => { el.textContent = g.NEW_YEAR_NOTE; });
});
