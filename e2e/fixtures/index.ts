import { AddEventPage } from '../pages/AddEventPage'
import { HomePage } from '../pages/HomePage'
import type {
	TestDataManager,
	TestEventData,
	TestEventFactory,
} from './testDataFixture'
import { TestScenarios, testDataFixture } from './testDataFixture'

/**
 * Combined fixture that provides all testing utilities
 */
export interface TestFixtures {
	testData: TestDataManager
	homePage: HomePage
	addEventPage: AddEventPage
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
})

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test'

/**
 * Export test scenarios and utilities for easy access
 */
export { TestScenarios }
export type { TestEventData, TestEventFactory } from './testDataFixture'

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
 * Common test workflows
 */
export const TestWorkflows = {
	/**
	 * Complete add event workflow
	 */
	async addEventWorkflow(
		homePage: HomePage,
		addEventPage: AddEventPage,
		testData: TestDataManager,
		eventData?: TestEventData,
	): Promise<void> {
		const event = eventData || testData.factory.createEvent({})

		await homePage.goto()
		await homePage.navigateToAddEvent()
		await addEventPage.addEvent(event)
		await homePage.verifyEventExists(event)
	},

	/**
	 * Verify timeline structure workflow
	 */
	async verifyTimelineStructure(
		homePage: HomePage,
		testData: TestDataManager,
	): Promise<void> {
		await TestSetup.fullTimeline(testData)
		await homePage.goto()
		await homePage.verifyTimelineStructure()
	},

	/**
	 * Filter testing workflow
	 */
	async testFiltering(
		homePage: HomePage,
		testData: TestDataManager,
	): Promise<void> {
		await TestSetup.mixedCalendars(testData)
		await homePage.goto()

		// Test Gregorian filter
		await homePage.selectGregorianFilter()
		await homePage.verifyActiveFilter('gregorian')

		// Test Hijri filter
		await homePage.selectHijriFilter()
		await homePage.verifyActiveFilter('hijri')

		// Test Both filter
		await homePage.selectBothFilter()
		await homePage.verifyActiveFilter('both')
	},

	/**
	 * Form validation workflow
	 */
	async testFormValidation(addEventPage: AddEventPage): Promise<void> {
		await addEventPage.goto()
		await addEventPage.testValidationWorkflow()
	},
}

/**
 * Test data generators for common scenarios
 */
export const TestDataGenerators = {
	/**
	 * Generate event for tomorrow
	 */
	tomorrow(factory: TestEventFactory) {
		return factory.createUpcomingEvent(1, 'Tomorrow Birthday')
	},

	/**
	 * Generate event for next week
	 */
	nextWeek(factory: TestEventFactory) {
		return factory.createUpcomingEvent(7, 'Next Week Birthday')
	},

	/**
	 * Generate event for next month
	 */
	nextMonth(factory: TestEventFactory) {
		return factory.createUpcomingEvent(30, 'Next Month Birthday')
	},

	/**
	 * Generate Hijri event
	 */
	hijriEvent(factory: TestEventFactory) {
		return factory.createHijriEvent({ name: 'Hijri Birthday' })
	},

	/**
	 * Generate event with specific relationship
	 */
	withRelationship(factory: TestEventFactory, relationship: string) {
		return factory.createEvent({
			name: `${relationship} Birthday`,
			relationship,
		})
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
