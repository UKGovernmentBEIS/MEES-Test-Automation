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

    test('Verify error message is displayed when rateable value is invalid', async ({ page }) => {
        // Set the rateable value to an invalid value of -100 and verify that the appropriate error message is displayed
        await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', -100);
        await expect((await penaltyCalculatorPage.getRateableValueErrorMessage())).toHaveText('Error:Rateable value must be a number greater than 0');
    });

    test.describe('Penalty calculation boundary tests - Less than 3 months breach', () => {
        test('Just below boundary - Rateable Value £49,999 should return minimum penalty of £5,000', async ({ page }) => {
            // 10% of £49,999 = £4,999.90, which is below the £5,000 minimum, so the penalty is capped at £5,000
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 49999);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£5,000');
        });

        test('Just above boundary - Rateable Value £50,001 should return penalty of £5,000.10', async ({ page }) => {
            // 10% of £50,001 = £5,000.10, which exceeds the £5,000 minimum so the full 10% applies
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 50001);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£5,000.1');
        });

        test('On boundary - Rateable Value £50,000 should return penalty of £5,000', async ({ page }) => {
            // 10% of £50,000 = £5,000, which is exactly the minimum threshold
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 50000);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£5,000');
        });

        test('Just below maximum cap boundary - Rateable Value £499,999 should return penalty of £49,999.9', async ({ page }) => {
            // 10% of £499,999 = £49,999.90, which is just below the £50,000 cap so no cap is applied
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 499999);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£49,999.9');
        });

        test('On maximum cap boundary - Rateable Value £500,000 should return penalty of £50,000', async ({ page }) => {
            // 10% of £500,000 = £50,000, which is exactly at the maximum cap
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 500000);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£50,000');
        });

        test('Just above maximum cap boundary - Rateable Value £500,001 should return capped penalty of £50,000', async ({ page }) => {
            // 10% of £500,001 = £50,000.10, which exceeds the £50,000 cap so the penalty is capped at £50,000
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('Less than 3 months', 500001);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£50,000');
        });
    });

    test.describe('Penalty calculation boundary tests - More than 3 months breach', () => {
        test('Just below minimum boundary - Rateable Value £49,999 should return minimum penalty of £10,000', async ({ page }) => {
            // 20% of £49,999 = £9,999.80, which is below the £10,000 minimum, so the penalty is capped at £10,000
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 49999);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£10,000');
        });

        test('On minimum boundary - Rateable Value £50,000 should return penalty of £10,000', async ({ page }) => {
            // 20% of £50,000 = £10,000, which is exactly at the minimum threshold
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 50000);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£10,000');
        });

        test('Just above minimum boundary - Rateable Value £50,001 should return penalty of £10,000.20', async ({ page }) => {
            // 20% of £50,001 = £10,000.20, which exceeds the £10,000 minimum so the full 20% applies
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 50001);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£10,000.2');
        });

        test('Just below maximum cap boundary - Rateable Value £749,999 should return penalty of £149,999.80', async ({ page }) => {
            // 20% of £749,999 = £149,999.80, which is just below the £150,000 cap so no cap is applied
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 749999);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£149,999.8');
        });

        test('On maximum cap boundary - Rateable Value £750,000 should return penalty of £150,000', async ({ page }) => {
            // 20% of £750,000 = £150,000, which is exactly at the maximum cap
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 750000);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£150,000');
        });

        test('Just above maximum cap boundary - Rateable Value £750,001 should return capped penalty of £150,000', async ({ page }) => {
            // 20% of £750,001 = £150,000.20, which exceeds the £150,000 cap so the penalty is capped at £150,000
            const resultsPage = await penaltyCalculatorPage.calculateMaximumPenalty('More than 3 months', 750001);
            expect(await resultsPage.getPanaltyMaximumValue()).toContain('£150,000');
        });
    });
});