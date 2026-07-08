import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../../utils/ElementUtilities';

export class CookiesSettingsPage {
    private readonly page: Page;
    private readonly mainContext: Locator;
    private readonly pageHeaderLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.mainContext = page.locator('#main-content');
        this.pageHeaderLink = page.getByRole('link', { name: 'Check if non-domestic properties meet minimum energy efficiency standards' });
    }

    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Cookie Settings Page',
            {
                mainContext: this.mainContext,
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

    async clickPageHeaderLinkAsUnauthenticatedUser(): Promise<import('../../LandingPage').LandingPage> {
        await this.pageHeaderLink.click();
        const { LandingPage } = await import('../../LandingPage');
        const landingPage = new LandingPage(this.page);
        await landingPage.waitForPageToLoad();
        return landingPage;
    }

    async clickPageHeaderLinkAsUnauthenticatedUserInNewTab(): Promise<import('../../LandingPage').LandingPage> {
        const newTab = await this.openLinkInNewTab(this.pageHeaderLink);
        const { LandingPage } = await import('../../LandingPage');
        const landingPage = new LandingPage(newTab);
        await landingPage.waitForPageToLoad();
        return landingPage;
    }

    async clickPageHeaderLinkAsAuthenticatedUser(): Promise<import('../HomePage').HomePage> {
        await this.pageHeaderLink.click();
        const { HomePage } = await import('../HomePage');
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    async clickPageHeaderLinkAsAuthenticatedUserInNewTab(): Promise<import('../HomePage').HomePage> {
        const newTab = await this.openLinkInNewTab(this.pageHeaderLink);
        const { HomePage } = await import('../HomePage');
        const homePage = new HomePage(newTab);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    private async openLinkInNewTab(locator: Locator): Promise<Page> {
        const [newTab] = await Promise.all([
            this.page.context().waitForEvent('page'),
            locator.click({ button: 'middle' })
        ]);
        await newTab.waitForLoadState();
        return newTab;
    }
}