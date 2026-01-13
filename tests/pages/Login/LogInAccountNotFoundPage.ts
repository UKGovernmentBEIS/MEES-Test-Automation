import { Page } from "@playwright/test";
import { ElementUtilities } from "../../utils/ElementUtilities";

export class LogInAccountNotFoundPage {
    private readonly page: Page;
    private readonly createAnAccountButton;
    readonly pageContext;

    constructor(page: Page) {
        this.page = page;
        this.createAnAccountButton = page.getByRole('button', { name: 'Create a GOV.UK One Login' });
        this.pageContext = page.locator('#main-content');
    }

    async waitForPageToLoad(): Promise<void> {
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Log In Account Not Found Page',
            {
                createAnAccountButton: this.createAnAccountButton,
                pageContext: this.pageContext
            });
    }
}