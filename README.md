# 🌱 SeedTracker

現場課題から事業化まで追跡する社内業務PWAアプリ。

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Vue 3 + Vite |
| 状態管理 | Pinia |
| DB | IndexedDB（Dexie.js） |
| ルーティング | Vue Router 4 |
| PWA | vite-plugin-pwa |
| スタイル | CSS Variables（フレームワークなし） |

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev

# プロダクションビルド
npm run build

# ビルド確認
npm run preview
```

## iPhone PWA として使う方法

1. `npm run build` でビルド
2. `dist/` フォルダを社内サーバーまたはローカルHTTPSサーバーで公開
   - 簡単な方法: `npx serve dist` または Python の `http.server`
   - **注意: PWAはHTTPSが必要**（`localhost` は例外）
3. iPhone Safari でアクセス
4. 共有ボタン → 「ホーム画面に追加」

## プロジェクト構造

```
src/
├── main.js           # エントリーポイント
├── App.vue           # ルートコンポーネント（ボトムナビ）
├── style.css         # グローバルスタイル・デザイントークン
├── db.js             # Dexie.js スキーマ・定数・CRUD
├── router/
│   └── index.js      # ルート定義
├── stores/
│   └── seeds.js      # Pinia ストア（全状態管理）
├── components/
│   ├── AppHeader.vue     # 共通ヘッダー
│   ├── SeedCard.vue      # シードカード
│   ├── StatusStepper.vue # ステータスステッパー
│   └── TagSelector.vue   # タグ選択
└── views/
    ├── ListView.vue      # S01 一覧画面
    ├── SeedForm.vue      # S02 登録・編集フォーム
    ├── SeedDetail.vue    # S03 詳細表示
    ├── TagsView.vue      # S04 タグ管理
    └── SettingsView.vue  # S05 設定・エクスポート
```

## 機能一覧（Phase 1 MVP）

- ✅ シード登録・編集・削除
- ✅ 6段階ステータス管理（課題→解決案→事業アイデア→検討中→開発中→事業化）
- ✅ 6種別カテゴリ（現場課題・自社製品改善・他社製品改善・存在しない製品・新規事業・技術シーズ）
- ✅ タグ管理（カラー付きCRUD）
- ✅ 全文検索（タイトル・本文・情報源）
- ✅ ステータス別フィルター
- ✅ カテゴリフィルター
- ✅ CSVエクスポート（Excel対応BOM付き）
- ✅ JSONバックアップ・インポート
- ✅ PWA対応（オフライン動作・iPhone ホーム画面追加）

## Phase 2 予定

- 写真添付（カメラ・ライブラリ）
- 関連人物マスタ（Personsテーブル）
- 関連企業マスタ（Companiesテーブル）
- シード×人物・企業紐付け

## データについて

全データはブラウザの **IndexedDB**（`SeedTrackerDB`）にローカル保存されます。  
サーバー不要・完全オフライン動作します。  
ブラウザのデータ削除でデータが消える場合があるため、定期的なJSONバックアップを推奨します。

---

## 🚀 GitHub + Railway へのデプロイ手順

### Step 1 — GitHubにプッシュ

```bash
cd seed-tracker
git init
git add .
git commit -m "feat: SeedTracker Phase2 MVP"

# GitHubでリポジトリ作成後：
git remote add origin https://github.com/<your-name>/seed-tracker.git
git branch -M main
git push -u origin main
```

### Step 2 — Railwayで新規プロジェクト作成

1. [railway.app](https://railway.app) にログイン
2. **New Project** → **Deploy from GitHub repo**
3. リポジトリを選択
4. Railway が自動検出：
   - Build: `npm run build`
   - Start: `npx serve dist -p $PORT --single`
5. **Deploy** → URLが発行される（例：`https://seed-tracker-xxx.up.railway.app`）

### Step 3 — iPhoneからPWA登録

1. Safari で Railway の URL を開く
2. 共有ボタン → **「ホーム画面に追加」**
3. 完了 — オフラインでも動作します

### 注意事項

- IndexedDB はブラウザローカルに保存されます
- Railway の無料枠は月500時間（常時稼働で約21日分）
- **データはブラウザ側に保存**のため、URLが変わっても既存データに影響なし
- 複数端末でのデータ共有は Phase 3（Supabase連携）で対応予定

