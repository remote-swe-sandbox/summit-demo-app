// モック認証のためのユーティリティ
import { prisma } from './prisma';

// モックユーザー情報
export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'mock-user@example.com',
};

// モック認証セッションを取得する関数
export async function getMockSession() {
  // ユーザーが存在しなければ作成
  const user = await prisma.user.upsert({
    where: { id: MOCK_USER.id },
    update: {},
    create: { id: MOCK_USER.id },
  });

  return {
    userId: MOCK_USER.id,
    email: MOCK_USER.email,
    accessToken: 'mock-access-token',
    user,
  };
}

// モック認証状態を検証する関数
export async function verifyMockAuth() {
  return true;
}

// 開発環境かどうかをチェック
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// モック認証を有効にするかどうかのフラグ
export function isMockAuthEnabled() {
  return isDevelopment() && process.env.ENABLE_MOCK_AUTH === 'true';
}
