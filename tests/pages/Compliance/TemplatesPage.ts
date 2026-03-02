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
        contextLocators.push(...await this.paragraphList);
        contextLocators.push(...await this.templateList);

        return contextLocators;
    }
} 