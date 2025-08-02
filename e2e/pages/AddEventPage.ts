import { expect, type Locator, type Page } from '@playwright/test'
import type { TestEventData } from '../fixtures/testDataFixture'
import { formatDateForInput } from '../utils/dateUtils'

/**
 * Page Object Model for the Add Event Page
 */
export class AddEventPage {
	readonly page: Page

	// Form elements
	readonly nameInput: Locator
	readonly gregorianDateInput: Locator
	readonly relationshipInput: Locator
	readonly submitButton: Locator
	readonly cancelButton: Locator

	// Preview elements
	readonly hijriDatePreview: Locator
	readonly agePreview: Locator
	readonly nextBirthdayPreview: Locator

	// Validation elements
	readonly nameError: Locator
	readonly dateError: Locator
	readonly formErrors: Locator

	// Loading states
	readonly loadingSpinner: Locator
	readonly submitButtonLoading: Locator

	// Page elements
	readonly pageTitle: Locator
	readonly backButton: Locator

	constructor(page: Page) {
		this.page = page

		// Form elements
		this.nameInput = page.getByTestId('name-input')
		this.gregorianDateInput = page.getByTestId('gregorian-date-input')
		this.relationshipInput = page.getByTestId('relationship-input')
		this.submitButton = page.getByTestId('submit-button')
		this.cancelButton = page.getByTestId('cancel-button')

		// Preview elements
		this.hijriDatePreview = page.getByTestId('hijri-date-preview')
		this.agePreview = page.getByTestId('age-preview')
		this.nextBirthdayPreview = page.getByTestId('next-birthday-preview')

		// Validation elements
		this.nameError = page.getByTestId('name-error')
		this.dateError = page.getByTestId('date-error')
		this.formErrors = page.getByTestId('form-error')

		// Loading states
		this.loadingSpinner = page.getByTestId('loading-spinner')
		this.submitButtonLoading = page.getByTestId('submit-button-loading')

		// Page elements
		this.pageTitle = page.getByTestId('page-title')
		this.backButton = page.getByTestId('back-button')
	}

	/**
	 * Navigation methods
	 */
	async goto(): Promise<void> {
		await this.page.goto('/add')
	}

	async goBack(): Promise<void> {
		await this.backButton.click()
		await expect(this.page).toHaveURL('/')
	}

	async cancel(): Promise<void> {
		await this.cancelButton.click()
		await expect(this.page).toHaveURL('/')
	}

	/**
	 * Form filling methods
	 */
	async fillName(name: string): Promise<void> {
		await this.nameInput.clear()
		await this.nameInput.fill(name)
	}

	async fillGregorianDate(date: string): Promise<void> {
		await this.gregorianDateInput.clear()
		await this.gregorianDateInput.fill(date)
	}

	async fillRelationship(relationship: string): Promise<void> {
		await this.relationshipInput.clear()
		await this.relationshipInput.fill(relationship)
	}

	async fillEventData(eventData: TestEventData): Promise<void> {
		await this.fillName(eventData.name)
		await this.fillGregorianDate(formatDateForInput(eventData.gregorianDate))

		if (eventData.relationship) {
			await this.fillRelationship(eventData.relationship)
		}
	}

	async clearForm(): Promise<void> {
		await this.nameInput.clear()
		await this.gregorianDateInput.clear()
		await this.relationshipInput.clear()
	}

	/**
	 * Form submission methods
	 */
	async submitForm(): Promise<void> {
		await this.submitButton.click()
	}

	async submitAndExpectSuccess(): Promise<void> {
		await this.submitForm()
		await expect(this.page).toHaveURL('/')
	}

	async submitAndExpectError(): Promise<void> {
		await this.submitForm()
		// Should stay on the same page when there are errors
		await expect(this.page).toHaveURL('/add')
	}

	/**
	 * Complete form submission workflow
	 */
	async addEvent(eventData: TestEventData): Promise<void> {
		await this.fillEventData(eventData)
		await this.submitAndExpectSuccess()
	}

	/**
	 * Verification methods
	 */
	async verifyPageLoaded(): Promise<void> {
		await expect(this.pageTitle).toBeVisible()
		await expect(this.nameInput).toBeVisible()
		await expect(this.gregorianDateInput).toBeVisible()
		await expect(this.submitButton).toBeVisible()
	}

	async verifyFormEmpty(): Promise<void> {
		await expect(this.nameInput).toHaveValue('')
		await expect(this.gregorianDateInput).toHaveValue('')
		await expect(this.relationshipInput).toHaveValue('')
	}

	async verifyFormFilled(eventData: TestEventData): Promise<void> {
		await expect(this.nameInput).toHaveValue(eventData.name)
		await expect(this.gregorianDateInput).toHaveValue(
			formatDateForInput(eventData.gregorianDate),
		)

		if (eventData.relationship) {
			await expect(this.relationshipInput).toHaveValue(eventData.relationship)
		}
	}

	async verifyHijriDatePreview(expectedHijriDate: string): Promise<void> {
		await expect(this.hijriDatePreview).toHaveText(expectedHijriDate)
	}

	async verifyAgePreview(expectedAge: number): Promise<void> {
		await expect(this.agePreview).toContainText(expectedAge.toString())
	}

	async verifyNextBirthdayPreview(expectedText: string): Promise<void> {
		await expect(this.nextBirthdayPreview).toContainText(expectedText)
	}

	/**
	 * Validation methods
	 */
	async verifyNameError(expectedError: string): Promise<void> {
		await expect(this.nameError).toBeVisible()
		await expect(this.nameError).toHaveText(expectedError)
	}

	async verifyDateError(expectedError: string): Promise<void> {
		// Wait for form submission to complete first
		await this.page.waitForTimeout(100)

		try {
			await expect(this.dateError).toBeVisible({ timeout: 5000 })
			await expect(this.dateError).toHaveText(expectedError)
		} catch (error) {
			// Enhanced debugging
			const formState = await this.captureFormState()
			console.error('❌ Date error verification failed:', {
				expected: expectedError,
				formState,
				pageUrl: this.page.url(),
			})
			throw error
		}
	}

	async verifyFormError(expectedError: string): Promise<void> {
		try {
			await expect(this.formErrors).toBeVisible()
			// The actual DOM includes "Error" prefix from the SVG title
			await expect(this.formErrors).toContainText(expectedError)
		} catch (error) {
			// Enhanced debugging
			const actualText = await this.formErrors.textContent().catch(() => 'N/A')
			const allErrors = await this.page.getByTestId(/.*error.*/).all()
			const errorInfo = await Promise.all(
				allErrors.map(async (el) => ({
					testId: await el.getAttribute('data-testid'),
					text: await el.textContent(),
					visible: await el.isVisible(),
				})),
			)

			console.error('❌ Form error verification failed:', {
				expected: expectedError,
				actual: actualText,
				allErrors: errorInfo,
				pageUrl: this.page.url(),
			})

			throw error
		}
	}

	async verifyNoErrors(): Promise<void> {
		await expect(this.nameError).not.toBeVisible()
		await expect(this.dateError).not.toBeVisible()
		await expect(this.formErrors).not.toBeVisible()
	}

	/**
	 * Input validation methods
	 */
	async verifyNameRequired(): Promise<void> {
		await this.fillName('')
		await this.submitAndExpectError()
		await this.verifyNameError('Name is required')
	}

	async verifyDateRequired(): Promise<void> {
		await this.fillName('Test Name')
		await this.fillGregorianDate('')
		await this.submitAndExpectError()
		await this.verifyDateError('Date is required')
	}

	async verifyInvalidDate(): Promise<void> {
		await this.fillName('Test Name')
		await this.fillGregorianDate('invalid-date')
		await this.submitAndExpectError()
		await this.verifyDateError('Please enter a valid date')
	}

	async verifyFutureDate(): Promise<void> {
		await this.fillName('Test Name')
		await this.fillGregorianDate('2030-01-01')
		await this.submitAndExpectError()
		await this.verifyDateError('Birth date cannot be in the future')
	}

	/**
	 * Loading state methods
	 */
	async verifySubmitButtonEnabled(): Promise<void> {
		await expect(this.submitButton).toBeEnabled()
	}

	async verifySubmitButtonDisabled(): Promise<void> {
		await expect(this.submitButton).toBeDisabled()
	}

	async verifyLoadingState(): Promise<void> {
		await expect(this.loadingSpinner).toBeVisible()
		await expect(this.submitButtonLoading).toBeVisible()
	}

	async verifyNotLoadingState(): Promise<void> {
		await expect(this.loadingSpinner).not.toBeVisible()
		await expect(this.submitButtonLoading).not.toBeVisible()
	}

	/**
	 * Preview update methods
	 */
	async waitForPreviewUpdate(): Promise<void> {
		// Wait for hijri date preview to update after gregorian date input
		await this.hijriDatePreview.waitFor({ state: 'visible' })
	}

	async verifyPreviewUpdatesOnDateChange(
		eventData: TestEventData,
	): Promise<void> {
		await this.fillGregorianDate(formatDateForInput(eventData.gregorianDate))
		await this.waitForPreviewUpdate()

		// Verify hijri date preview shows
		await expect(this.hijriDatePreview).toBeVisible()
		await expect(this.hijriDatePreview).not.toHaveText('')
	}

	/**
	 * Accessibility methods
	 */
	async verifyFormAccessibility(): Promise<void> {
		// Verify form labels are properly associated
		await expect(this.nameInput).toHaveAttribute('aria-label')
		await expect(this.gregorianDateInput).toHaveAttribute('aria-label')
		await expect(this.relationshipInput).toHaveAttribute('aria-label')
	}

	async verifyErrorAccessibility(): Promise<void> {
		// Verify error messages are properly announced
		await expect(this.nameError).toHaveAttribute('role', 'alert')
		await expect(this.dateError).toHaveAttribute('role', 'alert')
	}

	/**
	 * Keyboard navigation methods
	 */
	async navigateWithKeyboard(): Promise<void> {
		await this.nameInput.focus()
		await this.page.keyboard.press('Tab')
		await expect(this.gregorianDateInput).toBeFocused()

		// Tab through any potential intermediate elements until we reach relationship input
		let attempts = 0
		const maxAttempts = 5
		while (attempts < maxAttempts) {
			await this.page.keyboard.press('Tab')
			const isFocused = await this.relationshipInput.evaluate(
				(el) => document.activeElement === el,
			)
			if (isFocused) {
				break
			}
			attempts++
		}
		await expect(this.relationshipInput).toBeFocused()

		// Continue to submit button
		attempts = 0
		while (attempts < maxAttempts) {
			await this.page.keyboard.press('Tab')
			const isFocused = await this.submitButton.evaluate(
				(el) => document.activeElement === el,
			)
			if (isFocused) {
				break
			}
			attempts++
		}
		await expect(this.submitButton).toBeFocused()
	}

	async submitWithEnter(): Promise<void> {
		await this.nameInput.focus()
		await this.page.keyboard.press('Enter')
		// Form should submit when Enter is pressed in any input
	}

	/**
	 * Complex workflow methods
	 */
	async testCompleteWorkflow(eventData: TestEventData): Promise<void> {
		await this.verifyPageLoaded()
		await this.verifyFormEmpty()
		await this.fillEventData(eventData)
		await this.verifyFormFilled(eventData)
		await this.verifyPreviewUpdatesOnDateChange(eventData)
		await this.submitAndExpectSuccess()
	}

	async testValidationWorkflow(): Promise<void> {
		await this.verifyPageLoaded()
		await this.verifyNameRequired()
		await this.verifyDateRequired()
		await this.verifyInvalidDate()
		await this.verifyFutureDate()
	}

	/**
	 * Helper method to capture form state for debugging
	 */
	private async captureFormState() {
		return {
			nameValue: await this.nameInput.inputValue().catch(() => 'N/A'),
			dateValue: await this.gregorianDateInput.inputValue().catch(() => 'N/A'),
			relationshipValue: await this.relationshipInput
				.inputValue()
				.catch(() => 'N/A'),
			visibleErrors: await this.page.getByTestId(/.*error.*/).count(),
		}
	}
}
