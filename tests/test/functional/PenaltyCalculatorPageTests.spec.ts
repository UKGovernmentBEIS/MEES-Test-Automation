import { expect, test } from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { TestType, TestAnnotations } from '../../utils/TestTypes';
import { PenaltyCalculatorPage } from '../../pages/Compliance/PenaltyCalculatorPage';

test.describe('Penalty Calculator Page Functional Tests', () => {
    let penaltyCalculatorPage: PenaltyCalculatorPage;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.annotations.push(
            TestAnnotations.testType(TestType.FUNCTIONAL)
        );

        const landingPage = new LandingPage(page);
        await landingPage.navigate();
        const homePage = await landingPage.clickSignIn_AuthenticatedUser();
        penaltyCalculatorPage = await homePage.clickViewPenaltyCalculator();
    });

    test('Penalty Calculator page loads successfully', async ({ page }) => {
        expect(await penaltyCalculatorPage.isDisplayed()).toBe(true);
    });

    test('Verify penalty caclculation functionality', async ({ page }) => {
        let penaltyCalculatorResultsPage;

        // Select length of breach as "Less than 3 months" and enter rateable value of 1000
        // Verify that the calculated maximum penalty is £5,000
        penaltyCalculatorResultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 1000);
        expect(await penaltyCalculatorResultsPage.getPanaltyMaximumValue()).toContain('£5,000');

        // // Navigate back to the penalty calculator by clicking the 'Change' link for the length of breach
        // penaltyCalculatorPage = await penaltyCalculatorResultsPage.clickChangeLengthOfBreach();

        // // Select length of breach as "More than 3 months"
        // // Verify that the calculated maximum penalty is £10,000
        // penaltyCalculatorResultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 1000);
        // expect(await penaltyCalculatorResultsPage.getPanaltyMaximumValue()).toContain('£10,000');

        // // Navigate back to the penalty calculator by clicking the 'Change' link for the Rateable Value
        // penaltyCalculatorPage = await penaltyCalculatorResultsPage.clickChangeRateableValue();

        // // Select the rateable value as 10000
        // penaltyCalculatorResultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 10000);
        // expect(await penaltyCalculatorResultsPage.getPanaltyMaximumValue()).toContain('£100,000');
    });
});