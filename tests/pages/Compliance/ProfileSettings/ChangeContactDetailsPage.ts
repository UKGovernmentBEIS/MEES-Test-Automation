import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ProfileSettingsPage } from './ProfileSettingsPage';
import { CheckContactDetailsPage } from '../Support/CheckContactDetailsPage';

export class ChangeContactDetailsPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly pageHeading: Locator;
    private readonly firstNameHeading: Locator;
    private readonly lastNameHeading: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly saveAndContinueButton: Locator;
    private readonly backLink: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.pageHeading = page.getByRole('heading', { name: 'Change your contact details', level: 1 });
        this.firstNameHeading = page.getByRole('heading', { name: 'First name', level: 2 });
        this.lastNameHeading = page.getByRole('heading', { name: 'Last name', level: 2 });
        this.firstNameInput = page.getByRole('textbox', { name: 'First name' });
        this.lastNameInput = page.getByRole('textbox', { name: 'Last name' });
        this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' });
        this.backLink = page.getByRole('link', { name: 'Back', exact: true });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
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
        // Return only the static page structure. The first/last name textboxes are excluded
        // because they are pre-filled with the signed-in account's name, which is data-dependent
        // — consistent with the Filter Properties, Templates and Guidance page context scoping.
        return [
            this.backLink,
            this.pageHeading,
            this.firstNameHeading,
            this.lastNameHeading,
            this.saveAndContinueButton
        ];
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
        await this.firstNameInput.click({ clickCount: 3 });
        await this.firstNameInput.fill('');
    }

    async clearLastName(): Promise<void> {
        await this.lastNameInput.click({ clickCount: 3 });
        await this.lastNameInput.fill('');
    }

    getFirstNameError(): Locator {
        return this.page.locator('#firstName-error, [id$="firstName-error"], .govuk-error-message')
            .filter({ hasText: /first name/i });
    }

    getLastNameError(): Locator {
        return this.page.locator('#lastName-error, [id$="lastName-error"], .govuk-error-message')
            .filter({ hasText: /last name/i });
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
