import type { Temporal } from '@js-temporal/polyfill'
import type { TimeUntilBirthday } from '../utils/dates'

// Legacy type for backward compatibility
export type BirthdayEvent = {
	id: string
	name: string
	gregorianDate: Temporal.PlainDate
}

// New dual calendar system types
export type CalendarType = 'gregorian' | 'hijri'

export interface TimelineBirthdayEvent {
	id: string
	personId: string
	name: string
	calendarType: CalendarType
	birthDate: Temporal.PlainDate
	nextBirthday: Temporal.PlainDate
	daysUntilNext: number // Keep for backward compatibility
	timeUntilNext: TimeUntilBirthday // New detailed time structure
	ageOnNextBirthday: number
	relationship?: string
	reminderSet?: boolean
}

export interface Person {
	id: string
	name: string
	gregorianBirthDate: Temporal.PlainDate
	hijriBirthDate: Temporal.PlainDate
	relationship?: string
	// Derived events
	gregorianEvent: TimelineBirthdayEvent
	hijriEvent: TimelineBirthdayEvent
}

export interface TimelineSection {
	title: string
	timeRange: string
	gregorianEvents: TimelineBirthdayEvent[]
	hijriEvents: TimelineBirthdayEvent[]
	combinedEvents: TimelineBirthdayEvent[]
	isEmpty: boolean
}

export interface TimelineFilter {
	activeCalendar: CalendarType | 'both'
	showUpcoming: boolean
	timeRange: 'week' | 'month' | 'quarter' | 'year'
}

export interface StorageService {
	getEvents: () => BirthdayEvent[]
	getEventById: (id: string) => BirthdayEvent | null
	addEvent: (event: Omit<BirthdayEvent, 'id'>) => void
	updateEvent: (id: string, updates: Partial<Omit<BirthdayEvent, 'id'>>) => void
	deleteEvent: (id: string) => void
}
