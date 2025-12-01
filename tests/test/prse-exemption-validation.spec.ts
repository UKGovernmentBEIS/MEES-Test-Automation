import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('PRSE Exemptions Registration Test', () => {
  test('Validation error on incomplete contact details', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const haveRegisteredExempPage = await homePage.clickStartNow_AuthenticatedUser();
    await haveRegisteredExempPage.selectNotRegisteredBefore();
    const landlordOrAgentPage = await haveRegisteredExempPage.clickContinue();

    await landlordOrAgentPage.selectLandlord();
    const individualOrOrganisationPage = await landlordOrAgentPage.clickContinue();

    await individualOrOrganisationPage.selectIndividual();
    const contactDetailsPage = await individualOrOrganisationPage.clickContinue();

    await contactDetailsPage.fillContactDetails('Test', 'User');
    await contactDetailsPage.clickContinue();
    expect(await contactDetailsPage.isValidationErrorPanelDisplayed()).toBeTruthy();
  });
});
