import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ViewPropertiesPage } from './ViewPropertiesPage';
import { ElementUtilities } from '../../utils/ElementUtilities';

export class FilterPropertiesPage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly homeBreadcrumb: Locator;
    private readonly councilsList: Locator;
    private readonly councilsDropdown: Locator;
    private readonly energyRatingDropdown: Locator;
    private readonly streetTextBox: Locator;
    private readonly townTextBox: Locator;
    private readonly postcodeTextBox: Locator;
    private readonly applyFiltersButton: Locator;
    private readonly clearFiltersButton: Locator;
    private readonly allLALocationsRadioButton: Locator;
    private readonly onshoreLALocationsRadioButton: Locator;
    private readonly offshoreLALocationsRadioButton: Locator;

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.homeBreadcrumb = page.getByRole('link', { name: 'Home' })
        this.councilsList = page.getByText('You are viewing records for', { exact: false })
        this.councilsDropdown = page.getByLabel('Council')
        this.energyRatingDropdown = page.getByLabel('Energy rating')
        this.streetTextBox = page.getByRole('textbox', { name: 'Street' })
        this.townTextBox = page.getByRole('textbox', { name: 'Town' })
        this.postcodeTextBox = page.getByRole('textbox', { name: 'Postcode' })
        this.applyFiltersButton = page.getByRole('button', { name: 'Apply filters' })
        this.clearFiltersButton = page.getByRole('link', { name: 'Reset filters' })
        this.allLALocationsRadioButton = page.getByRole('radio', { name: 'All locations' })
        this.onshoreLALocationsRadioButton = page.getByRole('radio', { name: 'Onshore (England and Wales)' })
        this.offshoreLALocationsRadioButton = page.getByRole('radio', { name: 'Offshore' })
        
    }

        // Wait for the Filter Properties Page to load
        async waitForPageToLoad(): Promise<void> {
        await super.waitForPageToLoad();
        
        await ElementUtilities.waitForPageToLoad(
            this.page,
            'Filter Properties Page',
            {
                pageContext: this.pageContext,
                homeBreadcrumb: this.homeBreadcrumb,
                councilsList: this.councilsList,
                councilsDropdown: this.councilsDropdown,
                energyRatingDropdown: this.energyRatingDropdown,
                streetTextBox: this.streetTextBox,
                townTextBox: this.townTextBox,
                postcodeTextBox: this.postcodeTextBox,
                applyFiltersButton: this.applyFiltersButton,
                clearFiltersButton: this.clearFiltersButton,
                allLALocationsRadioButton: this.allLALocationsRadioButton,
                onshoreLALocationsRadioButton: this.onshoreLALocationsRadioButton,
                offshoreLALocationsRadioButton: this.offshoreLALocationsRadioButton
            });
    }

    async isDisplayed(): Promise<boolean> {
        return await this.homeBreadcrumb.isVisible() &&
            await this.councilsList.isVisible() &&
            await this.councilsDropdown.isVisible()
    };

    getPageContextLocator(): Locator {
        return this.pageContext;
    }

    async setCouncilFilter(council: string): Promise<void> {
        if (council === 'Show all councils') {
            await this.councilsDropdown.selectOption('');
        } else {
            // Select by label (text content)
            await this.councilsDropdown.selectOption({ label: council });
        }

        //Confirm the dropdown value has been set
        const selectedValue = await this.getSelectedCouncilFilter();
        if (selectedValue !== council) {
            throw new Error(`Failed to set council filter. Expected: ${council}, but got: ${selectedValue}`);
        }
    }

    async getSelectedCouncilFilter(): Promise<string> {
        const selectedValue = await this.councilsDropdown.inputValue();
        
        // If no value selected (empty string), it means "Show all councils" is selected
        if (selectedValue === '') {
            return 'Show all councils';
        }
        
        // Find the option with this value and return its text content
        const selectedOption = await this.councilsDropdown.locator(`option[value="${selectedValue}"]`);
        const textContent = await selectedOption.textContent();
        
        if (!textContent) {
            throw new Error(`Could not find option text for value: ${selectedValue}`);
        }
        
        return textContent.trim();
    }

    async setEnergyRatingFilter(energyRating: string): Promise<void> {
        await this.energyRatingDropdown.selectOption(energyRating);

        //Confirm the dropdown value has been set
        const selectedValue = await this.getSelectedEnergyRatingFilter();
        if (selectedValue !== energyRating) {
            throw new Error(`Failed to set energy rating filter. Expected: ${energyRating}, but got: ${selectedValue}`);
        }
    }

    async getSelectedEnergyRatingFilter(): Promise<string> {
        return await this.energyRatingDropdown.inputValue();
    }

    async setStreetFilter(street: string): Promise<void> {
        await this.streetTextBox.fill(street);

        //Confirm the textbox value has been set
        const enteredValue = await this.getStreetFilterValue();
        if (enteredValue !== street) {
            throw new Error(`Failed to set street filter. Expected: ${street}, but got: ${enteredValue}`);
        }
    }

    async getStreetFilterValue(): Promise<string> {
        return await this.streetTextBox.inputValue();
    }

    async setTownFilter(town: string): Promise<void> {
        await this.townTextBox.fill(town);

        //Confirm the textbox value has been set
        const enteredValue = await this.getTownFilterValue();
        if (enteredValue !== town) {
            throw new Error(`Failed to set town filter. Expected: ${town}, but got: ${enteredValue}`);
        }
    }

    async getTownFilterValue(): Promise<string> {
        return await this.townTextBox.inputValue();
    }

    async setPostcodeFilter(postcode: string): Promise<void> {
        await this.postcodeTextBox.fill(postcode);

        //Confirm the textbox value has been set
        const enteredValue = await this.getPostcodeFilterValue();
        if (enteredValue !== postcode) {
            throw new Error(`Failed to set postcode filter. Expected: ${postcode}, but got: ${enteredValue}`);
        }
    }

    async getPostcodeFilterValue(): Promise<string> {
        return await this.postcodeTextBox.inputValue();
    }

    async clickApplyFilters(): Promise<ViewPropertiesPage> {
        await this.applyFiltersButton.click();
        const viewPropertiesPage = new ViewPropertiesPage(this.page);
        await viewPropertiesPage.waitForPageToLoad();
        return viewPropertiesPage;
    }

    async clickClearFilters(): Promise<void> {
        await this.clearFiltersButton.click();

        // Confirm the filters have been reset
        const selectedCouncil = await this.getSelectedCouncilFilter();
        const selectedEnergyRating = await this.getSelectedEnergyRatingFilter();
        const streetValue = await this.getStreetFilterValue();
        const townValue = await this.getTownFilterValue();
        const postcodeValue = await this.getPostcodeFilterValue();

        if (selectedCouncil !== '' || selectedEnergyRating !== '' || streetValue !== '' || townValue !== '' || postcodeValue !== '') {
            throw new Error('Failed to clear filters. Some filters are still set.');
        }
    }

    async selectAllLALocations(): Promise<void> {
        await this.allLALocationsRadioButton.check();

        // Confirm the radio button is selected
        if (!await this.allLALocationsRadioButton.isChecked()) {
            throw new Error('Failed to select "All locations" radio button.');
        }
    }

    async selectOnshoreLALocations(): Promise<void> {
        await this.onshoreLALocationsRadioButton.check();

        // Confirm the radio button is selected
        if (!await this.onshoreLALocationsRadioButton.isChecked()) {
            throw new Error('Failed to select "Onshore (England and Wales)" radio button.');
        }
    }

    async selectOffshoreLALocations(): Promise<void> {
        await this.offshoreLALocationsRadioButton.check();

        // Confirm the radio button is selected
        if (!await this.offshoreLALocationsRadioButton.isChecked()) {
            throw new Error('Failed to select "Offshore" radio button.');
        }
    }
}