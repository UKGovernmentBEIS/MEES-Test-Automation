import { Page, Locator } from '@playwright/test';
import { BaseCompliancePage } from './BaseCompliancePage';
import { ViewPropertiesPage } from './ViewPropertiesPage';
import { ElementUtilities } from '../../utils/ElementUtilities';
import { HomePage } from './HomePage';

type EnergyRatings = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'Unrated';

export class FilterPropertiesPage extends BaseCompliancePage {
    private pageContext: Locator;
    private readonly homeBreadcrumb: Locator;
    private readonly councilStatement: Locator;
    private readonly councilsList: Locator;
    private readonly councilsDropdown: Locator;
    private readonly streetTextBox: Locator;
    private readonly townTextBox: Locator;
    private readonly postcodeTextBox: Locator;
    private readonly applyFiltersButton: Locator;
    private readonly clearFiltersButton: Locator;
    private readonly allLALocationsRadioButton: Locator;
    private readonly onshoreLALocationsRadioButton: Locator;
    private readonly offshoreLALocationsRadioButton: Locator;

    private energyRatingCheckboxes(letter: EnergyRatings): Locator {
        return this.page.getByRole('checkbox', { name: letter, exact: true });
    }

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.homeBreadcrumb = page.getByRole('link', { name: 'Home' })
        this.councilStatement = page.getByText('You can view records from', { exact: false })
        this.councilsList = page.locator('.govuk-details__text ul.govuk-list--bullet');
        this.councilsDropdown = page.getByLabel('Council')
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
                councilStatement: this.councilStatement,
                councilsDropdown: this.councilsDropdown,
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
        return this.page.url().includes('filter-properties');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        return [this.pageContext];
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

    async setEnergyRatingFilter(energyRating: EnergyRatings): Promise<void> {
        await this.energyRatingCheckboxes(energyRating).check();

        //Confirm the dropdown value has been set
        if (await this.energyRatingCheckboxes(energyRating).isChecked() === false) {
            throw new Error(`Failed to set energy rating filter. Expected: ${energyRating} to be checked.`);
        }
    }

    async getSelectedEnergyRatingFilter(): Promise<string[]> {
        const selectedRatings: string[] = [];
        for (const rating of ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as EnergyRatings[]) {
            if (await this.energyRatingCheckboxes(rating).isChecked()) {
                selectedRatings.push(rating);
            }
        }
        return selectedRatings;
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

        if (selectedCouncil !== 'Show all councils') {
            throw new Error(`Failed to clear council filter. Expected: Show all councils, but got: ${selectedCouncil}`);
        }
        if (selectedEnergyRating.length !== 0) {
            throw new Error(`Failed to clear energy rating filter. Expected: All energy ratings, but got: ${selectedEnergyRating}`);
        }
        if (streetValue !== '') {
            throw new Error(`Failed to clear street filter. Expected: empty string, but got: ${streetValue}`);
        }
        if (townValue !== '') {
            throw new Error(`Failed to clear town filter. Expected: empty string, but got: ${townValue}`);
        }
        if (postcodeValue !== '') {
            throw new Error(`Failed to clear postcode filter. Expected: empty string, but got: ${postcodeValue}`);
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

    async getLACouncilsList(): Promise<Locator[]> {
        // Check if the councils list is already visible, if not click to expand it
        const isVisible: boolean = await this.councilsList.isVisible();
        if (!isVisible) {
            await this.councilStatement.click();
            await this.councilsList.waitFor({ state: 'visible', timeout: 5000 });
        }
        const councilItems = await this.councilsList.locator('li').all();
            return councilItems;
    }

    async clickBreadcrumbHome(): Promise<HomePage> {
        await this.homeBreadcrumb.click();

        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }
}