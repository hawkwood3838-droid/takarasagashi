# 販売サイト

おうちクエスト（名前入りの宝さがし）の販売サイト（GitHub Pages で公開）。

- `index.html` … 商品ページ
- `order.html` … 注文フォーム（入力 → 確認 → Stripeの支払い画面）
- `thanks.html` … 支払いのあとの完了ページ
- `tokushoho.html` … 特定商取引法に基づく表記
- `privacy.html` … プライバシーポリシー
- `assets/config.js` … 商品名・価格・連絡先・受付の仕組みのURL。ここを書きかえればサイト全体に反映される

## なりたい自分すごろく（2026-10-11 追加）
- `sugoroku/index.html` … 商品ページ（種類と値段・届くもの・職業・よくある質問）
- `sugoroku/order.html`・`order.js` … 注文フォーム（やさしい版 1,480円・デラックス版 1,980円・家族版 2,480円）
- `sugoroku/thanks.html` … 支払いのあとの完了ページ
- `sugoroku/request.html`・`request.js` … 「作ってほしい職業」アンケート
- `sugoroku/config.js` … 値段・職業・文字数の決まり。`OPEN: true` で支払いボタンが押せる（`?test=1` を付けると いつでも ためせる）
- 受付の仕組みのURLと連絡先は `assets/config.js` を使う
