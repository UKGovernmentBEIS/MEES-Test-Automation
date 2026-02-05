import { test, expect } from '@playwright/test';

test.describe('Local Authorities DMS API Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/localauthorities';
    
    test('Valid x-functions-key returns 200 status 2', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.LOCAL_AUTHORITIES_KEY!
            }
        });
        
        expect(response.status()).toBe(200);
    });
});