import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/lib/amplifyServerUtils';
import { prisma } from '@/lib/prisma';
import { getMockSession, isMockAuthEnabled } from './mock-auth';

export class UserNotCreatedError {
  constructor(public readonly userId: string) {}
}

export async function getSession() {
  // モック認証が有効な場合はモックセッションを返す
  if (isMockAuthEnabled()) {
    return getMockSession();
  }

  // 通常の認証フロー
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });
    if (session.userSub == null || session.tokens?.idToken == null || session.tokens?.accessToken == null) {
      throw new Error('session not found');
    }
    const userId = session.userSub;
    const email = session.tokens.idToken.payload.email;
    if (typeof email != 'string') {
      throw new Error(`invalid email ${userId}.`);
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user == null) {
      throw new UserNotCreatedError(userId);
    }

    return {
      userId: user.id,
      email,
      accessToken: session.tokens.accessToken.toString(),
      user,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('認証エラー:', error);
      console.log('開発環境ではモック認証を有効にするには ENABLE_MOCK_AUTH=true を環境変数に設定してください');
    }
    throw error;
  }
}
