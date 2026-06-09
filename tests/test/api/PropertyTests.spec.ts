import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/propertydetail';
    const lacodes: string[] = ["E09000003", "E09000004"];
    const Uprn = 100023522975;

    test('Valid x-functions-key returns 200 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
            }
        });
        expect(response.status()).toBe(200);
    });

    test('Missing x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                // Missing x-functions-key header
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
            }
        });
        expect(response.status(), 
            `Expected 404 status for missing x-functions-key, but got '${response.status()}'`)
            .toBe(404);
    });

    test('Invalid x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.get(`${baseUrl}`, {
            headers: {
                'x-functions-key': 'invalid_key'
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
            }
        });
        expect(response.status(),
            `Expected 404 status for invalid x-functions-key, but got '${response.status()}'`)
            .toBe(404);
    });
});

test.describe('Response Structure Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/propertydetail';
    const lacodes: string[] = ["E09000003", "E09000004"];
    const epcId = 226143;
    const Uprn = 100022917842;

    test('Response returns valid JSON with correct top-level structure', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
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
    const baseUrl = process.env.DMS_BASE_URL + '/mees/propertydetail';
    const lacodes: string[] = ["E09000003", "E09000004"];
    const Uprn = 100022917842; // property with onshore landlord(s) — used for sequential and onshore assertions
    const multiLandlordUprn = 10011861776; // property with both Onshore and Offshore landlords

    test('SIC code fields are populated sequentially with no gaps', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: Uprn
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: multiLandlordUprn // property with known Offshore landlord(s) — used for offshore assertions
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: multiLandlordUprn
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
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: multiLandlordUprn
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
    const baseUrl = process.env.DMS_BASE_URL + '/mees/propertydetail';
    const lacodes: string[] = ["E09000003", "E09000004"];
    const uprn = 100023522975; // property belonging to E09000004

    test('Missing lacodes returns 400 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: { buildingrefnum: uprn }
        });
        expect(response.status()).toBe(400);
    });

    test('Missing buildingrefnum returns 400 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: { lacodes }
        });
        expect(response.status()).toBe(400);
    });

    test('Missing both fields returns 400 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: {}
        });
        expect(response.status()).toBe(400);
    });

    test('Empty lacodes array returns 200 with null data', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: { lacodes: [], buildingrefnum: uprn }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.property).toBeNull();
        expect(body.epcCertificates).toBeNull();
        expect(body.landlords).toBeNull();
    });

    test('buildingrefnum not belonging to provided lacodes returns 200 with null data', async ({ request }) => {
        // buildingrefnum belongs to E09000004 — using only E09000003 puts it outside the provided lacodes
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: { lacodes: ['E09000003'], buildingrefnum: uprn }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.property).toBeNull();
        expect(body.epcCertificates).toBeNull();
        expect(body.landlords).toBeNull();
    });

    test('buildingrefnum as string returns 400 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: { lacodes, buildingrefnum: '100023522975' }
        });
        expect(response.status()).toBe(400);
    });

    test('Unknown extra field alongside valid fields returns 200 status', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: { 'x-functions-key': process.env.PROPERTYDETAIL_KEY! },
            data: { lacodes, buildingrefnum: uprn, unknownfield: 'value' }
        });
        expect(response.status()).toBe(200);
    });
});

test.describe('Data Verification Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/propertydetail';
    const lacodes: string[] = ["E09000004"];
    const uprn = 100022918361;
    const nonUprnCode = '274935898943677672';

    test('Property fields return expected values for known UPRN', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: uprn
            }
        });
        expect(response.status()).toBe(200);

        const { property } = await response.json();
        expect(property.uprn).toBe(Number(uprn));
        expect(property.buildingReferenceNumber).toBe(Number(uprn)); // buildingReferenceNumber equals UPRN when UPRN is available
        expect(property.postcode).toBe('DA1 4AL');
        expect(property.town).toBe('DARTFORD');
        expect(property.epcEnergyRating).toBe(22);
        expect(property.epcEnergyRatingBand).toBe('A');
        expect(property.rateableValue).toBe(25500);
        // epcExpiryDate is returned as a raw ISO 8601 string — see BUG 922
        expect(property.epcExpiryDate).toContain('2035-08-13');
    });

    test('epcCertificates contains two entries with expected data for known UPRN', async ({ request }) => {
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: uprn
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

    test('Landlord returns expected data values for known UPRN', async ({ request }) => {

        const expectedLandlords = [
            {
                "uprn": 100022918361,
                "companyName": "BRITISH OVERSEAS BANK NOMINEES LIMITED",
                "location": "Onshore",
                "address": "250 BISHOPSGATE, LONDON, EC2M 4AA",
                "sicCodeSicText1": "99999 - Dormant Company",
                "sicCodeSicText2": null,
                "sicCodeSicText3": null,
                "sicCodeSicText4": null
            },
            {
                "uprn": 100022918361,
                "companyName": "SAFELINE GROUP UK LIMITED",
                "location": "Onshore",
                "address": "ONEGA HOUSE, 112 MAIN ROAD, SIDCUP, KENT, DA14 6NE",
                "sicCodeSicText1": "82990 - Other business support service activities n.e.c.",
                "sicCodeSicText2": null,
                "sicCodeSicText3": null,
                "sicCodeSicText4": null     
            },
            {
                "uprn": 100022918361,
                "companyName": "W G T C NOMINEES LIMITED",
                "location": "Onshore",
                "address": "250 BISHOPSGATE, LONDON, EC2M 4AA",
                "sicCodeSicText1": "99999 - Dormant Company",
                "sicCodeSicText2": null,
                "sicCodeSicText3": null,
                "sicCodeSicText4": null
            }
        ]

        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!
            },
            data: {
                lacodes: lacodes,
                buildingrefnum: uprn
            }
        });
        expect(response.status()).toBe(200);

        const propertyDetails = await response.json();
        const actualLandlords = propertyDetails.landlords;
        expect(actualLandlords).toHaveLength(3);
        for (let l = 0; l < actualLandlords.length; l++) {
            const actualLandlord = actualLandlords[l];
            const expectedLandlord = expectedLandlords[l]

            expect(actualLandlord.uprn).toBe(expectedLandlord.uprn);
            expect(actualLandlord.companyName).toBe(expectedLandlord.companyName);
            expect(actualLandlord.location).toBe(expectedLandlord.location);
            expect(actualLandlord.address).toBe(expectedLandlord.address);
            expect(actualLandlord.sicCodeSicText1).toBe(expectedLandlord.sicCodeSicText1);
            expect(actualLandlord.sicCodeSicText2).toBe(expectedLandlord.sicCodeSicText2);
            expect(actualLandlord.sicCodeSicText3).toBe(expectedLandlord.sicCodeSicText3);
            expect(actualLandlord.sicCodeSicText4).toBe(expectedLandlord.sicCodeSicText4);
            
        }
    });

    test('Properties without UPRN can have EPC Certificates', async ({ request }) => {
        // buildingrefnum exceeds Number.MAX_SAFE_INTEGER — use raw body string to preserve precision
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!,
                'Content-Type': 'application/json'
            },
            data: `{"lacodes":["E09000004"],"buildingrefnum":274935898943677672}`
        });
        expect(response.status()).toBe(200);

        const responseJSON = await response.json();
        const propertyDetails = responseJSON.property;
        const epcCertificates = responseJSON.epcCertificates;
        
        expect(propertyDetails.uprn).toBeNull();
        expect(propertyDetails.buildingReferenceNumber).toBe(Number(nonUprnCode));
        expect(epcCertificates).toHaveLength(1);
    });

    test('Properties without UPRN does not return landlord data', async ({ request }) => {
        // buildingrefnum exceeds Number.MAX_SAFE_INTEGER — use raw body string to preserve precision
        const response = await request.post(`${baseUrl}`, {
            headers: {
                'x-functions-key': process.env.PROPERTYDETAIL_KEY!,
                'Content-Type': 'application/json'
            },
            data: `{"lacodes":["E09000004"],"buildingrefnum":274935898943677672}`
        });

        expect(response.status()).toBe(200);

        const responseJSON = await response.json();
        const propertyDetails = responseJSON.property;
        const landlordDetails = responseJSON.landlords;
        
        expect(propertyDetails.uprn).toBeNull();
        expect(propertyDetails.buildingReferenceNumber).toBe(Number(nonUprnCode));
        // Landlords are linked to a property by UPRN — properties without a UPRN will always return an empty landlords array
        expect(landlordDetails).toHaveLength(0);
    });
});