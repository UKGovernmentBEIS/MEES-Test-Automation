import { Page, Locator } from '@playwright/test';
import { BaseGuidancePage } from './BaseGuidancePage';

export class GuidanceWherePropertyInformationComesFromPage extends BaseGuidancePage {
    constructor(page: Page) {
        super(page);
    }
}