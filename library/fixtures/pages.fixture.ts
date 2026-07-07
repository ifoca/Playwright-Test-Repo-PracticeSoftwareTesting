import { test as baseTest } from '@playwright/test';
import { LoginPage } from '@pages/login/login.page';
import { Homepage } from '@pages/homepage/home.page';

type MyPages = {
  loginPage: LoginPage;
  homepage: Homepage;
};

export const test = baseTest.extend<MyPages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homepage: async ({ page }, use) => {
    await use(new Homepage(page));
  },
});

export { expect } from '@playwright/test';
