import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ElementUtilities } from '../../utils/ElementUtilities';
import type { FilterPropertiesPage } from './FilterPropertiesPage';
import type { PenaltyCalculatorPage } from './PenaltyCalculatorPage';
import type { SupportWhoAreYouPage } from './Support/SupportWhoAreYouPage';
import type { LandingPage } from '../LandingPage';
import type { GuidanceMainPage } from './Guidance/GuidanceMainPage';
import type { TemplatesPage } from './TemplatesPage';
import type { ProfileSettingsPage } from './ProfileSettings/ProfileSettingsPage';

export abstract class BaseCompliancePage extends BasePage {
    protected readonly page: Page;
    protected readonly pageHeaderLink: Locator;
    protected signOutButton: Locator;
    protected profileSettingsLink: Locator;
    protected feedbackLink: Locator;
    protected footerHelpLink: Locator;
    protected openGovernmentLicenceLink: Locator;
    protected tabPropertyRecords: Locator;
    protected tabGuidance: Locator;
    protected tabTemplates: Locator;
    protected tabPenaltyCalculator: Locator;

    constructor(page: Page) {
            super(page);
            this.page = page;
            this.pageHeaderLink = page.getByRole('link', { name: 'Check if non-domestic properties meet minimum energy efficiency standards' });
            this.signOutButton = this.page.getByRole('link', { name: 'Sign out' });
            this.profileSettingsLink = this.page.getByRole('link', { name: 'Profile settings' });
            this.feedbackLink = page.locator('.govuk-phase-banner').getByRole('link', { name: 'give your feedback by email' });
            this.footerHelpLink = this.page.getByRole('contentinfo').getByRole('link', { name: 'Help' });
            this.openGovernmentLicenceLink = page.getByRole('contentinfo').getByRole('link', { name: 'Open Government Licence v3.0' });
            this.tabPropertyRecords = page.getByRole('link', { name: 'Property records', exact: true })
            this.tabGuidance = page.getByRole('link', { name: 'Guidance', exact: true });
            this.tabTemplates = page.getByRole('link', { name: 'Templates', exact: true });
            this.tabPenaltyCalculator = page.getByRole('link', { name: 'Penalty calculator', exact: true });
    }

    // Wait for the Base Compliance Page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Base Compliance Page',
            {
                pageFooter: this.pageFooter,
                signOutButton: this.signOutButton,
                tabPropertyRecords: this.tabPropertyRecords,
                tabGuidance: this.tabGuidance,
                tabTemplates: this.tabTemplates,
                tabPenaltyCalculator: this.tabPenaltyCalculator
            });
    }

    async clickOnPropertyRecordsTab(): Promise<FilterPropertiesPage> {
        await this.tabPropertyRecords.click();
        const { FilterPropertiesPage } = await import('./FilterPropertiesPage');
        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    async clickOnPenaltyCalculatorTab(): Promise<PenaltyCalculatorPage> {
        await this.tabPenaltyCalculator.click();
        const { PenaltyCalculatorPage } = await import('./PenaltyCalculatorPage');
        const penaltyCalculatorPage = new PenaltyCalculatorPage(this.page);
        await penaltyCalculatorPage.waitForPageToLoad();
        return penaltyCalculatorPage;
    }

    async clickPageHeaderLink(): Promise<LandingPage> {
        await this.pageHeaderLink.click();
        const { LandingPage } = await import('../LandingPage');
        const landingPage = new LandingPage(this.page);
        await landingPage.waitForPageToLoad();
        return landingPage;
    }

    async clickPageHeaderLinkInNewTab(): Promise<LandingPage> {
        const newTab = await this.openLinkInNewTab(this.pageHeaderLink);
        const { LandingPage } = await import('../LandingPage');
        const landingPage = new LandingPage(newTab);
        await landingPage.waitForPageToLoad();
        return landingPage;
    }

    async isProfileSettingsLinkVisible(): Promise<boolean> {
        return this.profileSettingsLink.isVisible();
    }

    async clickProfileSettings(): Promise<ProfileSettingsPage> {
        await this.profileSettingsLink.click();
        const { ProfileSettingsPage } = require('./ProfileSettings/ProfileSettingsPage') as typeof import('./ProfileSettings/ProfileSettingsPage');
        const profileSettingsPage = new ProfileSettingsPage(this.page);
        await profileSettingsPage.waitForPageToLoad();
        return profileSettingsPage;
    }

    async clickProfileSettingsInNewTab(): Promise<ProfileSettingsPage> {
        const newTab = await this.openLinkInNewTab(this.profileSettingsLink);
        // See comment in clickProfileSettings() for why require() is used here.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ProfileSettingsPage } = require('./ProfileSettings/ProfileSettingsPage') as typeof import('./ProfileSettings/ProfileSettingsPage');
        const profileSettingsPage = new ProfileSettingsPage(newTab);
        await profileSettingsPage.waitForPageToLoad();
        return profileSettingsPage;
    }

    // The 'give your feedback by email' link is in the BETA phase banner on every compliance page.
    // It is a mailto: link — expose the locator so tests can verify its href properties.
    getFeedbackLink(): Locator {
        return this.feedbackLink;
    }

    // The 'Open Government Licence v3.0' link is in the footer and opens an external page in a new tab.
    async clickOpenGovernmentLicenceLink(): Promise<Page> {
        return this.openLinkInNewTab(this.openGovernmentLicenceLink);
    }

    async clickFooterHelpLink(): Promise<SupportWhoAreYouPage> {
        await this.footerHelpLink.click();
        const { SupportWhoAreYouPage } = await import('./Support/SupportWhoAreYouPage');
        const supportWhoAreYouPage = new SupportWhoAreYouPage(this.page);
        await supportWhoAreYouPage.waitForPageToLoad();
        return supportWhoAreYouPage;
    }

    async clickFooterHelpLinkInNewTab(): Promise<SupportWhoAreYouPage> {
        const newTab = await this.openLinkInNewTab(this.footerHelpLink);
        const { SupportWhoAreYouPage } = await import('./Support/SupportWhoAreYouPage');
        const supportWhoAreYouPage = new SupportWhoAreYouPage(newTab);
        await supportWhoAreYouPage.waitForPageToLoad();
        return supportWhoAreYouPage;
    }

    async clickOnPropertyRecordsTabInNewTab(): Promise<FilterPropertiesPage> {
        const newTab = await this.openLinkInNewTab(this.tabPropertyRecords);
        const { FilterPropertiesPage } = await import('./FilterPropertiesPage');
        const filterPropertiesPage = new FilterPropertiesPage(newTab);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    async clickOnGuidanceTabInNewTab(): Promise<GuidanceMainPage> {
        const newTab = await this.openLinkInNewTab(this.tabGuidance);
        const { GuidanceMainPage } = await import('./Guidance/GuidanceMainPage');
        const guidanceMainPage = new GuidanceMainPage(newTab);
        await guidanceMainPage.waitForPageToLoad();
        return guidanceMainPage;
    }

    async clickOnTemplatesTabInNewTab(): Promise<TemplatesPage> {
        const newTab = await this.openLinkInNewTab(this.tabTemplates);
        const { TemplatesPage } = await import('./TemplatesPage');
        const templatesPage = new TemplatesPage(newTab);
        await templatesPage.waitForPageToLoad();
        return templatesPage;
    }

    async clickOnPenaltyCalculatorTabInNewTab(): Promise<PenaltyCalculatorPage> {
        const newTab = await this.openLinkInNewTab(this.tabPenaltyCalculator);
        const { PenaltyCalculatorPage } = await import('./PenaltyCalculatorPage');
        const penaltyCalculatorPage = new PenaltyCalculatorPage(newTab);
        await penaltyCalculatorPage.waitForPageToLoad();
        return penaltyCalculatorPage;
    }

    protected async openLinkInNewTab(locator: Locator): Promise<Page> {
        const [newTab] = await Promise.all([
            this.page.context().waitForEvent('page'),
            locator.click({ button: 'middle' })
        ]);
        await newTab.waitForLoadState();
        return newTab;
    }
}