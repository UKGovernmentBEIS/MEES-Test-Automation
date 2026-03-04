import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class TemplatesPage extends BaseCompliancePage {
    private readonly breadcrumbHome: Locator;
    private readonly paragraphList: Promise<Locator[]>;
    private readonly publisherInformation: Locator;
    private readonly templateList: Promise<Locator[]>;


    constructor(page: Page) {
        super(page);
        this.breadcrumbHome = page.getByRole('link', { name: 'Home' });
        this.paragraphList = page.locator('.govuk-grid-column-three-quarters>p').all();
        this.publisherInformation = page.locator('.govuk-grid-column-three-quarters>.templates-metadata');
        this.templateList = page.locator('.template-list>div').all();
    }

    async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();

        // Create an object of locators to wait for, starting with the breadcrumb 
        // and then adding the paragraph and template locators
        let locators: Record<string, Locator> = { breadcrumbHome: this.breadcrumbHome };
        // Add paragraph locators to the array
        const paragraphs = await this.paragraphList;
        if (paragraphs.length > 0) {
            paragraphs.forEach((paragraph, index) => {
                locators[`paragraph${index}`] = paragraph;
            });
        }
        // Add publisher information locator
        locators['publisherInformation'] = this.publisherInformation;
        // Add template locators to the array
        const templates = await this.templateList;
        if (templates.length > 0) {
            templates.forEach((template, index) => {
                locators[`template${index}`] = template;
            });
        }

        // Wait for all locators to be visible on the page
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Templates Page',
            locators);
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

        // Add publisher information locator
        contextLocators.push(this.publisherInformation);
        
        // Add all template locators  
        if (templates.length > 0) {
            contextLocators.push(...templates);
        }

        return contextLocators;
    }

    async getPublisherInformationLink(): Promise<string> {
        const link: Locator = this.publisherInformation.locator('p>a');
        const href = await link.getAttribute('href');
        return href?.trim() || '';
    }
} 