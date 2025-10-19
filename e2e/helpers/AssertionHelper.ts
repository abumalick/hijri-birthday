import { expect, type Locator, type Page } from '@playwright/test'
import type {
	TestDataManager,
	TestEventData,
} from '../fixtures/testDataFixture'
import { formatDateForInput } from '../utils/dateUtils'

/**
 * AssertionHelper class for centralizing complex verification logic
 *
 * This helper extracts verification and assertion patterns from page objects
 * into a centralized utility, reducing duplication and improving test readability.
 * All methods are static, requiring no instance creation.
 *
 * @example
 * ```typescript
 * // Verify form fields match expected data
 * await AssertionHelper.assertFormFilled(page, eventData, {
 *   nameInput: page.getByTestId('name-input'),
 *   dateInput: page.getByTestId('date-input'),
 *   relationshipInput: page.getByTestId('relationship-input')
 * })
 *
 * // Verify validation error appears
 * await AssertionHelper.assertValidationError(page, 'name', 'Name is required')
 *
 * // Verify page URL
 * await AssertionHelper.assertPageURL(page, '/add')
 *
 * // Verify element visibility
 * await AssertionHelper.assertElementVisible(page.getByTestId('submit-button'), true)
 *
 * // Verify event in timeline
 * await AssertionHelper.assertEventInTimeline(page, 'John Doe', 'This Week')
 *
 * // Verify event count
 * await AssertionHelper.assertEventCount(page, page.getByTestId('event-card'), 5)
 *
 * // Verify storage contains events
 * await AssertionHelper.assertStorageContains(testData, [eventData1, eventData2])
 * ```
 */
export class AssertionHelper {
	/**
	 * Verify all form fields match expected data
	 *
	 * Checks that name, date, and optionally relationship input fields contain
	 * the expected values from the provided TestEventData. Automatically formats
	 * the date using formatDateForInput utility for comparison.
	 *
	 * @param page - The Playwright Page object
	 * @param expectedData - The expected event data to verify against
	 * @param inputs - Object containing form field locators
	 * @param inputs.nameInput - Locator for the name input field
	 * @param inputs.dateInput - Locator for the date input field
	 * @param inputs.relationshipInput - Optional locator for the relationship input field
	 * @throws AssertionError if any field value doesn't match expected data
	 *
	 * @example
	 * ```typescript
	 * const eventData = {
	 *   name: 'Alice Smith',
	 *   gregorianDate: Temporal.PlainDate.from('2000-06-15'),
	 *   relationship: 'Sister'
	 * }
	 *
	 * await AssertionHelper.assertFormFilled(page, eventData, {
	 *   nameInput: page.getByTestId('name-input'),
	 *   dateInput: page.getByTestId('date-input'),
	 *   relationshipInput: page.getByTestId('relationship-input')
	 * })
	 * ```
	 */
	static async assertFormFilled(
		page: Page,
		expectedData: TestEventData,
		inputs: {
			nameInput: Locator
			dateInput: Locator
			relationshipInput?: Locator
		},
	): Promise<void> {
		try {
			// Verify name field
			await expect(inputs.nameInput).toHaveValue(expectedData.name)

			// Verify date field with formatted date
			const expectedFormattedDate = formatDateForInput(
				expectedData.gregorianDate,
			)
			await expect(inputs.dateInput).toHaveValue(expectedFormattedDate)

			// Verify relationship field if provided
			if (expectedData.relationship && inputs.relationshipInput) {
				await expect(inputs.relationshipInput).toHaveValue(
					expectedData.relationship,
				)
			}
		} catch (error) {
			throw new Error(
				`Form fields do not match expected data for "${expectedData.name}": ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Verify validation error appears with correct message
	 *
	 * Checks that a validation error message is visible and matches the expected
	 * message or pattern. Supports both string and RegExp patterns for flexible
	 * error message matching.
	 *
	 * @param page - The Playwright Page object
	 * @param field - The field type: 'name', 'date', or 'form' (general form error)
	 * @param expectedMessage - The expected error message (string or RegExp pattern)
	 * @throws AssertionError if error is not visible or message doesn't match
	 *
	 * @example
	 * ```typescript
	 * // Verify specific error message
	 * await AssertionHelper.assertValidationError(page, 'name', 'Name is required')
	 *
	 * // Verify error with regex pattern
	 * await AssertionHelper.assertValidationError(page, 'date', /must be in the past/)
	 *
	 * // Verify general form error
	 * await AssertionHelper.assertValidationError(page, 'form', 'Please fix the errors above')
	 * ```
	 */
	static async assertValidationError(
		page: Page,
		field: 'name' | 'date' | 'form',
		expectedMessage: string | RegExp,
	): Promise<void> {
		try {
			// Map field type to test ID
			const testIdMap = {
				name: 'name-error',
				date: 'date-error',
				form: 'form-error',
			}

			const errorLocator = page.getByTestId(testIdMap[field])

			// Verify error is visible
			await expect(errorLocator).toBeVisible({
				timeout: 5000,
			})

			// Verify error message matches
			if (typeof expectedMessage === 'string') {
				await expect(errorLocator).toHaveText(expectedMessage)
			} else {
				await expect(errorLocator).toContainText(expectedMessage)
			}
		} catch (error) {
			throw new Error(
				`Validation error for field "${field}" not found or message doesn't match: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Verify page URL matches expected path
	 *
	 * Checks that the current page URL matches the expected path. Useful for
	 * verifying navigation after form submission or user actions.
	 *
	 * @param page - The Playwright Page object
	 * @param expectedPath - The expected URL path (e.g., '/add', '/recorded', '/')
	 * @throws AssertionError if URL doesn't match expected path
	 *
	 * @example
	 * ```typescript
	 * // Verify navigation to home page
	 * await AssertionHelper.assertPageURL(page, '/')
	 *
	 * // Verify navigation to add event page
	 * await AssertionHelper.assertPageURL(page, '/add')
	 *
	 * // Verify navigation to recorded dates page
	 * await AssertionHelper.assertPageURL(page, '/recorded')
	 * ```
	 */
	static async assertPageURL(page: Page, expectedPath: string): Promise<void> {
		try {
			await expect(page).toHaveURL(expectedPath)
		} catch (error) {
			const currentURL = page.url()
			throw new Error(
				`Expected URL "${expectedPath}" but got "${currentURL}": ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Assert element visibility state
	 *
	 * Verifies that an element is either visible or hidden based on the
	 * shouldBeVisible parameter. Defaults to checking visibility.
	 *
	 * @param locator - The element locator to check
	 * @param shouldBeVisible - Whether the element should be visible (default: true)
	 * @throws AssertionError if visibility state doesn't match expectation
	 *
	 * @example
	 * ```typescript
	 * // Verify element is visible
	 * await AssertionHelper.assertElementVisible(page.getByTestId('submit-button'))
	 *
	 * // Verify element is visible (explicit)
	 * await AssertionHelper.assertElementVisible(page.getByTestId('submit-button'), true)
	 *
	 * // Verify element is hidden
	 * await AssertionHelper.assertElementVisible(page.getByTestId('loading-spinner'), false)
	 * ```
	 */
	static async assertElementVisible(
		locator: Locator,
		shouldBeVisible: boolean = true,
	): Promise<void> {
		try {
			if (shouldBeVisible) {
				await expect(locator).toBeVisible()
			} else {
				await expect(locator).not.toBeVisible()
			}
		} catch (error) {
			const state = shouldBeVisible ? 'visible' : 'hidden'
			throw new Error(
				`Element should be ${state} but is not: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Verify event appears in timeline
	 *
	 * Checks that an event with the specified name appears in the timeline.
	 * Optionally verifies the event appears in a specific timeline section
	 * (e.g., 'This Week', 'This Month', 'Next Quarter', 'Rest of Year').
	 *
	 * @param page - The Playwright Page object
	 * @param eventName - The name of the event to find in the timeline
	 * @param sectionName - Optional section name to verify event is in specific section
	 * @throws AssertionError if event is not found or not in expected section
	 *
	 * @example
	 * ```typescript
	 * // Verify event appears anywhere in timeline
	 * await AssertionHelper.assertEventInTimeline(page, 'John Doe')
	 *
	 * // Verify event appears in specific section
	 * await AssertionHelper.assertEventInTimeline(page, 'John Doe', 'This Week')
	 *
	 * // Verify event in next month section
	 * await AssertionHelper.assertEventInTimeline(page, 'Alice Smith', 'This Month')
	 * ```
	 */
	static async assertEventInTimeline(
		page: Page,
		eventName: string,
		sectionName?: string,
	): Promise<void> {
		try {
			if (sectionName) {
				// Map section name to test ID
				const sectionTestIdMap: Record<string, string> = {
					'This Week': 'this-week-section',
					'This Month': 'this-month-section',
					'Next Quarter': 'next-quarter-section',
					'Rest of Year': 'rest-of-year-section',
				}

				const sectionTestId = sectionTestIdMap[sectionName]
				if (!sectionTestId) {
					throw new Error(`Unknown section name: "${sectionName}"`)
				}

				const section = page.getByTestId(sectionTestId)
				const eventInSection = section.getByTestId('event-card').filter({
					hasText: eventName,
				})

				await expect(eventInSection.first()).toBeVisible()
			} else {
				// Check event appears anywhere in timeline
				const eventCard = page.getByTestId('event-card').filter({
					hasText: eventName,
				})

				await expect(eventCard.first()).toBeVisible()
			}
		} catch (error) {
			const sectionInfo = sectionName ? ` in section "${sectionName}"` : ''
			throw new Error(
				`Event "${eventName}" not found in timeline${sectionInfo}: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Verify event card count
	 *
	 * Checks that the number of event cards matches the expected count.
	 * Useful for verifying that the correct number of events are displayed
	 * after filtering, adding, or deleting events.
	 *
	 * @param page - The Playwright Page object
	 * @param eventCards - The locator for event cards (typically page.getByTestId('event-card'))
	 * @param expectedCount - The expected number of event cards
	 * @throws AssertionError if event card count doesn't match expected
	 *
	 * @example
	 * ```typescript
	 * // Verify 5 events are displayed
	 * await AssertionHelper.assertEventCount(page, page.getByTestId('event-card'), 5)
	 *
	 * // Verify no events are displayed (empty state)
	 * await AssertionHelper.assertEventCount(page, page.getByTestId('event-card'), 0)
	 *
	 * // Verify exactly 1 event after adding
	 * await AssertionHelper.assertEventCount(page, page.getByTestId('event-card'), 1)
	 * ```
	 */
	static async assertEventCount(
		page: Page,
		eventCards: Locator,
		expectedCount: number,
	): Promise<void> {
		try {
			await expect(eventCards).toHaveCount(expectedCount)
		} catch (error) {
			const actualCount = await eventCards.count()
			throw new Error(
				`Expected ${expectedCount} event cards but found ${actualCount}: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Verify storage contains expected events
	 *
	 * Checks that localStorage contains all the expected events with matching
	 * names and dates. Useful for verifying that events are properly persisted
	 * to storage after adding or editing.
	 *
	 * @param testData - The TestDataManager instance for accessing storage
	 * @param expectedEvents - Array of expected event data to verify in storage
	 * @throws AssertionError if any expected event is not found in storage
	 *
	 * @example
	 * ```typescript
	 * const event1 = testData.factory.createEvent({ name: 'John Doe' })
	 * const event2 = testData.factory.createEvent({ name: 'Alice Smith' })
	 *
	 * // Add events to storage
	 * await testData.addEventToStorage(event1)
	 * await testData.addEventToStorage(event2)
	 *
	 * // Verify both events are in storage
	 * await AssertionHelper.assertStorageContains(testData, [event1, event2])
	 * ```
	 */
	static async assertStorageContains(
		testData: TestDataManager,
		expectedEvents: TestEventData[],
	): Promise<void> {
		try {
			const storageData = await testData.getStorageData()

			for (const expectedEvent of expectedEvents) {
				const found = storageData.some(
					(stored) =>
						stored.name === expectedEvent.name &&
						stored.gregorianDate === expectedEvent.gregorianDate.toString(),
				)

				if (!found) {
					throw new Error(
						`Event "${expectedEvent.name}" (${expectedEvent.gregorianDate.toString()}) not found in storage`,
					)
				}
			}
		} catch (error) {
			throw new Error(
				`Storage verification failed: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}
}
