import { test, expect } from '@playwright/test';

const MAX_PROPERTIES_TO_VALIDATE = 10;
const KNOWN_LACODES = ['E09000003', 'E09000004'];
const KNOWN_TOWN = 'DARTFORD';
const KNOWN_POSTCODE = 'DA1 3PY';
const KNOWN_STREET = 'LOWER STATION  ROAD';
const KNOWN_ENERGY_RATING_BAND = 'B';

test.describe('Export DMS API Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/export';
    const requestBody = {
        "lacodes": KNOWN_LACODES,
        "town": KNOWN_TOWN
    };

    test('Valid x-functions-key returns 200 status', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
    });

    test('Response returns valid JSON with data array', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        // Verify response is valid JSON
        const responseBody = await response.json();

        // Double parsing required: API returns JSON-encoded string instead of proper JSON object
        // response.json() parses the outer JSON layer returning a string, then JSON.parse() gets the actual data
        const parsedBody = JSON.parse(responseBody);

        // Verify response contains a data array
        expect(parsedBody).toHaveProperty('data');
        expect(Array.isArray(parsedBody.data)).toBe(true);
    });

    test('Export items contain all required top-level fields', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        expect(parsedBody.data.length).toBeGreaterThan(0);
        const item = parsedBody.data[0];

        // Each export item must have property, EpcCertificates, and Landlords
        expect(item).toHaveProperty('property');
        expect(item).toHaveProperty('EpcCertificates');
        expect(item).toHaveProperty('Landlords');
        expect(typeof item.property).toBe('object');
        expect(Array.isArray(item.EpcCertificates)).toBe(true);
        expect(Array.isArray(item.Landlords)).toBe(true);
    });

    test('Property objects within export items contain all required fields', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        expect(parsedBody.data.length).toBeGreaterThan(0);
        const property = parsedBody.data[0].property;

        // Verify all expected property fields are present
        expect(Object.keys(property).length).toBe(22);
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
        expect(property).toHaveProperty('RateableValue');
        expect(property).toHaveProperty('EPCTransactionType');
        expect(property).toHaveProperty('DatasetCode');
        expect(property).toHaveProperty('EPCPropertyType');
        expect(property).toHaveProperty('PossibleEvidenceEpcTransactionType');
        expect(property).toHaveProperty('PossibleEvidenceSiccode');
        expect(property).toHaveProperty('CertificateLink');
    });

    test('EpcCertificates objects contain all required fields when present', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        expect(parsedBody.data.length).toBeGreaterThan(0);

        // Find an item that has EPC certificates
        const itemWithEpc = parsedBody.data.find(
            (item: any) => Array.isArray(item.EpcCertificates) && item.EpcCertificates.length > 0
        );
        expect(itemWithEpc).toBeDefined();

        const epc = itemWithEpc.EpcCertificates[0];
        expect(epc).toHaveProperty('Uprn');
        expect(epc).toHaveProperty('AssetRating');
        expect(epc).toHaveProperty('AssetRatingBand');
        expect(epc).toHaveProperty('LodgementDate');
        expect(epc).toHaveProperty('ExpiryDate');
        expect(epc).toHaveProperty('TransactionType');
    });

    test('Missing x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                // Missing x-functions-key header
            }
        });

        expect([401, 403]).toContain(response.status());
    });

    test('Invalid x-functions-key returns 401 or 403', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: requestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': 'invalid-key-12345'
            }
        });

        expect([401, 403]).toContain(response.status());
    });
});

test.describe('Export Filter Criteria Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/export';

    test('Missing required lacodes field returns 400', async ({ request }) => {
        const invalidRequestBody = {
            "street": "main street",
            "town": "Brighton",
            "postcode": "DN14 5BT"
            // Missing lacodes field
        };

        const response = await request.post(baseUrl, {
            data: invalidRequestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(400);

        // API correctly returns 400 Bad Request when required lacodes field is missing
        const responseText = await response.text();
        expect(responseText).toBeDefined();
    });

    test('Empty lacodes array returns empty result set', async ({ request }) => {
        const requestBodyWithEmptyLacodes = {
            "lacodes": []
        };

        const response = await request.post(baseUrl, {
            data: requestBodyWithEmptyLacodes,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        // API accepts empty lacodes array and returns empty result set
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        // When lacodes is empty, API returns data as empty string instead of array
        expect(parsedBody).toHaveProperty('data');
        expect(parsedBody.data).toBe(''); // API returns empty string instead of empty array
    });

    test('API filters out invalid lacodes and returns data for valid ones only', async ({ request }) => {
        const invalidRequestBody = {
            "lacodes": ['E09000004', 'INVALID123']
        };

        const response = await request.post(baseUrl, {
            data: invalidRequestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        // API accepts invalid lacodes and filters them out
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        // Should have data for valid lacode
        expect(parsedBody).toHaveProperty('data');
        expect(parsedBody.data.length).toBeGreaterThan(0);

        // Verify sampled properties match the valid lacode
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Expected at least one property to validate for lacode filter').toBeGreaterThan(0);
        for (const item of itemsToValidate) {
            expect(item.property.LocalAuthority).toBe('E09000004');
        }
    });

    test('Energy rating band filter works correctly', async ({ request }) => {
        const validRatings = [KNOWN_ENERGY_RATING_BAND];

        for (const rating of validRatings) {
            const requestBodyWithRating = {
                "lacodes": KNOWN_LACODES,
                "town": KNOWN_TOWN,
                "postcode": KNOWN_POSTCODE,
                "energyratingband": rating
            };

            const response = await request.post(baseUrl, {
                data: requestBodyWithRating,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.EXPORT_KEY!
                }
            });

            expect(response.status()).toBe(200);

            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);

            // Verify response structure and filtering works
            expect(parsedBody).toHaveProperty('data');
            expect(Array.isArray(parsedBody.data)).toBe(true);
            expect(parsedBody.data.length, "Filtering by energy rating band " + rating + " returned no results").toBeGreaterThan(0);

            // Verify sampled properties match the energy rating band filter
            const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
            expect(itemsToValidate.length, `Expected at least one property to validate for energy rating band ${rating}`).toBeGreaterThan(0);
            for (const item of itemsToValidate) {
                expect(item.property).toHaveProperty('EPCEnergyRatingBand');
                expect(item.property.EPCEnergyRatingBand).toBe(rating);
            }
        }
    });

    test('Invalid energy rating returns empty results', async ({ request }) => {
        const requestBodyWithInvalidRating = {
            "lacodes": KNOWN_LACODES,
            "town": KNOWN_TOWN,
            "energyratingband": "INVALID!"
        };

        const response = await request.post(baseUrl, {
            data: requestBodyWithInvalidRating,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        // API should reject invalid energy rating bands and return empty results
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);
        expect(parsedBody).toHaveProperty('data');
        expect(Array.isArray(parsedBody.data)).toBe(true);
        expect(parsedBody.data.length).toBe(0);
    });

    test('Street filter works correctly', async ({ request }) => {
        const requestBodyWithStreet = {
            "lacodes": KNOWN_LACODES,
            "town": KNOWN_TOWN,
            "street": KNOWN_STREET
        };

        const response = await request.post(baseUrl, {
            data: requestBodyWithStreet,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        // Verify sampled properties contain the street in one of the address lines
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Street filter returned no properties to validate').toBeGreaterThan(0);
        for (const item of itemsToValidate) {
            const addressFields = [item.property.Line1, item.property.Line2, item.property.Line3].join(' ').toLowerCase();
            expect(addressFields).toContain(KNOWN_STREET.toLowerCase());
        }
    });

    test('Town filter works correctly', async ({ request }) => {
        const requestBodyWithTown = {
            "lacodes": KNOWN_LACODES,
            "town": KNOWN_TOWN
        };

        const response = await request.post(baseUrl, {
            data: requestBodyWithTown,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        // Verify sampled properties match the town filter
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Town filter returned no properties to validate').toBeGreaterThan(0);
        for (const item of itemsToValidate) {
            expect(item.property.Town.toLowerCase()).toBe(KNOWN_TOWN.toLowerCase());
        }
    });

    test('Combined filters work correctly', async ({ request }) => {
        // Use filter criteria matching known property data with location
        const requestBodyWithMultipleFilters = {
            "lacodes": KNOWN_LACODES,
            "street": KNOWN_STREET,
            "town": KNOWN_TOWN,
            "postcode": KNOWN_POSTCODE,
            "energyratingband": KNOWN_ENERGY_RATING_BAND
        };

        const response = await request.post(baseUrl, {
            data: requestBodyWithMultipleFilters,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        // Verify response structure
        expect(parsedBody).toHaveProperty('data');
        expect(Array.isArray(parsedBody.data)).toBe(true);

        // Expect at least one record to be returned - test fails if 0 records
        expect(parsedBody.data.length).toBeGreaterThan(0);

        // Verify sampled properties match the applied filters
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Combined filters returned no properties to validate').toBeGreaterThan(0);
        for (const item of itemsToValidate) {
            expect(item.property.Town.toLowerCase()).toBe(KNOWN_TOWN.toLowerCase());
            expect(item.property.Postcode).toBe(KNOWN_POSTCODE);
            expect(item.property.LocalAuthority).toBe('E09000004');
            expect(item.property.EPCEnergyRatingBand).toBe(KNOWN_ENERGY_RATING_BAND);

            // Check street appears in one of the address lines
            const addressFields = [item.property.Line1, item.property.Line2, item.property.Line3].join(' ').toLowerCase();
            expect(addressFields).toContain(KNOWN_STREET.toLowerCase());
        }
    });

    test('Valid postcode filter works correctly', async ({ request }) => {
        const requestBodyWithPostcode = {
            "lacodes": KNOWN_LACODES,
            "town": KNOWN_TOWN,
            "postcode": KNOWN_POSTCODE
        };

        const response = await request.post(baseUrl, {
            data: requestBodyWithPostcode,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const parsedBody = JSON.parse(responseBody);

        // Verify sampled properties match the postcode filter
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Postcode filter returned no properties to validate').toBeGreaterThan(0);
        for (const item of itemsToValidate) {
            expect(item.property.Postcode).toBe(KNOWN_POSTCODE);
        }
    });

    test('Invalid filter body returns 400', async ({ request }) => {
        const invalidRequestBody = {
            "lacodes": "E09000004", // Should be an array, not a string
            "street": "main street"
        };

        const response = await request.post(baseUrl, {
            data: invalidRequestBody,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(400);
    });

    test('Invalid postcode format handling', async ({ request }) => {
        const testCases = [
            { postcode: "INVALID", description: "completely invalid postcode" },
            { postcode: "12345", description: "numeric only postcode" },
            { postcode: "TOOLONGPOSTCODE123", description: "too long postcode" },
            { postcode: "", description: "empty postcode" }
        ];

        for (const testCase of testCases) {
            const requestBodyWithInvalidPostcode = {
                "lacodes": KNOWN_LACODES,
                "town": KNOWN_TOWN,
                "postcode": testCase.postcode
            };

            const response = await request.post(baseUrl, {
                data: requestBodyWithInvalidPostcode,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.EXPORT_KEY!
                }
            });

            // API handles invalid postcodes by returning empty results
            expect(response.status()).toBe(200);

            if (response.status() === 200) {
                const responseBody = await response.json();
                const parsedBody = JSON.parse(responseBody);
                // If accepted, should return valid structure
                expect(parsedBody).toHaveProperty('data');
                expect(Array.isArray(parsedBody.data)).toBe(true);
            }
        }
    });
});

test.describe('Export EPC Data Integrity Tests', () => {
    const baseUrl = process.env.DMS_BASE_URL + '/mees/export';

    test('Unrated properties have null CertificateLink', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: { "lacodes": KNOWN_LACODES, "energyratingband": "Unrated" },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
        const parsedBody = JSON.parse(await response.json());
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Expected at least one Unrated property to validate').toBeGreaterThan(0);

        for (const item of itemsToValidate) {
            expect(
                item.property.CertificateLink,
                `Unrated property UPRN ${item.property.Uprn} should have null CertificateLink but got: ${item.property.CertificateLink}`
            ).toBeNull();
        }
    });

    test('Unrated properties have EPCEnergyRating of 0 and null EPCPropertyType, EPCExpiryDate and EPCTransactionType', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: { "lacodes": KNOWN_LACODES, "energyratingband": "Unrated" },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
        const parsedBody = JSON.parse(await response.json());
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Expected at least one Unrated property to validate').toBeGreaterThan(0);

        for (const item of itemsToValidate) {
            expect(
                item.property.EPCEnergyRating,
                `Unrated property UPRN ${item.property.Uprn} should have EPCEnergyRating of 0`
            ).toBe(0);
            expect(
                item.property.EPCPropertyType,
                `Unrated property UPRN ${item.property.Uprn} should have null EPCPropertyType`
            ).toBeNull();
            expect(
                item.property.EPCExpiryDate,
                `Unrated property UPRN ${item.property.Uprn} should have null EPCExpiryDate`
            ).toBeNull();
            expect(
                item.property.EPCTransactionType,
                `Unrated property UPRN ${item.property.Uprn} should have null EPCTransactionType`
            ).toBeNull();
        }
    });

    test('Unrated properties have an empty EpcCertificates array', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: { "lacodes": KNOWN_LACODES, "energyratingband": "Unrated" },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
        const parsedBody = JSON.parse(await response.json());
        const itemsToValidate = parsedBody.data.slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsToValidate.length, 'Expected at least one Unrated property to validate').toBeGreaterThan(0);

        for (const item of itemsToValidate) {
            expect(
                item.EpcCertificates.length,
                `Unrated property UPRN ${item.property.Uprn} should have no EPC certificates`
            ).toBe(0);
        }
    });

    test('Non-null CertificateLink is a valid https URL', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: { "lacodes": KNOWN_LACODES, "town": KNOWN_TOWN },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
        const parsedBody = JSON.parse(await response.json());

        const itemsWithLink = parsedBody.data
            .filter((item: any) => item.property.CertificateLink !== null)
            .slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsWithLink.length, 'Expected at least one property with a non-null CertificateLink').toBeGreaterThan(0);

        for (const item of itemsWithLink) {
            expect(
                item.property.CertificateLink,
                `UPRN ${item.property.Uprn} CertificateLink should start with https://`
            ).toMatch(/^https:\/\//);
        }
    });

    test('Properties with EPC certificates have a non-null EPCExpiryDate', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: { "lacodes": KNOWN_LACODES, "town": KNOWN_TOWN },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
        const parsedBody = JSON.parse(await response.json());

        const itemsWithEpc = parsedBody.data
            .filter((item: any) => item.EpcCertificates.length > 0)
            .slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsWithEpc.length, 'Expected at least one property with EPC certificates').toBeGreaterThan(0);

        for (const item of itemsWithEpc) {
            expect(
                item.property.EPCExpiryDate,
                `UPRN ${item.property.Uprn} has EPC certificates but EPCExpiryDate is null`
            ).not.toBeNull();
        }
    });

    test('Most recent EpcCertificate AssetRatingBand matches property EPCEnergyRatingBand', async ({ request }) => {
        const response = await request.post(baseUrl, {
            data: { "lacodes": KNOWN_LACODES, "town": KNOWN_TOWN },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });

        expect(response.status()).toBe(200);
        const parsedBody = JSON.parse(await response.json());

        const itemsWithEpc = parsedBody.data
            .filter((item: any) => item.EpcCertificates.length > 0)
            .slice(0, MAX_PROPERTIES_TO_VALIDATE);
        expect(itemsWithEpc.length, 'Expected at least one property with EPC certificates').toBeGreaterThan(0);

        for (const item of itemsWithEpc) {
            // Sort by LodgementDate descending to get the most recent EPC certificate
            const mostRecentEpc = [...item.EpcCertificates].sort(
                (a: any, b: any) => new Date(b.LodgementDate).getTime() - new Date(a.LodgementDate).getTime()
            )[0];
            expect(
                mostRecentEpc.AssetRatingBand,
                `UPRN ${item.property.Uprn}: most recent EPC AssetRatingBand '${mostRecentEpc.AssetRatingBand}' does not match property EPCEnergyRatingBand '${item.property.EPCEnergyRatingBand}'`
            ).toBe(item.property.EPCEnergyRatingBand);
        }
    });
});
