import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { GuidanceWherePropertyInformationComesFromPage } from './GuidanceWherePropertyInformationComesFromPage';
import { GuidanceUnderstandingTheMEESRegulationsPage } from './GuidanceUnderstandingTheMEESRegulationsPage';
import { GuidanceUnderstandingComplianceNoticePage } from './GuidanceUnderstandComplianceNoticesPage';
import { GuidanceUnderstandingPenaltiesPage } from './GuidanceUnderstandingPenaltiesPage';
import { GuidanceEnforcementTimelinePage } from './GuidanceEnforcmentTimelinePage';

type TemplateType = 
    'Understanding compliance' | 
    'Understanding penalties' | 
    'Enforcement timeline' | 
    'Understanding the MEES regulations' | 
    'Where property information comes from';

export class GuidanceMainPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly breadcrumbHome: Locator;
    private readonly pageTitle: Locator;
    
    private async templateLink(templateType: TemplateType): Promise<Locator> {
        return this.page.getByRole('link', { name: templateType });
    }

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.pageTitle = page.getByRole('heading', { name: 'Guidance' });
        this.pageContext = page.locator('#main-content');

    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Guidance Main Page',
            { breadcrumbHome: this.breadcrumbHome, pageTitle: this.pageTitle });
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('guidance') && await this.pageTitle.isVisible();
    }

    async getPageContextLocator(): Promise<Locator[]> {
        // Create an array of locators that represent the context of the page, such as the breadcrumb, page title, and main content
        const contextLocators: Locator[] = 
            [this.breadcrumbHome, this.pageTitle, this.pageContext];
        return contextLocators;
    }

    async clickTemplateLink(templateType: TemplateType): Promise<
        GuidanceUnderstandingComplianceNoticePage | 
        GuidanceUnderstandingPenaltiesPage | 
        GuidanceEnforcementTimelinePage | 
        GuidanceUnderstandingTheMEESRegulationsPage | 
        GuidanceWherePropertyInformationComesFromPage
    > {
        const templateLink = await this.templateLink(templateType);
         await templateLink.click();
        switch (templateType) {
            case 'Understanding compliance':
                return new GuidanceUnderstandingComplianceNoticePage(this.page);
            case 'Understanding penalties':
                return new GuidanceUnderstandingPenaltiesPage(this.page);
            case 'Enforcement timeline':
                return new GuidanceEnforcementTimelinePage(this.page);
            case 'Understanding the MEES regulations':
                return new GuidanceUnderstandingTheMEESRegulationsPage(this.page);
            case 'Where property information comes from':
                return new GuidanceWherePropertyInformationComesFromPage(this.page);
        }
    }
}