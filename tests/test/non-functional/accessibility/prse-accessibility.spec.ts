import { test, expect } from '../../../fixtures/authFixtures';
import { HomePage } from '../../../pages/HomePage';
import { AccessibilityUtilities } from '../../../utils/AccessibilityUtilities';

test.describe('Accessibility Tests - PRSE Exemption Registration @accessibility', () => {
  
  test('Home page should have no critical accessibility violations', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Analyze accessibility
    const results = await AccessibilityUtilities.analyzeAccessibility(page);

    // Assert no critical violations
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
  });

  test('Contact Details page should be accessible', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const haveRegisteredExempPage = await homePage.clickStartNow_AuthenticatedUser();
    await haveRegisteredExempPage.selectNotRegisteredBefore();
    const landlordOrAgentPage = await haveRegisteredExempPage.clickContinue();

    await landlordOrAgentPage.selectLandlord();
    const individualOrOrganisationPage = await landlordOrAgentPage.clickContinue();

    await individualOrOrganisationPage.selectIndividual();
    await individualOrOrganisationPage.clickContinue();

    // Analyze accessibility on Contact Details page
    const results = await AccessibilityUtilities.analyzeAccessibility(page);

    // Assert no critical violations
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Contact Details page has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
  });

  test('Validation error panel should be accessible', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const haveRegisteredExempPage = await homePage.clickStartNow_AuthenticatedUser();
    await haveRegisteredExempPage.selectNotRegisteredBefore();
    const landlordOrAgentPage = await haveRegisteredExempPage.clickContinue();

    await landlordOrAgentPage.selectLandlord();
    const individualOrOrganisationPage = await landlordOrAgentPage.clickContinue();

    await individualOrOrganisationPage.selectIndividual();
    const contactDetailsPage = await individualOrOrganisationPage.clickContinue();

    // Submit incomplete form to trigger validation errors
    await contactDetailsPage.fillContactDetails('Test', 'User');
    await contactDetailsPage.clickContinue();

    // Wait for validation error panel
    expect(await contactDetailsPage.isValidationErrorPanelDisplayed()).toBeTruthy();

    // Analyze accessibility with error panel displayed
    const results = await AccessibilityUtilities.analyzeAccessibility(page);

    // Assert no critical violations
    const criticalViolations = AccessibilityUtilities.hasCriticalViolations(results.violations);
    expect(criticalViolations, `Error panel has critical accessibility violations:\n${AccessibilityUtilities.formatViolations(results.violations)}`).toBe(false);
  });

  test('Full user journey should maintain accessibility standards', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Check each step of the journey
    let results = await AccessibilityUtilities.analyzeAccessibility(page);
    expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 'Home page should be accessible').toBe(false);

    const haveRegisteredExempPage = await homePage.clickStartNow_AuthenticatedUser();
    results = await AccessibilityUtilities.analyzeAccessibility(page);
    expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 'Have Registered page should be accessible').toBe(false);

    await haveRegisteredExempPage.selectNotRegisteredBefore();
    const landlordOrAgentPage = await haveRegisteredExempPage.clickContinue();
    results = await AccessibilityUtilities.analyzeAccessibility(page);
    expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 'Landlord/Agent page should be accessible').toBe(false);

    await landlordOrAgentPage.selectLandlord();
    const individualOrOrganisationPage = await landlordOrAgentPage.clickContinue();
    results = await AccessibilityUtilities.analyzeAccessibility(page);
    expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 'Individual/Organisation page should be accessible').toBe(false);

    await individualOrOrganisationPage.selectIndividual();
    await individualOrOrganisationPage.clickContinue();
    results = await AccessibilityUtilities.analyzeAccessibility(page);
    expect(AccessibilityUtilities.hasCriticalViolations(results.violations), 'Contact Details page should be accessible').toBe(false);
  });
});
