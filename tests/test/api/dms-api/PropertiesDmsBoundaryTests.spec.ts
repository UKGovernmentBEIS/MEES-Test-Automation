import { test, expect } from '@playwright/test';

test.describe('Properties DMS Boundary Tests', () => {
    
    test('Valid x-functions-key returns 200', async ({ request }) => {
        const response = await request.post('https://func-webportal-mees-api-bextuat-005.azurewebsites.net/mees/properties?page=1&size=10', {
            data: {
                "lacodes": ["E06000009", "E06000011"],
                "town": "GOWDALL"
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        
        expect(response.status()).toBe(200);
    });
});