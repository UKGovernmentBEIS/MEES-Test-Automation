import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { SupportContactFormPage } from './SupportContactFormPage';
import { HomePage } from '../HomePage';

export class SupportWhoAreYouPage extends BaseCompliancePage {
    private pageContext: Locator;
    protected readonly page: Page;
    private deznsRadioButton: Locator;
    private laRadioButton: Locator;
    private continueButton: Locator;
    private errorSelectOption: Locator;
    private backToHomePageButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.pageContext = page.locator('#main-content');
        this.deznsRadioButton = page.getByRole('radio', { name: 'Department for Energy Security and Net Zero official' });
        this.laRadioButton = page.getByRole('radio', { name: 'Local authority user' });
        this.continueButton = page.getByRole('button', { name: 'Continue' });
        this.errorSelectOption = page.locator('.govuk-error-message', { hasText: 'Please select one of the options' });
        this.backToHomePageButton = page.getByRole('link', { name: 'Back', exact: true });
    }

    // Wait for the Support Who Are You page to load
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'Support Who Are You Page', {
            pageContext: this.pageContext,
            deznsRadioButton: this.deznsRadioButton,
            laRadioButton: this.laRadioButton,
            continueButton: this.continueButton
        });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible() && 
            await this.deznsRadioButton.isVisible() && 
            await this.laRadioButton.isVisible() && 
            await this.continueButton.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    private readonly roles = {
        DEZNS: 'Department for Energy Security and Net Zero official',
        LA: 'Local authority user'
    };

    async selectRole(role: string): Promise<void> {
        switch (role) {
            case this.roles.DEZNS:
                await this.selectDeznsRadioButton();
                break;
            case this.roles.LA:
                await this.selectLaRadioButton();
                break;
            default:
                throw new Error(`Unsupported role: ${role}. Supported roles are: ${Object.values(this.roles).join(', ')}`);
        }
    }

    async selectDeznsRadioButton(): Promise<void> {
        await this.deznsRadioButton.click();
    }

    async selectLaRadioButton(): Promise<void> {
        await this.laRadioButton.click();
    }

    async clickContinueButton(): Promise<SupportContactFormPage> {
        await this.continueButton.click();
        return new SupportContactFormPage(this.page);
    }

    getErrorSelectOption(): Locator {
        return this.errorSelectOption;
    }

    async clickBackToHomePageButton(): Promise<HomePage> {
        await this.backToHomePageButton.click();
        return new HomePage(this.page);
    }
}