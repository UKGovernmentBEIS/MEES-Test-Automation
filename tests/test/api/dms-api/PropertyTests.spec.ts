import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    const paramUprn = '10002418410';

    test('Valid x-functions-key returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('Missing x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}`, {
            headers: {
                // Missing x-functions-key header
            }
        });
        expect([401, 403]).toContain(response.status());
    });

    test('Invalid x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}`, {
            headers: {
                'x-functions-key': 'invalid_key'
            }
        });
        expect([401, 403]).toContain(response.status());
    });
});

test.describe('Response Structure Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    const parambuildingrefnum = '924865340001';
    const paramUprn = '10002418410';

    test('Response returns valid JSON with correct top-level structure', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}&buildingrefnum=${parambuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // Verify response is valid JSON with expected top-level structure
        const responseBody = await response.json();
        expect(responseBody).toBeInstanceOf(Object);
        expect(responseBody).toHaveProperty('property');
        expect(responseBody.property).toBeInstanceOf(Object);
        expect(responseBody).toHaveProperty('epcCertificates');
        expect(responseBody.epcCertificates).toBeInstanceOf(Array);
        expect(responseBody).toHaveProperty('landlords');
        expect(responseBody.landlords).toBeInstanceOf(Array);
    });

    test('Property object contains all required fields with correct types', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}&buildingrefnum=${parambuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const property = responseBody.property;

        // Verify all expected property fields are present and have correct types
        expect(Object.keys(property).length).toBe(18);
        expect(property).toHaveProperty('uprn');
        expect(property).toHaveProperty('buildingReferenceNumber');
        expect(property).toHaveProperty('name');
        expect(property).toHaveProperty('number');
        expect(property).toHaveProperty('flatNameNumber');
        expect(property).toHaveProperty('line1');
        expect(property).toHaveProperty('line2');
        expect(property).toHaveProperty('line3');
        expect(property).toHaveProperty('town');
        expect(property).toHaveProperty('county');
        expect(property).toHaveProperty('postcode');
        expect(property).toHaveProperty('localAuthority');
        expect(property).toHaveProperty('epcEnergyRating');
        expect(property).toHaveProperty('epcEnergyRatingBand');
        expect(property).toHaveProperty('epcExpiryDate');
        expect(property).toHaveProperty('location');
        expect(property).toHaveProperty('rateableValue');
        expect(property).toHaveProperty('transactionType');
        expect(['number', 'object']).toContain(typeof property.uprn); // can be number or null
        expect(typeof property.buildingReferenceNumber).toBe('number');
        expect(['string', 'object']).toContain(typeof property.name); // can be string or null
        expect(['string', 'object']).toContain(typeof property.number); // can be string or null
        expect(['string', 'object']).toContain(typeof property.flatNameNumber); // can be string or null
        expect(['string', 'object']).toContain(typeof property.line1); // can be string or null
        expect(['string', 'object']).toContain(typeof property.line2); // can be string or null
        expect(['string', 'object']).toContain(typeof property.line3); // can be string or null
        expect(typeof property.town).toBe('string');
        expect(['string', 'object']).toContain(typeof property.county); // can be string or null
        expect(typeof property.postcode).toBe('string');
        expect(typeof property.localAuthority).toBe('string');
        expect(typeof property.epcEnergyRating).toBe('number');
        expect(typeof property.epcEnergyRatingBand).toBe('string');
        expect(typeof property.epcExpiryDate).toBe('string');
        expect(['string', 'object']).toContain(typeof property.location); // can be string or null
        expect(['number', 'object']).toContain(typeof property.rateableValue); // can be number or null
        expect(typeof property.transactionType).toBe('string');
    });

    test('EPC certificates array has correct structure', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}&buildingrefnum=${parambuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);    

        // Verify EPC certificates structure and field types
        const responseBody = await response.json();
        const epcCertificates = responseBody.epcCertificates;
        expect(Array.isArray(epcCertificates)).toBe(true);
        if (epcCertificates.length > 0) {
            const certificate = epcCertificates[0];
            expect(Object.keys(certificate).length).toBe(4);
            expect(typeof certificate.assetRating).toBe('number');
            expect(typeof certificate.assetRatingBand).toBe('string');
            expect(typeof certificate.lodgementDate).toBe('string');
            expect(typeof certificate.expiryDate).toBe('string');
        }
    });

    test('Landlords array has correct structure using UPRN', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // Verify landlords structure and field types
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('landlords');
        const landlords = responseBody.landlords;
        expect(Array.isArray(landlords)).toBe(true);
        expect(landlords.length).toBeGreaterThan(0);
        const landlord = landlords[0];
        expect(Object.keys(landlord).length).toBe(5);
        expect(typeof landlord.uprn).toBe('number');
        expect(typeof landlord.companyName).toBe('string');
        expect(typeof landlord.location).toBe('string');
        expect(typeof landlord.address).toBe('string');
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText); // can be string or null
    });

    // Bug: MEESALPHA-651 - Landlords array is empty when using Building Reference Number parameter
    test.skip('Landlords array has correct structure using Building Reference Number', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=${parambuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // Verify landlords structure and field types
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('landlords');
        const landlords = responseBody.landlords;
        expect(Array.isArray(landlords)).toBe(true);
        expect(landlords.length).toBeGreaterThan(0);
        const landlord = landlords[0];
        expect(Object.keys(landlord).length).toBe(5);
        expect(typeof landlord.uprn).toBe('number');
        expect(typeof landlord.companyName).toBe('string');
        expect(typeof landlord.location).toBe('string');
        expect(typeof landlord.address).toBe('string');
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText); // can be string or null
    });
});

test.describe('Parameter Validation Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    const validUprn = '10002418410';
    const validbuildingrefnum = '924865340001';

    test('Missing required parameters returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Invalid UPRN returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=invalid`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Invalid Building Reference Number returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=invalid`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Valid UPRN parameter return 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${validUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('Valid Building Reference Number parameter return 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=${validbuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('Valid UPRN and Building Reference Number parameters return 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${validUprn}&buildingrefnum=${validbuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('Empty UPRN parameter returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Empty Building Reference Number parameter returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('First valid UPRN followed by invalid Building Reference Number returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${validUprn}&buildingrefnum=invalid`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }        });
        expect(response.status()).toBe(200);
    });

    test('First valid Building Reference Number followed by invalid UPRN returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=${validbuildingrefnum}&uprn=invalid`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('First invalid UPRN followed by valid Building Reference Number returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=invalid&buildingrefnum=${validbuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('First invalid Building Reference Number followed by valid UPRN returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=invalid&uprn=${validUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });
});

test.describe('Edge Case Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    const paramUprn = '10002418410';
    const parambuildingrefnum = '924865340001';

    test('Invalid query parameter names handled gracefully', async ({ request }) => {
        const response = await request.get(`${baseUrl}?invalidparam=value`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('First valid uprn with invalid parameter', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}&invalidparam=value`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('First valid buildingrefnum with invalid parameter', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=${parambuildingrefnum}&invalidparam=value`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('First invalid parameter followed by valid uprn', async ({ request }) => {
        const response = await request.get(`${baseUrl}?invalidparam=value&uprn=${paramUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('First invalid parameter followed by valid buildingrefnum', async ({ request }) => {
        const response = await request.get(`${baseUrl}?invalidparam=value&buildingrefnum=${parambuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });
});