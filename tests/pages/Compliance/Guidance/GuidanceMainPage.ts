import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from '../BaseCompliancePage';
import { ElementUtilities } from '../../../utils/ElementUtilities';
import { GuidanceHowPRSPropertiesAreIdentifiedPage } from './GuidanceHowPRSPropertiesAreIdentified';
import { GuidanceUnderstandingTheMEESRegulationsPage } from './GuidanceUnderstandingTheMEESRegulationsPage';
import { GuidanceUnderstandingComplianceNoticePage } from './GuidanceUnderstandComplianceNoticesPage';
import { GuidanceUnderstandingPenaltiesPage } from './GuidanceUnderstandingPenaltiesPage';
import { GuidanceEnforcementTimelinePage } from './GuidanceEnforcmentTimelinePage';
import { GuidanceUnderstandingPropertyDetailsAndDataSourcesPage } from './GuidanceUnderstandingPropertyDetailsAndDataSources';
import { PageName } from '../../../utils/TestTypes';
import { HomePage } from '../HomePage';

export const GuidanceArticles = {
    UNDERSTANDING_COMPLIANCE: 'Understanding compliance notices',
    UNDERSTANDING_PENALTIES: 'Understanding penalties',
    ENFORCEMENT_TIMELINE: 'Enforcement timeline',
    UNDERSTANDING_MEES_REGULATIONS: 'Understanding the MEES Regulations',
    HOW_PRS_PROPERTIES_ARE_IDENTIFIED: 'How PRS properties are identified',
    UNDERSTANDING_PROPERTY_DETAILS_AND_DATA_SOURCES: 'Understanding property details and data sources'
} as const;

export type GuidanceArticles = typeof GuidanceArticles[keyof typeof GuidanceArticles];

export class GuidanceMainPage extends BaseCompliancePage {
    private readonly breadcrumbHome: Locator;
    private readonly pageTitle: Locator;
    private readonly mainParagraph: Locator;
    private readonly mainParagraphWarning: Locator;
    private async guidanceArticleLink(article: GuidanceArticles): Promise<Locator> {
        return this.page.getByRole('link', { name: article });
    }

    async paragraphsLinks(paragraphName: string): Promise<Locator> {
        return this.page.locator(`//a[text()='${paragraphName}']`);
    }

    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.pageTitle = page.getByRole('heading', { name: 'Guidance' });
        this.mainParagraph = page.locator('//div[contains(@class,"govuk-grid-column-two-thirds")]/p');
        this.mainParagraphWarning = page.locator('#main-content .govuk-warning-text');
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
        const contextLocators = [this.pageTitle, this.mainParagraph, this.mainParagraphWarning];
        for (const article of Object.values(GuidanceArticles)) {
            const articleLink = await this.guidanceArticleLink(article);
            contextLocators.push(articleLink);
        }
        return contextLocators;
    }

    async clickGuidanceArticle(article: GuidanceArticles): Promise<
        GuidanceUnderstandingComplianceNoticePage | 
        GuidanceUnderstandingPenaltiesPage | 
        GuidanceEnforcementTimelinePage | 
        GuidanceUnderstandingTheMEESRegulationsPage | 
        GuidanceHowPRSPropertiesAreIdentifiedPage |
        GuidanceUnderstandingPropertyDetailsAndDataSourcesPage
    > {
        const articleLink = await this.guidanceArticleLink(article);
         await articleLink.click();
        switch (article) {
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
            case 'Understanding property details and data sources':
                const propertyDetailsPage = new GuidanceUnderstandingPropertyDetailsAndDataSourcesPage(this.page);
                await propertyDetailsPage.waitForPageToLoad();
                return propertyDetailsPage;
        }
    }

    getPageNameForGuidanceArticle(article: GuidanceArticles): PageName {
        switch (article) {
            case 'Understanding compliance notices':
                return PageName.UNDERSTANDING_COMPLIANCE_PAGE;
            case 'Understanding penalties':
                return PageName.UNDERSTANDING_PENALTIES_PAGE;
            case 'Enforcement timeline':
                return PageName.ENFORCEMENT_TIMELINE_PAGE;
            case 'Understanding the MEES Regulations':
                return PageName.UNDERSTANDING_MEES_REGULATIONS_PAGE;
            case 'How PRS properties are identified':
                return PageName.HOW_PRS_PROPERTIES_ARE_IDENTIFIED_PAGE;
            case 'Understanding property details and data sources':
                return PageName.UNDERSTANDING_PROPERTY_DETAILS_AND_DATA_SOURCES_PAGE;
            default:
                throw new Error(`No PageName mapping for guidance article: ${article}`);
        }
    }

    async clickHomeBreadcrumb(): Promise<HomePage> {
        await this.breadcrumbHome.click();
        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }
}