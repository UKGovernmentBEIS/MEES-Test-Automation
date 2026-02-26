import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PenaltyCalculatorPage } from './PenaltyCalculatorPage';

export class PenaltyCalculatorResultsPage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly maximumPenaltyValue: Locator;
    private readonly changeLengthOfBreachLink: Locator;
    private readonly changeRateableValueLink: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = this.page.locator('#main-content');
        this.maximumPenaltyValue = this.page.locator('.penalty-amount');
        this.changeLengthOfBreachLink = this.page.getByRole('link', { name: 'Change length of breach' })
        this.changeRateableValueLink = this.page.getByRole('link', { name: 'Change rateable value' })
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

    async clickChangeLengthOfBreach(): Promise<PenaltyCalculatorPage> {
        await this.changeLengthOfBreachLink.click();
        const penaltyCalculatorPage = new PenaltyCalculatorPage(this.page);
        await penaltyCalculatorPage.waitForPageToLoad();
        return penaltyCalculatorPage;
    }

    async clickChangeRateableValue(): Promise<PenaltyCalculatorPage> {
        await this.changeRateableValueLink.click();
        const penaltyCalculatorPage = new PenaltyCalculatorPage(this.page);
        await penaltyCalculatorPage.waitForPageToLoad();
        return penaltyCalculatorPage;
    }

}