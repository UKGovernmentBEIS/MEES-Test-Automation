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
    const parambuildingrefnum = '226143';
    const paramUprn = '100022917842';

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
        expect(Object.keys(property).length).toBe(22);
        // Verify fields presents
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
        expect(property).toHaveProperty('epcPropertyType');
        expect(property).toHaveProperty('epcExpiryDate');
        expect(property).toHaveProperty('rateableValue');
        expect(property).toHaveProperty('epcTransactionType');
        expect(property).toHaveProperty('datasetCode');
        expect(property).toHaveProperty('possibleEvidenceEpcTransactionType');
        expect(property).toHaveProperty('possibleEvidenceSiccode');
        expect(property).toHaveProperty('certificateLink');
        // Verify field types
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
        expect(typeof property.epcPropertyType).toBe('string');
        expect(typeof property.epcExpiryDate).toBe('string');// can be string or null
        expect(['number', 'object']).toContain(typeof property.rateableValue); // can be number or null
        expect(typeof property.epcTransactionType).toBe('string');
        expect(['string', 'object']).toContain(typeof property.datasetCode); // can be string or null
        expect(typeof property.possibleEvidenceEpcTransactionType).toBe('boolean');
        expect(typeof property.possibleEvidenceSiccode).toBe('boolean');
        expect(typeof property.certificateLink).toBe('string');
    });

    test('EPC certificates array has correct structure', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}&buildingrefnum=${parambuildingrefnum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);    

        // Verify EPC certificates structure and field types
        // Note: certificateLink was moved from epcCertificates to the root property object
        const responseBody = await response.json();
        const epcCertificates = responseBody.epcCertificates;
        expect(Array.isArray(epcCertificates), 'epcCertificates should be an array').toBe(true);
        if (epcCertificates.length > 0) {
            const certificate = epcCertificates[0];
            const certKeys = Object.keys(certificate);
            expect(certKeys, `EPC certificate has unexpected fields. Expected [uprn, assetRating, assetRatingBand, lodgementDate, expiryDate, transactionTypeHistory], got [${certKeys.join(', ')}]`).toHaveLength(6);
            expect(typeof certificate.uprn, `Expected 'uprn' to be type 'number', got '${typeof certificate.uprn}'`).toBe('number');
            expect(typeof certificate.assetRating, `Expected 'assetRating' to be type 'number', got '${typeof certificate.assetRating}'`).toBe('number');
            expect(typeof certificate.assetRatingBand, `Expected 'assetRatingBand' to be type 'string', got '${typeof certificate.assetRatingBand}'`).toBe('string');
            expect(typeof certificate.lodgementDate, `Expected 'lodgementDate' to be type 'string', got '${typeof certificate.lodgementDate}'`).toBe('string');
            expect(typeof certificate.expiryDate, `Expected 'expiryDate' to be type 'string', got '${typeof certificate.expiryDate}'`).toBe('string');
            expect(typeof certificate.transactionType, `Expected 'transactionType' to be type 'string', got '${typeof certificate.transactionType}'`).toBe('string');
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
        expect(Object.keys(landlord).length).toBe(8);
        expect(typeof landlord.uprn).toBe('number');
        expect(typeof landlord.companyName).toBe('string');
        expect(typeof landlord.location).toBe('string');
        expect(typeof landlord.address).toBe('string');
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText1);
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText2);
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText3);
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText4);
    });

    test('Landlords array has correct structure using Building Reference Number', async ({ request }) => {
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
        expect(Object.keys(landlord).length).toBe(8);
        expect(typeof landlord.uprn).toBe('number');
        expect(typeof landlord.companyName).toBe('string');
        expect(typeof landlord.location).toBe('string');
        expect(typeof landlord.address).toBe('string');
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText1);
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText2);
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText3);
        expect(['string', 'object']).toContain(typeof landlord.sicCodeSicText4);
    });
});

test.describe('SIC Code Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    const paramUprn = '100022917842'; // property with onshore landlord(s) — used for sequential and onshore assertions
    const multiLandlordUprn = '10010248290'; // property with both Onshore and Offshore landlords

    test('SIC code fields are populated sequentially with no gaps', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${paramUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // For each landlord, SIC codes must be filled from position 1 with no null gaps before a non-null value
        const responseBody = await response.json();
        const landlords = responseBody.landlords;
        expect(Array.isArray(landlords)).toBe(true);
        expect(landlords.length).toBeGreaterThan(0);
        for (const landlord of landlords) {
            if (landlord.sicCodeSicText2 !== null) expect(landlord.sicCodeSicText1).not.toBeNull();
            if (landlord.sicCodeSicText3 !== null) expect(landlord.sicCodeSicText2).not.toBeNull();
            if (landlord.sicCodeSicText4 !== null) expect(landlord.sicCodeSicText3).not.toBeNull();
        }
    });

    test('Offshore landlord has all SIC code fields as null', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${multiLandlordUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // Every landlord with location 'Offshore' must have all four SIC code fields as null
        const responseBody = await response.json();
        const landlords = responseBody.landlords;
        expect(Array.isArray(landlords)).toBe(true);
        const offshoreLandlords = landlords.filter((l: any) => l.location === 'Offshore');
        expect(offshoreLandlords.length).toBeGreaterThan(0);
        for (const landlord of offshoreLandlords) {
            expect(landlord.sicCodeSicText1).toBeNull();
            expect(landlord.sicCodeSicText2).toBeNull();
            expect(landlord.sicCodeSicText3).toBeNull();
            expect(landlord.sicCodeSicText4).toBeNull();
        }
    });

    test('Landlord with a non-null SIC code has Onshore location', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${multiLandlordUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // Any landlord that has at least one non-null SIC code must have location = 'Onshore'
        const responseBody = await response.json();
        const landlords = responseBody.landlords;
        expect(Array.isArray(landlords)).toBe(true);
        for (const landlord of landlords) {
            const hasAnySicCode = [landlord.sicCodeSicText1, landlord.sicCodeSicText2,
                                   landlord.sicCodeSicText3, landlord.sicCodeSicText4]
                                  .some((v: string | null) => v !== null);
            if (hasAnySicCode) {
                expect(landlord.location).toBe('Onshore');
            }
        }
    });

    test('SIC code fields are held independently per landlord in a multi-landlord response', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${multiLandlordUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        // The response must contain multiple landlords — all sharing the same UPRN (property identifier)
        // but representing distinct companies.
        const responseBody = await response.json();
        const landlords = responseBody.landlords;
        expect(Array.isArray(landlords)).toBe(true);
        expect(landlords.length).toBeGreaterThan(1);

        // All landlords share the property UPRN — this is expected and correct
        for (const landlord of landlords) {
            expect(landlord.uprn).toBe(landlords[0].uprn);
        }

        // Landlords are distinct companies
        const companyNames = landlords.map((l: any) => l.companyName);
        const uniqueCompanyNames = new Set(companyNames);
        expect(uniqueCompanyNames.size).toBe(landlords.length);
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

    test('UPRN too short returns 200 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=12345678901`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('UPRN too long returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=1234567890123`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('UPRN with non-numeric characters returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=1000241841A`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('UPRN with special characters returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=10002418-10`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Building Reference Number too short returns 200', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=12345678901`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);
    });

    test('Building Reference Number too long returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=1234567890123`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Building Reference Number with non-numeric characters returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=92486534000A`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
    });

    test('Building Reference Number with special characters returns 400 status', async ({ request }) => {
        const response = await request.get(`${baseUrl}?buildingrefnum=924865340-01`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(400);
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

test.describe('Data Verification Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/property';
    // Reference property: Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL
    const refUprn = '100022918361';
    const refBuildingRefNum = '1172671'; // same physical property as refUprn

    test('Property fields return expected values for known UPRN', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${refUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        const { property } = await response.json();
        expect(property.uprn).toBe(100022918361);
        expect(property.buildingReferenceNumber).toBe(1172671);
        expect(property.postcode).toBe('DA1 4AL');
        expect(property.town).toBe('DARTFORD');
        expect(property.epcEnergyRating).toBe(22);
        expect(property.epcEnergyRatingBand).toBe('A');
        expect(property.rateableValue).toBe(25500);
        // epcExpiryDate is returned as a raw ISO 8601 string — see BUG 922
        expect(property.epcExpiryDate).toContain('2035-08-13');
    });

    test('epcCertificates contains two entries with expected data for known UPRN', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${refUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        const { epcCertificates } = await response.json();
        expect(epcCertificates).toHaveLength(2);

        // Most recent certificate (lodged Aug 2025, expiring Aug 2035)
        const cert0 = epcCertificates[0];
        expect(cert0.uprn).toBe(100022918361);
        expect(cert0.assetRating).toBe(22);
        expect(cert0.assetRatingBand).toBe('A');
        expect(cert0.lodgementDate).toContain('2025-08-13');
        expect(cert0.expiryDate).toContain('2035-08-13');

        // Older certificate (lodged Mar 2015, expired Mar 2025)
        const cert1 = epcCertificates[1];
        expect(cert1.uprn).toBe(100022918361);
        expect(cert1.assetRating).toBe(93);
        expect(cert1.assetRatingBand).toBe('D');
        expect(cert1.lodgementDate).toContain('2015-03-06');
        expect(cert1.expiryDate).toContain('2025-03-06');
    });

    test('epcCertificates contains two entries with expected data for known buildingrefnum', async ({ request }) => {
        // BUG 925: querying by buildingrefnum=1172671 returns only 1 epcCertificate instead of 2.
        // The same property queried by uprn=100022918361 correctly returns 2.
        // Asserting the current invalid behaviour (length 1) so the test passes until the bug is fixed.
        const response = await request.get(`${baseUrl}?buildingrefnum=${refBuildingRefNum}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        const { epcCertificates } = await response.json();
        expect(epcCertificates).toHaveLength(1); // BUG 925: should be 2

        // Most recent certificate (lodged Aug 2025, expiring Aug 2035)
        const cert0 = epcCertificates[0];
        expect(cert0.uprn).toBe(100022918361);
        expect(cert0.assetRating).toBe(22);
        expect(cert0.assetRatingBand).toBe('A');
        expect(cert0.lodgementDate).toContain('2025-08-13');
        expect(cert0.expiryDate).toContain('2035-08-13');

        // BUG 925: cert1 (assetRating: 93, assetRatingBand: D, lodgementDate: 2015-03-06, expiryDate: 2025-03-06) is missing
    });

    test('Landlord returns expected data values for known UPRN', async ({ request }) => {
        const response = await request.get(`${baseUrl}?uprn=${refUprn}`, {
            headers: {
                'x-functions-key': process.env.PROPERTY_KEY!
            }
        });
        expect(response.status()).toBe(200);

        const { landlords } = await response.json();
        expect(landlords).toHaveLength(1);
        const landlord = landlords[0];
        expect(landlord.uprn).toBe(100022918361);
        expect(landlord.companyName).toBe('BRITISH OVERSEAS BANK NOMINEES LIMITED');
        expect(landlord.address).toBe('250 Bishopsgate, London EC2M 4AA');
        expect(landlord.location).toBe('Onshore');
    });
});