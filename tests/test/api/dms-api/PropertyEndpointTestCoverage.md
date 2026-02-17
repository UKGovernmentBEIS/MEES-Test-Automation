# Property Endpoint Test Coverage - Schema Focused

## Endpoint Details
- **URL**: `{{DMS_BASE_URL}}/mees/property`
- **Method**: GET
- **Authentication**: x-functions-key header
- **Environment Variable**: `PROPERTY_KEY=1od5x70XbwLwmHDfnTlq_Ln6-vxUyVIXVIhQCwIEsh8lAzFuyC-nTw==`

## Test Parameters
- `buildingrefnum`: 924865340001
- `uprn`: 10002418410

## Expected Response Schema
```json
{
    "property": {
        "uprn": null | number,
        "buildingReferenceNumber": number,
        "name": null | string,
        "number": null | string,
        "flatNameNumber": null | string,
        "line1": null | string,
        "line2": null | string,
        "line3": null | string,
        "town": string,
        "county": null | string,
        "postcode": string,
        "localAuthority": string,
        "epcEnergyRating": number,
        "epcEnergyRatingBand": string,
        "epcExpiryDate": string (date format),
        "location": null | string,
        "rateableValue": null | number,
        "transactionType": string
    },
    "epcCertificates": [
        {
            "assetRating": number,
            "assetRatingBand": string,
            "lodgementDate": string (date format),
            "expiryDate": string (date format)
        }
    ],
    "landlords": array
}
```

## 1. Authentication Tests

### 1.1 Valid Authentication
- **Test**: `Valid x-functions-key returns 200 status`
- **Focus**: Status code validation
- **Method**: GET with valid key and `buildingrefnum` parameter

### 1.2 Missing Authentication
- **Test**: `Missing x-functions-key returns 401 or 403`
- **Focus**: Error status code validation
- **Method**: GET without x-functions-key header

### 1.3 Invalid Authentication
- **Test**: `Invalid x-functions-key returns 401 or 403`
- **Focus**: Error status code validation
- **Method**: GET with invalid key ('invalid-key-12345')

## 2. Response Schema Validation Tests

### 2.1 Top-Level Structure
- **Test**: `Response returns valid JSON with correct top-level structure`
- **Validation**:
  - Response is valid JSON
  - Has exactly 3 top-level properties: `property`, `epcCertificates`, `landlords`
  - Each property exists regardless of content

### 2.2 Property Object Schema
- **Test**: `Property object contains all required fields with correct types`
- **Validation**:
  - Property object has exactly 18 fields
  - Each field exists (presence check)
  - Field types match schema:
    - Numbers: `uprn`, `buildingReferenceNumber`, `epcEnergyRating`, `rateableValue`
    - Strings: `name`, `number`, `flatNameNumber`, `line1`, `line2`, `line3`, `town`, `county`, `postcode`, `localAuthority`, `epcEnergyRatingBand`, `epcExpiryDate`, `location`, `transactionType`
    - Allow null values for optional fields

### 2.3 EPC Certificates Array Schema
- **Test**: `EPC certificates array has correct structure`
- **Validation**:
  - `epcCertificates` is an array
  - If array not empty, each certificate object has 4 fields
  - Certificate fields have correct types:
    - Numbers: `assetRating`
    - Strings: `assetRatingBand`, `lodgementDate`, `expiryDate`

### 2.4 Landlords Array Schema
- **Test**: `Landlords array exists and has correct type`
- **Validation**:
  - `landlords` field exists
  - `landlords` is an array (regardless of content)

## 3. Parameter Validation Tests

### 3.1 Required Parameters
- **Test**: `Missing both parameters returns 400 or appropriate error`
- **Method**: GET without any query parameters
- **Focus**: Error handling behavior

### 3.2 Parameter Combinations
- **Test**: `buildingrefnum parameter only works correctly`
- **Method**: GET with `?buildingrefnum=924865340001`
- **Focus**: Accepts parameter and returns 200

- **Test**: `uprn parameter only works correctly`
- **Method**: GET with `?uprn=10002418410`
- **Focus**: Accepts parameter and returns 200

- **Test**: `Both parameters work together`
- **Method**: GET with `?buildingrefnum=924865340001&uprn=10002418410`
- **Focus**: Accepts both parameters and returns 200

### 3.3 Parameter Value Validation
- **Test**: `Empty parameter values handled appropriately`
- **Methods**: 
  - `?buildingrefnum=`
  - `?uprn=`
- **Focus**: Error status or graceful handling

- **Test**: `Invalid parameter formats return appropriate response`
- **Methods**:
  - `?buildingrefnum=invalid123`
  - `?uprn=notanumber`
  - `?buildingrefnum=999999999999999` (too long)
- **Focus**: Error handling behavior, not specific error messages

### 3.4 Non-existent Records
- **Test**: `Non-existent buildingrefnum returns appropriate response`
- **Method**: GET with fake building reference
- **Focus**: Response structure (404, empty data, or error format)

- **Test**: `Non-existent uprn returns appropriate response`
- **Method**: GET with fake UPRN
- **Focus**: Response structure consistency

## 4. Data Type and Format Validation

### 4.1 Date Format Validation
- **Test**: `Date fields follow consistent format`
- **Focus**: 
  - `epcExpiryDate` in property object is string
  - Certificate `lodgementDate` and `expiryDate` are strings
  - Date format consistency (not validating specific dates)

### 4.2 Numeric Field Validation
- **Test**: `Numeric fields have correct data types`
- **Focus**:
  - Energy rating is number
  - Building reference number is number
  - Asset ratings in certificates are numbers
  - UPRN (when not null) is number

### 4.3 String Field Validation
- **Test**: `String fields have correct data types and non-empty when present`
- **Focus**:
  - Required string fields are not empty strings
  - Optional string fields are either string or null
  - Energy rating bands are single characters

### 4.4 Null Field Handling
- **Test**: `Nullable fields handle null values correctly`
- **Focus**:
  - Optional fields can be null
  - Required fields are never null
  - Consistent null handling across similar fields

## 5. Edge Cases and Error Handling

### 5.1 Malformed Requests
- **Test**: `Invalid query parameter names handled gracefully`
- **Method**: GET with `?invalidparam=123`
- **Focus**: Response behavior (ignore, error, or default handling)

### 5.2 Special Characters
- **Test**: `Special characters in parameters handled appropriately`
- **Methods**:
  - `?buildingrefnum=123%20456` (URL encoded)
  - `?uprn=<script>alert(1)</script>` 
- **Focus**: Security and input sanitization behavior

### 5.3 Response Consistency
- **Test**: `Response schema remains consistent across different valid requests`
- **Method**: Multiple valid requests with different parameters
- **Focus**: Schema structure doesn't change based on data

## 6. Performance and Reliability (Light Testing)

### 6.1 Response Time
- **Test**: `Response returns within reasonable time`
- **Focus**: Basic performance expectation (not specific timing)

### 6.2 Concurrent Requests
- **Test**: `Multiple simultaneous requests handled correctly`
- **Focus**: No schema corruption or errors under light load

## Test Implementation Notes

### Response Parsing Strategy
- Check if API returns JSON-encoded strings like Properties endpoint
- Handle double parsing if necessary: `JSON.parse(await response.json())`
- Document parsing requirements for future tests

### Assertions Focus
- **DO**: Validate data types, field presence, array types
- **DON'T**: Assert specific values that might change
- **DO**: Check required vs optional field behavior  
- **DON'T**: Validate business logic or data accuracy

### Error Response Handling
- Focus on HTTP status codes rather than error message content
- Validate error response structure if consistent format exists
- Test error scenarios but don't assert specific error text

### Parameterized Testing
- Use test data that's likely to remain stable
- Create reusable helper functions for schema validation
- Consider using JSON schema validation libraries if available

## Coverage Summary

| Category | Tests | Focus |
|----------|-------|-------|
| Authentication | 3 | Status codes and security |
| Schema Structure | 4 | Response format and types |
| Parameter Validation | 8 | Input handling and combinations |
| Data Types | 4 | Type safety and consistency |
| Edge Cases | 3 | Error handling and robustness |
| **Total** | **22** | **Schema and behavior validation** |

This coverage ensures robust validation of the API contract without being brittle to data changes.