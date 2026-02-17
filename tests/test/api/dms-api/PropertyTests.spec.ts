import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    const paramBuildingRefNumber = '924865340001';
    const paramUprn = '10002418410';

    test('Valid x-functions-key returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });
});