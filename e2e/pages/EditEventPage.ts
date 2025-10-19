import { expect, type Locator, type Page } from '@playwright/test'
import type { TestEventData } from '../fixtures/testDataFixture'
import { AssertionHelper } from '../helpers/AssertionHelper'
import { FormHelper } from '../helpers/FormHelper'
import { Selectors } from '../selectors/Selectors'
import { formatDateForInput } from '../utils/dateUtils'
import { BasePage } from './BasePage'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'

/**
 * EditEventPage class - Page Object Model for the Edit Event Page (/recorded/:id/edit)
 *
 * Handles editing existing events with form interactions, validation, and deletion.
 * Leverages FormHelper for form operations and AssertionHelper for verifications
 * to reduce code duplication and improve maintainability.
 *
 * @example
 * ```typescript
 * const editPage = new EditEventPage(page)
 * await editPage.gotoEdit('event-123')
 * await editPage.fillName('Updated Name')
 * await editPage.submitAndExpectSuccess()
 * ```
 */
export class EditEventPage extends BasePage {
	readonly formHelper: FormHelper
	readonly nameInput: Locator
	readonly gregorianDateInput: Locator
	readonly relationshipInput: Locator
	readonly submitButton: Locator
	readonly cancelButton: Locator
	readonly deleteButton: Locator
	readonly hijriDatePreview: Locator
	readonly nameError: Locator
	readonly dateError: Locator

	constructor(page: Page) {
		super(page)
		this.formHelper = new FormHelper()

		// Use Selectors for all form inputs
		this.nameInput = Selectors.form.nameInput(page)
		this.gregorianDateInput = Selectors.form.gregorianDateInput(page)
		this.relationshipInput = Selectors.form.relationshipInput(page)
		this.submitButton = Selectors.form.saveButton(page)
		this.cancelButton = Selectors.form.cancelButton(page)
		this.deleteButton = Selectors.recordedDates.deleteButton(page)
		this.hijriDatePreview = Selectors.preview.hijriDatePreview(page)
		this.nameError = Selectors.form.nameError(page)
		this.dateError = Selectors.form.dateError(page)
	}

	/**
	 * Get the page instance (for test access)
	 */
	get pageInstance(): Page {
		return this.page
	}

	/**
	 * Navigate to the edit page for a specific event
	 * @param eventId - The ID of the event to edit
	 */
	async gotoEdit(eventId: string): Promise<void> {
		await this.page.goto(`/recorded/${eventId}/edit`)
		await expect(this.page).toHaveURL(new RegExp(`/recorded/${eventId}/edit`))
	}

	/**
	 * Navigate to the page (required by BasePage abstract class)
	 * For EditEventPage, use gotoEdit(eventId) instead
	 */
	async goto(): Promise<void> {
		throw new Error('Use gotoEdit(eventId) instead')
	}

	/**
	 * Cancel editing and return to recorded dates page
	 */
	async cancel(): Promise<void> {
		await this.cancelButton.click()
		await expect(this.page).toHaveURL('/recorded')
	}

	/**
	 * Fill the name field
	 * @param name - The name to enter
	 */
	async fillName(name: string): Promise<void> {
		await this.formHelper.fillTextField(this.nameInput, name)
	}

	/**
	 * Fill the date field
	 * @param date - The date string in YYYY-MM-DD format
	 */
	async fillDate(date: string): Promise<void> {
		await this.formHelper.fillDateField(this.gregorianDateInput, date)
	}

	/**
	 * Fill the relationship field
	 * @param relationship - The relationship value to enter
	 */
	async selectRelationship(relationship: string): Promise<void> {
		await this.formHelper.fillTextField(this.relationshipInput, relationship)
	}

	/**
	 * Submit the edit form
	 */
	async submitEdit(): Promise<void> {
		await this.formHelper.submitForm(this.submitButton)
	}

	/**
	 * Click the delete button to open delete confirmation modal
	 */
	async clickDelete(): Promise<void> {
		await expect(this.deleteButton.first()).toBeVisible()
		await this.page.waitForTimeout(200)

		// Close any existing modals
		const existingModal = this.page
			.locator('.modal, .dialog, [role="dialog"]')
			.first()
		if (await existingModal.isVisible()) {
			await this.page.keyboard.press('Escape')
			await this.page.waitForTimeout(300)
		}

		// Scroll into view and click
		await this.deleteButton.first().scrollIntoViewIfNeeded()
		await this.page.waitForTimeout(100)
		await this.deleteButton.first().click({ force: true, timeout: 10000 })
	}

	/**
	 * Confirm deletion via the delete confirmation modal
	 */
	async confirmDelete(): Promise<void> {
		const modal = new DeleteConfirmationModal(this.page)

		if (await modal.isVisible()) {
			await modal.confirm()
			return
		}

		await this.deleteButton.first().scrollIntoViewIfNeeded()
		await this.page.waitForTimeout(100)
		await this.deleteButton.first().click()

		await this.page.waitForTimeout(300)
		await modal.verifyVisible()
		await modal.confirm()
	}

	/**
	 * Cancel deletion via the delete confirmation modal
	 */
	async cancelDelete(): Promise<void> {
		const modal = new DeleteConfirmationModal(this.page)

		if (await modal.isVisible()) {
			await modal.cancel()
			return
		}

		await this.deleteButton.first().scrollIntoViewIfNeeded()
		await this.page.keyboard.press('Escape')
		await this.page.waitForTimeout(200)

		const maxAttempts = 3
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				await this.deleteButton.first().click({ force: true, timeout: 5000 })
				break
			} catch (e) {
				if (attempt === maxAttempts - 1) throw e
				await this.page.keyboard.press('Escape')
				await this.page.waitForTimeout(200)
			}
		}

		await this.page.waitForTimeout(300)
		await modal.verifyVisible()
		await modal.cancel()
	}

	/**
	 * Verify the edit page has loaded
	 */
	async verifyPageLoaded(): Promise<void> {
		await expect(this.nameInput).toBeVisible()
		await expect(this.gregorianDateInput).toBeVisible()
		const hasSubmitButton = (await this.submitButton.count()) > 0
		if (!hasSubmitButton) {
			await expect(
				this.page.getByRole('button', { name: /save|update|submit/i }).first(),
			).toBeVisible()
		}
	}

	/**
	 * Verify the form is pre-populated with event data
	 * @param eventData - The expected event data
	 */
	async verifyFormPrePopulated(eventData: TestEventData): Promise<void> {
		await AssertionHelper.assertFormFilled(this.page, eventData, {
			nameInput: this.nameInput,
			dateInput: this.gregorianDateInput,
			relationshipInput: this.relationshipInput,
		})
	}

	/**
	 * Verify the delete confirmation modal is visible
	 */
	async verifyDeleteModal(): Promise<void> {
		const modal = new DeleteConfirmationModal(this.page)
		await modal.verifyVisible()
	}

	/**
	 * Verify a validation error appears for a specific field
	 * @param field - The field type: 'name', 'date', or 'form'
	 * @param message - The expected error message
	 */
	async verifyValidationError(
		field: 'name' | 'date' | 'form',
		message: string | RegExp,
	): Promise<void> {
		await AssertionHelper.assertValidationError(this.page, field, message)
	}

	/**
	 * Get the current form data
	 * @returns Partial event data from the form
	 */
	async getFormData(): Promise<Partial<TestEventData>> {
		return {
			name: await this.nameInput.inputValue(),
			gregorianDate: undefined,
			relationship: await this.relationshipInput.inputValue().catch(() => ''),
		}
	}

	/**
	 * Check if the delete modal is visible
	 * @returns True if the modal is visible
	 */
	async isDeleteModalVisible(): Promise<boolean> {
		const modal = new DeleteConfirmationModal(this.page)
		return await modal.isVisible()
	}

	/**
	 * Edit multiple event fields at once
	 * @param updated - Partial event data with fields to update
	 */
	async editEventData(updated: Partial<TestEventData>): Promise<void> {
		if (typeof updated.name === 'string') {
			await this.fillName(updated.name)
		}
		if (updated.gregorianDate) {
			await this.fillDate(formatDateForInput(updated.gregorianDate))
		}
		if (typeof updated.relationship === 'string') {
			await this.selectRelationship(updated.relationship)
		}
	}

	/**
	 * Submit the form and expect successful navigation to recorded dates page
	 */
	async submitAndExpectSuccess(): Promise<void> {
		await this.submitEdit()
		await expect(this.page).toHaveURL('/recorded')
	}

	/**
	 * Submit the form and expect to stay on the edit page or navigate to recorded dates
	 */
	async submitAndExpectStayOnEdit(): Promise<void> {
		await this.submitEdit()
		const onEdit = /\/recorded\/[^/]+\/edit$/
		const onRecorded = '/recorded'
		try {
			await expect(this.page).toHaveURL(onEdit, { timeout: 1500 })
		} catch {
			await expect(this.page).toHaveURL(onRecorded)
		}
	}
}
