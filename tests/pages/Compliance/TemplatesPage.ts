import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class TemplatesPage extends BaseCompliancePage {
    private readonly breadcrumbHome: Locator;
    private readonly paragraphList: Promise<Locator[]>;
    private readonly templateList: Promise<Locator[]>;


    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.paragraphList = page.locator('.govuk-grid-column-two-thirds>p').all();
        this.templateList = page.locator('.template-list>div').all();
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Templates Page',
            {
                breadcrumbHome: this.breadcrumbHome
            });
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('templates');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        // Create an array of locators that represent the context of the page, such as the breadcrumb, paragraphs, and template list
        const contextLocators: Locator[] = [this.breadcrumbHome];
        
        // Get fresh locators each time to ensure we get current page state
        const paragraphs = await this.page.locator('.govuk-grid-column-three-quarters>p').all();
        const templates = await this.page.locator('.template-list>div').all();
        
        // Add all paragraph locators
        if (paragraphs.length > 0) {
            contextLocators.push(...paragraphs);
        }
        
        // Add all template locators  
        if (templates.length > 0) {
            contextLocators.push(...templates);
        }

        return contextLocators;
    }
} 