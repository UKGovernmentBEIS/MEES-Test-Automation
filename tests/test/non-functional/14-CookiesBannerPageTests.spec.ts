import { expect, test} from '../../fixtures/authFixtures';
import { LandingPage } from '../../pages/LandingPage';
import { CookiesBanner } from '../../pages/Compliance/Cookies/CookiesBanner';
import { PageName } from '../../utils/TestTypes';
import { BaseNonFunctionalTest } from '../../utils/BaseNonFunctionalTest';

test.describe('Cookies Banner and Cookies Settings Page Non-Functional Tests', () => {

    test('Verify that the cookies banner context and accessibility', async ({ page }, testInfo) => {
        const baseTest: BaseNonFunctionalTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.COOKIES_BANNER);

        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const cookiesBanner = new CookiesBanner(page);
        await cookiesBanner.waitForBannerToLoad();
        expect(await cookiesBanner.isDisplayed()).toBeTruthy();

        // Verify accessibility on the Cookies Banner
        await baseTest.verifyAccessibility(PageName.COOKIES_BANNER);

        // Verify page context on the Cookies Banner
        const locators = await cookiesBanner.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });

    test('Verify that the cookies settings page context and accessibility', async ({ page }, testInfo) => {
        const baseTest: BaseNonFunctionalTest = new BaseNonFunctionalTest(page, testInfo);
        baseTest.addTestAnnotations(PageName.COOKIES_SETTINGS_PAGE);

        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.navigate();
        const cookiesBanner = new CookiesBanner(page);
        await cookiesBanner.waitForBannerToLoad();
        expect(await cookiesBanner.isDisplayed()).toBeTruthy();

        // Click on the "View cookies" link to navigate to the Cookies Settings page
        const cookiesSettingsPage = await cookiesBanner.clickViewCookies();
        expect(await cookiesSettingsPage.isDisplayed()).toBeTruthy();

        // Verify accessibility on the Cookies Settings page
        await baseTest.verifyAccessibility(PageName.COOKIES_SETTINGS_PAGE);

        // Verify page context on the Cookies Settings page
        const locators = await cookiesSettingsPage.getPageContextLocator();
        await baseTest.verifyContextWithLocators(locators);
    });
});