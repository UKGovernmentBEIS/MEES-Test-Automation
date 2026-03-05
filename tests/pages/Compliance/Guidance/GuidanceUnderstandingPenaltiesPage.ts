import { Page, Locator } from '@playwright/test';
import { BaseGuidancePage } from './BaseGuidancePage';

export class GuidanceUnderstandingPenaltiesPage extends BaseGuidancePage {
    constructor(page: Page) {
        super(page);
    }
}