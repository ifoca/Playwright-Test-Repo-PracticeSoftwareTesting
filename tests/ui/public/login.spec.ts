import { test, expect } from '@fixtures/base.fixture';

const CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL!;
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD!;
const CUSTOMER_NAME = 'Jane Doe';

test.describe('Login page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.gotoLoginPage();
  });

  test.describe('Successful login', () => {
    test('Redirects to account page and shows user name in nav', async ({ loginPage, page }) => {
      await loginPage.loginWith(CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

      await expect(page).toHaveURL(/\/account/);
      await expect(loginPage.pageTitle).toHaveText(/My account/i);
      await expect(loginPage.navUserMenu).toHaveText(CUSTOMER_NAME);
      await expect(loginPage.signInNavLink).not.toBeVisible();
    });
  });

  test.describe('Login validation messages', async () => {
    test('Invalid email or password is returned', async ({ loginPage, page }) => {
      await loginPage.loginWith(CUSTOMER_EMAIL, CUSTOMER_PASSWORD + 'a');
      await expect(loginPage.loginError).toContainText('Invalid email or password');
      // Still on the login page
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('Email and password are required', async ({ loginPage, page }) => {
      await loginPage.loginWith('', '');
      await expect(loginPage.emailErrorMessage).toContainText('Email is required');
      await expect(loginPage.passwordErrorMessage).toContainText('Password is required');
      // Still on the login page
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('Invalid email address message is returned', async ({ loginPage }) => {
      await loginPage.loginWith('fakeemail', '');
      await expect(loginPage.emailErrorMessage).toContainText('Email format is invalid');
    });

    test('Password length is invalid', async ({ loginPage }) => {
      await loginPage.loginWith('fake@email.com', 'ab');
      await expect(loginPage.passwordErrorMessage).toHaveText('Password length is invalid');
    });
  });

  test.describe('Navigation links', () => {
    test('User is redirected to the sign up page', async ({ loginPage, page }) => {
      await loginPage.clickRegisterLink();
      await expect(page).toHaveURL('/auth/register');
    });

    test('User is redirected to the password reset up page', async ({ loginPage, page }) => {
      await loginPage.clickForgotPasswordLink();
      await expect(page).toHaveURL('/auth/forgot-password');
    });
  });
});

// !Gameloft20152015@12o?
