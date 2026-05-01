# Test Data Setup Guide

Tests contain hardcoded values that must be verified/updated when setting up a new environment.

## Setup Process

1. **Run tests initially** to identify failures and which properties exist in target environment
2. **Update hardcoded values** in test files to match available data
3. **Verify dates** are current/future (EPC expiry dates, exemption dates)

## Files with Hardcoded Data

### PropertyDetailsPageTest.spec.ts
**Location**: [tests/test/functional/PropertyDetailsPageTest.spec.ts](../tests/test/functional/PropertyDetailsPageTest.spec.ts)

**Hardcoded values to verify**:
- Property address: `'Unit 47, Acorn Industrial Park, Crayford Road, Crayford, DARTFORD, DA1 4AL'`
- UPRN: `'100022918361'`
- Property type: `'General Industrial and Special Industrial Groups'`
- Rateable value: `'£25,500'`
- Landlord name: `'BRITISH OVERSEAS BANK NOMINEES LIMITED'`
- Landlord address: `'250 Bishopsgate, London EC2M 4AA'`
- EPC expiry date: `'20 February 2026'`
- PRS exemption date: `'14 February 2026'`
- EPC history dates: `'13 August 2025'`, `'13 August 2035'`

### PropertyTests.spec.ts (Data Verification Tests)
**Location**: [tests/test/api/PropertyTests.spec.ts](../tests/test/api/PropertyTests.spec.ts)

**Hardcoded values to verify** (used in `Data Verification Tests` and `Bug Tests` describe blocks):
- UPRN: `'100022918361'`
- Building Reference Number: `'1172671'` (same physical property as the UPRN above)
- Expected `property.buildingReferenceNumber`: `1172671`
- Expected `property.postcode`: `'DA1 4AL'`
- Expected `property.town`: `'DARTFORD'`
- Expected `property.epcEnergyRating`: `22`
- Expected `property.epcEnergyRatingBand`: `'A'`
- Expected `property.rateableValue`: `25500`
- Expected `property.epcExpiryDate`: contains `'2035-08-13'`
- Expected `epcCertificates` count: `2`
- Expected `epcCertificates[0].assetRating`: `22`
- Expected `epcCertificates[0].assetRatingBand`: `'A'`
- Expected `epcCertificates[0].lodgementDate`: contains `'2025-08-13'`
- Expected `epcCertificates[0].expiryDate`: contains `'2035-08-13'`
- Expected `epcCertificates[1].assetRating`: `93`
- Expected `epcCertificates[1].assetRatingBand`: `'D'`
- Expected `epcCertificates[1].lodgementDate`: contains `'2015-03-06'`
- Expected `epcCertificates[1].expiryDate`: contains `'2025-03-06'`
- Expected `landlords` count: `1`
- Expected `landlords[0].companyName`: `'BRITISH OVERSEAS BANK NOMINEES LIMITED'`
- Expected `landlords[0].address`: `'250 Bishopsgate, London EC2M 4AA'`
- Expected `landlords[0].location`: `'Onshore'`

### PropertiesDmsBoundaryTests.spec.ts
**Location**: [tests/test/api/PropertiesDmsBoundaryTests.spec.ts](../tests/test/api/PropertiesDmsBoundaryTests.spec.ts)

**Hardcoded data dependencies to verify**:

1. **Basic API requests work**:
   - `"lacodes": ["E09000003","E09000004"]` with `"street": "23 Acorn Industrial Park"` must return data

2. **Single lacode validation**:
   - `"lacodes": ["E06000009"]` must return valid properties (used in invalid lacode filtering test)

3. **Location filtering** (Onshore/Offshore):
   - `"lacodes": ["E06000009", "E06000011"]` must have both Onshore and Offshore properties

4. **Street filtering**:
   - `"lacodes": ["E06000009", "E06000011"]` with `"street": "Main Street"` must return properties

5. **Town filtering**:
   - `"lacodes": ["E06000009", "E06000011"]` with `"town": "Brighton"` must return properties

6. **Energy rating coverage**:
   - `"lacodes": ["E09000003", "E09000004"]` must have properties with ALL ratings: A, B, C, D, E, F, G, Unrated

7. **Combined filters test**:
   - Must have property matching ALL criteria:
     - `"lacodes": ["E09000003","E09000004"]`
     - `"street": "23 Acorn Industrial Park"`
     - `"location": "Onshore"`
     - `"town": "DARTFORD"`
     - `"postcode": "DA1 4AL"`
     - `"energyratingband": "C"`

8. **Postcode filtering**:
   - `"lacodes": ["E06000009", "E06000011"]` with `"postcode": "DN14 5BT"` must return properties