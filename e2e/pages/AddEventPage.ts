import { expect } from '@playwright/test'
import type { TestEventData } from '../fixtures/testDataFixture'
import { AssertionHelper } from '../helpers/AssertionHelper'
import { FormHelper } from '../helpers/FormHelper'
import { Selectors } from '../selectors/Selectors'
import { formatDateForInput } from '../utils/dateUtils'
import { BasePage } from './BasePage'

/**
 * Page Object Model for the Add Event Page
 *
 * Handles navigation, form interactions, and verification for the add event page.
 * Leverages FormHelper for form operations and AssertionHelper for verifications
 * to reduce code duplication and improve maintainability.
 *
 * @example
 * ```typescript
 * const addPage = new AddEventPage(page)
 * await addPage.goto()
 * await addPage.addEvent(eventData)
 * await addPage.verifyPageLoaded()
 * ```
 */
export class AddEventPage extends BasePage {
	private formHelper = new FormHelper()

	/**
	 * Navigate to the add event page
	 */
	async goto(): Promise<void> {
		await this.page.goto('/add')
	}

	/**
	 * Click the back button and verify navigation to home
	 */
	async goBack(): Promise<void> {
		await Selectors.navigation.backButton(this.page).click()
		await AssertionHelper.assertPageURL(this.page, '/')
	}

	/**
	 * Click the cancel button and verify navigation to home
	 */
	async cancel(): Promise<void> {
		await Selectors.form.cancelButton(this.page).click()
		await AssertionHelper.assertPageURL(this.page, '/')
	}

	/**
	 * Fill the name input field
	 */
	async fillName(name: string): Promise<void> {
		await this.formHelper.fillTextField(
			Selectors.form.nameInput(this.page),
			name,
		)
	}

	/**
	 * Fill the gregorian date input field
	 */
	async fillGregorianDate(date: string): Promise<void> {
		await this.formHelper.fillDateField(
			Selectors.form.gregorianDateInput(this.page),
			date,
		)
	}

	/**
	 * Fill the relationship input field
	 */
	async fillRelationship(relationship: string): Promise<void> {
		await this.formHelper.fillTextField(
			Selectors.form.relationshipInput(this.page),
			relationship,
		)
	}

	/**
	 * Fill all event form fields with provided data
	 */
	async fillEventData(eventData: TestEventData): Promise<void> {
		await this.formHelper.fillEventForm(
			{
				nameInput: Selectors.form.nameInput(this.page),
				dateInput: Selectors.form.gregorianDateInput(this.page),
				relationshipInput: Selectors.form.relationshipInput(this.page),
			},
			eventData,
		)
	}

	/**
	 * Clear all form input fields
	 */
	async clearForm(): Promise<void> {
		await this.formHelper.clearForm([
			Selectors.form.nameInput(this.page),
			Selectors.form.gregorianDateInput(this.page),
			Selectors.form.relationshipInput(this.page),
		])
	}

	/**
	 * Submit the form by clicking the submit button
	 */
	async submitForm(): Promise<void> {
		await this.formHelper.submitForm(Selectors.form.submitButton(this.page))
	}

	/**
	 * Submit the form and verify successful navigation to home page
	 */
	async submitAndExpectSuccess(): Promise<void> {
		await this.submitForm()
		await AssertionHelper.assertPageURL(this.page, '/')
	}

	/**
	 * Submit the form and verify it stays on the add page (validation error)
	 */
	async submitAndExpectError(): Promise<void> {
		await this.submitForm()
		await AssertionHelper.assertPageURL(this.page, '/add')
	}

	/**
	 * Complete workflow: fill form and submit successfully
	 */
	async addEvent(eventData: TestEventData): Promise<void> {
		await this.fillEventData(eventData)
		await this.submitAndExpectSuccess()
	}

	/**
	 * Verify the page has loaded with all required elements visible
	 */
	async verifyPageLoaded(): Promise<void> {
		await AssertionHelper.assertElementVisible(
			Selectors.page.pageTitle(this.page),
		)
		await AssertionHelper.assertElementVisible(
			Selectors.form.nameInput(this.page),
		)
		await AssertionHelper.assertElementVisible(
			Selectors.form.gregorianDateInput(this.page),
		)
		await AssertionHelper.assertElementVisible(
			Selectors.form.submitButton(this.page),
		)
	}

	/**
	 * Verify all form fields are empty
	 */
	async verifyFormEmpty(): Promise<void> {
		await expect(Selectors.form.nameInput(this.page)).toHaveValue('')
		await expect(Selectors.form.gregorianDateInput(this.page)).toHaveValue('')
		await expect(Selectors.form.relationshipInput(this.page)).toHaveValue('')
	}

	/**
	 * Verify form fields match the provided event data
	 */
	async verifyFormFilled(eventData: TestEventData): Promise<void> {
		await AssertionHelper.assertFormFilled(this.page, eventData, {
			nameInput: Selectors.form.nameInput(this.page),
			dateInput: Selectors.form.gregorianDateInput(this.page),
			relationshipInput: Selectors.form.relationshipInput(this.page),
		})
	}

	/**
	 * Verify the hijri date preview displays the expected date
	 */
	async verifyHijriDatePreview(expectedHijriDate: string): Promise<void> {
		await expect(Selectors.preview.hijriDatePreview(this.page)).toHaveText(
			expectedHijriDate,
		)
	}

	/**
	 * Verify the age preview displays the expected age
	 */
	async verifyAgePreview(expectedAge: number): Promise<void> {
		await expect(Selectors.preview.agePreview(this.page)).toContainText(
			expectedAge.toString(),
		)
	}

	/**
	 * Verify the next birthday preview displays the expected text
	 */
	async verifyNextBirthdayPreview(expectedText: string): Promise<void> {
		await expect(
			Selectors.preview.nextBirthdayPreview(this.page),
		).toContainText(expectedText)
	}

	/**
	 * Verify name field error message
	 */
	async verifyNameError(expectedError: string): Promise<void> {
		await AssertionHelper.assertValidationError(
			this.page,
			'name',
			expectedError,
		)
	}

	/**
	 * Verify date field error message
	 */
	async verifyDateError(expectedError: string): Promise<void> {
		await AssertionHelper.assertValidationError(
			this.page,
			'date',
			expectedError,
		)
	}

	/**
	 * Verify form-level error message
	 */
	async verifyFormError(expectedError: string): Promise<void> {
		await AssertionHelper.assertValidationError(
			this.page,
			'form',
			expectedError,
		)
	}

	/**
	 * Verify no validation errors are visible
	 */
	async verifyNoErrors(): Promise<void> {
		await AssertionHelper.assertElementVisible(
			Selectors.form.nameError(this.page),
			false,
		)
		await AssertionHelper.assertElementVisible(
			Selectors.form.dateError(this.page),
			false,
		)
		await AssertionHelper.assertElementVisible(
			Selectors.form.formError(this.page),
			false,
		)
	}

	/**
	 * Verify submit button is enabled
	 */
	async verifySubmitButtonEnabled(): Promise<void> {
		await expect(Selectors.form.submitButton(this.page)).toBeEnabled()
	}

	/**
	 * Verify submit button is disabled
	 */
	async verifySubmitButtonDisabled(): Promise<void> {
		await expect(Selectors.form.submitButton(this.page)).toBeDisabled()
	}

	/**
	 * Verify loading state is visible
	 */
	async verifyLoadingState(): Promise<void> {
		await AssertionHelper.assertElementVisible(
			Selectors.page.loadingSpinner(this.page),
		)
		await AssertionHelper.assertElementVisible(
			Selectors.page.submitButtonLoading(this.page),
		)
	}

	/**
	 * Verify loading state is not visible
	 */
	async verifyNotLoadingState(): Promise<void> {
		await AssertionHelper.assertElementVisible(
			Selectors.page.loadingSpinner(this.page),
			false,
		)
		await AssertionHelper.assertElementVisible(
			Selectors.page.submitButtonLoading(this.page),
			false,
		)
	}

	/**
	 * Wait for hijri date preview to update after date input
	 */
	async waitForPreviewUpdate(): Promise<void> {
		await Selectors.preview.hijriDatePreview(this.page).waitFor({
			state: 'visible',
		})
	}

	/**
	 * Verify preview updates when date is changed
	 */
	async verifyPreviewUpdatesOnDateChange(
		eventData: TestEventData,
	): Promise<void> {
		await this.fillGregorianDate(formatDateForInput(eventData.gregorianDate))
		await this.waitForPreviewUpdate()

		// Verify hijri date preview shows
		await AssertionHelper.assertElementVisible(
			Selectors.preview.hijriDatePreview(this.page),
		)
		await expect(Selectors.preview.hijriDatePreview(this.page)).not.toHaveText(
			'',
		)
	}

	/**
	 * Verify form labels have proper accessibility attributes
	 */
	async verifyFormAccessibility(): Promise<void> {
		await expect(Selectors.form.nameInput(this.page)).toHaveAttribute(
			'aria-label',
		)
		await expect(Selectors.form.gregorianDateInput(this.page)).toHaveAttribute(
			'aria-label',
		)
		await expect(Selectors.form.relationshipInput(this.page)).toHaveAttribute(
			'aria-label',
		)
	}

	/**
	 * Verify error messages have proper accessibility attributes
	 */
	async verifyErrorAccessibility(): Promise<void> {
		await expect(Selectors.form.nameError(this.page)).toHaveAttribute(
			'role',
			'alert',
		)
		await expect(Selectors.form.dateError(this.page)).toHaveAttribute(
			'role',
			'alert',
		)
	}
}
