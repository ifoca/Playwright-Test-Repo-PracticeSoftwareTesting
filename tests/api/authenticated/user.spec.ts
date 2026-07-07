import { APIResponse } from '@playwright/test';
import { readFile } from 'fs/promises';
import { test, expect } from '@fixtures/base.fixture';
import type { User } from '@app-types/api.types';
import { USER_FILE } from '@config/filePaths';

let userResponse: APIResponse;
let body: User;

test.describe('User API tests', () => {
  let id: string, email: string, first_name: string, last_name: string, password: string;

  test.beforeAll(async ({ authRequest }) => {
    userResponse = await authRequest.get('/users/me');
    body = await userResponse.json();

    expect(userResponse.status()).toBe(200);

    try {
      const raw = await readFile(USER_FILE, 'utf-8');
      ({ id, email, first_name, last_name, password } = await JSON.parse(raw));
    } catch {
      throw new Error(
        '`user.json` file not found. Make sure auth.setup.ts has run before authenticated tests.',
      );
    }
  });

  test('GET /users/me with valid token returns current user profile', () => {
    expect(body.id).toBe(id);
    expect(body.email).toBe(email);
    expect(body.first_name).toBe(first_name);
    expect(body.last_name).toBe(last_name);
  });

  test('POST /users/change-password with wrong current password returns 400', async ({
    authRequest,
  }) => {
    const wrongPass = password + '$';
    const response = await authRequest.post('/users/change-password', {
      data: {
        current_password: wrongPass,
        new_password: wrongPass,
        new_password_confirmation: wrongPass,
      },
    });
    const data = await response.json();

    expect(response.status()).toBe(400);
    expect(typeof data.success).toBe('boolean');
    expect(data.success).toBe(false);
    expect(data.message).toBe('Your current password does not matches with the password.');
  });

  test('POST /users/change-password with correct current password returns 200', async ({
    authRequest,
  }) => {
    const newPass = password + '$';
    const response = await authRequest.post('/users/change-password', {
      data: {
        current_password: password,
        new_password: newPass,
        new_password_confirmation: newPass,
      },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(typeof data.success).toBe('boolean');
    expect(data.success).toBe(true);
  });
});
