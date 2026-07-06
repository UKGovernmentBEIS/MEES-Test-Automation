import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../utils/ElementUtilities';
import { SignInOrCreatePage } from './Login/SignInOrCreatePage';

/**
 * The PRSE (Review exemptions for private rented sector energy standards) start page.
 * Unlike the MEES landing page, it uses a "Start now" button that leads into the
 * GOV.UK One Login sign-in flow.
 */
export class PRSELandingPage {
    private readonly page: Page;
    private readonly startNowButton: Locator;
    private readonly serviceHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.startNowButton = page.getByRole('button', { name: 'Start now' });
        this.serviceHeading = page.getByRole('heading', {
            name: 'Review exemptions for private rented sector energy standards',
            level: 1,
        });
    }

    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(this.page, 'PRSE Landing Page', {
            serviceHeading: this.serviceHeading,
            startNowButton: this.startNowButton,
        });
    }

    async clickStartNow(): Promise<SignInOrCreatePage> {
        await this.startNowButton.click();
        const signInOrCreatePage = new SignInOrCreatePage(this.page);
        await signInOrCreatePage.waitForPageToLoad();
        return signInOrCreatePage;
    }
}
