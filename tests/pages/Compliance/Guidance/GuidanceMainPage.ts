import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { GuidanceHowPRSPropertiesAreIdentifiedPage } from './GuidanceHowPRSPropertiesAreIdentified';
import { GuidanceUnderstandingTheMEESRegulationsPage } from './GuidanceUnderstandingTheMEESRegulationsPage';
import { GuidanceUnderstandingComplianceNoticePage } from './GuidanceUnderstandComplianceNoticesPage';
import { GuidanceUnderstandingPenaltiesPage } from './GuidanceUnderstandingPenaltiesPage';
import { GuidanceEnforcementTimelinePage } from './GuidanceEnforcmentTimelinePage';
import { PageName } from '../../../utils/TestTypes';
import { HomePage } from '../HomePage';

export const TemplateTypes = {
    UNDERSTANDING_COMPLIANCE: 'Understanding compliance notices',
    UNDERSTANDING_PENALTIES: 'Understanding penalties',
    ENFORCEMENT_TIMELINE: 'Enforcement timeline',
    UNDERSTANDING_MEES_REGULATIONS: 'Understanding the MEES Regulations',
    HOW_PRS_PROPERTIES_ARE_IDENTIFIED: 'How PRS properties are identified'
} as const;

export type TemplateTypes = typeof TemplateTypes[keyof typeof TemplateTypes];

export class GuidanceMainPage extends BaseCompliancePage {
    private readonly pageContext: Locator;
    private readonly breadcrumbHome: Locator;
    private readonly pageTitle: Locator;
    
    private async templateLink(templateType: TemplateTypes): Promise<Locator> {
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
        return await this.pageTitle.isVisible()==true;
    }

    async getPageContextLocator(): Promise<Locator[]> {
        // Create an array of locators that represent the context of the page, such as the breadcrumb, page title, and main content
        const contextLocators: Locator[] = 
            [this.breadcrumbHome, this.pageTitle, this.pageContext];
        return contextLocators;
    }

    async clickTemplateLink(templateType: TemplateTypes): Promise<
        GuidanceUnderstandingComplianceNoticePage | 
        GuidanceUnderstandingPenaltiesPage | 
        GuidanceEnforcementTimelinePage | 
        GuidanceUnderstandingTheMEESRegulationsPage | 
        GuidanceHowPRSPropertiesAreIdentifiedPage
    > {
        const templateLink = await this.templateLink(templateType);
         await templateLink.click();
        switch (templateType) {
            case 'Understanding compliance notices':
                const page = new GuidanceUnderstandingComplianceNoticePage(this.page);
                await page.waitForPageToLoad();
                return page;
            case 'Understanding penalties':
                const penaltiesPage = new GuidanceUnderstandingPenaltiesPage(this.page);
                await penaltiesPage.waitForPageToLoad();
                return penaltiesPage;
            case 'Enforcement timeline':
                const timelinePage = new GuidanceEnforcementTimelinePage(this.page);
                await timelinePage.waitForPageToLoad();
                return timelinePage;
            case 'Understanding the MEES Regulations':
                const meesPage = new GuidanceUnderstandingTheMEESRegulationsPage(this.page);
                await meesPage.waitForPageToLoad();
                return meesPage;
            case 'How PRS properties are identified':
                const prsPropertiesPage = new GuidanceHowPRSPropertiesAreIdentifiedPage(this.page);
                await prsPropertiesPage.waitForPageToLoad();
                return prsPropertiesPage;
        }
    }

    getPageNameForTemplate(templateType: TemplateTypes): PageName {
        switch (templateType) {
            case TemplateTypes.UNDERSTANDING_COMPLIANCE:
                return PageName.UNDERSTANDING_COMPLIANCE_PAGE;
            case TemplateTypes.UNDERSTANDING_PENALTIES:
                return PageName.UNDERSTANDING_PENALTIES_PAGE;
            case TemplateTypes.ENFORCEMENT_TIMELINE:
                return PageName.ENFORCEMENT_TIMELINE_PAGE;
            case TemplateTypes.UNDERSTANDING_MEES_REGULATIONS:
                return PageName.UNDERSTANDING_MEES_REGULATIONS_PAGE;
            case TemplateTypes.HOW_PRS_PROPERTIES_ARE_IDENTIFIED:
                return PageName.HOW_PRS_PROPERTIES_ARE_IDENTIFIED_PAGE;
            default:
                throw new Error(`No PageName mapping for template type: ${templateType}`);
        }
    }

    async clickHomeBreadcrumb(): Promise<HomePage> {
        await this.breadcrumbHome.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }
}