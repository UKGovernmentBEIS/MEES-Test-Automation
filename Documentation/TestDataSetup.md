# PRSE Test Data Setup Guide

This document describes the PRSE (PRS Exemption Register) data that must exist in each environment for functional tests to pass. DMS data is not covered here.

> **Date warning:** Several tests assert hardcoded dates (`22 May 2026`, `26 May 2026`). These are now in the past and the PRSE records — and the corresponding test assertions — will need updating when the environment is refreshed.

---

## View Properties Page

**Test file:** [tests/test/functional/ViewPropertiesPageTests.spec.ts](../tests/test/functional/ViewPropertiesPageTests.spec.ts)

### PRS Exemption status colours

Filter applied by the test: **Council = LONDON BOROUGH OF BEXLEY**, **Energy Rating = A**.

The test requires that the Properties View page shows list of properties matching above filter criteria and have at least one property 
in PRSE with each of the following exemption statuses. Properties are found dynamically — no fixed address or UPRN is required. The test
can handle pagination.

| Required PRS exemption status | Expected colour tag |
|-------------------------------|---------------------|
| Penalty sent | light-blue |
| Received | blue |
| Draft | blue |
| Approved | green |
| Updated | orange |
| Ended | pink |
| Expired | grey |
| Needs update | yellow |
| Not found | grey* |

> Note: *"Not found" behaviour is currently affected by Bug 908.

### Non-exempt property with penalty

| Address | UPRN | Required PRSE state |
|---------|------|---------------------|
| 6, London Road, Crayford, DARTFORD, DA1 4BH | *(any)* | No exemption; penalty recorded |

The PRS Exemption column must show `Not found` for this property.

---

## Property Details Page — PRS exemptions and penalties tab

**Test file:** [tests/test/functional/PropertyDetailsPageTest.spec.ts](../tests/test/functional/PropertyDetailsPageTest.spec.ts)

### Exemption status possible values

Property navigated to by the test: **THE COTTAGE NURSERY, LOWER STATION ROAD, CRAYFORD, DARTFORD, DA1 3PY**

Each UPRN below must have a PRSE exemption in the specified status. The test navigates to the property by address then switches context per UPRN via direct URL.

| UPRN | Required PRS exemption status |
|------|-------------------------------|
| 100022918361 | Penalty sent |
| 10096984308 | Received |
| 10090795654 | Updated |
| 10023302263 | Approved |
| 10090792724 | Ended |
| 10090792723 | Expired |

### Full exemption and penalty data

| Field | Required value |
|-------|---------------|
| Property | THE COTTAGE NURSERY, LOWER STATION ROAD, CRAYFORD, DARTFORD, DA1 3PY |
| UPRN | 100022918361 |
| PRS exemption status | Penalty sent |
| PRS exemption date | 22 May 2026 ⚠️ |
| PRS penalty | Recorded |
| PRS penalty date | 22 May 2026 ⚠️ |

### Penalty only — no exemption

| Field | Required value |
|-------|---------------|
| Property | 6, London Road, Crayford, DARTFORD, DA1 4BH |
| Energy rating | G |
| PRS exemption status | *(none — must show "Not found")* |
| PRS exemption date | *(none — must show "Not found")* |
| PRS penalty | Recorded |
| PRS penalty date | 26 May 2026 ⚠️ |

### No PRSE data

| Property | UPRN | Required PRSE state |
|----------|------|---------------------|
| DOUGAL BROS TRANSPORT LTD, LOWER STATION ROAD, CRAYFORD, DARTFORD, DA1 3PY | *(any)* | No exemption or penalty — all fields show "Not found" |

### No UPRN — PRSE data unreachable

| Property | UPRN |
|----------|------|
| Unit 2B, Roman Way, Crayford, DARTFORD, DA1 4FY | None |

No PRSE data is required for this property. The system cannot link PRSE records without a UPRN, so all fields show `Not found` automatically.