// 販売サイトの設定。商品名・価格・お話の一覧はここだけ書きかえればサイト全体に反映される
window.KIT = {
  PRODUCT_NAME: 'おうちクエスト',
  SHOP_NAME: 'ひなた あそび工房',
  PRICE: 980,
  // 9〜12さい「なぞときチャレンジ」（漢字にふりがな・9さい以上の むずかしい暗号）。2026-10-27 決定。受付の CONFIG.OLDER_AGE・PRICE_OLDER_JPY と同じ
  OLDER_AGE: 9,
  PRICE_OLDER: 1280,
  OLDER_NAME: 'なぞときチャレンジ',
  SELLER: '髙木大資',
  CONTACT: 'hawkwood3838@gmail.com',
  // 受付の仕組み（Apps Script ウェブアプリ）のURL。空のあいだは支払いボタンが「準備中」になる
  API_URL: 'https://script.google.com/macros/s/AKfycbw1iDJKzfDWksZPnbNmDfRAX9ipbbwVlo_1CgePaHks8NQpIzshOXSw4oCSZVxGbSvFDw/exec',
  NAME_MAX: 8,
  NAMES_MAX: 4, // 用途に names_max があればそちら（お正月は6）
  LIKES_MAX: 10,
  SENDER_MAX: 10, // 手紙の差出人（じいじと ばあば など。空なら お話の案内役だけ）。2026-10-27
  AGES: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  // お話の一覧に出す「対象年齢」と「遊ぶ時間」（2026-10-27）。3〜4さいは約15分、5さい以上は20〜30分。9〜12さいは なぞときチャレンジ（値段は PRICE_OLDER）
  AGE_LABEL: '3〜12さい',
  PLAY_TIME: '15〜30分',
  LITTLE_AGE: 4, // この年齢以下は字を読まない版（隠し場所は4か所）
  // きょうだい版（2026-10-28）：下の子用（●）の手紙とカードを足す。受付の CONFIG.KYOUDAI・キット作成の KYOUDAI_AGES と同じ
  KYOUDAI: { PLUS: 300, AGES: [3, 4, 5, 6, 7, 8] },
  // 3回分セット（2026-10-28。set.html）：買うと引き換えコード（T…）がメールで届き、好きなお話を好きな日に3回作れる。
  // 3〜8さい版だけ。有効期限は6か月。受付の CONFIG.SET と同じ
  SET: { TITLE: '3回分セット', COUNT: 3, PRICE: 2480, VALID_MONTHS: 6 },
  // むずかしさえらび（受付の CONFIG.LEVELS・キット作成の LEVELS と同じ）。謎の年齢を本当の年齢から shift だけずらす
  LEVELS: [
    { key: 'easy', label: 'やさしめ', shift: -1 },
    { key: 'normal', label: 'ふつう', shift: 0 },
    { key: 'hard', label: 'むずかしめ', shift: 1 },
  ],
  OCCASIONS: {
    birthday: { label: 'おたんじょうび', note: '手紙に「〇さいの たんじょうび おめでとう」が入り、合言葉は「おめでとう」' },
    everyday: { label: 'ふだんの日', note: 'ごほうびや雨の日の遊びに。合言葉はお話ごとにちがいます' },
    christmas: { label: 'クリスマス', note: 'クリスマスだけのお話です' },
    shougatsu: { label: 'お正月', note: 'お正月だけのお話です。家族やいとこと遊べるよう、名前は6人まで入れられます', names_max: 6 },
  },
  // ほかの通販サイトで買った人の引き換え（order.html?redeem=booth）。受付の仕組みの CONFIG.REDEEM.CHANNELS と同じキー
  REDEEM: {
    booth: { label: 'BOOTH', where: 'BOOTHの「購入履歴」で、この商品の注文番号（数字）を見られます。' },
    // 3回分セットの引き換えコード（T＋数字6けた－英数字5もじ）。支払いはセットで済んでいる
    set: { label: '3回分セット', field: '引き換えコード', placeholder: 'T261101-ABCDE', re: '^T[0-9]{6}-[A-Z0-9]{5}$', code: true,
      where: '3回分セットを買ったときのメールに、引き換えコード（Tから始まる番号）が書いてあります。',
      legend: '3回分セットで作る', title: '3回分セットで作る', bad: '引き換えコード（Tから始まる番号）を確かめてください' },
  },
  // サンタからの手紙（12月の毎日1通の なぞとき。santa.html）。受付の CONFIG.ADVENT・キット作成の advent.py と同じ。
  // 通数は決まるまで仮に12（12/13〜12/24）。変えるときは3か所そろえる
  ADVENT: { TITLE: 'サンタからの手紙', LETTERS: 12, PRICE: 1480, AGES: [5, 6, 7, 8, 9, 10, 11, 12], SALE_FROM: '11-01', SALE_UNTIL: '12-20' },
  // 季節のお話を売る期間（月-日）。期間の外は「〇月から」と出して選べなくする
  SEASONS: {
    christmas: { from: '11-01', until: '12-25', soon: '11月から' },
    shougatsu: { from: '12-01', until: '01-07', soon: '12月から' },
  },
  // お話（キット作成の stories.py と同じキー）
  // title は {漢字|よみ} の形で書く。販売ページでは漢字の上に小さくふりがなが付き、
  // 半角スペースは「ここで改行してよい」の印（表示では空白にならない）。
  // 確認画面などでは漢字だけ（name）になる。受付の仕組み（Code.gs）の name と同じ漢字にそろえること
  STORIES: [
    { key: 'kaizoku', title: '{海賊|かいぞく}の {宝|たから}', host: 'キャプテン・ひげまる', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: 'ひげの船長が隠した宝を、暗号をといて探します。' },
    { key: 'ninja', title: '{忍者|にんじゃ}の {修行|しゅぎょう}', host: 'にんじゃの せんせい くろまめ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '忍者の先生の修行をこなして、ひみつの巻物へ。' },
    { key: 'mahou', title: '{魔法使|まほうつか}いの {弟子|でし}', host: 'まほうつかいの ミモザ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '見習いまほうつかいと、まほうの宝石を探します。' },
    { key: 'kyouryuu', title: '{恐竜|きょうりゅう}の たまご', host: 'きょうりゅうはかせ ホネホネ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: 'はかせと一緒に、めずらしい恐竜の卵を発掘。' },
    { key: 'uchuu', title: '{宇宙|うちゅう}の {冒険|ぼうけん}', host: 'ほしの こ ピピ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '遠い星から来たピピの、星のかけらを探します。' },
    { key: 'tantei', title: '{名探偵|めいたんてい}の {事件簿|じけんぼ}', host: 'めいたんてい ハテナ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '怪盗に隠された宝物を、推理で取りもどします。' },
    { key: 'yousei', title: '{妖精|ようせい}の {森|もり}', host: 'はなの ようせい リリ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '花の妖精がくれた、ひみつのおくりものを探します。' },
    { key: 'ningyo', title: '{人魚|にんぎょ}の {海|うみ}', host: 'にんぎょの マリン', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '人魚のマリンと、しんじゅの宝箱を探します。' },
    { key: 'okashi', title: 'お{菓子|かし}の {国|くに}', host: 'パティシエの ショコラ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: 'おかしの家をめぐって、とびきりのごほうびへ。' },
    { key: 'xmas_minarai', title: '{見習|みなら}いサンタの お{手伝|てつだ}い', host: 'みならいサンタ ポポ', line: 'christmas', occasions: ['christmas'],
      blurb: '地図をなくした見習いサンタを助けて、プレゼントを探します。' },
    { key: 'xmas_tonakai', title: 'いたずらトナカイ', host: 'トナカイの ベル', line: 'christmas', occasions: ['christmas'],
      blurb: 'いたずら好きのトナカイが隠したプレゼントを追いかけます。' },
    { key: 'xmas_santa', title: 'サンタからの {挑戦状|ちょうせんじょう}', host: 'サンタクロース', line: 'christmas', occasions: ['christmas'],
      blurb: 'サンタクロースからの挑戦状。暗号をといてプレゼントへ。' },
    { key: 'shougatsu_fuku', title: '{福|ふく}の{神|かみ}の お{年玉|としだま}', host: 'ふくのかみ ニコ', line: 'shougatsu', occasions: ['shougatsu'],
      blurb: '福の神が隠したお年玉を、家族やいとこと探します。' },
  ],
  // 隠し場所（キット作成側の SPOTS と同じ並び・同じキー）
  SPOTS: [
    { key: 'れいぞうこ', label: '冷蔵庫', tip: '扉にマグネットで' },
    { key: 'せんたくき', label: '洗濯機', tip: 'フタの上に' },
    { key: 'げんかん', label: '玄関', tip: '靴の横に' },
    { key: 'おふろ', label: '脱衣所', tip: 'ぬれない所に' },
    { key: 'ふとん', label: '布団・ベッド', tip: 'まくらの下に' },
    { key: 'くつばこ', label: '下駄箱', tip: '扉を開けた段に' },
    { key: 'つくえ', label: '机', tip: '引き出しか机の上' },
    { key: 'まど', label: '窓', tip: 'カーテンの裏に' },
    { key: 'ほんだな', label: '本棚', tip: '本の間に' },
    { key: 'おしいれ', label: '押し入れ・クローゼット', tip: '戸を少し開けて' },
    { key: 'かがみ', label: '鏡', tip: '横の壁に' },
  ],
};

// 季節のお話がいま選べるか（例：クリスマスは11/1〜12/25）
window.KIT.inSeason = function (occasions) {
  const k = window.KIT;
  const now = new Date();
  const md = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  return occasions.some(o => {
    const s = k.SEASONS[o];
    if (!s) return true;
    return s.from <= s.until ? (md >= s.from && md <= s.until) : (md >= s.from || md <= s.until);
  });
};
window.KIT.storyOf = key => window.KIT.STORIES.find(s => s.key === key);

// お話の題：name は漢字だけ（例：海賊の宝）、rubyOf はふりがなつきのHTML
// ふりがなは漢字の上にはみ出して置く（<ruby> だと読みが長いとき漢字の間があいてしまうため）
(function () {
  const RUBY_RE = /\{([^|}]+)\|([^}]+)\}/g;
  const esc = t => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.KIT.STORIES.forEach(s => { s.name = s.title.replace(RUBY_RE, '$1').replace(/ /g, ''); });
  window.KIT.rubyOf = s => '<span class="kanji-title" aria-label="' + esc(s.name) + '">'
    + esc(s.title).split(' ').map(t => t.replace(RUBY_RE, '<span class="rb">$1<span class="rt" aria-hidden="true">$2</span></span>')).join('<wbr>')
    + '</span>';
})();

// 商品名などを、ページ内の data-kit="..." の場所に入れる
document.addEventListener('DOMContentLoaded', () => {
  const k = window.KIT;
  const values = {
    product: k.PRODUCT_NAME,
    shop: k.SHOP_NAME,
    price: k.PRICE.toLocaleString('ja-JP'),
    price_older: k.PRICE_OLDER.toLocaleString('ja-JP'),
    older_name: k.OLDER_NAME,
    seller: k.SELLER,
    contact: k.CONTACT,
    stories: String(k.STORIES.length),
  };
  document.querySelectorAll('[data-kit]').forEach(el => {
    const v = values[el.dataset.kit];
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll('a[data-kit-mail]').forEach(a => { a.href = 'mailto:' + k.CONTACT; });
  if (document.title.indexOf('{product}') >= 0) document.title = document.title.replace('{product}', k.PRODUCT_NAME);
});
