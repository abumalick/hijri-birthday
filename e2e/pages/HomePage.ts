import { expect, type Locator, type Page } from '@playwright/test'
import type { TestEventData } from '../fixtures/testDataFixture'

/**
 * Page Object Model for the Home Page
 */
export class HomePage {
	readonly page: Page

	// Navigation elements
	readonly addEventButton: Locator
	readonly recordedDatesLink: Locator
	readonly guidanceLink: Locator

	// Filter and display elements
	readonly calendarFilterTabs: Locator
	readonly gregorianTab: Locator
	readonly hijriTab: Locator
	readonly bothTab: Locator

	// Timeline sections
	readonly timelineSection: Locator
	readonly thisWeekSection: Locator
	readonly thisMonthSection: Locator
	readonly nextQuarterSection: Locator
	readonly restOfYearSection: Locator

	// Event cards
	readonly eventCards: Locator
	readonly firstEventCard: Locator

	// Empty state
	readonly emptyStateMessage: Locator
	readonly emptyStateImage: Locator

	// Current date display
	readonly hijriDateDisplay: Locator
	readonly gregorianDateDisplay: Locator

	constructor(page: Page) {
		this.page = page

		// Navigation elements
		this.addEventButton = page.getByTestId('add-event-button')
		this.recordedDatesLink = page.getByTestId('recorded-dates-link')
		this.guidanceLink = page.getByTestId('guidance-link')

		// Filter tabs
		this.calendarFilterTabs = page.getByTestId('calendar-filter-tabs')
		this.gregorianTab = page.getByTestId('gregorian-tab')
		this.hijriTab = page.getByTestId('hijri-tab')
		this.bothTab = page.getByTestId('both-tab')

		// Timeline sections
		this.timelineSection = page.getByTestId('timeline-section')
		this.thisWeekSection = page.getByTestId('this-week-section')
		this.thisMonthSection = page.getByTestId('this-month-section')
		this.nextQuarterSection = page.getByTestId('next-quarter-section')
		this.restOfYearSection = page.getByTestId('rest-of-year-section')

		// Event cards
		this.eventCards = page.getByTestId('event-card')
		this.firstEventCard = this.eventCards.first()

		// Empty state
		this.emptyStateMessage = page.getByTestId('empty-state-message')
		this.emptyStateImage = page.getByTestId('empty-state-image')

		// Date displays
		this.hijriDateDisplay = page.getByTestId('hijri-date-display')
		this.gregorianDateDisplay = page.getByTestId('gregorian-date-display')
	}

	/**
	 * Navigation methods
	 */
	async goto(): Promise<void> {
		await this.page.goto('/')
	}

	async navigateToAddEvent(): Promise<void> {
		await this.addEventButton.click()
		await expect(this.page).toHaveURL('/add')
	}

	async navigateToRecordedDates(): Promise<void> {
		await this.recordedDatesLink.click()
		await expect(this.page).toHaveURL('/recorded')
	}

	async navigateToGuidance(): Promise<void> {
		await this.guidanceLink.click()
		await expect(this.page).toHaveURL('/guidance')
	}

	/**
	 * Filter methods
	 */
	async selectGregorianFilter(): Promise<void> {
		await this.gregorianTab.click()
		await expect(this.gregorianTab).toHaveClass(/tab-active/)
	}

	async selectHijriFilter(): Promise<void> {
		await this.hijriTab.click()
		await expect(this.hijriTab).toHaveClass(/tab-active/)
	}

	async selectBothFilter(): Promise<void> {
		await this.bothTab.click()
		await expect(this.bothTab).toHaveClass(/tab-active/)
	}

	/**
	 * Event card methods
	 */
	async getEventCardByName(name: string): Promise<Locator> {
		return this.eventCards.filter({ hasText: name })
	}

	async getEventCardByIndex(index: number): Promise<Locator> {
		return this.eventCards.nth(index)
	}

	async clickEventCard(name: string): Promise<void> {
		const eventCard = await this.getEventCardByName(name)
		await eventCard.click()
	}

	/**
	 * Verification methods
	 */
	async verifyPageLoaded(): Promise<void> {
		await expect(this.addEventButton).toBeVisible()

		// Calendar filter tabs are only visible when there are events
		const hasEvents = (await this.eventCards.count()) > 0
		if (hasEvents) {
			await expect(this.calendarFilterTabs).toBeVisible()
		}
	}

	async verifyEmptyState(): Promise<void> {
		await expect(this.emptyStateMessage).toBeVisible()
		await expect(this.emptyStateImage).toBeVisible()
		await expect(this.eventCards).toHaveCount(0)
	}

	async verifyEventExists(eventData: TestEventData): Promise<void> {
		const eventCards = this.eventCards.filter({ hasText: eventData.name })

		// Expect at least one event card to exist
		await expect(eventCards.first()).toBeVisible()

		// Verify at least one event card has the correct name
		const firstCard = eventCards.first()
		const eventName = firstCard.getByTestId('event-name')
		await expect(eventName).toHaveText(eventData.name)

		// Verify relationship if provided
		if (eventData.relationship) {
			const relationship = firstCard.getByTestId('event-relationship')
			await expect(relationship).toHaveText(eventData.relationship)
		}
	}

	async verifyEventCount(expectedCount: number): Promise<void> {
		await expect(this.eventCards).toHaveCount(expectedCount)
	}

	/**
	 * Verify the count of unique persons (each person creates 2 events: Gregorian + Hijri)
	 */
	async verifyPersonCount(expectedPersonCount: number): Promise<void> {
		const expectedEventCount = expectedPersonCount * 2 // Each person creates 2 events
		await expect(this.eventCards).toHaveCount(expectedEventCount)
	}

	async verifyTimelineSectionExists(sectionName: string): Promise<void> {
		const section = this.page.getByTestId(
			`${sectionName.toLowerCase().replace(/\s+/g, '-')}-section`,
		)
		await expect(section).toBeVisible()
	}

	async verifyTimelineSectionHasEvents(
		sectionName: string,
		expectedCount: number,
	): Promise<void> {
		const section = this.page.getByTestId(
			`${sectionName.toLowerCase().replace(/\s+/g, '-')}-section`,
		)
		const sectionEvents = section.getByTestId('event-card')
		await expect(sectionEvents).toHaveCount(expectedCount)
	}

	async verifyCurrentDateDisplays(): Promise<void> {
		await expect(this.hijriDateDisplay).toBeVisible()
		await expect(this.gregorianDateDisplay).toBeVisible()
	}

	/**
	 * Timeline section methods
	 */
	async getEventsInSection(sectionName: string): Promise<Locator> {
		const section = this.page.getByTestId(
			`${sectionName.toLowerCase().replace(/\s+/g, '-')}-section`,
		)
		return section.getByTestId('event-card')
	}

	async verifyEventInSection(
		sectionName: string,
		eventName: string,
	): Promise<void> {
		const sectionEvents = await this.getEventsInSection(sectionName)
		const eventInSection = sectionEvents.filter({ hasText: eventName })
		await expect(eventInSection).toBeVisible()
	}

	/**
	 * Filter verification methods
	 */
	async verifyActiveFilter(
		filterType: 'gregorian' | 'hijri' | 'both',
	): Promise<void> {
		const activeTab = this.page.getByTestId(`${filterType}-tab`)
		await expect(activeTab).toHaveClass(/tab-active/)
	}

	async verifyFilteredResults(): Promise<void> {
		// This would verify that only events of the selected calendar type are shown
		// Implementation depends on how the filtering is implemented in the UI
		const visibleCards = this.eventCards
		await expect(visibleCards).toBeVisible()
	}

	/**
	 * Interaction methods
	 */
	async waitForEventsToLoad(): Promise<void> {
		// Wait for either events to appear or empty state to show
		await Promise.race([
			this.eventCards.first().waitFor({ state: 'visible' }),
			this.emptyStateMessage.waitFor({ state: 'visible' }),
		])
	}

	async scrollToSection(sectionName: string): Promise<void> {
		const section = this.page.getByTestId(
			`${sectionName.toLowerCase().replace(/\s+/g, '-')}-section`,
		)
		await section.scrollIntoViewIfNeeded()
	}

	/**
	 * Bulk verification methods
	 */
	async verifyMultipleEvents(events: TestEventData[]): Promise<void> {
		// Each person creates 2 events (Gregorian + Hijri)
		const expectedEventCount = events.length * 2
		await this.verifyEventCount(expectedEventCount)

		for (const event of events) {
			await this.verifyEventExists(event)
		}
	}

	async verifyTimelineStructure(): Promise<void> {
		// Verify that all timeline sections are present
		await this.verifyTimelineSectionExists('This Week')
		await this.verifyTimelineSectionExists('This Month')
		await this.verifyTimelineSectionExists('Next Quarter')
		await this.verifyTimelineSectionExists('Rest of Year')
	}
}
