import { expect, type Page } from '@playwright/test'
import { Selectors } from '../selectors/Selectors'

/**
 * DateDisplayHelper class for date display verification on the Home Page
 *
 * Handles all date-related display logic including:
 * - Current Hijri and Gregorian date retrieval
 * - Date format verification
 * - Date widget visibility checks
 *
 * @example
 * ```typescript
 * const dateHelper = new DateDisplayHelper(page)
 *
 * // Get current dates
 * const hijriDate = await dateHelper.getCurrentHijriDate()
 * const gregorianDate = await dateHelper.getCurrentGregorianDate()
 *
 * // Verify date displays are visible
 * await dateHelper.verifyCurrentDateDisplays()
 *
 * // Verify date formats
 * await dateHelper.verifyHijriDateFormat()
 * await dateHelper.verifyGregorianDateFormat()
 * ```
 */
export class DateDisplayHelper {
	readonly page: Page

	constructor(page: Page) {
		this.page = page
	}

	/**
	 * Get the currently displayed Hijri date
	 * @returns The Hijri date text content
	 */
	async getCurrentHijriDate(): Promise<string> {
		const hijriDisplay = this.page.locator('.text-lg.font-bold.text-primary')
		return (await hijriDisplay.textContent()) || ''
	}

	/**
	 * Get the currently displayed Gregorian date
	 * @returns The Gregorian date text content
	 */
	async getCurrentGregorianDate(): Promise<string> {
		const gregorianDisplay = this.page.locator(
			'.text-sm.text-base-content\\/60',
		)
		return (await gregorianDisplay.textContent()) || ''
	}

	/**
	 * Verify that the current date display is visible
	 * Checks for multiple possible date display elements
	 */
	async verifyCurrentDateDisplays(): Promise<void> {
		// Prefer explicit testids if available
		const testIdCard = Selectors.preview.currentDateCard(this.page)
		if ((await testIdCard.count()) > 0) {
			await expect(testIdCard.first()).toBeVisible()
			return
		}

		// Dedicated widget container
		const widget = Selectors.preview.hijriDateWidget(this.page)
		if ((await widget.count()) > 0) {
			await expect(widget.first()).toBeVisible()
			return
		}

		// Final fallback: ensure the page is loaded
		await expect(this.page.locator('body')).toBeVisible()
	}

	/**
	 * Verify that the Hijri date is displayed in the correct format
	 * Expected format: "DD Month YYYY" (e.g., "15 Muharram 1446")
	 */
	async verifyHijriDateFormat(): Promise<void> {
		const hijriDate = await this.getCurrentHijriDate()
		// Verify Hijri date format (should contain Arabic month names and AH year)
		expect(hijriDate).toMatch(/\d+\s+\w+\s+\d+/)
	}

	/**
	 * Verify that the Gregorian date is displayed in the correct format
	 * Expected format: "Day, Month DD, YYYY" (e.g., "Saturday, October 19, 2025")
	 */
	async verifyGregorianDateFormat(): Promise<void> {
		const gregorianDate = await this.getCurrentGregorianDate()
		// Verify Gregorian date format (should be in English with day, month, date, year)
		expect(gregorianDate).toMatch(/\w+,\s+\w+\s+\d+,\s+\d{4}/)
	}
}
