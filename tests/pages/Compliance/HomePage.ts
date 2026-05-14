import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BaseCompliancePage } from './BaseCompliancePage';
import { FilterPropertiesPage } from './FilterPropertiesPage';
import { PenaltyCalculatorPage } from './PenaltyCalculatorPage';
import { TemplatesPage } from './TemplatesPage';
import { GuidanceMainPage } from './Guidance/GuidanceMainPage';

export class HomePage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly viewPropertiesLink: Locator;
    private readonly viewGuidanceLink: Locator;
    private readonly viewTemplatesLink: Locator;
    private readonly viewPenaltyCalculatorLink: Locator;
    

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.viewPropertiesLink = page.getByRole('link', { name: 'View property records' });
        this.viewGuidanceLink = page.getByRole('link', { name: 'View guidance' });
        this.viewTemplatesLink = page.getByRole('link', { name: 'View templates' });
        this.viewPenaltyCalculatorLink = page.getByRole('link', { name: 'View penalty calculator' });
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
}