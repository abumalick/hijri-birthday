import { AssertionHelper } from '../helpers/AssertionHelper'
import { FormHelper } from '../helpers/FormHelper'
import { AddEventPage } from '../pages/AddEventPage'
import { DateDisplayHelper } from '../pages/DateDisplayHelper'
import { EditEventPage } from '../pages/EditEventPage'
import { FilterHelper } from '../pages/FilterHelper'
import { HomePage } from '../pages/HomePage'
import { RecordedDatesPage } from '../pages/RecordedDatesPage'
import { TimelineHelper } from '../pages/TimelineHelper'
import type { TestDataManager, TestEventData } from './testDataFixture'
import { TestScenarios, testDataFixture } from './testDataFixture'

/**
 * Combined fixture that provides all testing utilities
 */
interface TestFixtures {
	testData: TestDataManager
	homePage: HomePage
	addEventPage: AddEventPage
	recordedDatesPage: RecordedDatesPage
	editEventPage: EditEventPage
	formHelper: FormHelper
	assertionHelper: AssertionHelper
	timelineHelper: TimelineHelper
	filterHelper: FilterHelper
	dateDisplayHelper: DateDisplayHelper
}

/**
 * Extended test fixture with all page objects and test data management
 */
export const test = testDataFixture.extend<Omit<TestFixtures, 'testData'>>({
	// HomePage fixture
	homePage: async ({ page }, use) => {
		const homePage = new HomePage(page)
		await use(homePage)
	},

	// AddEventPage fixture
	addEventPage: async ({ page }, use) => {
		const addEventPage = new AddEventPage(page)
		await use(addEventPage)
	},

	// RecordedDatesPage fixture
	recordedDatesPage: async ({ page }, use) => {
		const recordedDatesPage = new RecordedDatesPage(page)
		await use(recordedDatesPage)
	},

	// EditEventPage fixture
	editEventPage: async ({ page }, use) => {
		const editEventPage = new EditEventPage(page)
		await use(editEventPage)
	},

	// FormHelper fixture
	formHelper: async ({ page }, use) => {
		const formHelper = new FormHelper()
		await use(formHelper)
	},

	// AssertionHelper fixture
	assertionHelper: async ({ page }, use) => {
		const assertionHelper = new AssertionHelper()
		await use(assertionHelper)
	},

	// TimelineHelper fixture
	timelineHelper: async ({ page }, use) => {
		const timelineHelper = new TimelineHelper(page)
		await use(timelineHelper)
	},

	// FilterHelper fixture
	filterHelper: async ({ page }, use) => {
		const filterHelper = new FilterHelper(page)
		await use(filterHelper)
	},

	// DateDisplayHelper fixture
	dateDisplayHelper: async ({ page }, use) => {
		const dateDisplayHelper = new DateDisplayHelper(page)
		await use(dateDisplayHelper)
	},
})

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test'

/**
 * Export test scenarios and utilities for easy access
 */
export { TestScenarios }

/**
 * Export new helpers for direct access
 */
export type { TestEventData } from './testDataFixture'

/**
 * Common test setup utilities
 */
export const TestSetup = {
	/**
	 * Setup empty state test scenario
	 */
	async emptyState(testData: TestDataManager): Promise<void> {
		await testData.clearStorage()
	},

	/**
	 * Setup single event test scenario
	 */
	async singleEvent(testData: TestDataManager): Promise<void> {
		const events = TestScenarios.singleEvent(testData.factory)
		await testData.seedStorage(events)
	},

	/**
	 * Setup multiple events test scenario
	 */
	async multipleEvents(testData: TestDataManager): Promise<void> {
		const events = TestScenarios.multipleEvents(testData.factory)
		await testData.seedStorage(events)
	},

	/**
	 * Setup upcoming birthdays test scenario
	 */
	async upcomingBirthdays(testData: TestDataManager): Promise<void> {
		const events = TestScenarios.upcomingBirthdays(testData.factory)
		await testData.seedStorage(events)
	},

	/**
	 * Setup mixed calendars test scenario
	 */
	async mixedCalendars(testData: TestDataManager): Promise<void> {
		const events = TestScenarios.mixedCalendars(testData.factory)
		await testData.seedStorage(events)
	},

	/**
	 * Setup full timeline test scenario
	 */
	async fullTimeline(testData: TestDataManager): Promise<void> {
		const events = TestScenarios.fullTimeline(testData.factory)
		await testData.seedStorage(events)
	},
}

/**
 * Assertion helpers for common verifications
 */
export const TestAssertions = {
	/**
	 * Assert event appears in correct timeline section
	 */
	async assertEventInTimelineSection(
		homePage: HomePage,
		eventName: string,
		sectionName: string,
	): Promise<void> {
		await homePage.verifyEventInSection(sectionName, eventName)
	},

	/**
	 * Assert storage contains expected events
	 */
	async assertStorageContains(
		testData: TestDataManager,
		expectedEvents: TestEventData[],
	): Promise<void> {
		for (const event of expectedEvents) {
			const exists = await testData.verifyEventInStorage(event)
			if (!exists) {
				throw new Error(`Event ${event.name} not found in storage`)
			}
		}
	},

	/**
	 * Assert storage is empty
	 */
	async assertStorageEmpty(testData: TestDataManager): Promise<void> {
		const isEmpty = await testData.verifyStorageEmpty()
		if (!isEmpty) {
			throw new Error('Storage is not empty')
		}
	},
}
