import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ElementUtilities } from '../../utils/ElementUtilities';

export abstract class BaseCompliancePage extends BasePage {
    protected readonly page: Page;
    protected signOutButton: Locator;
    protected tabPropertyRecords: Locator;
    protected tabGuidance: Locator;
    protected tabTemplates: Locator;
    protected tabPenaltyCalculator: Locator;
  
    constructor(page: Page) {
            super(page);
            this.page = page;
            this.signOutButton = this.page.getByRole('link', { name: 'Sign out' });
            this.tabPropertyRecords = page.getByRole('link', { name: 'Property records', exact: true })
            this.tabGuidance = page.getByRole('link', { name: 'Guidance', exact: true });
            this.tabTemplates = page.getByRole('link', { name: 'Templates', exact: true });
            this.tabPenaltyCalculator = page.getByRole('link', { name: 'Penalty calculator', exact: true });
    }

    // Wait for the Base Compliance Page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Base Compliance Page',
            {
                pageFooter: this.pageFooter,
                signOutButton: this.signOutButton,
                tabPropertyRecords: this.tabPropertyRecords,
                tabGuidance: this.tabGuidance,
                tabTemplates: this.tabTemplates,
                tabPenaltyCalculator: this.tabPenaltyCalculator
            });
    }
}