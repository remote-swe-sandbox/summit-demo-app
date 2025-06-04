import { prisma } from '@/lib/prisma';
import { runWithAmplifyServerContext } from '@/lib/amplifyServerUtils';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { cookies } from 'next/headers';
import { isMockAuthEnabled, MOCK_USER } from './mock-auth';

export class MyCustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MyCustomError';
  }
}

const actionClient = createSafeActionClient({
  handleServerError(e) {
    // Log to console.
    console.error('Action error:', e.message);

    // In this case, we can use the 'MyCustomError` class to unmask errors
    // and return them with their actual messages to the client.
    if (e instanceof MyCustomError) {
      return e.message;
    }

    // Every other error that occurs will be masked with the default message.
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  // モック認証が有効な場合はモックユーザーを使用
  if (isMockAuthEnabled()) {
    // モックユーザーが存在しない場合は作成
    const user = await prisma.user.upsert({
      where: { id: MOCK_USER.id },
      update: {},
      create: { id: MOCK_USER.id },
    });
    
    console.log('Using mock authentication for server action:', MOCK_USER.id);
    return next({ ctx: { userId: user.id } });
  }

  try {
    // 通常の認証フロー
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!currentUser) {
      throw new Error('Session is not valid!');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.userId,
      },
    });

    if (user == null) {
      throw new Error('user not found');
    }

    return next({ ctx: { userId: user.id } });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('認証エラー:', error);
      console.log('開発環境ではモック認証を有効にするには ENABLE_MOCK_AUTH=true を環境変数に設定してください');
    }
    throw error;
  }
});
