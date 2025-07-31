import { Temporal } from '@js-temporal/polyfill'

export function getHijriDate(
	gregorianDate: Temporal.PlainDate,
): Temporal.PlainDate {
	return gregorianDate.withCalendar('islamic-umalqura')
}

export function getGregorianDate(
	hijriDate: Temporal.PlainDate,
): Temporal.PlainDate {
	return hijriDate.withCalendar('gregory')
}

export function getAge(birthDate: Temporal.PlainDate): number {
	const today = Temporal.Now.plainDateISO().withCalendar(birthDate.calendarId)
	return today.since(birthDate, { largestUnit: 'years' }).years
}

export function getNextBirthday(
	birthDate: Temporal.PlainDate,
): Temporal.PlainDate {
	const today = Temporal.Now.plainDateISO()
	const todayInCalendar = today.withCalendar(birthDate.calendarId)

	let nextBirthday = birthDate.with({ year: todayInCalendar.year })

	if (Temporal.PlainDate.compare(nextBirthday, todayInCalendar) < 0) {
		nextBirthday = nextBirthday.add({ years: 1 })
	}

	return nextBirthday
}

export function displayGregorianDate(
	gregorianDate: Temporal.PlainDate,
): string {
	return gregorianDate.toLocaleString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}

export function displayHijriDate(hijriDate: Temporal.PlainDate): string {
	return hijriDate.toLocaleString('en-US', {
		calendar: 'islamic-umalqura',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}

// New countdown and timeline utilities
export interface TimeUntilBirthday {
	months: number
	days: number
	totalDays: number
}

export function getTimeUntilBirthday(
	birthDate: Temporal.PlainDate,
): TimeUntilBirthday {
	const nextBirthday = getNextBirthday(birthDate)
	const today = Temporal.Now.plainDateISO().withCalendar(birthDate.calendarId)

	// Get the duration with months and days
	const duration = today.until(nextBirthday, { largestUnit: 'month' })
	const totalDays = Math.ceil(nextBirthday.since(today).total({ unit: 'day' }))

	return {
		months: duration.months,
		days: duration.days,
		totalDays,
	}
}

export function getDaysUntilBirthday(birthDate: Temporal.PlainDate): number {
	return getTimeUntilBirthday(birthDate).totalDays
}

export function getCountdownColor(
	daysUntil: number,
): 'error' | 'warning' | 'success' {
	if (daysUntil <= 7) return 'error'
	if (daysUntil <= 30) return 'warning'
	return 'success'
}

export function getTimeRangeLabel(daysUntil: number): string {
	if (daysUntil <= 7) return 'This Week'
	if (daysUntil <= 30) return 'This Month'
	if (daysUntil <= 90) return 'Next 3 Months'
	return 'Rest of Year'
}

export function formatCountdown(timeUntil: TimeUntilBirthday): string {
	const { months, days, totalDays } = timeUntil

	if (totalDays === 0) return 'Today!'
	if (totalDays === 1) return '1 Day'

	// If less than a month, show only days
	if (months === 0) {
		return `${days} Day${days === 1 ? '' : 's'}`
	}

	// If exactly whole months, show only months
	if (days === 0) {
		return `${months} Month${months === 1 ? '' : 's'}`
	}

	// Show both months and days
	const monthText = `${months} Month${months === 1 ? '' : 's'}`
	const dayText = `${days} Day${days === 1 ? '' : 's'}`

	return `${monthText}, ${dayText}`
}

// Overloaded function for backward compatibility
export function formatCountdownFromDays(daysUntil: number): string {
	if (daysUntil === 0) return 'Today!'
	if (daysUntil === 1) return '1 Day'
	return `${Math.ceil(daysUntil)} Days`
}

export function getNextGregorianBirthday(
	gregorianBirthDate: Temporal.PlainDate,
): Temporal.PlainDate {
	return getNextBirthday(gregorianBirthDate)
}

export function getNextHijriBirthday(
	hijriBirthDate: Temporal.PlainDate,
): Temporal.PlainDate {
	return getNextBirthday(hijriBirthDate)
}

export function calculateGregorianAge(
	gregorianBirthDate: Temporal.PlainDate,
): number {
	const nextBirthday = getNextGregorianBirthday(gregorianBirthDate)
	return nextBirthday.since(gregorianBirthDate, { largestUnit: 'years' }).years
}

export function calculateHijriAge(hijriBirthDate: Temporal.PlainDate): number {
	const nextBirthday = getNextHijriBirthday(hijriBirthDate)
	return nextBirthday.since(hijriBirthDate, { largestUnit: 'years' }).years
}

// Current date utilities
export function getCurrentHijriDate(): Temporal.PlainDate {
	const today = Temporal.Now.plainDateISO()
	return today.withCalendar('islamic-umalqura')
}

export function getCurrentGregorianDate(): Temporal.PlainDate {
	return Temporal.Now.plainDateISO()
}

export function formatCurrentHijriDate(): string {
	const hijriDate = getCurrentHijriDate()
	return hijriDate.toLocaleString('en-US', {
		calendar: 'islamic-umalqura',
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}

export function formatCurrentHijriDateShort(): string {
	const hijriDate = getCurrentHijriDate()
	return hijriDate.toLocaleString('en-US', {
		calendar: 'islamic-umalqura',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})
}
