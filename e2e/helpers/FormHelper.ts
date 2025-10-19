import type { Locator } from '@playwright/test'
import type { TestEventData } from '../fixtures/testDataFixture'
import { formatDateForInput } from '../utils/dateUtils'

/**
 * FormHelper class for centralizing reusable form interaction patterns
 *
 * This helper eliminates duplication between AddEventPage and EditEventPage
 * by providing common form manipulation methods with consistent error handling.
 *
 * @example
 * ```typescript
 * const formHelper = new FormHelper()
 * await formHelper.fillTextField(page.getByTestId('name-input'), 'John Doe')
 * await formHelper.fillDateField(page.getByTestId('date-input'), '2000-06-15')
 * await formHelper.submitForm(page.getByTestId('submit-button'))
 * ```
 */
export class FormHelper {
	/**
	 * Clear and fill a text input field
	 *
	 * Clears any existing value first, then fills with the provided text.
	 * Useful for ensuring clean state before entering new data.
	 *
	 * @param locator - The input field locator to fill
	 * @param value - The text value to enter
	 * @throws Error if the field cannot be cleared or filled
	 *
	 * @example
	 * ```typescript
	 * await formHelper.fillTextField(nameInput, 'Alice Smith')
	 * ```
	 */
	async fillTextField(locator: Locator, value: string): Promise<void> {
		try {
			await locator.clear()
			await locator.fill(value)
		} catch (error) {
			throw new Error(
				`Failed to fill text field with value "${value}": ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Fill a date input field with formatted date string
	 *
	 * Clears any existing value first, then fills with the provided date.
	 * Date should be in YYYY-MM-DD format for HTML date inputs.
	 *
	 * @param locator - The date input field locator
	 * @param date - The date string in YYYY-MM-DD format
	 * @throws Error if the field cannot be cleared or filled
	 *
	 * @example
	 * ```typescript
	 * await formHelper.fillDateField(dateInput, '2000-06-15')
	 * ```
	 */
	async fillDateField(locator: Locator, date: string): Promise<void> {
		try {
			await locator.clear()
			await locator.fill(date)
		} catch (error) {
			throw new Error(
				`Failed to fill date field with value "${date}": ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Clear multiple input fields
	 *
	 * Clears all provided input locators. Useful for resetting entire forms
	 * or clearing specific groups of fields.
	 *
	 * @param locators - Array of input field locators to clear
	 * @throws Error if any field cannot be cleared
	 *
	 * @example
	 * ```typescript
	 * await formHelper.clearForm([nameInput, dateInput, relationshipInput])
	 * ```
	 */
	async clearForm(locators: Locator[]): Promise<void> {
		try {
			for (const locator of locators) {
				await locator.clear()
			}
		} catch (error) {
			throw new Error(
				`Failed to clear form fields: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Click the submit button to submit a form
	 *
	 * Clicks the provided submit button locator. Handles the form submission
	 * action without waiting for navigation or validation results.
	 *
	 * @param submitButton - The submit button locator
	 * @throws Error if the button cannot be clicked
	 *
	 * @example
	 * ```typescript
	 * await formHelper.submitForm(submitButton)
	 * ```
	 */
	async submitForm(submitButton: Locator): Promise<void> {
		try {
			await submitButton.click()
		} catch (error) {
			throw new Error(
				`Failed to submit form: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Fill a complete event form with all required and optional fields
	 *
	 * Fills the event form with name, date, and optionally relationship data.
	 * Automatically formats the date using formatDateForInput utility.
	 * Skips the relationship field if not provided in eventData.
	 *
	 * @param data - Object containing form field locators
	 * @param data.nameInput - Locator for the name input field
	 * @param data.dateInput - Locator for the date input field
	 * @param data.relationshipInput - Optional locator for the relationship input field
	 * @param eventData - The event data to fill into the form
	 * @throws Error if any field cannot be filled
	 *
	 * @example
	 * ```typescript
	 * const eventData = {
	 *   name: 'John Doe',
	 *   gregorianDate: Temporal.PlainDate.from('2000-06-15'),
	 *   relationship: 'Friend'
	 * }
	 *
	 * await formHelper.fillEventForm(
	 *   {
	 *     nameInput: page.getByTestId('name-input'),
	 *     dateInput: page.getByTestId('date-input'),
	 *     relationshipInput: page.getByTestId('relationship-input')
	 *   },
	 *   eventData
	 * )
	 * ```
	 */
	async fillEventForm(
		data: {
			nameInput: Locator
			dateInput: Locator
			relationshipInput?: Locator
		},
		eventData: TestEventData,
	): Promise<void> {
		try {
			// Fill name field
			await this.fillTextField(data.nameInput, eventData.name)

			// Fill date field with formatted date
			const formattedDate = formatDateForInput(eventData.gregorianDate)
			await this.fillDateField(data.dateInput, formattedDate)

			// Fill relationship field if provided
			if (eventData.relationship && data.relationshipInput) {
				await this.fillTextField(data.relationshipInput, eventData.relationship)
			}
		} catch (error) {
			throw new Error(
				`Failed to fill event form: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
}
