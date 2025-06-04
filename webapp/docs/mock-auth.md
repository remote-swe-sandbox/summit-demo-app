# モック認証の使い方

ローカル開発時にCognito認証をスキップしてアプリケーションを使用するための機能です。

## セットアップ方法

1. 環境変数ファイルを作成します：

```bash
# .env.local ファイルのテンプレート
COGNITO_DOMAIN=auth.example.com
AMPLIFY_APP_ORIGIN=http://localhost:3000
USER_POOL_CLIENT_ID=dummy
USER_POOL_ID=us-west-2_dummy
NEXT_PUBLIC_EVENT_HTTP_ENDPOINT=""
NEXT_PUBLIC_AWS_REGION="us-west-2"
ASYNC_JOB_HANDLER_ARN=""
ENABLE_MOCK_AUTH=true

# データベース接続情報
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=sample
DATABASE_PORT=5432
DATABASE_ENGINE=postgres
DATABASE_OPTION=''
DATABASE_URL="${DATABASE_ENGINE}://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}${DATABASE_OPTION}"
```

2. このファイルを `.env.local` としてプロジェクトのルートディレクトリに保存します

## 使用方法

1. 環境変数 `ENABLE_MOCK_AUTH=true` を設定するとモック認証が有効になります

2. アプリケーションを起動すると：
   - 認証画面へのリダイレクトがスキップされる
   - モックユーザーID: `mock-user-id` として認証される
   - ユーザーが存在しない場合は自動的に作成される

## モックユーザー情報の変更方法

モックユーザーのIDやメールアドレスを変更したい場合は、`src/lib/mock-auth.ts` の `MOCK_USER` オブジェクトを編集してください。

```typescript
export const MOCK_USER = {
  id: 'カスタマイズしたユーザーID',
  email: 'カスタマイズしたメールアドレス',
};
```