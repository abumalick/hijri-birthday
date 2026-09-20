import { Temporal } from '@js-temporal/polyfill'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	displayHijriDate,
	formatAgeDetail,
	getAge,
	getDetailedAge,
	getGregorianDate,
	getHijriDate,
	getNextBirthday,
} from './dates'

describe('Date Utilities', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})
	describe('getHijriDate', () => {
		it('should convert a Gregorian date to Hijri (Umm al-Qura)', () => {
			const gregorianDate = Temporal.PlainDate.from('2024-07-17')
			const hijriDate = getHijriDate(gregorianDate)
			expect(hijriDate.calendarId).toBe('islamic-umalqura')
			expect(hijriDate.year).toBe(1446)
			expect(hijriDate.month).toBe(1)
			expect(hijriDate.day).toBe(11)
		})
	})

	describe('getGregorianDate', () => {
		it('should convert a Hijri date to Gregorian', () => {
			const hijriDate = Temporal.PlainDate.from({
				year: 1446,
				month: 1,
				day: 11,
				calendar: 'islamic-umalqura',
			})
			const gregorianDate = getGregorianDate(hijriDate)
			expect(gregorianDate.calendarId).toBe('gregory')
			expect(gregorianDate.year).toBe(2024)
			expect(gregorianDate.month).toBe(7)
			expect(gregorianDate.day).toBe(17)
		})
	})

	describe('getAge', () => {
		it('should calculate the correct age', () => {
			const mockToday = Temporal.PlainDate.from('2024-07-17')
			vi.setSystemTime(
				new Date(
					mockToday.toZonedDateTime('UTC').toInstant().epochMilliseconds,
				),
			)

			const birthDate = Temporal.PlainDate.from('1990-01-15')
			const age = getAge(birthDate)
			expect(age).toBe(34)
		})

		it('should return age 0 for a date in the same year', () => {
			const mockToday = Temporal.PlainDate.from('2024-07-17')
			vi.setSystemTime(
				new Date(
					mockToday.toZonedDateTime('UTC').toInstant().epochMilliseconds,
				),
			)

			const birthDate = Temporal.PlainDate.from('2024-01-15')
			const age = getAge(birthDate)
			expect(age).toBe(0)
		})
	})
	it('should calculate the correct age in Hijri years', () => {
		// Today is 2024-07-17 Gregorian, which is 1446-01-11 Hijri.
		const mockToday = Temporal.PlainDate.from('2024-07-17')
		vi.setSystemTime(
			new Date(mockToday.toZonedDateTime('UTC').toInstant().epochMilliseconds),
		)

		// Birth date is 1990-08-22 Gregorian, which corresponds to 1411-02-01 Hijri.
		// A person born on this date would be 33 in Gregorian years.
		// In Hijri years, they are 34, as their birthday for 1446 has not yet passed.
		const birthDate = Temporal.PlainDate.from({
			year: 1411,
			month: 2,
			day: 1,
			calendar: 'islamic-umalqura',
		})
		const age = getAge(birthDate)
		expect(age).toBe(34)
	})

	describe('getNextBirthday', () => {
		it('should return the upcoming birthday for the current year if it has not passed', () => {
			const mockToday = Temporal.PlainDate.from('2024-07-17')
			vi.setSystemTime(
				new Date(
					mockToday.toZonedDateTime('UTC').toInstant().epochMilliseconds,
				),
			)

			const birthDate = Temporal.PlainDate.from({
				year: 1410,
				month: 12,
				day: 15,
				calendar: 'islamic-umalqura',
			}) // Approx 1990-07-08

			const nextBirthday = getNextBirthday(birthDate)
			// The next birthday will be in 1446 AH, as 1445 has passed.
			expect(nextBirthday.year).toBe(1446)
			expect(nextBirthday.month).toBe(12)
			expect(nextBirthday.day).toBe(15)
		})

		it('should return the birthday for the next year if it has already passed this year', () => {
			const mockToday = Temporal.PlainDate.from('2024-07-17') // 1446-01-11
			vi.setSystemTime(
				new Date(
					mockToday.toZonedDateTime('UTC').toInstant().epochMilliseconds,
				),
			)

			const birthDate = Temporal.PlainDate.from({
				year: 1410,
				month: 1,
				day: 1,
				calendar: 'islamic-umalqura',
			})

			const nextBirthday = getNextBirthday(birthDate)
			expect(nextBirthday.year).toBe(1447)
			expect(nextBirthday.month).toBe(1)
			expect(nextBirthday.day).toBe(1)
		})

		it("should return today's date if the birthday is today", () => {
			const mockToday = Temporal.PlainDate.from('2024-07-17') // 1446-01-11
			vi.setSystemTime(
				new Date(
					mockToday.toZonedDateTime('UTC').toInstant().epochMilliseconds,
				),
			)

			const birthDate = Temporal.PlainDate.from({
				year: 1410,
				month: 1,
				day: 11,
				calendar: 'islamic-umalqura',
			})

			const nextBirthday = getNextBirthday(birthDate)
			expect(nextBirthday.year).toBe(1446)
			expect(nextBirthday.month).toBe(1)
			expect(nextBirthday.day).toBe(11)
			expect(
				nextBirthday.equals(mockToday.withCalendar('islamic-umalqura')),
			).toBe(true)
		})
	})

	describe('displayHijriDate', () => {
		it('should format the Hijri date correctly', () => {
			const hijriDate = Temporal.PlainDate.from({
				year: 1446,
				month: 1,
				day: 11,
				calendar: 'islamic-umalqura',
			})
			// This corresponds to 2024-07-17, which is a Wednesday.
			const formattedDate = displayHijriDate(hijriDate)
			expect(formattedDate).toBe('Muharram 11, 1446 AH')
		})

		it('should use the Hijri month names from the months reference', () => {
			const hijriDate = Temporal.PlainDate.from({
				year: 1448,
				month: 4,
				day: 8,
				calendar: 'islamic-umalqura',
			})
			expect(displayHijriDate(hijriDate)).toBe("Rabi' al-Thani 8, 1448 AH")
		})

		it('should not depend on the browser supporting the Hijri calendar in Intl', () => {
			// Browsers without islamic-umalqura data (e.g. Vivaldi on Android)
			// format the Hijri fields with Gregorian month names and eras.
			vi.spyOn(Temporal.PlainDate.prototype, 'toLocaleString').mockReturnValue(
				'April 8, 1448 BC',
			)
			const hijriDate = Temporal.PlainDate.from({
				year: 1448,
				month: 4,
				day: 8,
				calendar: 'islamic-umalqura',
			})
			expect(displayHijriDate(hijriDate)).toBe("Rabi' al-Thani 8, 1448 AH")
		})
	})

	describe('getDetailedAge', () => {
		// Local midnight, so the frozen day matches Temporal.Now in any timezone.
		const freezeAt = (date: string) => {
			vi.setSystemTime(
				new Date(
					Temporal.PlainDate.from(date)
						.toZonedDateTime(Temporal.Now.timeZoneId())
						.toInstant().epochMilliseconds,
				),
			)
		}

		it('should return the age today in years, months and days', () => {
			freezeAt('2026-09-20')
			const age = getDetailedAge(Temporal.PlainDate.from('2025-03-30'))
			expect(age).toEqual({ years: 1, months: 5, days: 21 })
		})

		it('should borrow from the year when the birthday has not passed yet', () => {
			freezeAt('2026-09-20')
			// 25 years and 8 months after 2000-12-31 is 2026-08-31, then 20 days.
			const age = getDetailedAge(Temporal.PlainDate.from('2000-12-31'))
			expect(age).toEqual({ years: 25, months: 8, days: 20 })
		})

		it('should count the days from the monthly anniversary, not backwards from today', () => {
			freezeAt('2020-10-15')
			// The 24y 7mo anniversary is 2020-09-20, which is 25 days ago.
			const age = getDetailedAge(Temporal.PlainDate.from('1996-02-20'))
			expect(age).toEqual({ years: 24, months: 7, days: 25 })
		})

		it('should return zero months and days on a birthday', () => {
			freezeAt('2026-09-20')
			const age = getDetailedAge(Temporal.PlainDate.from('1990-09-20'))
			expect(age).toEqual({ years: 36, months: 0, days: 0 })
		})

		it('should count Hijri years for a Hijri birth date', () => {
			// 2026-09-20 Gregorian is 1448-04-08 Hijri.
			freezeAt('2026-09-20')
			const birthDate = Temporal.PlainDate.from({
				year: 1446,
				month: 1,
				day: 11,
				calendar: 'islamic-umalqura',
			})
			expect(getDetailedAge(birthDate)).toEqual({
				years: 2,
				months: 2,
				days: 27,
			})
		})
	})

	describe('formatAgeDetail', () => {
		it('should abbreviate months and days', () => {
			expect(formatAgeDetail({ years: 1, months: 5, days: 21 })).toBe(
				'5 mo, 21 d',
			)
		})

		it('should omit a unit that is zero', () => {
			expect(formatAgeDetail({ years: 1, months: 0, days: 21 })).toBe('21 d')
			expect(formatAgeDetail({ years: 1, months: 5, days: 0 })).toBe('5 mo')
		})

		it('should read "today" on a birthday', () => {
			expect(formatAgeDetail({ years: 36, months: 0, days: 0 })).toBe('today')
		})
	})
})
