/**
 * 6億分の1のねこ — 支払い照合（Google Apps Script ウェブアプリ）
 *
 * 役割：ゲームから「?session=cs_...」で呼ばれたら、Stripe に問い合わせて
 *       そのチェックアウトが本当に支払い済みかを返す。ついでにシートに記録する。
 *
 * 置き方（1回だけ）：
 *   1. https://script.google.com → 新しいプロジェクト → このファイルの中身を貼る
 *   2. 左の「プロジェクトの設定」→「スクリプト プロパティ」に追加
 *        STRIPE_KEY : Stripe の「制限付きキー」（権限は Checkout Sessions: 読み取り だけ）
 *        SHEET_ID   : 記録用スプレッドシートのID（URLの /d/ と /edit の間）※省略可
 *   3. 右上「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *        実行ユーザー：自分 ／ アクセスできるユーザー：全員  → デプロイ
 *   4. 出てきたウェブアプリのURLを、ゲームの SITE.verifyUrl に入れる（クロちゃんに渡せばOK）
 *
 * Stripe 側：「うちに迎える」の支払いリンクの「支払い後」を
 *   https://hawkwood3838-droid.github.io/takarasagashi/neko/?room=ok&session_id={CHECKOUT_SESSION_ID}
 *   にリダイレクトする設定にする（{CHECKOUT_SESSION_ID} はそのまま書く）。
 */

var PROPS = PropertiesService.getScriptProperties();

function doGet(e) {
  var sid = ((e && e.parameter && (e.parameter.session || e.parameter.cs)) || '').trim(); // ?sid= は Google が予約していて使えないので ?session=
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sid)) return out_({ ok: false, err: 'bad_sid' });
  var key = PROPS.getProperty('STRIPE_KEY');
  if (!key) return out_({ ok: false, err: 'no_key' });

  var res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions/' + sid + '?expand[]=line_items', {
    headers: { Authorization: 'Bearer ' + key }, muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) return out_({ ok: false, err: 'stripe_' + res.getResponseCode() });
  var cs = JSON.parse(res.getContentText());
  if (cs.payment_status !== 'paid') return out_({ ok: false, err: 'unpaid' });

  var item = itemFor_(cs);
  var country = (cs.customer_details && cs.customer_details.address && cs.customer_details.address.country) || '';
  log_(sid, item, cs.amount_total, cs.currency, country, cs.created);
  return out_({ ok: true, item: item, amount: cs.amount_total, cur: cs.currency });
}

/** 何を買ったか（金額と通貨、だめなら商品名で判定） */
function itemFor_(cs) {
  var a = cs.amount_total, c = (cs.currency || '').toLowerCase();
  var byAmount = { 'jpy:500': 'room', 'jpy:120': 'oyatsu', 'jpy:240': 'hana', 'jpy:480': 'hoshi',
                   'usd:400': 'room', 'usd:100': 'oyatsu', 'usd:200': 'hana', 'usd:400': 'hoshi' };
  var desc = '';
  try { desc = cs.line_items.data.map(function (li) { return li.description || ''; }).join(' '); } catch (err) {}
  if (/迎える|Adopt|adopt/.test(desc)) return 'room';
  if (/おやつ|Treat|treat/.test(desc)) return 'oyatsu';
  if (/お花|Flower|flower/.test(desc)) return 'hana';
  if (/お星|Star|star/.test(desc)) return 'hoshi';
  return byAmount[c + ':' + a] || 'other';
}

/** スプレッドシートに1行追加（同じ sid は二重に書かない） */
function log_(sid, item, amount, cur, country, created) {
  var id = PROPS.getProperty('SHEET_ID'); if (!id) return;
  try {
    var ss = SpreadsheetApp.openById(id);
    var sh = ss.getSheetByName('verify') || ss.insertSheet('verify');
    if (sh.getLastRow() === 0) sh.appendRow(['確認日時', '支払い日時', 'session_id', '品目', '金額', '通貨', 'カード国']);
    var last = sh.getLastRow();
    if (last > 1) {
      var ids = sh.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (ids[i][0] === sid) return;
    }
    sh.appendRow([new Date(), new Date(created * 1000), sid, item, amount, cur, country]);
  } catch (err) { /* 記録に失敗しても照合の返事は返す */ }
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** 動作テスト用：エディタから実行 → ログに結果が出る */
function test_() {
  var e = { parameter: { sid: 'cs_test_xxx' } };
  Logger.log(doGet(e).getContent());
}
