import { Page, Locator } from '@playwright/test';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { BasePage } from '../BasePage';
import { ViewPropertiesPage } from './ViewPropertiesPage';

export class HomePage extends BasePage {
    private readonly pageContext: Locator;
    private readonly signOutButton: Locator;
    private readonly viewPropertiesLink: Locator;
    private readonly viewGuidanceLink: Locator;
    private readonly viewTemplatesLink: Locator;
    private readonly viewPenaltyCalculatorLink: Locator;
    private readonly tabPropertyRecords: Locator;
    private readonly tabGuidance: Locator;
    private readonly tabTemplates: Locator;
    private readonly tabPenaltyCalculator: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.signOutButton = page.getByRole('link', { name: 'Sign out' });
        this.viewPropertiesLink = page.getByRole('link', { name: 'View property records' });
        this.viewGuidanceLink = page.getByRole('link', { name: 'View guidance' });
        this.viewTemplatesLink = page.getByRole('link', { name: 'View templates' });
        this.viewPenaltyCalculatorLink = page.getByRole('link', { name: 'View penalty calculator' });
        this.tabPropertyRecords = page.getByRole('link', { name: 'Property records', exact: true })
        this.tabGuidance = page.getByRole('link', { name: 'Guidance', exact: true });
        this.tabTemplates = page.getByRole('link', { name: 'Templates', exact: true });
        this.tabPenaltyCalculator = page.getByRole('link', { name: 'Penalty calculator', exact: true });
    }

    // Wait for the Home Page page to load
    // Timeout set to 60 seconds, as this page generally loads slower
    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Home Page',
            {
                pageContext: this.pageContext,
                pageFooter: this.pageFooter,
                viewPropertiesButton: this.viewPropertiesLink,
                signOutButton: this.signOutButton,
                viewGuidanceButton: this.viewGuidanceLink,
                viewTemplatesButton: this.viewTemplatesLink,
                viewPenaltyCalculatorButton: this.viewPenaltyCalculatorLink,
                tabPropertyRecords: this.tabPropertyRecords,
                tabGuidance: this.tabGuidance,
                tabTemplates: this.tabTemplates,
                tabPenaltyCalculator: this.tabPenaltyCalculator
            },
            60000);
    }

    async isDisplayed(): Promise<boolean> {
        return await this.pageContext.isVisible();
    }

    getPageContextLocator(): Locator {
        return this.pageContext;
    }

    async clickViewProperties(): Promise<ViewPropertiesPage> {
        await this.viewPropertiesLink.click();
        const viewPropertiesPage = new ViewPropertiesPage(this.page);
        await viewPropertiesPage.waitForPageToLoad();
        return viewPropertiesPage;
    }


}