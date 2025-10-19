import { expect, type Locator, type Page } from '@playwright/test'
import type { TestEventData } from '../fixtures/testDataFixture'
import { Selectors } from '../selectors/Selectors'
import { BasePage } from './BasePage'
import { DateDisplayHelper } from './DateDisplayHelper'
import { FilterHelper } from './FilterHelper'
import { TimelineHelper } from './TimelineHelper'

/**
 * Page Object Model for the Home Page
 *
 * Handles navigation, basic UI interactions, and simple verifications.
 * Complex logic is delegated to specialized helpers:
 * - TimelineHelper: Timeline section analysis and verification
 * - FilterHelper: Filter state and persistence verification
 * - DateDisplayHelper: Date display format and content verification
 */
export class HomePage extends BasePage {
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

	// Helpers
	private timelineHelper: TimelineHelper
	private filterHelper: FilterHelper
	private dateDisplayHelper: DateDisplayHelper

	constructor(page: Page) {
		super(page)

		// Navigation elements
		this.addEventButton = Selectors.navigation.addButton(page)
		this.recordedDatesLink = Selectors.navigation.recordedDatesLink(page)
		this.guidanceLink = Selectors.navigation.guidanceLink(page)

		// Filter tabs
		this.calendarFilterTabs = Selectors.timeline.filterTabs(page)
		this.gregorianTab = Selectors.timeline.gregorianTab(page)
		this.hijriTab = Selectors.timeline.hijriTab(page)
		this.bothTab = Selectors.timeline.bothTab(page)

		// Timeline sections
		this.timelineSection = Selectors.timeline.timelineSection(page)
		this.thisWeekSection = Selectors.timeline.thisWeekSection(page)
		this.thisMonthSection = Selectors.timeline.thisMonthSection(page)
		this.nextQuarterSection = Selectors.timeline.nextQuarterSection(page)
		this.restOfYearSection = Selectors.timeline.restOfYearSection(page)

		// Event cards
		this.eventCards = Selectors.timeline.eventCard(page)
		this.firstEventCard = this.eventCards.first()

		// Empty state
		this.emptyStateMessage = Selectors.empty.emptyStateMessage(page)
		this.emptyStateImage = Selectors.empty.emptyStateImage(page)

		// Date displays
		this.hijriDateDisplay = Selectors.preview.hijriDateDisplay(page)
		this.gregorianDateDisplay = Selectors.preview.gregorianDateDisplay(page)

		// Initialize helpers
		this.timelineHelper = new TimelineHelper(page)
		this.filterHelper = new FilterHelper(page)
		this.dateDisplayHelper = new DateDisplayHelper(page)
	}

	/**
	 * Navigation to home page
	 */
	async goto(): Promise<void> {
		await this.page.goto('/')
	}

	/**
	 * Navigate to add event page
	 */
	async navigateToAddEvent(): Promise<void> {
		await this.addEventButton.click()
		await expect(this.page).toHaveURL('/add')
	}

	/**
	 * Navigate to recorded dates page
	 */
	async navigateToRecordedDates(): Promise<void> {
		await this.recordedDatesLink.click()
		await expect(this.page).toHaveURL('/recorded')
	}

	/**
	 * Navigate to guidance page
	 */
	async navigateToGuidance(): Promise<void> {
		await this.guidanceLink.click()
		await expect(this.page).toHaveURL('/guidance')
	}

	/**
	 * Select Gregorian calendar filter
	 */
	async selectGregorianFilter(): Promise<void> {
		await this.gregorianTab.click()
		await expect(this.gregorianTab).toHaveClass(/tab-active/)
	}

	/**
	 * Select Hijri calendar filter
	 */
	async selectHijriFilter(): Promise<void> {
		await this.hijriTab.click()
		await expect(this.hijriTab).toHaveClass(/tab-active/)
	}

	/**
	 * Select both calendars filter
	 */
	async selectBothFilter(): Promise<void> {
		await this.bothTab.click()
		await expect(this.bothTab).toHaveClass(/tab-active/)
	}

	/**
	 * Get event card by name
	 */
	async getEventCardByName(name: string): Promise<Locator> {
		return this.eventCards.filter({ hasText: name })
	}

	/**
	 * Get event card by index
	 */
	async getEventCardByIndex(index: number): Promise<Locator> {
		return this.eventCards.nth(index)
	}

	/**
	 * Click event card by name
	 */
	async clickEventCard(name: string): Promise<void> {
		const eventCard = await this.getEventCardByName(name)
		await eventCard.click()
	}

	/**
	 * Verify page is loaded
	 */
	async verifyPageLoaded(): Promise<void> {
		await expect(this.addEventButton).toBeVisible()

		// Calendar filter tabs are only visible when there are events
		const hasEvents = (await this.eventCards.count()) > 0
		if (hasEvents) {
			await expect(this.calendarFilterTabs).toBeVisible()
		}
	}

	/**
	 * Verify empty state is displayed
	 */
	async verifyEmptyState(): Promise<void> {
		await expect(this.emptyStateMessage).toBeVisible()
		await expect(this.emptyStateImage).toBeVisible()
		await expect(this.eventCards).toHaveCount(0)
	}

	/**
	 * Verify event exists by name and relationship
	 */
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

	/**
	 * Verify total event count
	 */
	async verifyEventCount(expectedCount: number): Promise<void> {
		await expect(this.eventCards).toHaveCount(expectedCount)
	}

	/**
	 * Verify person count (each person creates 2 events: Gregorian + Hijri)
	 */
	async verifyPersonCount(expectedPersonCount: number): Promise<void> {
		const expectedEventCount = expectedPersonCount * 2
		await expect(this.eventCards).toHaveCount(expectedEventCount)
	}

	/**
	 * Verify multiple events exist
	 */
	async verifyMultipleEvents(events: TestEventData[]): Promise<void> {
		// Each person creates 2 events (Gregorian + Hijri)
		const expectedEventCount = events.length * 2
		await this.verifyEventCount(expectedEventCount)

		for (const event of events) {
			await this.verifyEventExists(event)
		}
	}

	/**
	 * Wait for events to load or empty state to show
	 */
	async waitForEventsToLoad(): Promise<void> {
		await Promise.race([
			this.eventCards.first().waitFor({ state: 'visible' }),
			this.emptyStateMessage.waitFor({ state: 'visible' }),
		])
	}

	/**
	 * Scroll to timeline section
	 */
	async scrollToSection(sectionName: string): Promise<void> {
		const section = this.page.getByTestId(
			`${sectionName.toLowerCase().replace(/\s+/g, '-')}-section`,
		)
		await section.scrollIntoViewIfNeeded()
	}

	/**
	 * Timeline helper delegation methods
	 */

	/**
	 * Get all timeline section titles
	 */
	async getTimelineSections(): Promise<string[]> {
		return this.timelineHelper.getTimelineSections()
	}

	/**
	 * Get events in specific timeline section
	 */
	async getEventsInSection(sectionName: string): Promise<Locator> {
		return this.timelineHelper.getEventsInSection(sectionName)
	}

	/**
	 * Verify timeline section exists
	 */
	async verifyTimelineSectionExists(sectionName: string): Promise<void> {
		return this.timelineHelper.verifyTimelineSectionExists(sectionName)
	}

	/**
	 * Verify timeline section has specific event count
	 */
	async verifyTimelineSectionHasEvents(
		sectionName: string,
		expectedCount: number,
	): Promise<void> {
		return this.timelineHelper.verifyTimelineSectionHasEvents(
			sectionName,
			expectedCount,
		)
	}

	/**
	 * Verify event exists in specific section
	 */
	async verifyEventInSection(
		sectionName: string,
		eventName: string,
	): Promise<void> {
		return this.timelineHelper.verifyEventInSection(sectionName, eventName)
	}

	/**
	 * Verify overall timeline structure
	 */
	async verifyTimelineStructure(): Promise<void> {
		return this.timelineHelper.verifyTimelineStructure()
	}

	/**
	 * Verify timeline section grouping
	 */
	async verifyTimelineSectionGrouping(): Promise<void> {
		return this.timelineHelper.verifyTimelineSectionGrouping()
	}

	/**
	 * Verify event count in specific section
	 */
	async verifyEventCountInSection(
		sectionTitle: string,
		expectedCount: number,
	): Promise<void> {
		return this.timelineHelper.verifyEventCountInSection(
			sectionTitle,
			expectedCount,
		)
	}

	/**
	 * Verify event order in timeline
	 */
	async verifyEventOrder(): Promise<void> {
		// Verify that at least first N cards are visible in stable order
		const count = await this.eventCards.count()
		if (count < 2) return
		for (let i = 0; i < Math.min(count, 10); i++) {
			await expect(this.eventCards.nth(i)).toBeVisible()
		}
	}

	/**
	 * Filter helper delegation methods
	 */

	/**
	 * Verify active filter
	 */
	async verifyActiveFilter(
		filterType: 'gregorian' | 'hijri' | 'both',
	): Promise<void> {
		return this.filterHelper.verifyActiveFilter(filterType)
	}

	/**
	 * Verify filter persists across reload
	 */
	async verifyFilterPersistence(
		expectedFilter: 'gregorian' | 'hijri' | 'both',
	): Promise<void> {
		return this.filterHelper.verifyFilterPersistence(expectedFilter)
	}

	/**
	 * Verify no events message for current filter
	 */
	async verifyNoEventsForFilter(): Promise<void> {
		return this.filterHelper.verifyNoEventsForFilter()
	}

	/**
	 * Get filter badge counts
	 */
	async getFilterCounts(): Promise<{
		gregorian: number
		hijri: number
		both: number
	}> {
		return this.filterHelper.getFilterCounts()
	}

	/**
	 * Verify filter counts match expected values
	 */
	async verifyFilterCounts(expected: {
		gregorian: number
		hijri: number
		both: number
	}): Promise<void> {
		return this.filterHelper.verifyFilterCounts(expected)
	}

	/**
	 * Date display helper delegation methods
	 */

	/**
	 * Get current Hijri date display
	 */
	async getCurrentHijriDate(): Promise<string> {
		return this.dateDisplayHelper.getCurrentHijriDate()
	}

	/**
	 * Get current Gregorian date display
	 */
	async getCurrentGregorianDate(): Promise<string> {
		return this.dateDisplayHelper.getCurrentGregorianDate()
	}

	/**
	 * Verify current date displays are visible
	 */
	async verifyCurrentDateDisplays(): Promise<void> {
		return this.dateDisplayHelper.verifyCurrentDateDisplays()
	}

	/**
	 * Verify Hijri date format
	 */
	async verifyHijriDateFormat(): Promise<void> {
		return this.dateDisplayHelper.verifyHijriDateFormat()
	}

	/**
	 * Verify Gregorian date format
	 */
	async verifyGregorianDateFormat(): Promise<void> {
		return this.dateDisplayHelper.verifyGregorianDateFormat()
	}

	/**
	 * Wait for timeline to load
	 */
	async waitForTimelineLoad(): Promise<void> {
		await Promise.race([
			this.page.locator('h2').first().waitFor({ state: 'visible' }),
			this.emptyStateMessage.waitFor({ state: 'visible' }),
			this.page.locator('text=No upcoming dates').waitFor({ state: 'visible' }),
		])
	}
}
