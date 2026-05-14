import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { CheckContactDetailsPage } from './CheckContactDetailsPage';

export class ChangeContactDetailsPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly pageHeading: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly saveAndContinueButton: Locator;
    private readonly backLink: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.pageHeading = page.getByRole('heading', { name: 'Change your contact details', level: 1 });
        this.firstNameInput = page.getByRole('textbox', { name: 'First name' });
        this.lastNameInput = page.getByRole('textbox', { name: 'Last name' });
        this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' });
        this.backLink = page.getByRole('link', { name: 'Back', exact: true });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        // Not waiting on pageHeading — heading text matches the Profile Settings bug heading.
        // Rely on form fields to confirm the Change Contact Details page has rendered.
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Change Contact Details Page',
            {
                pageContext: this.pageContext,
                firstNameInput: this.firstNameInput,
                lastNameInput: this.lastNameInput,
                saveAndContinueButton: this.saveAndContinueButton,
            }
        );
    }

    async isDisplayed(): Promise<boolean> {
        try {
            await this.firstNameInput.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async getFirstNameValue(): Promise<string> {
        return this.firstNameInput.inputValue();
    }

    async getLastNameValue(): Promise<string> {
        return this.lastNameInput.inputValue();
    }

    async setFirstName(firstName: string): Promise<void> {
        await this.firstNameInput.clear();
        await ElementUtilities.fillText(this.firstNameInput, firstName);
    }

    async setLastName(lastName: string): Promise<void> {
        await this.lastNameInput.clear();
        await ElementUtilities.fillText(this.lastNameInput, lastName);
    }

    async clearFirstName(): Promise<void> {
        await this.firstNameInput.clear();
    }

    async clearLastName(): Promise<void> {
        await this.lastNameInput.fill('');
    }

    async getFirstNameError(): Promise<string> {
        return this.page.locator('#firstName-error, [id$="firstName-error"], .govuk-error-message')
            .filter({ hasText: /first name/i })
            .innerText();
    }

    async getLastNameError(): Promise<string> {
        return this.page.locator('#lastName-error, [id$="lastName-error"], .govuk-error-message')
            .filter({ hasText: /last name/i })
            .innerText();
    }

    async clickSaveAndContinue(): Promise<CheckContactDetailsPage> {
        await this.saveAndContinueButton.click();
        const checkContactDetailsPage = new CheckContactDetailsPage(this.page);
        await checkContactDetailsPage.waitForPageToLoad();
        return checkContactDetailsPage;
    }

    async clickBack(): Promise<ProfileSettingsPage> {
        await this.backLink.click();
        const profileSettingsPage = new ProfileSettingsPage(this.page);
        await profileSettingsPage.waitForPageToLoad();
        return profileSettingsPage;
    }
}
