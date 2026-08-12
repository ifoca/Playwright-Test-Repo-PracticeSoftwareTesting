import { STORAGE_FILE } from 'library/config/filePaths';
import { test as setup, expect } from '@fixtures/base.fixture';
import { registerUser } from '@dataFactory/apiRegister';
import { apiLogin } from '@dataFactory/apiLogin';

setup(
  'Register new user, log in and save storage state',
  async ({ apiRequest, loginPage, page, context }) => {
    // Register new user via API
    const registerResponse = await registerUser(apiRequest);
    expect(registerResponse.status).toBe(201);

    const { email, password } = registerResponse.credentials;

    // Log in with the new user via API to store the access toke
    const loginResponse = await apiLogin(apiRequest, email, password);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.loggedInUser).toHaveProperty('access_token');

    // Log in with the new user via the UI to save the browser storage state
    await loginPage.gotoLoginPage();
    await loginPage.loginWith(email, password);
    await expect(loginPage.pageTitle).toHaveText(/My account/i);
    await context.storageState({ path: STORAGE_FILE });
  },
);

// Gets the email, password from the file written with the registration
// const raw = await readFile(USER_FILE, 'utf-8');
// const { email, password, first_name, last_name } = await JSON.parse(raw);
