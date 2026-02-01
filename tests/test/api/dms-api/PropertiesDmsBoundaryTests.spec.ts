import { test, expect } from '@playwright/test';
import { PassThrough } from 'stream';

test.describe('Properties DMS Boundary Tests', () => {
    const baseUrl = process.env.DMS_URL
    const requestBody = {
        "lacodes": ["E06000009", "E06000011"],
        "town": "GOWDALL"
    };
    
    test('Valid x-functions-key returns 200 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}?page=1&size=10`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        
        expect(response.status()).toBe(200);
    });

    test('Response returns valid JSON with correct pagination structure', async ({ request }) => {
        const response = await request.post(`${baseUrl}?page=1&size=10`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        
        // Verify response is valid JSON
        const responseBody = await response.json();
        
        // Double parsing required: API returns JSON-encoded string instead of proper JSON object
        // response.json() parses the outer JSON layer returning a string, then JSON.parse() gets the actual data
        const parsedBody = JSON.parse(responseBody);
        
        // Verify expected JSON structure for properties response
        expect(Object.keys(parsedBody).length).toBe(5);
        expect(parsedBody).toHaveProperty('data');
        expect(parsedBody).toHaveProperty('page');
        expect(parsedBody).toHaveProperty('size');
        expect(parsedBody).toHaveProperty('total_records');
        expect(parsedBody).toHaveProperty('total_pages');
        
        // Verify data structure is array
        expect(Array.isArray(parsedBody.data)).toBe(true);
    });

    test('Response returns correct pagination values', async ({ request }) => {
        const response = await request.post(`${baseUrl}?page=1&size=10`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        
        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);
        
        expect(parsedBody.page).toBe(1);
        expect(parsedBody.size).toBe(10);
        expect(parsedBody.total_records).toBe(11);
        expect(parsedBody.total_pages).toBe(2);
    });

    test('Property objects contain all required fields', async ({ request }) => {
        const response = await request.post(`${baseUrl}?page=1&size=10`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.PROPERTIES_KEY!
            }
        });
        
        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);
        
        // Verify property structure if data exists
        expect(parsedBody.data.length).toBeGreaterThan(0);
        const property = parsedBody.data[0];
        
        // Verify all expected property fields are present
        expect(Object.keys(property).length).toBe(17);
        expect(property).toHaveProperty('Uprn');
        expect(property).toHaveProperty('BuildingReferenceNumber');
        expect(property).toHaveProperty('Name');
        expect(property).toHaveProperty('Number');
        expect(property).toHaveProperty('FlatNameNumber');
        expect(property).toHaveProperty('Line1');
        expect(property).toHaveProperty('Line2');
        expect(property).toHaveProperty('Line3');
        expect(property).toHaveProperty('Town');
        expect(property).toHaveProperty('County');
        expect(property).toHaveProperty('Postcode');
        expect(property).toHaveProperty('LocalAuthority');
        expect(property).toHaveProperty('EPCEnergyRating');
        expect(property).toHaveProperty('EPCEnergyRatingBand');
        expect(property).toHaveProperty('EPCExpiryDate');
        expect(property).toHaveProperty('Location');
        expect(property).toHaveProperty('RateableValue');
    });

    test('Missing x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.post(`${baseUrl}?page=1&size=10`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                // Missing x-functions-key header
            }
        });
        
        expect([401, 403]).toContain(response.status());
        
        // Verify error response doesn't expose sensitive details
        const responseText = await response.text();
        expect(responseText).not.toMatch(/stack|trace|exception|error.*path|internal|debug|sql|database/i);
    });

    test('Invalid x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.post(`${baseUrl}?page=1&size=10`, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': 'invalid-key-12345'
            }
        });
        
        expect([401, 403]).toContain(response.status());
        
        // Verify error response doesn't expose sensitive details
        const responseText = await response.text();
        expect(responseText).not.toMatch(/stack|trace|exception|error.*path|internal|debug|sql|database/i);
    });
});