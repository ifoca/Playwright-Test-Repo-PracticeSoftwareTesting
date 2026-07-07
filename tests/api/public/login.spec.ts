import { test, expect } from '@fixtures/base.fixture';
import type { LoginResponse } from '@app-types/api.types';

const CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL!;
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD!;

test.describe('Login tests', () => {
  test.describe('Successful login', () => {
    test('POST /users/login with valid credentials returns 200 and access_token', async ({
      apiRequest,
    }) => {
      const response = await apiRequest.post('/users/login', {
        data: {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD,
        },
      });
      const body: LoginResponse = await response.json();
      expect(response.status()).toBe(200);
      expect(body).toHaveProperty('access_token');
      expect(body.access_token).toBeDefined();
      expect(body.token_type).toBe('bearer');
      expect(body.expires_in).toBe(300);
    });
  });

  test.describe('Login validation messages', () => {
    test('POST /users/login with wrong password returns 401', async ({ apiRequest }) => {
      const response = await apiRequest.post('/users/login', {
        data: {
          email: CUSTOMER_EMAIL,
          password: `${CUSTOMER_PASSWORD}+wrong`,
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(401);
      expect(body.error).toStrictEqual('Unauthorized');
    });

    test('POST /users/login with unregistered email returns 401', async ({ apiRequest }) => {
      const response = await apiRequest.post('/users/login', {
        data: {
          email: `fake-${CUSTOMER_EMAIL}`,
          password: CUSTOMER_PASSWORD,
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(401);
      expect(body.error).toStrictEqual('Unauthorized');
    });

    test('POST /users/login` with empty email returns invalid login request', async ({
      apiRequest,
    }) => {
      const response = await apiRequest.post('/users/login', {
        data: {
          email: '',
          password: CUSTOMER_PASSWORD,
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(401);
      expect(body.error).toStrictEqual('Invalid login request');
    });

    test('POST /users/login` with empty password returns invalid login request', async ({
      apiRequest,
    }) => {
      const response = await apiRequest.post('/users/login', {
        data: {
          email: CUSTOMER_EMAIL,
          password: '',
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(401);
      expect(body.error).toStrictEqual('Invalid login request');
    });
  });
});
