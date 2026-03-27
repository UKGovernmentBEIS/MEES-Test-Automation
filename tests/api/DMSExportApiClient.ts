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
}
