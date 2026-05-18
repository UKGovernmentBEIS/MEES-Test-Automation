import { Page, Locator } from '@playwright/test';
import { BaseGuidancePage } from './BaseGuidancePage';

export class GuidanceHowPRSPropertiesAreIdentifiedPage extends BaseGuidancePage {
    private readonly energyEfficiencyRegulationsLink: Locator;

    constructor(page: Page) {
        super(page);
        this.energyEfficiencyRegulationsLink = this.page.getByRole('link', { name: /Energy Efficiency \(Private Rented Property\)/ });
    }

    async clickEnergyEfficiencyRegulationsLinkAndGetNewTab(): Promise<Page> {
        const [newTab] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.energyEfficiencyRegulationsLink.click()
        ]);
        await newTab.waitForLoadState();
        return newTab;
    }
}