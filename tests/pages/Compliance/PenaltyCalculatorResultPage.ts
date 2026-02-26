import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class PenaltyCalculatorResultsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly maximumPenaltyValue: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = this.page.locator('#main-content');
        this.maximumPenaltyValue = this.page.locator('.penalty-amount');
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Penalty Calculator Results Page',
            {
                pageContext: this.pageContext,
            },);
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('penalty-calculator-results');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async getPanaltyMaximumValue(): Promise<string> {
        const maximumPenaltyValue = await this.maximumPenaltyValue.innerText();
        return maximumPenaltyValue;
    }
}