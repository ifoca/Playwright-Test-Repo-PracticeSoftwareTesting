import { writeFile, mkdir } from 'fs/promises';
import { AUTH_DIR, TOKEN_FILE } from '@config/filePaths';
import type { APIRequestContext } from '@playwright/test';

export const apiLogin = async (request: APIRequestContext, email: string, password: string) => {
  // create .auth directory if it does not exist
  await mkdir(AUTH_DIR, { recursive: true });

  const response = await request.post('/users/login', {
    data: {
      email,
      password,
    },
  });

  if (!response.ok()) {
    // Fail if the login does not succeed
    throw new Error(`Login failed with status ${response.status()}, ${await response.text()}`);
  }

  const loggedInUser = await response.json();

  const accessToken = {
    access_token: loggedInUser.access_token,
  };

  // guard in case the access_token exists but is undefined
  if (!accessToken) {
    throw new Error('Login succeeded but no access_token in response');
  }

  await writeFile(TOKEN_FILE, JSON.stringify(accessToken, null, 2));

  return {
    status: response.status(),
    loggedInUser,
  };
};
