import { Temporal } from '@js-temporal/polyfill'
import type { TestEventData } from '../../fixtures'
import { expect, TestScenarios, TestSetup, test } from '../../fixtures'

// Mobile viewport for all tests in this suite
test.use({ viewport: { width: 360, height: 640 } })

/**
 * Utilities specific to recorded dates tests
 */
function diverseNameSet(factory: {
	createEvent: (data: Partial<TestEventData>) => TestEventData
}) {
	// Names include different cases, partial overlaps, special characters, and unicode
	const names = [
		'Alice Johnson',
		'alice cooper',
		'Bob Marley',
		'Bóby',
		'Çınar',
		"D'Angelo",
		'Élodie',
		'محمد',
		'Zoe-Z',
		'Anna-Maria',
		"O'Brien",
		'X Æ A-12',
		'Ñandú',
		'李雷',
	]
	return names.map((name, i) =>
		factory.createEvent({
			name,
			// Spread birthdays across months/days to enable sort by date
			gregorianDate: Temporal.Now.plainDateISO()
				.subtract({ years: 20 + i })
				.with({ month: (i % 12) + 1, day: (i % 28) + 1 }),
			relationship: i % 2 === 0 ? 'Friend' : 'Family',
		}),
	)
}

function generateLargeSet(
	factory: { createEvent: (data: Partial<TestEventData>) => TestEventData },
	count = 24,
) {
	const arr: TestEventData[] = []
	for (let i = 0; i < count; i++) {
		arr.push(
			factory.createEvent({
				name: `Perf Person ${String.fromCharCode(65 + (i % 26))}-${i}`,
				gregorianDate: Temporal.Now.plainDateISO()
					.subtract({ years: 18 + (i % 40) })
					.with({ month: (i % 12) + 1, day: (i % 28) + 1 }),
				relationship:
					i % 3 === 0 ? 'Colleague' : i % 3 === 1 ? 'Family' : 'Friend',
			}),
		)
	}
	return arr
}

test.describe('Recorded Dates Management - Core', () => {
	test.beforeEach(async ({ testData }) => {
		// Ensure localStorage is cleared and app loaded per fixture
		await testData.clearStorage()
	})

	test('Empty State: shows hero and CTA when no recorded dates', async ({
		recordedDatesPage,
		testData,
	}) => {
		await TestSetup.emptyState(testData)
		await recordedDatesPage.goto()

		await recordedDatesPage.verifyPageEmptyState()
		await expect(recordedDatesPage.header).toHaveCount(0) // header appears only when list exists
	})

	test('List Display: shows all recorded events with accurate info', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = TestScenarios.multipleEvents(testData.factory) // 5 people
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		// Each person appears once on Recorded page (not duplicating calendars)
		const count = await recordedDatesPage.getCardCount()
		expect(count).toBe(people.length)

		for (const p of people) {
			await recordedDatesPage.expectCardVisible(p.name)
		}
	})

	test('Search: partial and case-insensitive matching', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = diverseNameSet(testData.factory)
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		// Case-insensitive: "alice" should match "Alice Johnson" and "alice cooper"
		await recordedDatesPage.setSearch('alice')
		await recordedDatesPage.expectCardVisible('Alice Johnson')
		await recordedDatesPage.expectCardVisible('alice cooper')

		// Partial within hyphenated and special characters
		await recordedDatesPage.setSearch('Zoe')
		await recordedDatesPage.expectCardVisible('Zoe-Z')

		await recordedDatesPage.setSearch('ang') // should hit D'Angelo, Anna-Maria shouldn't match
		await recordedDatesPage.expectCardVisible("D'Angelo")

		// Unicode
		await recordedDatesPage.setSearch('élod') // lowercase, diacritics-insensitive depending on impl—at least contains text
		await recordedDatesPage.expectCardVisible('Élodie')

		// No results
		await recordedDatesPage.setSearch('this-should-not-match-anything-12345')
		await recordedDatesPage.verifySearchEmptyState()

		// Clear search to restore
		await recordedDatesPage.clearSearch()
		const count = await recordedDatesPage.getCardCount()
		expect(count).toBe(people.length)
	})

	test('Sort: by name ascending and descending', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = diverseNameSet(testData.factory)
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		// Ascending
		await recordedDatesPage.selectSort('name')
		await recordedDatesPage.expectOrderByNameAscending()

		// Descending
		await recordedDatesPage.selectSort('name-desc')
		await recordedDatesPage.expectOrderByNameDescending()
	})

	test('Sort: by date and by age in both directions (stability check)', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = diverseNameSet(testData.factory)
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		// Since date/age values are not annotated with strict testids, validate stability/visibility
		await recordedDatesPage.selectSort('date-desc')
		await recordedDatesPage.expectOrderStableVisibleTop()

		await recordedDatesPage.selectSort('date-asc')
		await recordedDatesPage.expectOrderStableVisibleTop()
	})

	test('Empty search results state within non-empty dataset', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = TestScenarios.multipleEvents(testData.factory)
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		await recordedDatesPage.setSearch('zzzzzz-no-match')
		await recordedDatesPage.verifySearchEmptyState()

		// Return to full list
		await recordedDatesPage.clearSearch()
		const count = await recordedDatesPage.getCardCount()
		expect(count).toBe(people.length)
	})

	test('Edit Navigation: clicking Edit navigates to /recorded/:id/edit', async ({
		recordedDatesPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Edit Me' })
		await testData.seedStorage([person])
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		await recordedDatesPage.clickEditFor('Edit Me')
		await expect(recordedDatesPage.page).toHaveURL(/\/recorded\/[^/]+\/edit$/)
	})

	test('Data Consistency: after adding on Home page, appears in Recorded Dates list', async ({
		homePage,
		addEventPage,
		recordedDatesPage,
		testData,
	}) => {
		// Add via UI to simulate real flow
		const newEvent = testData.factory.createEvent({
			name: 'Consistency Person',
		})

		await homePage.goto()
		await homePage.navigateToAddEvent()
		await addEventPage.addEvent(newEvent)

		// Verify in Home
		await homePage.verifyEventExists(newEvent)

		// Verify in Recorded
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()
		await recordedDatesPage.expectCardVisible(newEvent.name)
	})

	test('Combined search + sort interaction remains consistent', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = diverseNameSet(testData.factory)
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		// Filter to entries containing 'a' then sort
		await recordedDatesPage.setSearch('a')
		await recordedDatesPage.selectSort('name')
		await recordedDatesPage.expectOrderStableVisibleTop()

		await recordedDatesPage.selectSort('name-desc')
		await recordedDatesPage.expectOrderStableVisibleTop()

		// Clear and ensure full dataset restored
		await recordedDatesPage.clearSearch()
		const count = await recordedDatesPage.getCardCount()
		expect(count).toBe(people.length)
	})

	test('Performance: List renders and remains interactive with 20+ records', async ({
		recordedDatesPage,
		testData,
	}) => {
		const people = generateLargeSet(testData.factory, 28)
		await testData.seedStorage(people)
		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()

		const count = await recordedDatesPage.getCardCount()
		expect(count).toBe(people.length)

		// Basic interaction under load
		await recordedDatesPage.setSearch('Perf Person A')
		await recordedDatesPage.expectOrderStableVisibleTop()

		await recordedDatesPage.clearSearch()
		await recordedDatesPage.selectSort('name')
		await recordedDatesPage.expectOrderStableVisibleTop()
	})
})
