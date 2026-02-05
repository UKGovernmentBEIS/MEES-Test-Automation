import { test, expect } from '@playwright/test';

test.describe('Local Authorities DMS API Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL
    
    test('Valid x-functions-key returns 200 status 2', async ({ request }) => {
        const response = await request.get(`${baseUrl}/mees/localauthorities`, {
            headers: {
                'x-functions-key': 'C6QGEfzPsfVH_pkYdZYsufQCRJjb5dnRzWCFinnPC5RPAzFuQ99jsQ=='
            }
        });
        
        expect(response.status()).toBe(200);
    });
});