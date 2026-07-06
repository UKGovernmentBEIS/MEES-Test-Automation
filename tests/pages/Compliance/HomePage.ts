import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { PenaltyCalculatorPage } from './PenaltyCalculatorPage';
import { TemplatesPage } from './TemplatesPage';
import { GuidanceMainPage } from './Guidance/GuidanceMainPage';
import { SupportWhoAreYouPage } from './Support/SupportWhoAreYouPage';

export class HomePage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly viewPropertiesLink: Locator;
    private readonly viewGuidanceLink: Locator;
    private readonly viewTemplatesLink: Locator;
    private readonly viewPenaltyCalculatorLink: Locator;
    private readonly viewSupportLink: Locator;
    

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.viewPropertiesLink = page.getByRole('link', { name: 'View property records' });
        this.viewGuidanceLink = page.getByRole('link', { name: 'View guidance' });
        this.viewTemplatesLink = page.getByRole('link', { name: 'View templates' });
        this.viewPenaltyCalculatorLink = page.getByRole('link', { name: 'View penalty calculator' });
        this.viewSupportLink = page.getByRole('link', { name: 'Support' });
    }

    // Wait for the Home Page page to load
    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Home Page',
            {
                pageContext: this.pageContext,
                viewGuidanceButton: this.viewGuidanceLink,
                viewTemplatesButton: this.viewTemplatesLink,
                viewPenaltyCalculatorButton: this.viewPenaltyCalculatorLink,
                viewSupportButton: this.viewSupportLink,
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('landing-page');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
    }

    async clickViewProperties(): Promise<FilterPropertiesPage> {
        await this.viewPropertiesLink.click();
        const filterPropertiesPage = new FilterPropertiesPage(this.page);
        await filterPropertiesPage.waitForPageToLoad();
        return filterPropertiesPage;
    }

    async clickViewPenaltyCalculator(): Promise<PenaltyCalculatorPage> {
        await this.viewPenaltyCalculatorLink.click();
        const penaltyCalculatorPage = new PenaltyCalculatorPage(this.page);
        await penaltyCalculatorPage.waitForPageToLoad();
        return penaltyCalculatorPage;
    }

    async clickViewTemplates(): Promise<TemplatesPage> {
        await this.viewTemplatesLink.click();
        const templatesPage = new TemplatesPage(this.page);
        await templatesPage.waitForPageToLoad();
        return templatesPage;
    }

    async clickGuidanceLink(): Promise<GuidanceMainPage> {
        await this.viewGuidanceLink.click();
        const guidanceMainPage = new GuidanceMainPage(this.page);
        await guidanceMainPage.waitForPageToLoad();
        return guidanceMainPage;
    }

    async clickRequestSupportLink(): Promise<SupportWhoAreYouPage> {
        await this.viewSupportLink.click();
        const supportWhoAreYouPage = new SupportWhoAreYouPage(this.page);
        await supportWhoAreYouPage.waitForPageToLoad();
        return supportWhoAreYouPage;
    }

    async clickViewPropertiesInNewTab(): Promise<FilterPropertiesPage> {
        const newTab = await this.openLinkInNewTab(this.viewPropertiesLink);
        const page = new FilterPropertiesPage(newTab);
        await page.waitForPageToLoad();
        return page;
    }

    async clickViewGuidanceLinkInNewTab(): Promise<GuidanceMainPage> {
        const newTab = await this.openLinkInNewTab(this.viewGuidanceLink);
        const page = new GuidanceMainPage(newTab);
        await page.waitForPageToLoad();
        return page;
    }

    async clickViewTemplatesInNewTab(): Promise<TemplatesPage> {
        const newTab = await this.openLinkInNewTab(this.viewTemplatesLink);
        const page = new TemplatesPage(newTab);
        await page.waitForPageToLoad();
        return page;
    }

    async clickViewPenaltyCalculatorInNewTab(): Promise<PenaltyCalculatorPage> {
        const newTab = await this.openLinkInNewTab(this.viewPenaltyCalculatorLink);
        const page = new PenaltyCalculatorPage(newTab);
        await page.waitForPageToLoad();
        return page;
    }

    async clickRequestSupportLinkInNewTab(): Promise<SupportWhoAreYouPage> {
        const newTab = await this.openLinkInNewTab(this.viewSupportLink);
        const supportWhoAreYouPage = new SupportWhoAreYouPage(newTab);
        await supportWhoAreYouPage.waitForPageToLoad();
        return supportWhoAreYouPage;
    }
}