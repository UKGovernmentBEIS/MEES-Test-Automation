import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { PenaltyCalculatorResultsPage } from './PenaltyCalculatorResultPage';

type LengthOfBreach = 'Less than 3 months' | 'More than 3 months';

export class PenaltyCalculatorPage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly rateableValueInput: Locator;
    private readonly calculateMaximumPenaltyButton: Locator;
    
    private async LengthOfBreachRadioButton(lengthOfBreach: LengthOfBreach): Promise<Locator> {
        return this.page.getByRole('radio', { name: lengthOfBreach });
    }

    constructor(page: Page) {
        super(page);
        this.pageContext = this.page.locator('#main-content');
        this.rateableValueInput = this.page.getByRole('textbox', { name: 'What is the rateable value of' })
        this.calculateMaximumPenaltyButton = this.page.getByRole('button', { name: 'Calculate maximum penalty' });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Penalty Calculator Page',
            {
                pageContext: this.pageContext,
            },);
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('penalty-calculator');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async getRateableValueErrorMessage(): Promise<Locator> {
        return this.page.locator('p.govuk-error-message');
    }

    async calculateMaximumPenalty(lengthOfBreach: LengthOfBreach, rateableValue: number): Promise<PenaltyCalculatorResultsPage> {
        // Select the length of breach radio button based on the input
        const lengthOfBreachRadioButton = await this.LengthOfBreachRadioButton(lengthOfBreach);
        await lengthOfBreachRadioButton.check();

        // Enter the rateable value
        await this.rateableValueInput.fill(rateableValue.toString());

        // Click the calculate button and navigate to the results page
        await this.calculateMaximumPenaltyButton.click();
        const penaltyCalculatorResultsPage = new PenaltyCalculatorResultsPage(this.page);
        await penaltyCalculatorResultsPage.waitForPageToLoad();
        return penaltyCalculatorResultsPage;
    }

    async clearRateableValue(): Promise<void> {
        await this.rateableValueInput.fill('');
    }

    async clickStartNewCalculation(): Promise<PenaltyCalculatorResultsPage | void> {
        await this.calculateMaximumPenaltyButton.click();

        // Check if the Penalty Calculator page is still displayed
        // If it is, this means there were validation errors and we should return void.
        // If not, it means we navigated to the results page and we should return a new instance of the PenaltyCalculatorResultsPage
        if (await this.isDisplayed()) {
            return;
        } else {
            const penaltyCalculatorResultsPage = new PenaltyCalculatorResultsPage(this.page);
            await penaltyCalculatorResultsPage.waitForPageToLoad();
            return penaltyCalculatorResultsPage;
        }
    }
}