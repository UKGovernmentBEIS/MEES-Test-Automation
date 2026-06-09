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
    private readonly showAllRentalEvidenceRadioButton: Locator;
    private readonly evidenceFoundRadioButton: Locator;
    private readonly notFoundRadioButton: Locator;

    private energyRatingCheckboxes(letter: EnergyRatings): Locator {
        return this.page.getByRole('checkbox', { name: letter, exact: true });
    }

    constructor(page: Page) {
        super(page);
        this.pageContext = page.locator('#main-content');
        this.homeBreadcrumb = page.getByRole('link', { name: 'Home' })
        this.councilStatement = page.getByText('You can view records from', { exact: false })
        this.councilsList = page.locator('.govuk-details__text ul.govuk-list--bullet');
        this.councilsDropdown = page.locator('//*[contains(@id, "localAuthority")]');
        this.streetTextBox = page.getByRole('textbox', { name: 'Street' })
        this.townTextBox = page.getByRole('textbox', { name: 'Town' })
        this.postcodeTextBox = page.getByRole('textbox', { name: 'Postcode' })
        this.applyFiltersButton = page.getByRole('button', { name: 'Apply filters' })
        this.clearFiltersButton = page.getByRole('link', { name: 'Reset filters' })
        this.showAllRentalEvidenceRadioButton = page.getByRole('radio', { name: 'Show all' })
        this.evidenceFoundRadioButton = page.getByRole('radio', { name: 'Evidence found' })
        this.notFoundRadioButton = page.getByRole('radio', { name: 'Not found' })
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
                clearFiltersButton: this.clearFiltersButton
            });
    }

    async isDisplayed(): Promise<boolean> {
        return this.page.url().includes('filter-properties');
    }

    async getPageContextLocator(): Promise<Locator[]> {
        // Return only the static form structure. The council dropdown (its options and their
        // order) and the "view records from N councils" statement are excluded as they are
        // data-dependent — consistent with the Templates and Guidance page context scoping.
        return [
            this.homeBreadcrumb,
            this.streetTextBox,
            this.townTextBox,
            this.postcodeTextBox,
            this.showAllRentalEvidenceRadioButton,
            this.evidenceFoundRadioButton,
            this.notFoundRadioButton,
            this.applyFiltersButton,
            this.clearFiltersButton
        ];
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
        // Blur to fire the change event so the underlying LWC commits the value before the filter
        // is applied. fill() only fires input, which the component does not always bind to in time.
        await this.streetTextBox.blur();

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
        // Blur to fire the change event so the underlying LWC commits the value before the filter
        // is applied. fill() only fires input, which the component does not always bind to in time.
        await this.townTextBox.blur();

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
        // Blur to fire the change event so the underlying LWC commits the value before the filter
        // is applied. fill() only fires input, which the component does not always bind to in time.
        await this.postcodeTextBox.blur();

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
        const rentalEvidence = await this.getSelectedRentalEvidenceFilter();

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
        if (rentalEvidence !== 'Show all') {
            throw new Error(`Failed to clear rental evidence filter. Expected: Show all, but got: ${rentalEvidence}`);
        }
    }

    async getSelectedRentalEvidenceFilter(): Promise<string> {
        if (await this.showAllRentalEvidenceRadioButton.isChecked()) return 'Show all';
        if (await this.evidenceFoundRadioButton.isChecked()) return 'Evidence found';
        if (await this.notFoundRadioButton.isChecked()) return 'Not found';
        return '';
    }

    async getCouncilDropdownDefaultOptionText(): Promise<string> {
        const defaultOption = this.councilsDropdown.locator('option[value=""]');
        return (await defaultOption.textContent() ?? '').trim();
    }

    async getLACouncilsList(): Promise<Locator> {
        // Check if the councils list is already visible, if not click to expand it
        const isVisible: boolean = await this.councilsList.isVisible();
        if (!isVisible) {
            await this.councilStatement.click();
            await this.councilsList.waitFor({ state: 'visible', timeout: 5000 });
        }
        return this.councilsList;
    }

    async clickBreadcrumbHome(): Promise<HomePage> {
        await this.homeBreadcrumb.click();

        const homePage = new HomePage(this.page);
        await homePage.waitForPageToLoad();
        return homePage;
    }

    async isShowAllRentalEvidenceSelected(): Promise<boolean> {
        return await this.showAllRentalEvidenceRadioButton.isChecked();
    }

    async selectShowAllRentalEvidence(): Promise<void> {
        await this.showAllRentalEvidenceRadioButton.check();
        if (!await this.isShowAllRentalEvidenceSelected()) {
            throw new Error('Failed to select "Show all" radio button.');
        }
    }

    async isEvidenceFoundRentalEvidenceSelected(): Promise<boolean> {
        return await this.evidenceFoundRadioButton.isChecked();
    }

    async selectEvidenceFoundRentalEvidence(): Promise<void> {
        await this.evidenceFoundRadioButton.check();
        if (!await this.isEvidenceFoundRentalEvidenceSelected()) {
            throw new Error('Failed to select "Evidence found" radio button.');
        }
    }

    async isNotFoundRentalEvidenceSelected(): Promise<boolean> {
        return await this.notFoundRadioButton.isChecked();
    }

    async selectNotFoundRentalEvidence(): Promise<void> {
        await this.notFoundRadioButton.check();
        if (!await this.isNotFoundRentalEvidenceSelected()) {
            throw new Error('Failed to select "Not found" radio button.');
        }
    }
} 