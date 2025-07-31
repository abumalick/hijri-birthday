import { useState, useEffect, useMemo } from 'react'
import type {
	BirthdayEvent,
	Person,
	TimelineSection,
	CalendarType,
} from '../services/types'
import { LocalStorageService } from '../services/LocalStorageService'
import {
	convertLegacyEventToPerson,
	getTimelineEvents,
} from '../utils/timeline'

const FILTER_STORAGE_KEY = 'timeline-filter-preference'

export function useTimelineEvents() {
	const [legacyEvents, setLegacyEvents] = useState<BirthdayEvent[]>([])
	const [activeFilter, setActiveFilter] = useState<CalendarType | 'both'>(
		() => {
			const saved = localStorage.getItem(FILTER_STORAGE_KEY)
			return (saved as CalendarType | 'both') || 'both'
		},
	)

	const storageService = useMemo(() => new LocalStorageService(), [])

	// Load events from storage
	useEffect(() => {
		const events = storageService.getEvents()
		setLegacyEvents(events)
	}, [storageService])

	// Convert legacy events to persons
	const persons = useMemo(() => {
		return legacyEvents.map(convertLegacyEventToPerson)
	}, [legacyEvents])

	// Get timeline sections based on current filter
	const timelineSections = useMemo(() => {
		return getTimelineEvents(persons, activeFilter)
	}, [persons, activeFilter])

	// Calculate event counts for filter tabs
	const eventCounts = useMemo(() => {
		const allEvents = persons.flatMap((person) => [
			person.gregorianEvent,
			person.hijriEvent,
		])
		return {
			gregorian: allEvents.filter((e) => e.calendarType === 'gregorian').length,
			hijri: allEvents.filter((e) => e.calendarType === 'hijri').length,
			both: allEvents.length,
		}
	}, [persons])

	// Handle filter change with persistence
	const handleFilterChange = (newFilter: CalendarType | 'both') => {
		setActiveFilter(newFilter)
		localStorage.setItem(FILTER_STORAGE_KEY, newFilter)
	}

	return {
		timelineSections,
		activeFilter,
		handleFilterChange,
		eventCounts,
		isLoading: false,
		isEmpty: legacyEvents.length === 0,
	}
}
