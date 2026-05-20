import { APIRequestContext } from '@playwright/test';

export interface DMSRawItem {
    property: Record<string, any>;
    EpcCertificates: Record<string, any>[] | null;
    Landlords: Record<string, any>[];
}

export class DMSExportApiClient {
    constructor(private readonly request: APIRequestContext) {}

    async getExportedData(filters: Record<string, any>): Promise<DMSRawItem[]> {
        const dmsApiUrl = `${process.env.DMS_BASE_URL}/mees/export`;
        const response = await this.request.post(dmsApiUrl, {
            data: filters,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-functions-key': process.env.EXPORT_KEY!
            }
        });
        if (response.status() !== 200) {
            throw new Error(`DMS API request failed with status ${response.status()}`);
        }

        const responseBody = await response.json();
        const parsedResponse = JSON.parse(responseBody);
        if (!parsedResponse || !Array.isArray(parsedResponse.data)) {
            throw new Error('Invalid DMS API response format: ' + responseBody);
        }
        return parsedResponse.data as DMSRawItem[];
    }

    async findFirstFullyPopulatedItem(filters: Record<string, any>): Promise<DMSRawItem> {
        const items = await this.getExportedData(filters);
        if (items.length === 0) {
            throw new Error('No properties returned from DMS export for filters: ' + JSON.stringify(filters));
        }
        const countNonEmpty = (item: DMSRawItem): number => {
            const flat = this.flattenItem(item);
            return Object.values(flat).filter(v => v !== null && v !== undefined && v !== '').length;
        };
        return items.reduce((best, current) =>
            countNonEmpty(current) > countNonEmpty(best) ? current : best
        );
    }

    flattenItem(item: DMSRawItem): Record<string, any> {
        const { property, EpcCertificates, Landlords } = item;

        const firstEPC = Array.isArray(EpcCertificates) && EpcCertificates.length > 0
            ? EpcCertificates[0] : {};
        const firstLandlord = Array.isArray(Landlords) && Landlords.length > 0
            ? this.mapLandlordFields(Landlords[0]) : {};
        return {
            ...property,
            ...firstEPC,
            ...firstLandlord
        };
    }

    private mapLandlordFields(landlord: Record<string, any>): Record<string, any> {
        const fieldMap: Record<string, string> = {
            'Address':        'LandlordAddress',
            'CompanyName':    'LandlordCompanyName',
            'Location':       'LandlordLocation',
            'SicCodeSicText': 'LandlordSicCode'
        };
        return Object.fromEntries(
            Object.entries(landlord).map(([k, v]) => [fieldMap[k] ?? k, v])
        );
    }

    async getPropertyWithMultipleLandlords(filters: Record<string, any>): Promise<DMSRawItem> {
        const items = await this.getExportedData(filters);
        if (items.length === 0) {
            throw new Error('No properties returned from DMS export for filters: ' + JSON.stringify(filters));
        }

        // Find the first property with multiple landlords
        const propertyWithMultipleLandlords = 
            items.find(item => Array.isArray(item.Landlords) && item.Landlords.length > 1);
        if (!propertyWithMultipleLandlords) {
            throw new Error('No properties with multiple landlords found for filters: ' + JSON.stringify(filters));
        }
        return propertyWithMultipleLandlords;
    }

    async getPropertyWithMoreThanFourLandlords(filters: Record<string, any>): Promise<DMSRawItem> {
        const items = await this.getExportedData(filters);
        if (items.length === 0) {
            throw new Error('No properties returned from DMS export for filters: ' + JSON.stringify(filters));
        }

        // Find the first property with more than four landlords
        const propertyWithMoreThanFourLandlords = 
            items.find(item => Array.isArray(item.Landlords) && item.Landlords.length > 4);
        if (!propertyWithMoreThanFourLandlords) {
            throw new Error('No properties with more than four landlords found for filters: ' + JSON.stringify(filters));
        }
        return propertyWithMoreThanFourLandlords;
    }

    async getPropertyWithNoLandlords(filters: Record<string, any>): Promise<DMSRawItem> {
        const items = await this.getExportedData(filters);
        if (items.length === 0) {
            throw new Error('No properties returned from DMS export for filters: ' + JSON.stringify(filters));
        }

        // Find the first property with no landlords
        const propertyWithNoLandlords = 
            items.find(item => Array.isArray(item.Landlords) && item.Landlords.length === 0);
        if (!propertyWithNoLandlords) {
            throw new Error('No properties with no landlords found for filters: ' + JSON.stringify(filters));
        }
        return propertyWithNoLandlords;
    }

    async getPropertyWithAnOwnerWithMultipleSicCodes(filters: Record<string, any>): Promise<DMSRawItem> {
        const items = await this.getExportedData(filters);
        if (items.length === 0) {
            throw new Error('No properties returned from DMS export for filters: ' + JSON.stringify(filters));
        }

        // Find the first property with an owner that has multiple sic codes
        const propertyWithAnOwnerWithMultipleSicCodes = 
            items.find(item => Array.isArray(item.Landlords) && item.Landlords.length > 1);
        if (!propertyWithAnOwnerWithMultipleSicCodes) {
            throw new Error('No properties with an owner with multiple SIC codes found for filters: ' + JSON.stringify(filters));
        }
        return propertyWithAnOwnerWithMultipleSicCodes;
    }

    async getPropertyByOwnerLocation(filters: Record<string, any>, location: string): Promise<DMSRawItem> {
        const items = await this.getExportedData(filters);
        if (items.length === 0) {
            throw new Error('No properties returned from DMS export for filters: ' + JSON.stringify(filters));
        }

        // Find the first property with the specified location
        const propertyByLocation = 
            items.find(item => Array.isArray(item.Landlords) && item.Landlords.some(landlord => landlord.Location === location));
        if (!propertyByLocation) {
            throw new Error('No properties found for location: ' + location + ' with filters: ' + JSON.stringify(filters));
        }
        return propertyByLocation;
    }
}
