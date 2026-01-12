import { Page } from '@playwright/test';
import { BasePasswordPage } from './BasePages/BasePasswordPage.ts';

export class LoginPasswordPage extends BasePasswordPage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}
