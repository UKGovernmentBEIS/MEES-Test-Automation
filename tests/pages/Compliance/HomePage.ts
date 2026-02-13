import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';

export class HomePage extends BaseCompliancePage {
    private pageContext: Locator = this.page.locator('#main-content');
    private readonly viewPropertiesLink: Locator = this.page.getByRole('link', { name: 'View properties' });
    private readonly viewGuidanceLink: Locator = this.page.getByRole('link', { name: 'View guidance' });
    private readonly viewTemplatesLink: Locator = this.page.getByRole('link', { name: 'View templates' });
    private readonly viewPenaltyCalculatorLink: Locator = this.page.getByRole('link', { name: 'View penalty calculator' });
    

    constructor(page: Page) {
        super(page);
    }

    // Wait for the Home Page page to load
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Home Page',
            {
                pageContext: this.pageContext,
                viewGuidanceButton: this.viewGuidanceLink,
                viewTemplatesButton: this.viewTemplatesLink,
                viewPenaltyCalculatorButton: this.viewPenaltyCalculatorLink,
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        this.waitForPageToLoad();
        return true;
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }

    async clickViewProperties(): Promise<FilterPropertiesPage> {
        await this.viewPropertiesLink.click();
        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }
}