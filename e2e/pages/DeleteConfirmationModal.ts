import { expect, type Locator, type Page } from '@playwright/test'

/**
 * DeleteConfirmationModal class - Page Object Model for the Delete Confirmation Modal
 *
 * Handles interactions with delete confirmation dialogs across the application.
 * Designed to work with various modal implementations (DaisyUI dialog, ARIA dialog, custom).
 * Provides methods for confirming or canceling deletions with proper verification.
 *
 * @example
 * ```typescript
 * const modal = new DeleteConfirmationModal(page)
 * await modal.verifyVisible()
 * await modal.verifyEventName('John Doe')
 * await modal.confirm()
 * ```
 */
export class DeleteConfirmationModal {
	readonly page: Page

	// Modal root and content
	readonly modalRoot: Locator
	readonly modalTitle: Locator
	readonly modalDescription: Locator

	// Action buttons
	readonly confirmButton: Locator
	readonly cancelButton: Locator
	readonly closeButton: Locator

	// Event name display (if present)
	readonly eventNameText: Locator
	readonly warningText: Locator

	constructor(page: Page) {
		this.page = page

		// Modal root: match the actual modal structure in the edit page
		this.modalRoot = page.locator('.modal.modal-open').first()

		// Title and description
		this.modalTitle = this.modalRoot
			.getByRole('heading')
			.or(this.modalRoot.locator('h3'))
			.first()

		this.modalDescription = this.modalRoot.locator('p').first()

		// Buttons
		this.confirmButton = this.modalRoot
			.getByRole('button', { name: /delete|confirm|yes/i })
			.or(this.modalRoot.locator('button.btn-error'))
			.first()

		this.cancelButton = this.modalRoot
			.getByRole('button', { name: /cancel|no|dismiss|close/i })
			.or(this.modalRoot.locator('button:not(.btn-error)'))
			.first()

		this.closeButton = this.modalRoot
			.getByRole('button', { name: /close/i })
			.or(this.modalRoot.locator('[aria-label="Close"]'))
			.first()

		// Content helpers
		this.eventNameText = this.modalRoot.locator('.font-bold').first()

		this.warningText = this.modalRoot.locator('p').first()
	}

	// Interaction methods
	async confirm(): Promise<void> {
		if (await this.confirmButton.count()) {
			await this.confirmButton.click()
		} else {
			// Fallback: click the last destructive-looking button
			const destructive = this.modalRoot
				.getByRole('button')
				.filter({ hasText: /delete|confirm|yes/i })
			await destructive.last().click()
		}
	}

	async cancel(): Promise<void> {
		if (await this.cancelButton.count()) {
			await this.cancelButton.click()
			return
		}
		// Try clicking any visible close
		if (await this.closeButton.count()) {
			await this.closeButton.click()
			return
		}
		// Last resort: press Escape
		await this.closeWithEscape()
	}

	async closeWithEscape(): Promise<void> {
		await this.page.keyboard.press('Escape')
	}

	// Verification methods with enhanced tolerance
	async verifyVisible(): Promise<void> {
		// Allow a short delay for animations/transitions
		await this.page.waitForTimeout(200)

		// Try multiple strategies to verify modal is visible
		try {
			await expect(this.modalRoot.first()).toBeVisible({ timeout: 3000 })
		} catch {
			// If modal root not found, try to find any modal-like element
			const fallbackModal = this.page
				.locator('div[class*="modal"], div[class*="dialog"], .modal, .dialog')
				.filter({ hasText: /delete|confirm|remove/i })
				.first()
			await expect(fallbackModal).toBeVisible({ timeout: 3000 })
		}

		// Check for any visible button in modal (more reliable than focus check)
		try {
			await expect(
				this.confirmButton.first().or(this.cancelButton.first()),
			).toBeVisible({ timeout: 2000 })
		} catch {
			// If buttons not found, check for any button in modal context
			const anyButton = this.page
				.locator('.modal button, .dialog button, [role="dialog"] button')
				.first()
			await expect(anyButton).toBeVisible({ timeout: 2000 })
		}
	}

	async verifyEventName(expectedName: string): Promise<void> {
		// Try explicit test id, else look for visible text occurrence
		if (await this.eventNameText.count()) {
			await expect(this.eventNameText).toContainText(expectedName)
			return
		}
		await expect(
			this.modalRoot.getByText(
				new RegExp(expectedName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')),
			),
		).toBeVisible()
	}

	async verifyWarningMessage(): Promise<void> {
		// Ensure there's a visible warning hinting permanence
		const text = (await this.modalRoot.textContent()) || ''
		const hasWarning =
			/delete|permanent|cannot be undone|remove|are you sure/i.test(text)
		expect(hasWarning).toBe(true)
	}

	// Visibility helper
	async isVisible(): Promise<boolean> {
		return (
			(await this.modalRoot.count()) > 0 &&
			(await this.modalRoot.first().isVisible())
		)
	}
}
