import { Temporal } from '@js-temporal/polyfill'
import { test as base, type Page } from '@playwright/test'
import { TestDates } from '../utils/dateUtils'

/**
 * Test data factory for creating birthday events
 */
export interface TestEventData {
	name: string
	gregorianDate: Temporal.PlainDate
	relationship?: string
	id?: string
}

export interface TestEventFactory {
	createEvent(data: Partial<TestEventData>): TestEventData
	createUpcomingEvent(daysUntil: number, name?: string): TestEventData
	createHijriEvent(data: Partial<TestEventData>): TestEventData
	createMultipleEvents(count: number): TestEventData[]
	createTimelineScenario(): {
		thisWeek: TestEventData[]
		thisMonth: TestEventData[]
		nextQuarter: TestEventData[]
		restOfYear: TestEventData[]
	}
}

export interface TestDataManager {
	factory: TestEventFactory
	clearStorage(): Promise<void>
	seedStorage(events: TestEventData[]): Promise<void>
	getStorageData(): Promise<StoredEventData[]>
	addEventToStorage(event: TestEventData): Promise<void>
	removeEventFromStorage(id: string): Promise<void>
	verifyStorageEmpty(): Promise<boolean>
	verifyEventInStorage(eventData: TestEventData): Promise<boolean>
}

/**
 * Stored event data structure in localStorage
 */
export interface StoredEventData {
	id: string
	name: string
	gregorianDate: string
	relationship?: string
}

/**
 * Implementation of test event factory
 */
class TestEventFactoryImpl implements TestEventFactory {
	private eventCounter = 0

	createEvent(data: Partial<TestEventData> = {}): TestEventData {
		this.eventCounter++
		return {
			name: data.name || `Test Event ${this.eventCounter}`,
			gregorianDate: data.gregorianDate || TestDates.nextMonth(),
			relationship: data.relationship || 'Friend',
			id: data.id || `test-event-${this.eventCounter}-${Date.now()}`,
		}
	}

	createUpcomingEvent(daysUntil: number, name?: string): TestEventData {
		const birthDate = TestDates.fixed.gregorian.subtract({ years: 25 })
		const today = Temporal.Now.plainDateISO()
		const targetBirthday = today.add({ days: daysUntil })

		// Adjust birth date to have birthday on target date
		const adjustedBirthDate = birthDate.with({
			month: targetBirthday.month,
			day: targetBirthday.day,
		})

		return this.createEvent({
			name: name || `Event in ${daysUntil} days`,
			gregorianDate: adjustedBirthDate,
		})
	}

	createHijriEvent(data: Partial<TestEventData> = {}): TestEventData {
		const hijriDate =
			data.gregorianDate?.withCalendar('islamic-umalqura') ||
			TestDates.hijriNextMonth()
		return this.createEvent({
			...data,
			gregorianDate: hijriDate.withCalendar('gregory'),
		})
	}

	createMultipleEvents(count: number): TestEventData[] {
		return Array.from({ length: count }, (_, i) =>
			this.createEvent({ name: `Bulk Event ${i + 1}` }),
		)
	}

	createTimelineScenario() {
		return {
			thisWeek: [
				this.createUpcomingEvent(1, 'Tomorrow Birthday'),
				this.createUpcomingEvent(3, 'Mid-week Birthday'),
				this.createUpcomingEvent(6, 'Weekend Birthday'),
			],
			thisMonth: [
				this.createUpcomingEvent(10, 'Next Week Birthday'),
				this.createUpcomingEvent(20, 'Month End Birthday'),
				this.createUpcomingEvent(25, 'Late Month Birthday'),
			],
			nextQuarter: [
				this.createUpcomingEvent(45, 'Next Month Birthday'),
				this.createUpcomingEvent(75, 'Quarter End Birthday'),
			],
			restOfYear: [
				this.createUpcomingEvent(120, 'Mid Year Birthday'),
				this.createUpcomingEvent(300, 'Year End Birthday'),
			],
		}
	}
}

/**
 * Implementation of test data manager with localStorage operations
 */
class TestDataManagerImpl implements TestDataManager {
	factory: TestEventFactory
	private page: Page

	constructor(page: Page) {
		this.page = page
		this.factory = new TestEventFactoryImpl()
	}

	async clearStorage(): Promise<void> {
		try {
			await this.page.evaluate(() => {
				if (typeof localStorage !== 'undefined') {
					localStorage.removeItem('birthdayEvents')
				}
			})
		} catch (error) {
			// Ignore localStorage access errors during setup
			console.warn('Could not clear localStorage:', error)
		}
	}

	async seedStorage(events: TestEventData[]): Promise<void> {
		const storageEvents = events.map((event) => ({
			id: event.id || crypto.randomUUID(),
			name: event.name,
			gregorianDate: event.gregorianDate.toString(),
			relationship: event.relationship,
		}))

		try {
			await this.page.evaluate((events) => {
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('birthdayEvents', JSON.stringify(events))
				}
			}, storageEvents)
		} catch (error) {
			console.warn('Could not seed localStorage:', error)
		}
	}

	async getStorageData(): Promise<StoredEventData[]> {
		try {
			return await this.page.evaluate(() => {
				if (typeof localStorage === 'undefined') return []

				const data = localStorage.getItem('birthdayEvents')
				if (!data) return []

				try {
					const events = JSON.parse(data)
					return events.map((event: StoredEventData) => ({
						...event,
						gregorianDate: event.gregorianDate, // Keep as string for comparison
					}))
				} catch {
					return []
				}
			})
		} catch (error) {
			console.warn('Could not get localStorage data:', error)
			return []
		}
	}

	async addEventToStorage(event: TestEventData): Promise<void> {
		await this.page.evaluate(
			(eventData) => {
				const existing = JSON.parse(
					localStorage.getItem('birthdayEvents') || '[]',
				)
				const newEvent = {
					id: eventData.id || crypto.randomUUID(),
					name: eventData.name,
					gregorianDate: eventData.gregorianDate,
					relationship: eventData.relationship,
				}
				existing.push(newEvent)
				localStorage.setItem('birthdayEvents', JSON.stringify(existing))
			},
			{
				id: event.id,
				name: event.name,
				gregorianDate: event.gregorianDate.toString(),
				relationship: event.relationship,
			},
		)
	}

	async removeEventFromStorage(id: string): Promise<void> {
		await this.page.evaluate((eventId) => {
			const existing = JSON.parse(
				localStorage.getItem('birthdayEvents') || '[]',
			)
			const filtered = existing.filter(
				(event: StoredEventData) => event.id !== eventId,
			)
			localStorage.setItem('birthdayEvents', JSON.stringify(filtered))
		}, id)
	}

	async verifyStorageEmpty(): Promise<boolean> {
		const events = await this.getStorageData()
		return events.length === 0
	}

	async verifyEventInStorage(eventData: TestEventData): Promise<boolean> {
		const events = await this.getStorageData()
		return events.some(
			(event) =>
				event.name === eventData.name &&
				event.gregorianDate === eventData.gregorianDate.toString(),
		)
	}
}

/**
 * Test fixture that provides test data management capabilities
 */
export const testDataFixture = base.extend<{
	testData: TestDataManager
}>({
	testData: async ({ page }, use) => {
		const testData = new TestDataManagerImpl(page)

		// Navigate to the page first to ensure localStorage is available
		await page.goto('/')

		// Clean up before each test
		await testData.clearStorage()

		await use(testData)

		// Clean up after each test
		await testData.clearStorage()
	},
})

/**
 * Common test data scenarios for reuse across tests
 */
export const TestScenarios = {
	emptyState: [],
	singleEvent: (factory: TestEventFactory) => [factory.createEvent({})],
	multipleEvents: (factory: TestEventFactory) =>
		factory.createMultipleEvents(5),
	upcomingBirthdays: (factory: TestEventFactory) => [
		factory.createUpcomingEvent(1, 'Tomorrow'),
		factory.createUpcomingEvent(7, 'Next Week'),
		factory.createUpcomingEvent(30, 'Next Month'),
	],
	mixedCalendars: (factory: TestEventFactory) => [
		factory.createEvent({ name: 'Gregorian Event' }),
		factory.createHijriEvent({ name: 'Hijri Event' }),
	],
	fullTimeline: (factory: TestEventFactory) => {
		const scenario = factory.createTimelineScenario()
		return [
			...scenario.thisWeek,
			...scenario.thisMonth,
			...scenario.nextQuarter,
			...scenario.restOfYear,
		]
	},
}

export { testDataFixture as test }
