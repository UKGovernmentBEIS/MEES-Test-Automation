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
        // On UAT, "Start now" first hits a Salesforce SSO redirect
        // (/PRSELocalAuthority/login -> LAOneLogin) before landing on GOV.UK One Login, which can
        // take a few seconds; on QA it goes straight there. Wait for One Login before proceeding so
        // the intermediate redirect has time to complete.
        await this.page.waitForURL(/sign-in-or-create|signin\.integration\.account\.gov\.uk/, { timeout: 45000 });

        const signInOrCreatePage = new SignInOrCreatePage(this.page);
        await signInOrCreatePage.waitForPageToLoad();
        return signInOrCreatePage;
    }
}
