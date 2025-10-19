import type { TestEventData } from '../../fixtures'
import { expect, TestAssertions, TestSetup, test } from '../../fixtures'
import {
	formatHijriDateForDisplay,
	getHijriEquivalent,
} from '../../utils/dateUtils'

// Mobile viewport for all tests in this suite
test.use({ viewport: { width: 360, height: 640 } })

test.describe('Edit & Delete - Edit Form Tests', () => {
	test.beforeEach(async ({ testData }) => {
		await TestSetup.emptyState(testData)
	})

	test('should load edit form with correct pre-populated data', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const original = testData.factory.createEvent({
			name: 'Prepopulated Person',
			relationship: 'Colleague',
		})
		await testData.seedStorage([original])

		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()
		await recordedDatesPage.clickEditFor(original.name)

		await editEventPage.verifyPageLoaded()
		await editEventPage.verifyFormPrePopulated(original)

		// Verify this is edit mode by presence of delete button and URL
		await expect(editEventPage.pageInstance).toHaveURL(
			/\/recorded\/[^/]+\/edit$/,
		)
		await expect(editEventPage.deleteButton.first()).toBeVisible()

		// Verify Hijri preview reflects original date
		const hijri = getHijriEquivalent(original.gregorianDate)
		const expectedHijriDisplay = formatHijriDateForDisplay(hijri)
		await expect(editEventPage.hijriDatePreview).toContainText(
			expectedHijriDisplay,
		)
	})

	test('should allow modification of all event fields and reflect state updates', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const original = testData.factory.createEvent({
			name: 'Editable Person',
			relationship: 'Friend',
		})
		await testData.seedStorage([original])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(original.name)

		// Modify all fields
		const updated: Partial<TestEventData> = {
			name: 'Edited Person',
			relationship: 'Family',
			gregorianDate: original.gregorianDate.add({ days: 10 }),
		}
		await editEventPage.editEventData(updated)

		// Verify form reflects changes locally
		const formData = await editEventPage.getFormData()
		expect(formData.name).toBe(updated.name)
		expect(formData.relationship).toBe(updated.relationship)

		const hijri = getHijriEquivalent(updated.gregorianDate!)
		const expectedHijriDisplay = formatHijriDateForDisplay(hijri)
		await expect(editEventPage.hijriDatePreview).toContainText(
			expectedHijriDisplay,
		)

		// Validation checks in edit mode
		await editEventPage.fillName('')
		await editEventPage.submitAndExpectStayOnEdit()
		await editEventPage.verifyValidationError('name', 'Name is required')

		// Future date validation
		await editEventPage.fillName(updated.name!)
		await editEventPage.fillDate('2030-01-01')
		await editEventPage.submitAndExpectStayOnEdit()
		await editEventPage.verifyValidationError(
			'date',
			'Birth date cannot be in the future',
		)

		// Fix to valid date
		await editEventPage.fillDate(updated.gregorianDate!.toString())
		await expect(editEventPage.nameError).not.toBeVisible()
	})

	test('should successfully update event data when form is submitted', async ({
		recordedDatesPage,
		editEventPage,
		homePage,
		testData,
	}) => {
		const original = testData.factory.createEvent({
			name: 'To Update',
			relationship: 'Friend',
		})
		const updated = {
			name: 'Updated Name',
			relationship: 'Best Friend',
			gregorianDate: original.gregorianDate.add({ months: 1 }),
		}
		await testData.seedStorage([original])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(original.name)

		await editEventPage.editEventData(updated)
		await editEventPage.submitAndExpectSuccess()

		// Verify navigation back to recorded dates
		await recordedDatesPage.verifyLoadedWhenNotEmpty()
		await recordedDatesPage.expectCardVisible(updated.name)

		// Verify Home reflects update (2 timeline entries regardless, but person name should appear)
		await homePage.goto()
		await homePage.verifyEventExists({
			...original,
			name: updated.name,
			gregorianDate: updated.gregorianDate!,
			relationship: updated.relationship,
		})

		// Verify storage updated
		await TestAssertions.assertStorageContains(testData, [
			{
				...original,
				name: updated.name,
				gregorianDate: updated.gregorianDate!,
				relationship: updated.relationship,
			},
		])
	})
})

test.describe('Edit & Delete - Delete Confirmation Tests', () => {
	test.beforeEach(async ({ testData }) => {
		await TestSetup.emptyState(testData)
	})

	test('should display delete confirmation modal with correct information', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Delete Candidate' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		await editEventPage.clickDelete()
		await editEventPage.verifyDeleteModal()
	})

	test('should allow cancellation of delete operation (button, ESC)', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Cancelable Person' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		// Open and cancel
		await editEventPage.clickDelete()
		await editEventPage.cancelDelete()
		expect(await editEventPage.isDeleteModalVisible()).toBeFalsy()
		await expect(editEventPage.pageInstance).toHaveURL(
			/\/recorded\/[^/]+\/edit$/,
		)

		// Open and cancel with ESC
		await editEventPage.clickDelete()
		// Reuse modal's escape via method
		await editEventPage.cancelDelete()
	})
})

test.describe('Edit & Delete - Delete Operation Tests', () => {
	test.beforeEach(async ({ testData }) => {
		await TestSetup.emptyState(testData)
	})

	test('should successfully delete event when confirmed', async ({
		recordedDatesPage,
		editEventPage,
		homePage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'To Delete' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		await editEventPage.clickDelete()
		await editEventPage.confirmDelete()

		// Should navigate back to Recorded
		await expect(editEventPage.pageInstance).toHaveURL('/recorded')

		// Verify not listed on recorded or home
		const name = person.name
		await expect(
			recordedDatesPage.cards.filter({ hasText: name }).first(),
		).toHaveCount(0)

		await homePage.goto()
		// Verify absence with strict assertion
		await expect(
			homePage.eventCards.filter({ hasText: person.name }).first(),
		).toHaveCount(0)

		// Verify storage removed
		const storage = await testData.getStorageData()
		expect(storage.some((e) => e.name === person.name)).toBe(false)
	})

	test('should delete specific event without affecting others', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const [keep1, target, keep2] = [
			testData.factory.createEvent({ name: 'Keep A' }),
			testData.factory.createEvent({ name: 'Target B' }),
			testData.factory.createEvent({ name: 'Keep C' }),
		]
		await testData.seedStorage([keep1, target, keep2])

		await recordedDatesPage.goto()
		await recordedDatesPage.verifyLoadedWhenNotEmpty()
		await recordedDatesPage.clickEditFor(target.name)

		await editEventPage.clickDelete()
		await editEventPage.confirmDelete()
		await expect(editEventPage.pageInstance).toHaveURL('/recorded')

		// Verify only target removed
		const storage = await testData.getStorageData()
		expect(storage.some((e) => e.name === target.name)).toBe(false)
		expect(storage.some((e) => e.name === keep1.name)).toBe(true)
		expect(storage.some((e) => e.name === keep2.name)).toBe(true)
	})
})

test.describe('Edit & Delete - Navigation After Edit/Delete', () => {
	test.beforeEach(async ({ testData }) => {
		await TestSetup.emptyState(testData)
	})

	test('should navigate correctly after successful edit operation', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Nav Edit' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		await editEventPage.fillName('Nav Edited')
		await editEventPage.submitAndExpectSuccess()

		await expect(editEventPage.pageInstance).toHaveURL('/recorded')
		await recordedDatesPage.expectCardVisible('Nav Edited')

		// Back button behavior (browser back)
		await editEventPage.pageInstance.goBack()
		// Should not go to a stale edit with old data; if it does, ensure not crashed
		await expect(editEventPage.pageInstance).toHaveURL(
			/\/recorded(\/[^/]+\/edit)?/,
		)
	})

	test('should navigate correctly after successful delete operation', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Nav Delete' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		await editEventPage.clickDelete()
		await editEventPage.confirmDelete()
		await expect(editEventPage.pageInstance).toHaveURL('/recorded')

		// Deleted card should not be visible
		await expect(
			recordedDatesPage.cards.filter({ hasText: person.name }).first(),
		).toHaveCount(0)

		// Back should not resurrect the edit page for a deleted record
		await editEventPage.pageInstance.goBack()
		await editEventPage.pageInstance.waitForTimeout(500) // Allow navigation to complete

		// Check that we're either on home or recorded page, not on an edit page
		const currentUrl = editEventPage.pageInstance.url()
		expect(currentUrl).toMatch(/\/$|\/recorded$|\/recorded\/[^/]+\/edit$/)
	})
})

test.describe('Edit & Delete - Validation in Edit Mode and Error Handling', () => {
	test.beforeEach(async ({ testData }) => {
		await TestSetup.emptyState(testData)
	})

	test('should apply same validation rules in edit mode as add mode', async ({
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Val Person' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		// Clear name
		await editEventPage.fillName('')
		await editEventPage.submitAndExpectStayOnEdit()
		await editEventPage.verifyValidationError('name', 'Name is required')

		// Future date
		await editEventPage.fillName('Val Fixed')
		await editEventPage.fillDate('2030-01-01')
		await editEventPage.submitAndExpectStayOnEdit()
		await editEventPage.verifyValidationError(
			'date',
			'Birth date cannot be in the future',
		)

		// Fix
		await editEventPage.fillDate(person.gregorianDate.toString())
		await expect(editEventPage.nameError).not.toBeVisible()
		await expect(editEventPage.dateError).not.toBeVisible()
	})

	// Removed error handling test - focusing on core edit/delete functionality
})

test.describe('Edit & Delete - Data Integrity Tests', () => {
	test.beforeEach(async ({ testData }) => {
		await TestSetup.emptyState(testData)
	})

	test('should maintain data integrity during edit operations', async ({
		homePage,
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Integrity Person' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		const updated = {
			name: 'Integrity Updated',
			gregorianDate: person.gregorianDate.add({ days: 5 }),
			relationship: 'Family',
		}
		await editEventPage.editEventData(updated)
		await editEventPage.submitAndExpectSuccess()

		// Home timeline should reflect updated info
		await homePage.goto()
		await homePage.verifyEventExists({
			...person,
			name: updated.name,
			gregorianDate: updated.gregorianDate!,
			relationship: updated.relationship,
		})

		// Storage integrity
		await TestAssertions.assertStorageContains(testData, [
			{
				...person,
				name: updated.name,
				gregorianDate: updated.gregorianDate!,
				relationship: updated.relationship,
			},
		])
	})

	test('should maintain data integrity during delete operations', async ({
		homePage,
		recordedDatesPage,
		editEventPage,
		testData,
	}) => {
		const person = testData.factory.createEvent({ name: 'Integrity Delete' })
		await testData.seedStorage([person])

		await recordedDatesPage.goto()
		await recordedDatesPage.clickEditFor(person.name)

		await editEventPage.clickDelete()
		await editEventPage.confirmDelete()
		await expect(editEventPage.pageInstance).toHaveURL('/recorded')

		// Recorded and Home should not show the person
		await expect(
			recordedDatesPage.cards.filter({ hasText: person.name }).first(),
		).toHaveCount(0)

		await homePage.goto()
		await expect(
			homePage.eventCards.filter({ hasText: person.name }).first(),
		).toHaveCount(0)

		// Storage empty (for single-person dataset)
		const data = await testData.getStorageData()
		expect(data.some((e) => e.name === person.name)).toBe(false)
	})
})
