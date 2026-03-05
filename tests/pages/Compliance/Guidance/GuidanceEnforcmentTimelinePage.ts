import { Page} from '@playwright/test';
import { BaseGuidancePage } from './BaseGuidancePage';

export class GuidanceEnforcementTimelinePage extends BaseGuidancePage {
    constructor(page: Page) {
        super(page);
    }
}