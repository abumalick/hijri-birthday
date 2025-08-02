import type { Temporal } from '@js-temporal/polyfill'
import type {
	BirthdayEvent,
	CalendarType,
	Person,
	TimelineBirthdayEvent,
	TimelineSection,
} from '../services/types'
import {
	calculateGregorianAge,
	calculateHijriAge,
	getHijriDate,
	getNextGregorianBirthday,
	getNextHijriBirthday,
	getTimeRangeLabel,
	getTimeUntilBirthday,
} from './dates'

// Convert legacy BirthdayEvent to Person with dual events
export function convertLegacyEventToPerson(event: BirthdayEvent): Person {
	const hijriBirthDate = getHijriDate(event.gregorianDate)

	const gregorianEvent = generateGregorianEvent(
		event.id,
		event.name,
		event.gregorianDate,
		event.relationship,
	)
	const hijriEvent = generateHijriEvent(
		event.id,
		event.name,
		hijriBirthDate,
		event.relationship,
	)

	return {
		id: event.id,
		name: event.name,
		gregorianBirthDate: event.gregorianDate,
		hijriBirthDate,
		relationship: event.relationship,
		gregorianEvent,
		hijriEvent,
	}
}

// Generate Gregorian birthday event
function generateGregorianEvent(
	personId: string,
	name: string,
	gregorianBirthDate: Temporal.PlainDate,
	relationship?: string,
): TimelineBirthdayEvent {
	const nextBirthday = getNextGregorianBirthday(gregorianBirthDate)
	const timeUntil = getTimeUntilBirthday(gregorianBirthDate)
	const ageOnNext = calculateGregorianAge(gregorianBirthDate)

	return {
		id: `${personId}-gregorian`,
		personId,
		name,
		calendarType: 'gregorian',
		birthDate: gregorianBirthDate,
		nextBirthday,
		daysUntilNext: timeUntil.totalDays, // Keep for backward compatibility
		timeUntilNext: timeUntil, // New detailed time structure
		ageOnNextBirthday: ageOnNext,
		relationship,
		reminderSet: false,
	}
}

// Generate Hijri birthday event
function generateHijriEvent(
	personId: string,
	name: string,
	hijriBirthDate: Temporal.PlainDate,
	relationship?: string,
): TimelineBirthdayEvent {
	const nextBirthday = getNextHijriBirthday(hijriBirthDate)
	const timeUntil = getTimeUntilBirthday(hijriBirthDate)
	const ageOnNext = calculateHijriAge(hijriBirthDate)

	return {
		id: `${personId}-hijri`,
		personId,
		name,
		calendarType: 'hijri',
		birthDate: hijriBirthDate,
		nextBirthday,
		daysUntilNext: timeUntil.totalDays, // Keep for backward compatibility
		timeUntilNext: timeUntil, // New detailed time structure
		ageOnNextBirthday: ageOnNext,
		relationship,
		reminderSet: false,
	}
}

// Generate both events for a person
export function generateBirthdayEvents(
	person: Person,
): TimelineBirthdayEvent[] {
	return [person.gregorianEvent, person.hijriEvent]
}

// Group events into timeline sections
export function groupEventsIntoSections(
	events: TimelineBirthdayEvent[],
): TimelineSection[] {
	const sections: { [key: string]: TimelineBirthdayEvent[] } = {
		'This Week': [],
		'This Month': [],
		'Next 3 Months': [],
		'Rest of Year': [],
	}

	// Group events by time range
	events.forEach((event) => {
		const timeRange = getTimeRangeLabel(event.daysUntilNext)
		sections[timeRange].push(event)
	})

	// Convert to TimelineSection objects
	return Object.entries(sections)
		.map(([title, allEvents]) => {
			const gregorianEvents = allEvents.filter(
				(e) => e.calendarType === 'gregorian',
			)
			const hijriEvents = allEvents.filter((e) => e.calendarType === 'hijri')
			const combinedEvents = [...allEvents].sort(
				(a, b) => a.daysUntilNext - b.daysUntilNext,
			)

			return {
				title,
				timeRange: title.toLowerCase().replace(/\s+/g, '-'),
				gregorianEvents: gregorianEvents.sort(
					(a, b) => a.daysUntilNext - b.daysUntilNext,
				),
				hijriEvents: hijriEvents.sort(
					(a, b) => a.daysUntilNext - b.daysUntilNext,
				),
				combinedEvents,
				isEmpty: allEvents.length === 0,
			}
		})
		.filter((section) => !section.isEmpty)
}

// Filter events by calendar type
export function filterEventsByCalendar(
	events: TimelineBirthdayEvent[],
	calendarType: CalendarType | 'both',
): TimelineBirthdayEvent[] {
	if (calendarType === 'both') return events
	return events.filter((event) => event.calendarType === calendarType)
}

// Get events for timeline display
export function getTimelineEvents(
	persons: Person[],
	filter: CalendarType | 'both',
): TimelineSection[] {
	const allEvents = persons.flatMap((person) => generateBirthdayEvents(person))
	const filteredEvents = filterEventsByCalendar(allEvents, filter)
	return groupEventsIntoSections(filteredEvents)
}
