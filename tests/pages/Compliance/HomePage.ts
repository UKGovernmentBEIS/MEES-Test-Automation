import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertyPage } from './FilterPropertyPage';

export class HomePage extends BaseCompliancePage {
    private readonly viewPropertiesLink: Locator;
    private readonly viewGuidanceLink: Locator;
    private readonly viewTemplatesLink: Locator;
    private readonly viewPenaltyCalculatorLink: Locator;
    

    constructor(page: Page) {
        super(page);
        this.viewPropertiesLink = page.getByRole('link', { name: 'View property records' });
        this.viewGuidanceLink = page.getByRole('link', { name: 'View guidance' });
        this.viewTemplatesLink = page.getByRole('link', { name: 'View templates' });
        this.viewPenaltyCalculatorLink = page.getByRole('link', { name: 'View penalty calculator' });
    }

    // Wait for the Home Page page to load
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Home Page',
            {
                viewGuidanceButton: this.viewGuidanceLink,
                viewTemplatesButton: this.viewTemplatesLink,
                viewPenaltyCalculatorButton: this.viewPenaltyCalculatorLink,
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }

    async clickViewProperties(): Promise<FilterPropertyPage> {
        await this.viewPropertiesLink.click();
        const filterPropertyPage = new FilterPropertyPage(this.page);
        await filterPropertyPage.waitForPageToLoad();
        return filterPropertyPage;
    }
}