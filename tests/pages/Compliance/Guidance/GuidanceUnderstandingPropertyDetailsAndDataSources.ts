import { Page } from '@playwright/test';
import { BaseGuidancePage } from './BaseGuidancePage';

export class GuidanceUnderstandingPropertyDetailsAndDataSourcesPage extends BaseGuidancePage {
    constructor(page: Page) {
        super(page);
    }
}