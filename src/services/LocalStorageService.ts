import { Temporal } from '@js-temporal/polyfill'
import type { BirthdayEvent, StorageService } from './types'

const STORAGE_KEY = 'birthdayEvents'

export class LocalStorageService implements StorageService {
	getEvents(): BirthdayEvent[] {
		try {
			const eventsJson = localStorage.getItem(STORAGE_KEY)
			if (!eventsJson) {
				return []
			}
			const events = JSON.parse(eventsJson) as any[]
			return events.map((event) => ({
				...event,
				gregorianDate: Temporal.PlainDate.from(event.gregorianDate),
			}))
		} catch (error) {
			console.error('Error parsing events from localStorage:', error)
			return []
		}
	}

	getEventById(id: string): BirthdayEvent | null {
		const events = this.getEvents()
		return events.find((event) => event.id === id) || null
	}

	addEvent(event: Omit<BirthdayEvent, 'id'>): void {
		const events = this.getEvents()
		const newEvent: BirthdayEvent = {
			...event,
			id: crypto.randomUUID(),
		}
		// Convert Temporal.PlainDate to string for storage
		const eventsToStore = [...events, newEvent].map((e) => ({
			...e,
			gregorianDate: e.gregorianDate.toString(),
		}))
		localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore))
	}

	updateEvent(id: string, updates: Partial<Omit<BirthdayEvent, 'id'>>): void {
		const events = this.getEvents()
		const eventIndex = events.findIndex((event) => event.id === id)

		if (eventIndex === -1) {
			throw new Error(`Event with id ${id} not found`)
		}

		const updatedEvent = {
			...events[eventIndex],
			...updates,
		}

		events[eventIndex] = updatedEvent
		// Convert Temporal.PlainDate to string for storage
		const eventsToStore = events.map((e) => ({
			...e,
			gregorianDate: e.gregorianDate.toString(),
		}))
		localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore))
	}

	deleteEvent(id: string): void {
		const events = this.getEvents()
		const filteredEvents = events.filter((event) => event.id !== id)

		if (filteredEvents.length === events.length) {
			throw new Error(`Event with id ${id} not found`)
		}

		// Convert Temporal.PlainDate to string for storage
		const eventsToStore = filteredEvents.map((e) => ({
			...e,
			gregorianDate: e.gregorianDate.toString(),
		}))
		localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore))
	}
}
