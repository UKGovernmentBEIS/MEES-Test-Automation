import { Page } from "@playwright/test";
import { BasePasswordPage } from "./BasePages/BasePasswordPage";

export class ExistingEmailRegistrationPage extends BasePasswordPage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }
}