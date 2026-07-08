import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { CookiesSettingsPage } from './CookiesSettingsPage';

export class CookiesBanner {
    private readonly page: Page;
    private readonly mainContext: Locator;
    private readonly acceptButton: Locator;
    private readonly rejectButton: Locator;
    private readonly viewCookiesLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.mainContext = page.locator('.govuk-cookie-banner__message');
        this.acceptButton = page.getByRole('button', { name: 'Accept analytics cookies' });
        this.rejectButton = page.getByRole('button', { name: 'Reject analytics cookies' });
        this.viewCookiesLink = page.getByRole('link', { name: 'View cookies' });
    }

    async waitForBannerToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Cookie Banner',
            {
                mainContext: this.mainContext,
                acceptButton: this.acceptButton,
                rejectButton: this.rejectButton,
                viewCookiesLink: this.viewCookiesLink,
            }
        );
    }

    async isDisplayed(): Promise<boolean> {
        try {
            await this.mainContext.waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.mainContext];
    }

    async clickAccept(): Promise<void> {
        await this.acceptButton.click();

        // Wait for the cookie banner to disappear after clicking "Accept"
        await this.mainContext.waitFor({ state: 'detached', timeout: 5000 });
    }

    async clickReject(): Promise<void> {
        await this.rejectButton.click();

        // Wait for the cookie banner to disappear after clicking "Reject"
        await this.mainContext.waitFor({ state: 'detached', timeout: 5000 });
    }

    async clickViewCookies(): Promise<CookiesSettingsPage> {
        await this.viewCookiesLink.click();

        // Wait for the Cookies Settings page to load after clicking "View cookies"
        const cookiesSettingsPage = new CookiesSettingsPage(this.page);
        await cookiesSettingsPage.waitForPageToLoad();
        return cookiesSettingsPage;
    }

    static async navigateToSettings(page: Page): Promise<CookiesSettingsPage> {
        const banner = new CookiesBanner(page);
        await banner.waitForBannerToLoad();
        return banner.clickViewCookies();
    }
}