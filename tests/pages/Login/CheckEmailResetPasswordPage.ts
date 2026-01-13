import { Page } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCheckEmailPage } from './BasePages/BaseCheckEmailPage';

export class CheckEmailResetPasswordPage extends BaseCheckEmailPage {

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

    // Wait for the Check Email page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Check Email Page',
            { pageContext: this.pageContext }
        );
    }
}