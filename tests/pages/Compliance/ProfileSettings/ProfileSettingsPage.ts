import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ChangeContactDetailsPage } from './ChangeContactDetailsPage';
import { HomePage } from '../HomePage';

export class ProfileSettingsPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly pageHeading: Locator;
    private readonly helpSection: Locator;
    private readonly helpLink: Locator;
    private readonly backLink: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.pageHeading = page.getByRole('heading', { name: 'Profile settings', level: 1 });
        this.helpSection = page.getByRole('heading', { name: 'If you need help' });
        this.helpLink = page.locator('#main-content').getByRole('link', { name: 'Help' });
        this.backLink = page.getByRole('link', { name: 'Back', exact: true });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Profile Settings Page',
            {
                pageContext: this.pageContext,
                pageHeading: this.pageHeading,
            }
        );
    }

    async isDisplayed(): Promise<boolean> {
        try {
            await this.pageHeading.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageHeading, this.helpSection];
    }

    async getContactDetailValue(fieldName: string): Promise<string> {
        return this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(fieldName, { exact: true }) })
            .locator('.govuk-summary-list__value')
            .innerText();
    }

    async isChangeLinkPresent(fieldName: string): Promise<boolean> {
        const row = this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(fieldName, { exact: true }) });
        try {
            await row.getByRole('link', { name: 'Change' }).waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async clickChangeFirstName(): Promise<ChangeContactDetailsPage> {
        const firstNameRow = this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText('First name', { exact: true }) });
        await firstNameRow.getByRole('link', { name: 'Change' }).click();
        const changeContactDetailsPage = new ChangeContactDetailsPage(this.page);
        await changeContactDetailsPage.waitForPageToLoad();
        return changeContactDetailsPage;
    }

    async getCouncilNames(): Promise<string[]> {
        // Councils are stored as a multi-line string in a single govuk-summary-list__value
        // where the key is "Councils". innerText() auto-waits for the element.
        const valueText = await this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText('Councils', { exact: true }) })
            .locator('.govuk-summary-list__value')
            .innerText();
        return valueText.trim().split('\n').map(c => c.trim()).filter(c => c.length > 0);
    }

    async isHelpLinkVisible(): Promise<boolean> {
        return this.helpLink.isVisible();
    }

    async isHelpSectionVisible(): Promise<boolean> {
        return this.helpSection.isVisible();
    }

    async isBackLinkVisible(): Promise<boolean> {
        try {
            await this.backLink.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async clickBack(): Promise<HomePage> {
        await this.backLink.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }
}
