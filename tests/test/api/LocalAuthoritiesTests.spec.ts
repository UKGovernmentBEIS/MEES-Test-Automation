import { test, expect } from '@playwright/test';

test.describe('Local Authorities DMS API Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/localauthorities';
    
    test('Valid x-functions-key returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.LOCAL_AUTHORITIES_KEY!
            }
        });
        
        expect(response.status()).toBe(200);
    });

    test('Response returns valid JSON with correct structure', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.LOCAL_AUTHORITIES_KEY!
            }
        });
        
        expect(response.status()).toBe(200);
        
        // Verify response is valid JSON array
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
    });

    test('Local authority objects contain all required fields', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.LOCAL_AUTHORITIES_KEY!
            }
        });
        
        const responseBody = await response.json();
        
        // Verify local authority structure
        expect(responseBody.length).toBeGreaterThan(0);
        const localAuthority = responseBody[0];
        
        // Verify all expected local authority fields are present
        expect(Object.keys(localAuthority).length).toBe(2);
        expect(localAuthority).toHaveProperty('Name');
        expect(localAuthority).toHaveProperty('Code');
        
        // Verify field types
        expect(typeof localAuthority.Name).toBe('string');
        expect(typeof localAuthority.Code).toBe('string');
        expect(localAuthority.Name.length).toBeGreaterThan(0);
        expect(localAuthority.Code.length).toBeGreaterThan(0);
    });

    test('Missing x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                // Missing x-functions-key header
            }
        });
        
        expect([401, 403]).toContain(response.status());
    });

    test('Invalid x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': 'invalid-key-12345'
            }
        });
        
        expect([401, 403]).toContain(response.status());
    });
});