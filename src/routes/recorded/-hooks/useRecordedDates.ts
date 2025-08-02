import { Temporal } from '@js-temporal/polyfill'
import { useMemo, useState } from 'react'
import { LocalStorageService } from '../../../services/LocalStorageService'
import type { BirthdayEvent, CalendarType } from '../../../services/types'
import {
	calculateGregorianAge,
	calculateHijriAge,
	getHijriDate,
} from '../../../utils/dates'

export type SortOption = 'name' | 'name-desc' | 'date-asc' | 'date-desc'

export interface RecordedDateEntry {
	id: string
	name: string
	gregorianDate: Temporal.PlainDate
	hijriDate: Temporal.PlainDate
	gregorianAge: number
	hijriAge: number
	calendarType: CalendarType
}

export function useRecordedDates() {
	const [sortBy, setSortBy] = useState<SortOption>('name')
	const [searchQuery, setSearchQuery] = useState('')

	const storageService = new LocalStorageService()
	const events = storageService.getEvents()

	const recordedDates = useMemo(() => {
		// Convert events to recorded date entries
		const entries: RecordedDateEntry[] = events.map((event: BirthdayEvent) => {
			const gregorianAge = calculateGregorianAge(event.gregorianDate)
			const hijriDate = getHijriDate(event.gregorianDate)
			const hijriAge = calculateHijriAge(hijriDate)

			// For now, we'll assume all existing events are gregorian
			// In a future update, we could add calendar type to the event structure
			return {
				id: event.id,
				name: event.name,
				gregorianDate: event.gregorianDate,
				hijriDate,
				gregorianAge,
				hijriAge,
				calendarType: 'gregorian' as CalendarType,
			}
		})

		// Apply search filter
		let filteredEntries = entries
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim()
			filteredEntries = entries.filter((entry) =>
				entry.name.toLowerCase().includes(query),
			)
		}

		// Apply sorting
		const sortedEntries = [...filteredEntries].sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name)
				case 'name-desc':
					return b.name.localeCompare(a.name)
				case 'date-asc':
					return Temporal.PlainDate.compare(b.gregorianDate, a.gregorianDate)
				case 'date-desc':
					return Temporal.PlainDate.compare(a.gregorianDate, b.gregorianDate)
				default:
					return 0
			}
		})

		return sortedEntries
	}, [events, sortBy, searchQuery])

	const stats = useMemo(() => {
		const total = events.length

		return {
			total,
		}
	}, [events])

	return {
		recordedDates,
		stats,
		sortBy,
		setSortBy,
		searchQuery,
		setSearchQuery,
		isEmpty: events.length === 0,
	}
}
