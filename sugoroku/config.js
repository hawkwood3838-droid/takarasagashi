// なりたい自分すごろく（名前入り）の設定。受付の仕組みのURL・連絡先は ../assets/config.js（window.KIT）を使う
window.SUGO = {
  PRODUCT_NAME: 'なりたい自分すごろく',
  // 販売を始めたら true にする。false のあいだは「準備中」と出して、支払いボタンを押せなくする
  // （?test=1 を付けて開くと、テスト用のキーで ためせる）
  OPEN: false,
  // 種類と値段（受付の仕組み Code.gs の CONFIG.SUGOROKU.PLANS と同じ）。price が 0 のものは「準備中」
  PLANS: [
    { key: 'yasashii', name: '名前入り やさしい版', price: 1480, pages: 19,
      note: '小学生（10さいくらい）から。ふつうの長さ（2人で35分〜）。はじめての方に。' },
    { key: 'deluxe', name: '名前入り デラックス版', price: 1980, pages: 29,
      note: 'やさしい＋ほんかく＋ガッツリ。家族で むずかしさを まぜて遊べます。' },
    { key: 'family', name: '家族の名前入り（〇〇家版）', price: 2480, pages: 32,
      note: '家族みんなの名前と なりたい職業が入る デラックス版。' },
  ],
  JOBS: [
    { key: 'kaishain', name: '会社員', color: '#2F6FB0' },
    { key: 'ishi', name: '医師', color: '#2E9455' },
    { key: 'patissier', name: 'パティシエ', color: '#D5443A' },
    { key: 'keisatsu', name: '警察官', color: '#1F3A5F' },
    { key: 'hoikushi', name: '保育士', color: '#C98A12' },
    { key: 'sports', name: 'スポーツ選手', color: '#7D4AA8' },
    { key: 'youtuber', name: 'YouTuber', color: '#C23B3B' },
    { key: 'model', name: 'モデル', color: '#C2487E' },
  ],
  HONORIFICS: ['くん', 'ちゃん', 'さん', ''],
  NAME_MAX: 8,
  FAMILY_MAX: 6,
  MEMBERS_MIN: 2,
  MEMBERS_MAX: 6,
  LIKE_MAX: 8,
  LIKES_MAX: 3,
  MESSAGE_MAX: 60,
  FROM_MAX: 16,
  REQUEST_MAX: 20,
  HONKAKU_AGE: 12, // デラックス版・家族版で、この年齢から 人生シートが ほんかく になる
  // アンケート（受付の仕組みの CONFIG.REQUEST と同じ）
  REQ_AGES: ['5さい以下', '6〜8さい', '9〜12さい', '13〜15さい', '16さい以上・おとな'],
  REQ_WHO: ['子ども本人', '保護者', '先生・習いごとの指導者', 'その他'],
};

window.SUGO.planOf = key => window.SUGO.PLANS.find(p => p.key === key);
window.SUGO.jobOf = key => window.SUGO.JOBS.find(j => j.key === key);
window.SUGO.isOpen = () => window.SUGO.OPEN || new URLSearchParams(location.search).get('test') === '1';
window.SUGO.yen = n => n.toLocaleString('ja-JP');

// data-sugo="..." の場所に値段などを入れる
document.addEventListener('DOMContentLoaded', () => {
  const g = window.SUGO;
  document.querySelectorAll('[data-sugo-price]').forEach(el => {
    const p = g.planOf(el.dataset.sugoPrice);
    if (p) el.textContent = p.price ? g.yen(p.price) + '円' : '準備中';
  });
  document.querySelectorAll('[data-sugo-pages]').forEach(el => {
    const p = g.planOf(el.dataset.sugoPages);
    if (p) el.textContent = p.pages;
  });
  if (document.title.indexOf('{sugo}') >= 0) document.title = document.title.replace('{sugo}', g.PRODUCT_NAME);
});
