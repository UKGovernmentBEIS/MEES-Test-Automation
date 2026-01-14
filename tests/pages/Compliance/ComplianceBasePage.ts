import { Page, Locator } from '@playwright/test';

// This class provides methods and properties common to all Compliance Pages
export abstract class CompliancePageBase {
    protected readonly page: Page;
    readonly pageFooter: Locator;

    constructor(page: Page) {
        this.page = page;
        this.pageFooter = this.page.locator('c-gds-footer').getByRole('contentinfo');
    }

    abstract waitForPageToLoad(): Promise<void>;
}