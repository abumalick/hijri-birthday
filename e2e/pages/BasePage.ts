import type { Locator, Page } from '@playwright/test'

/**
 * Abstract base class for all page objects in the test suite.
 *
 * Provides common functionality that all page objects can inherit from, including:
 * - Page instance management
 * - Common waiting patterns
 * - Input field utilities
 *
 * All page objects should extend this class to ensure consistent behavior and reduce code duplication.
 *
 * @example
 * ```typescript
 * export class MyPage extends BasePage {
 *   readonly myButton: Locator
 *
 *   constructor(page: Page) {
 *     super(page)
 *     this.myButton = page.getByTestId('my-button')
 *   }
 *
 *   async goto(): Promise<void> {
 *     await this.page.goto('/my-page')
 *   }
 * }
 * ```
 */
export abstract class BasePage {
	/**
	 * The Playwright Page instance for this page object.
	 * Protected so subclasses can access it.
	 */
	protected page: Page

	/**
	 * Creates a new BasePage instance.
	 *
	 * @param page - The Playwright Page instance
	 */
	constructor(page: Page) {
		this.page = page
	}

	/**
	 * Navigates to the page's URL.
	 * Must be implemented by subclasses to define their specific URL.
	 *
	 * @example
	 * ```typescript
	 * async goto(): Promise<void> {
	 *   await this.page.goto('/add')
	 * }
	 * ```
	 */
	abstract goto(): Promise<void>

	/**
	 * Waits for the page to load by checking for common loading indicators.
	 * Useful for ensuring the page is fully loaded before interacting with elements.
	 *
	 * This method waits for the page to reach a "load" state, which indicates
	 * that the page has finished loading its main content.
	 *
	 * @param timeout - Optional timeout in milliseconds (default: 5000ms)
	 * @throws Will throw if the page doesn't load within the timeout period
	 *
	 * @example
	 * ```typescript
	 * await this.waitForPageLoad()
	 * await this.waitForPageLoad(10000) // Custom timeout
	 * ```
	 */
	protected async waitForPageLoad(timeout: number = 5000): Promise<void> {
		await this.page.waitForLoadState('load', { timeout })
	}

	/**
	 * Waits for an element to be visible on the page.
	 * Useful for ensuring an element is ready before interacting with it.
	 *
	 * @param locator - The Playwright Locator for the element to wait for
	 * @param timeout - Optional timeout in milliseconds (default: 5000ms)
	 * @throws Will throw if the element doesn't become visible within the timeout period
	 *
	 * @example
	 * ```typescript
	 * await this.waitForElement(this.submitButton)
	 * await this.waitForElement(this.loadingSpinner, 10000)
	 * ```
	 */
	protected async waitForElement(
		locator: Locator,
		timeout: number = 5000,
	): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout })
	}

	/**
	 * Clears an input field.
	 * Removes all text from the input without filling it with new content.
	 *
	 * @param locator - The Playwright Locator for the input field
	 * @throws Will throw if the element is not found or is not an input field
	 *
	 * @example
	 * ```typescript
	 * await this.clearInput(this.nameInput)
	 * ```
	 */
	protected async clearInput(locator: Locator): Promise<void> {
		await locator.clear()
	}

	/**
	 * Fills an input field with a value.
	 * Clears the field first, then fills it with the provided value.
	 * This ensures the field is empty before filling, preventing duplicate content.
	 *
	 * @param locator - The Playwright Locator for the input field
	 * @param value - The value to fill into the input field
	 * @throws Will throw if the element is not found or is not an input field
	 *
	 * @example
	 * ```typescript
	 * await this.fillInput(this.nameInput, 'John Doe')
	 * await this.fillInput(this.emailInput, 'john@example.com')
	 * ```
	 */
	protected async fillInput(locator: Locator, value: string): Promise<void> {
		await locator.clear()
		await locator.fill(value)
	}

	/**
	 * Gets the current value of an input field.
	 * Retrieves the text content of the input without modifying it.
	 *
	 * @param locator - The Playwright Locator for the input field
	 * @returns The current value of the input field
	 * @throws Will throw if the element is not found or is not an input field
	 *
	 * @example
	 * ```typescript
	 * const name = await this.getInputValue(this.nameInput)
	 * expect(name).toBe('John Doe')
	 * ```
	 */
	protected async getInputValue(locator: Locator): Promise<string> {
		const value = await locator.inputValue()
		return value
	}
}
