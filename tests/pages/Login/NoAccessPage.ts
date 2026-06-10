import { Page, Locator } from "@playwright/test";
import { ElementUtilities } from "../../utils/ElementUtilities";

export class NoAccessPage {
    private readonly page: Page;
    private readonly headingMessage: Locator;
    pageContext: Locator;

    constructor(page: Page) {
        this.page = page;
        this.headingMessage = this.page.getByText('You do not have access to this service');
        this.pageContext = page.locator('#main-content');
    }

    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'No Access Page',
            {
                headingMessage: this.headingMessage,
                pageContext: this.pageContext
            },
            60000);
    }
}