import { test, expect } from '@playwright/test';
import { PassThrough } from 'stream';

test.describe('Properties DMS API Tests', () => {
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
    });

    test.describe('Filter Criteria Tests', () => {
        test('Missing required lacodes field returns 400', async ({ request }) => {
            const invalidRequestBody = {
                "street": "main street",
                "town": "Brighton",
                "postcode": "DN14 5BT"
                // Missing lacodes field
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: invalidRequestBody,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
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

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithEmptyLacodes,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            // API accepts empty lacodes array and returns empty result set
            expect(response.status()).toBe(200);

            // Verify results - API returns different structure for empty lacodes
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            
            // When lacodes is empty, API returns data as empty string instead of array
            expect(parsedBody).toHaveProperty('data');
            expect(parsedBody.data).toBe(''); // API returns empty string instead of empty array
            expect(parsedBody.total_records).toBe(0);
            expect(parsedBody.page).toBe(0);
            expect(parsedBody.size).toBe(0);
            expect(parsedBody.total_pages).toBe(0);
        });

        test('API filters out invalid lacodes and returns data for valid ones only', async ({ request }) => {
            const invalidRequestBody = {
                "lacodes": ["E06000009", "INVALID123"]
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: invalidRequestBody,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            // API accepts invalid lacodes and filters them out
            expect(response.status()).toBe(200);
            
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            
            // Should have data for valid lacode
            expect(parsedBody).toHaveProperty('data');
            expect(parsedBody.data.length).toBeGreaterThan(0);
            
            // Verify all properties match the valid lacode
            for (const property of parsedBody.data) {
                expect(property.LocalAuthority).toBe('E06000009');
            }
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
                    "lacodes": ["E06000009"],
                    "postcode": testCase.postcode
                };

                const response = await request.post(`${baseUrl}?page=1&size=10`, {
                    data: requestBodyWithInvalidPostcode,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-functions-key': process.env.PROPERTIES_KEY!
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

        test('Energy rating band filter works correctly', async ({ request }) => {
            const validRatings = ["A+", "A", "B", "C", "D", "E", "F", "G", "Unrated"];
            
            for (const rating of validRatings) {
                const requestBodyWithRating = {
                    "lacodes": ["E09000003", "E09000004"],
                    "energyratingband": rating
                };

                const response = await request.post(`${baseUrl}?page=1&size=10`, {
                    data: requestBodyWithRating,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-functions-key': process.env.PROPERTIES_KEY!
                    }
                });

                expect(response.status()).toBe(200);
                
                const responseBody = await response.json();
                const parsedBody = JSON.parse(responseBody);
                
                // Verify response structure and filtering works
                expect(parsedBody).toHaveProperty('data');
                expect(Array.isArray(parsedBody.data)).toBe(true);
                expect(parsedBody.data.length).toBeGreaterThan(0);
                
                // Verify all properties match the energy rating band filter
                for (const property of parsedBody.data) {
                    expect(property).toHaveProperty('EPCEnergyRatingBand');
                    expect(property.EPCEnergyRatingBand).toBe(rating);
                }
            }
        });

        test('Invalid energy rating returns empty results', async ({ request }) => {
            const requestBodyWithInvalidRating = {
                "lacodes": ["E06000009"],
                "energyratingband": "INVALID!"
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithInvalidRating,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            // API should reject invalid energy rating bands and return empty results
            expect(response.status()).toBe(200);

            // Verify results are empty due to invalid rating
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            expect(parsedBody).toHaveProperty('data');
            expect(Array.isArray(parsedBody.data)).toBe(true);
            expect(parsedBody.data.length).toBe(0);
        });

        test('Valid location filters work correctly', async ({ request }) => {
            // Test without location filter (should return all records)
            const requestWithoutFilter = {
                "lacodes": ["E06000009", "E06000011"]
            };

            const responseWithoutFilter = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestWithoutFilter,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            expect(responseWithoutFilter.status()).toBe(200);
            const bodyWithoutFilter = await responseWithoutFilter.json();
            const parsedWithoutFilter = JSON.parse(bodyWithoutFilter);
            const totalRecordsAll = parsedWithoutFilter.total_records;

            const validLocations = ["Onshore", "Offshore"];
            
            for (const location of validLocations) {
                const requestBodyWithLocation = {
                    "lacodes": ["E06000009", "E06000011"],
                    "location": location
                };

                const response = await request.post(`${baseUrl}?page=1&size=10`, {
                    data: requestBodyWithLocation,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-functions-key': process.env.PROPERTIES_KEY!
                    }
                });

                expect(response.status()).toBe(200);
                
                const responseBody = await response.json();
                const parsedBody = JSON.parse(responseBody);
                
                // Verify location filter reduces the total number of records
                expect(parsedBody.total_records).toBeLessThan(totalRecordsAll);
                
                // If data exists, verify all properties match the location filter
                // NOTE: It's unclear exactly which properties are filtered out by location filter
                if (parsedBody.data.length > 0) {
                    for (const property of parsedBody.data) {
                        expect(property.Location).toBe(location);
                    }
                }
            }
        });

        test('Invalid location returns empty results', async ({ request }) => {
            const requestBodyWithInvalidLocation = {
                "lacodes": ["E06000009"],
                "location": "InvalidLocation"
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithInvalidLocation,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            expect(response.status()).toBe(200);
            
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            
            // Invalid location returns no data
            expect(parsedBody).toHaveProperty('data');
            expect(Array.isArray(parsedBody.data)).toBe(true);
            expect(parsedBody.data.length).toBe(0);
            expect(parsedBody.total_records).toBe(0);
        });

        test('Street filter works correctly', async ({ request }) => {
            const requestBodyWithStreet = {
                "lacodes": ["E06000009", "E06000011"],
                "street": "Main Street"
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithStreet,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            expect(response.status()).toBe(200);
            
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            
            // If data exists, verify properties contain the street in one of the address lines
            if (parsedBody.data.length > 0) {
                for (const property of parsedBody.data) {
                    const addressFields = [property.Line1, property.Line2, property.Line3].join(' ').toLowerCase();
                    expect(addressFields).toContain('main street');
                }
            }
        });

        test('Town filter works correctly', async ({ request }) => {
            const requestBodyWithTown = {
                "lacodes": ["E06000009", "E06000011"],
                "town": "Brighton"
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithTown,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            expect(response.status()).toBe(200);
            
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            
            // If data exists, verify all properties match the town filter
            if (parsedBody.data.length > 0) {
                for (const property of parsedBody.data) {
                    expect(property.Town.toLowerCase()).toBe('brighton');
                }
            }
        });

        test('Combined filters work correctly', async ({ request }) => {
            // Use filter criteria matching known property data with location
            const requestBodyWithMultipleFilters = {
                "lacodes": ["E06000011"],
                "street": "GOWDALL LANE",
                "town": "SNAITH",
                "postcode": "DN14 0AA",
                "energyratingband": "B",
                "location": "Onshore"
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithMultipleFilters,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
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
            expect(parsedBody.total_records).toBeGreaterThan(0);
            
            // Verify all properties match the applied filters
            for (const property of parsedBody.data) {
                expect(property.Town.toLowerCase()).toBe('snaith');
                expect(property.Postcode).toBe('DN14 0AA');
                expect(property.LocalAuthority).toBe('E06000011');
                expect(property.Location).toBe('Onshore');
                expect(property.EPCEnergyRatingBand).toBe('B');
                
                // Check street appears in one of the address lines
                const addressFields = [property.Line1, property.Line2, property.Line3].join(' ').toLowerCase();
                expect(addressFields).toContain('gowdall lane');
            }
        });

        test('Valid postcode filter works correctly', async ({ request }) => {
            const requestBodyWithPostcode = {
                "lacodes": ["E06000009", "E06000011"],
                "postcode": "DN14 5BT"
            };

            const response = await request.post(`${baseUrl}?page=1&size=10`, {
                data: requestBodyWithPostcode,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-functions-key': process.env.PROPERTIES_KEY!
                }
            });

            expect(response.status()).toBe(200);
            
            const responseBody = await response.json();
            const parsedBody = JSON.parse(responseBody);
            
            // If data exists, verify all properties match the postcode filter
            if (parsedBody.data.length > 0) {
                for (const property of parsedBody.data) {
                    expect(property.Postcode).toBe('DN14 5BT');
                }
            }
        });
    });
});