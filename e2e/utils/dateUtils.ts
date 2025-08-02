import { Temporal } from '@js-temporal/polyfill'

/**
 * Test date utilities for generating consistent test data
 */

export interface TestDateConfig {
	daysFromToday?: number
	monthsFromToday?: number
	yearsFromToday?: number
	calendar?: 'gregorian' | 'hijri'
}

/**
 * Generate a test date relative to today
 */
export function generateTestDate(
	config: TestDateConfig = {},
): Temporal.PlainDate {
	const {
		daysFromToday = 0,
		monthsFromToday = 0,
		yearsFromToday = 0,
		calendar = 'gregorian',
	} = config

	let baseDate = Temporal.Now.plainDateISO()

	if (calendar === 'hijri') {
		baseDate = baseDate.withCalendar('islamic-umalqura')
	}

	return baseDate.add({
		days: daysFromToday,
		months: monthsFromToday,
		years: yearsFromToday,
	})
}

/**
 * Generate a birth date that will have a birthday in the specified number of days
 */
export function generateBirthDateForUpcomingBirthday(
	daysUntilBirthday: number,
	ageOnNextBirthday: number = 25,
	calendar: 'gregorian' | 'hijri' = 'gregorian',
): Temporal.PlainDate {
	const today = Temporal.Now.plainDateISO()
	const nextBirthday = today.add({ days: daysUntilBirthday })

	let birthDate = nextBirthday.subtract({ years: ageOnNextBirthday })

	if (calendar === 'hijri') {
		birthDate = birthDate.withCalendar('islamic-umalqura')
	}

	return birthDate
}

/**
 * Generate test dates for different timeline scenarios
 */
export const TestDates = {
	// Upcoming birthdays
	tomorrow: () => generateBirthDateForUpcomingBirthday(1),
	nextWeek: () => generateBirthDateForUpcomingBirthday(7),
	nextMonth: () => generateBirthDateForUpcomingBirthday(30),
	nextQuarter: () => generateBirthDateForUpcomingBirthday(90),

	// Hijri dates
	hijriTomorrow: () => generateBirthDateForUpcomingBirthday(1, 25, 'hijri'),
	hijriNextWeek: () => generateBirthDateForUpcomingBirthday(7, 25, 'hijri'),
	hijriNextMonth: () => generateBirthDateForUpcomingBirthday(30, 25, 'hijri'),

	// Past dates for age calculation
	pastDate: (yearsAgo: number) =>
		generateTestDate({ yearsFromToday: -yearsAgo }),

	// Fixed test dates for consistent testing
	fixed: {
		gregorian: Temporal.PlainDate.from('2000-06-15'),
		hijri:
			Temporal.PlainDate.from('2000-06-15').withCalendar('islamic-umalqura'),
	},
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Temporal.PlainDate): string {
	const gregorianDate = date.withCalendar('gregory')
	// Format as YYYY-MM-DD for HTML date inputs
	const year = gregorianDate.year.toString().padStart(4, '0')
	const month = gregorianDate.month.toString().padStart(2, '0')
	const day = gregorianDate.day.toString().padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Convert Hijri date to expected display format
 */
export function formatHijriDateForDisplay(
	hijriDate: Temporal.PlainDate,
): string {
	return hijriDate.toLocaleString('en-US', {
		calendar: 'islamic-umalqura',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}

/**
 * Convert Gregorian date to expected display format
 */
export function formatGregorianDateForDisplay(
	gregorianDate: Temporal.PlainDate,
): string {
	return gregorianDate.toLocaleString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}

/**
 * Get the Hijri equivalent of a Gregorian date
 */
export function getHijriEquivalent(
	gregorianDate: Temporal.PlainDate,
): Temporal.PlainDate {
	return gregorianDate.withCalendar('islamic-umalqura')
}

/**
 * Get the Gregorian equivalent of a Hijri date
 */
export function getGregorianEquivalent(
	hijriDate: Temporal.PlainDate,
): Temporal.PlainDate {
	return hijriDate.withCalendar('gregory')
}

/**
 * Calculate days until next birthday for a given birth date
 */
export function calculateDaysUntilBirthday(
	birthDate: Temporal.PlainDate,
): number {
	const today = Temporal.Now.plainDateISO().withCalendar(birthDate.calendarId)
	let nextBirthday = birthDate.with({ year: today.year })

	if (Temporal.PlainDate.compare(nextBirthday, today) < 0) {
		nextBirthday = nextBirthday.add({ years: 1 })
	}

	return Math.ceil(nextBirthday.since(today).total({ unit: 'day' }))
}
