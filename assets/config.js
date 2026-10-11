// 販売サイトの設定。商品名・価格・お話の一覧はここだけ書きかえればサイト全体に反映される
window.KIT = {
  PRODUCT_NAME: 'おうちクエスト',
  SHOP_NAME: 'ひなた あそび工房',
  PRICE: 980,
  SELLER: '髙木大資',
  CONTACT: 'hawkwood3838@gmail.com',
  // 受付の仕組み（Apps Script ウェブアプリ）のURL。空のあいだは支払いボタンが「準備中」になる
  API_URL: 'https://script.google.com/macros/s/AKfycbw1iDJKzfDWksZPnbNmDfRAX9ipbbwVlo_1CgePaHks8NQpIzshOXSw4oCSZVxGbSvFDw/exec',
  NAME_MAX: 8,
  NAMES_MAX: 4,
  LIKES_MAX: 10,
  AGES: [3, 4, 5, 6, 7, 8],
  LITTLE_AGE: 4, // この年齢以下は字を読まない版（隠し場所は4か所）
  OCCASIONS: {
    birthday: { label: 'おたんじょうび', note: '手紙に「〇さいの たんじょうび おめでとう」が入り、合言葉は「おめでとう」' },
    everyday: { label: 'ふだんの日', note: 'ごほうびや雨の日の遊びに。合言葉はお話ごとにちがいます' },
    christmas: { label: 'クリスマス', note: 'クリスマスだけのお話です' },
  },
  // 季節のお話を売る期間（月-日）。期間の外は「〇月から」と出して選べなくする
  SEASONS: {
    christmas: { from: '11-01', until: '12-25', soon: '11月から' },
  },
  // お話（キット作成の stories.py と同じキー）
  STORIES: [
    { key: 'kaizoku', name: 'かいぞくの たから', host: 'キャプテン・ひげまる', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: 'ひげの船長が隠した宝を、暗号をといて探します。' },
    { key: 'ninja', name: 'にんじゃの しゅぎょう', host: 'にんじゃの せんせい くろまめ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '忍者の先生の修行をこなして、ひみつの巻物へ。' },
    { key: 'mahou', name: 'まほうつかいの でし', host: 'まほうつかいの ミモザ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '見習いまほうつかいと、まほうの宝石を探します。' },
    { key: 'kyouryuu', name: 'きょうりゅうの たまご', host: 'きょうりゅうはかせ ホネホネ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: 'はかせと一緒に、めずらしい恐竜の卵を発掘。' },
    { key: 'uchuu', name: 'うちゅうの ぼうけん', host: 'ほしの こ ピピ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '遠い星から来たピピの、星のかけらを探します。' },
    { key: 'tantei', name: 'めいたんていの じけんぼ', host: 'めいたんてい ハテナ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '怪盗に隠された宝物を、推理で取りもどします。' },
    { key: 'yousei', name: 'ようせいの もり', host: 'はなの ようせい リリ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '花の妖精がくれた、ひみつのおくりものを探します。' },
    { key: 'ningyo', name: 'にんぎょの うみ', host: 'にんぎょの マリン', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: '人魚のマリンと、しんじゅの宝箱を探します。' },
    { key: 'okashi', name: 'おかしの くに', host: 'パティシエの ショコラ', line: 'year', occasions: ['birthday', 'everyday'],
      blurb: 'おかしの家をめぐって、とびきりのごほうびへ。' },
    { key: 'xmas_minarai', name: 'みならいサンタの おてつだい', host: 'みならいサンタ ポポ', line: 'christmas', occasions: ['christmas'],
      blurb: '地図をなくした見習いサンタを助けて、プレゼントを探します。' },
    { key: 'xmas_tonakai', name: 'いたずらトナカイ', host: 'トナカイの ベル', line: 'christmas', occasions: ['christmas'],
      blurb: 'いたずら好きのトナカイが隠したプレゼントを追いかけます。' },
    { key: 'xmas_santa', name: 'サンタからの ちょうせんじょう', host: 'サンタクロース', line: 'christmas', occasions: ['christmas'],
      blurb: 'サンタクロースからの挑戦状。暗号をといてプレゼントへ。' },
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

// 商品名などを、ページ内の data-kit="..." の場所に入れる
document.addEventListener('DOMContentLoaded', () => {
  const k = window.KIT;
  const values = {
    product: k.PRODUCT_NAME,
    shop: k.SHOP_NAME,
    price: k.PRICE.toLocaleString('ja-JP'),
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
