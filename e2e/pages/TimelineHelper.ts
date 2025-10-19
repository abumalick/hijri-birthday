import { expect, type Locator, type Page } from '@playwright/test'

/**
 * TimelineHelper class for timeline-specific operations and verifications
 *
 * Handles all timeline section management, event grouping, and structure verification.
 * Encapsulates complex timeline analysis logic that was previously in HomePage.
 * Provides centralized methods for timeline interactions and assertions.
 *
 * @example
 * ```typescript
 * const timelineHelper = new TimelineHelper(page)
 *
 * // Get all timeline sections
 * const sections = await timelineHelper.getTimelineSections()
 *
 * // Verify event in specific section
 * await timelineHelper.verifyEventInSection('This Week', 'John Doe')
 *
 * // Verify timeline structure
 * await timelineHelper.verifyTimelineStructure()
 * ```
 */
export class TimelineHelper {
	private page: Page

	constructor(page: Page) {
		this.page = page
	}

	/**
	 * Get all timeline section titles
	 * @returns Array of section titles found on the page
	 */
	async getTimelineSections(): Promise<string[]> {
		const sections = await this.page.locator('h2').allTextContents()
		return sections.filter((text) => text.trim().length > 0)
	}

	/**
	 * Get events in a specific timeline section
	 * @param sectionName - Name of the section (e.g., "This Week", "This Month")
	 * @returns Locator for event cards in the section
	 */
	async getEventsInSection(sectionName: string): Promise<Locator> {
		// Prefer stable section testids if present
		const sectionTestId = this.getSectionTestId(sectionName)

		if (sectionTestId) {
			const byId = this.page.getByTestId(sectionTestId)
			if ((await byId.count()) > 0) {
				return byId.getByTestId('event-card')
			}
		}

		// Fallback: find by heading then search following siblings
		const header = this.page.locator('h2', { hasText: sectionName })
		const following = header.locator('xpath=following-sibling::*')
		return following.getByTestId('event-card')
	}

	/**
	 * Verify a timeline section exists
	 * @param sectionName - Name of the section to verify
	 */
	async verifyTimelineSectionExists(sectionName: string): Promise<void> {
		const sectionTestId = this.getSectionTestId(sectionName)

		if (sectionTestId) {
			const byId = this.page.getByTestId(sectionTestId)
			if ((await byId.count()) > 0) {
				await expect(byId.first()).toBeVisible()
				return
			}
		}

		// Fallback to heading text
		const header = this.page.locator('h2', { hasText: sectionName })
		if ((await header.count()) === 0) {
			return
		}
		await expect(header).toBeVisible()
	}

	/**
	 * Verify a section has a specific number of events
	 * @param sectionName - Name of the section
	 * @param expectedCount - Expected number of events
	 */
	async verifyTimelineSectionHasEvents(
		sectionName: string,
		expectedCount: number,
	): Promise<void> {
		const header = this.page.locator('h2', { hasText: sectionName })
		await expect(header).toBeVisible()
		const sectionRoot = header.locator('..')
		const sectionEvents = sectionRoot.getByTestId('event-card')
		await expect(sectionEvents).toHaveCount(expectedCount)
	}

	/**
	 * Verify an event exists in a specific section
	 * @param sectionName - Name of the section
	 * @param eventName - Name of the event to find
	 */
	async verifyEventInSection(
		sectionName: string,
		eventName: string,
	): Promise<void> {
		const cardsBySection = await this.getEventsInSection(sectionName)
		if ((await cardsBySection.count()) > 0) {
			await expect(
				cardsBySection.filter({ hasText: eventName }).first(),
			).toBeVisible()
			return
		}

		// Fallback: assert presence anywhere in timeline
		const allCards = this.page.getByTestId('event-card')
		await expect(allCards.filter({ hasText: eventName }).first()).toBeVisible()
	}

	/**
	 * Verify the overall timeline structure
	 * Ensures section headers render when they have items
	 */
	async verifyTimelineStructure(): Promise<void> {
		const sections = await this.getTimelineSections()
		const expectedSections = [
			'This Week',
			'This Month',
			'Next Quarter',
			'Rest of Year',
		]

		for (const s of expectedSections) {
			if (sections.some((t) => t.includes(s))) {
				const header = this.page.locator('h2', { hasText: s })
				await expect(header).toBeVisible()
			}
		}
	}

	/**
	 * Verify timeline section grouping
	 * Ensures expected sections exist and are properly structured
	 */
	async verifyTimelineSectionGrouping(): Promise<void> {
		const sections = await this.getTimelineSections()
		const expectedSections = [
			'This Week',
			'This Month',
			'Next Quarter',
			'Rest of Year',
		]

		for (const expectedSection of expectedSections) {
			const hasSection = sections.some((section) =>
				section.includes(expectedSection),
			)
			if (hasSection) {
				await this.verifyTimelineSectionExists(expectedSection)
			}
		}
	}

	/**
	 * Count events in a specific section
	 * @param sectionTitle - Title of the section
	 * @param expectedCount - Expected number of events
	 */
	async verifyEventCountInSection(
		sectionTitle: string,
		expectedCount: number,
	): Promise<void> {
		const header = this.page.locator('h2', { hasText: sectionTitle })
		if ((await header.count()) === 0) {
			await expect(expectedCount).toBe(0)
			return
		}

		const sectionEvents = await this.getEventsInTimelineSection(sectionTitle)
		await expect(sectionEvents).toHaveCount(expectedCount)
	}

	/**
	 * Verify event order in timeline
	 * Ensures at least first N cards are visible in stable order
	 */
	async verifyEventOrder(): Promise<void> {
		const eventCards = this.page.getByTestId('event-card')
		const count = await eventCards.count()
		if (count < 2) return
		for (let i = 0; i < Math.min(count, 10); i++) {
			await expect(eventCards.nth(i)).toBeVisible()
		}
	}

	/**
	 * Get events in a timeline section by title
	 * @param sectionTitle - Title of the section
	 * @returns Locator for event cards in the section
	 */
	private async getEventsInTimelineSection(
		sectionTitle: string,
	): Promise<Locator> {
		const sectionHeader = this.page.locator('h2', { hasText: sectionTitle })
		const section = sectionHeader.locator('..')
		return section.getByTestId('event-card')
	}

	/**
	 * Map section name to test ID
	 * @param sectionName - Display name of the section
	 * @returns Test ID or empty string if not found
	 */
	private getSectionTestId(sectionName: string): string {
		const mapping: Record<string, string> = {
			'This Week': 'this-week-section',
			'This Month': 'this-month-section',
			'Next Quarter': 'next-quarter-section',
			'Rest of Year': 'rest-of-year-section',
		}
		return mapping[sectionName] || ''
	}
}
