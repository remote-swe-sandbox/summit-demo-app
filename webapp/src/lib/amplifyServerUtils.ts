import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

if (process.env.AMPLIFY_APP_ORIGIN_SOURCE_PARAMETER) {
  const ssm = new SSMClient({});
  try {
    const res = await ssm.send(new GetParameterCommand({ Name: process.env.AMPLIFY_APP_ORIGIN_SOURCE_PARAMETER }));
    process.env.AMPLIFY_APP_ORIGIN = res.Parameter?.Value;
  } catch (e) {
    console.log(e);
  }
}

export const { runWithAmplifyServerContext, createAuthRouteHandlers } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        userPoolId: process.env.USER_POOL_ID || 'mock-user-pool-id',
        userPoolClientId: process.env.USER_POOL_CLIENT_ID || 'mock-user-pool-client-id',
        loginWith: {
          oauth: {
            redirectSignIn: [`${process.env.AMPLIFY_APP_ORIGIN || 'http://localhost:3000'}/api/auth/sign-in-callback`],
            redirectSignOut: [
              `${process.env.AMPLIFY_APP_ORIGIN || 'http://localhost:3000'}/api/auth/sign-out-callback`,
            ],
            responseType: 'code',
            domain: process.env.COGNITO_DOMAIN || 'mock-cognito-domain',
            scopes: ['profile', 'openid', 'aws.cognito.signin.user.admin'],
          },
        },
      },
    },
  },
  runtimeOptions: {
    cookies: {
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
});
