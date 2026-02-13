import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';

export class HomePage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly viewPropertiesLink: Locator;
    private readonly viewGuidanceLink: Locator;
    private readonly viewTemplatesLink: Locator;
    private readonly viewPenaltyCalculatorLink: Locator;
    

    constructor(page: Page) {
        super(page);
        this.pageContext = this.page.locator('#main-content');
        this.viewPropertiesLink = this.page.getByRole('link', { name: 'View properties' });
        this.viewGuidanceLink = this.page.getByRole('link', { name: 'View guidance' });
        this.viewTemplatesLink = this.page.getByRole('link', { name: 'View templates' });
        this.viewPenaltyCalculatorLink = this.page.getByRole('link', { name: 'View penalty calculator' });
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