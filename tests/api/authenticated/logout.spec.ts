import { test, expect } from '@fixtures/base.fixture';

// skipping for now since this will invalidate the token used by the other tests
test.describe.skip('Invalidate token', () => {
  test('POST /users/logout` invalidates token; subsequent request returns 401', async ({
    authRequest,
  }) => {
    // Check token before logging out
    const beforeLogout = await authRequest.get('/users/me');
    expect(beforeLogout.status()).toBe(200);

    // Logout
    const logout = await authRequest.get('/users/logout');
    const logoutData = await logout.json();
    expect(logout.status()).toBe(200);
    expect(logoutData.message).toBe('Successfully logged out');

    // Check token after logging out
    const afterLogout = await authRequest.get('/users/me');
    const meData = await afterLogout.json();
    expect(afterLogout.status()).toBe(401);
    expect(meData.message).toBe('Unauthorized');
  });

  /* Possible solution
  1. Create a fresh login specifically for this test, use that token to logout, and leave the shared token untouched:
  test('POST /users/logout invalidates token', async ({ apiRequest }) => {
  // Login fresh — don't use the shared authRequest
  const loginResponse = await apiRequest.post('/users/login', {
    data: {
      email: process.env.CUSTOMER_EMAIL,
      password: process.env.CUSTOMER_PASSWORD,
    },
  });
  const { access_token } = await loginResponse.json();

  // Create a one-off authenticated context with this fresh token
  const authedContext = await request.newContext({
    baseURL: process.env.API_BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  // Verify it works
  const before = await authedContext.get('/users/me');
  expect(before.status()).toBe(200);

  // Logout
  const logout = await authedContext.post('/users/logout');
  expect(logout.status()).toBe(200);

  // Token is now invalid
  const after = await authedContext.get('/users/me');
  expect(after.status()).toBe(401);

  await authedContext.dispose();
});

2. run the logout test in a separate project with no parallelism

{
  name: 'api-authenticated-logout',
  testMatch: /logout\.spec\.ts/,
  dependencies: ['api-authenticated'],  // runs after all other authenticated tests finish
  use: { ... }
}

  */
});
