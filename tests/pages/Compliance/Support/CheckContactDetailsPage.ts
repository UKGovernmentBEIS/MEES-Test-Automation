import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ChangeContactDetailsPage } from './ChangeContactDetailsPage';
import { ContactDetailsConfirmationPage } from './ContactDetailsConfirmationPage';

export class CheckContactDetailsPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly pageHeading: Locator;
    private readonly confirmAndSaveButton: Locator;
    private readonly backLink: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.pageHeading = page.getByRole('heading', { name: 'Check your contact details', level: 2 });
        this.confirmAndSaveButton = page.getByRole('button', { name: 'Confirm and save' });
        this.backLink = page.getByRole('link', { name: 'Back', exact: true });
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        // Not waiting on pageHeading — the app may not render the h1 quickly enough.
        // Rely on confirmAndSaveButton to confirm the Check Contact Details page has rendered.
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Check Contact Details Page',
            {
                pageContext: this.pageContext,
                confirmAndSaveButton: this.confirmAndSaveButton,
            }
        );
    }

    async isDisplayed(): Promise<boolean> {
        try {
            await this.confirmAndSaveButton.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageHeading, this.confirmAndSaveButton];
    }

    async getContactDetailValue(fieldName: string): Promise<string> {
        return this.page.locator('.govuk-summary-list__row')
            .filter({ has: this.page.locator('.govuk-summary-list__key').getByText(fieldName, { exact: true }) })
            .locator('.govuk-summary-list__value')
            .innerText();
    }

    async clickConfirmAndSave(): Promise<ContactDetailsConfirmationPage> {
        await this.confirmAndSaveButton.click();
        const confirmationPage = new ContactDetailsConfirmationPage(this.page);
        await confirmationPage.waitForPageToLoad();
        return confirmationPage;
    }

    async clickBack(): Promise<ChangeContactDetailsPage> {
        await this.backLink.click();
        const changeContactDetailsPage = new ChangeContactDetailsPage(this.page);
        await changeContactDetailsPage.waitForPageToLoad();
        return changeContactDetailsPage;
    }
}
