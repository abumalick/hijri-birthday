import { expect, type Page } from '@playwright/test'
import { Selectors } from '../selectors/Selectors'

/**
 * FilterHelper class for filter-related operations on the HomePage
 *
 * Handles all filter verification and interaction logic including:
 * - Active filter verification
 * - Filter persistence across page reloads
 * - Empty state verification for filters
 * - Filter badge count retrieval and verification
 *
 * @example
 * ```typescript
 * const filterHelper = new FilterHelper(page)
 *
 * // Verify active filter
 * await filterHelper.verifyActiveFilter('gregorian')
 *
 * // Verify filter persists across reload
 * await filterHelper.verifyFilterPersistence('hijri')
 *
 * // Get filter counts
 * const counts = await filterHelper.getFilterCounts()
 * // Returns: { gregorian: 5, hijri: 3, both: 8 }
 * ```
 */
export class FilterHelper {
	readonly page: Page

	constructor(page: Page) {
		this.page = page
	}

	/**
	 * Verify which filter is currently active
	 * @param filterType - The filter type to verify ('gregorian', 'hijri', or 'both')
	 */
	async verifyActiveFilter(
		filterType: 'gregorian' | 'hijri' | 'both',
	): Promise<void> {
		const activeTab = this.page.getByTestId(`calendar-filter-${filterType}`)
		await expect(activeTab).toHaveClass(/tab-active/)
	}

	/**
	 * Verify that a filter persists across page reload
	 * @param expectedFilter - The filter type that should persist
	 */
	async verifyFilterPersistence(
		expectedFilter: 'gregorian' | 'hijri' | 'both',
	): Promise<void> {
		await this.page.reload()
		await this.verifyActiveFilter(expectedFilter)
	}

	/**
	 * Verify that "no events" message appears for the current filter
	 */
	async verifyNoEventsForFilter(): Promise<void> {
		// Wait for timeline to load
		await Promise.race([
			this.page.locator('h2').first().waitFor({ state: 'visible' }),
			this.page
				.getByTestId('empty-state-message')
				.waitFor({ state: 'visible' }),
			this.page.locator('text=No upcoming dates').waitFor({ state: 'visible' }),
		])

		const infoHeader = this.page.locator('h3', {
			hasText: 'No upcoming dates',
		})
		const infoPara = this.page.locator('p', {
			hasText: 'No dates found for the selected calendar filter.',
		})
		const eventCards = Selectors.timeline.eventCard(this.page)

		// If any cards are visible, this filter is not empty
		const visibleCount = await eventCards.count()
		if (visibleCount > 0) {
			await expect.soft(infoHeader).toHaveCount(0)
			await expect.soft(infoPara).toHaveCount(0)
			await expect(eventCards.first()).toBeVisible()
			return
		}

		// Otherwise the empty-for-filter panel should render
		await expect(infoHeader).toBeVisible()
		await expect(infoPara).toBeVisible()
	}

	/**
	 * Get the badge counts for each filter tab
	 * @returns Object with gregorian, hijri, and both filter counts
	 */
	async getFilterCounts(): Promise<{
		gregorian: number
		hijri: number
		both: number
	}> {
		const gregorianTab = Selectors.timeline.gregorianTab(this.page)
		const hijriTab = Selectors.timeline.hijriTab(this.page)
		const bothTab = Selectors.timeline.bothTab(this.page)

		const gregorianBadge = gregorianTab.locator('.badge')
		const hijriBadge = hijriTab.locator('.badge')
		const bothBadge = bothTab.locator('.badge')

		const gregorianCount = parseInt(
			(await gregorianBadge.textContent()) || '0',
			10,
		)
		const hijriCount = parseInt((await hijriBadge.textContent()) || '0', 10)
		const bothCount = parseInt((await bothBadge.textContent()) || '0', 10)

		return { gregorian: gregorianCount, hijri: hijriCount, both: bothCount }
	}

	/**
	 * Verify that filter badge counts match expected values
	 * @param expected - Object with expected counts for each filter
	 */
	async verifyFilterCounts(expected: {
		gregorian: number
		hijri: number
		both: number
	}): Promise<void> {
		const actual = await this.getFilterCounts()
		expect(actual.gregorian).toBe(expected.gregorian)
		expect(actual.hijri).toBe(expected.hijri)
		expect(actual.both).toBe(expected.both)
	}
}
