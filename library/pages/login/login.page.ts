import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly navUserMenu: Locator;
  readonly pageTitle: Locator;
  readonly signInNavLink: Locator;
  readonly emailErrorMessage: Locator;
  readonly passwordErrorMessage: Locator;
  readonly loginError: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.navUserMenu = page.getByTestId('nav-menu');
    this.pageTitle = page.getByTestId('page-title');
    this.signInNavLink = page.getByTestId('nav-sign-in');
    this.emailErrorMessage = page.getByTestId('email-error');
    this.passwordErrorMessage = page.getByTestId('password-error');
    this.loginError = page.getByTestId('login-error');
    this.registerLink = page.getByTestId('register-link');
    this.forgotPasswordLink = page.getByTestId('forgot-password-link');
  }

  // ── Navigation ──

  async gotoLoginPage() {
    await this.page.goto('/auth/login');
  }

  // ── Actions ──

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async loginWith(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitButton.click();
  }

  async clickRegisterLink() {
    await this.registerLink.click();
  }

  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.click();
  }
}
