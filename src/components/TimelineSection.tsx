import type { TimelineSection, CalendarType } from '../services/types'
import { DateEventCard } from './BirthdayEventCard'

interface TimelineSectionProps {
	section: TimelineSection
	activeFilter: CalendarType | 'both'
	className?: string
}

export function TimelineSectionComponent({
	section,
	activeFilter,
	className = '',
}: TimelineSectionProps) {
	// Get events based on active filter
	const getEventsForFilter = () => {
		switch (activeFilter) {
			case 'gregorian':
				return section.gregorianEvents
			case 'hijri':
				return section.hijriEvents
			case 'both':
			default:
				return section.combinedEvents
		}
	}

	const events = getEventsForFilter()

	if (events.length === 0) {
		return null
	}

	return (
		<div className={`mb-8 ${className}`}>
			<div className="flex items-center gap-3 mb-4">
				<h2 className="text-xl font-bold text-base-content">{section.title}</h2>
				<div className="badge badge-neutral badge-sm">
					{events.length} event{events.length !== 1 ? 's' : ''}
				</div>
			</div>

			<div className="grid gap-4">
				{events.map((event) => (
					<DateEventCard
						key={event.id}
						event={event}
						className="transition-all duration-300 ease-in-out"
					/>
				))}
			</div>
		</div>
	)
}
