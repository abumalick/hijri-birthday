import type { TimelineBirthdayEvent } from '../services/types'
import { CalendarBadge } from './CalendarBadge'
import { CountdownBadge } from './CountdownBadge'
import { displayGregorianDate, displayHijriDate } from '../utils/dates'

interface DateEventCardProps {
	event: TimelineBirthdayEvent
	className?: string
}

export function DateEventCard({ event, className = '' }: DateEventCardProps) {
	const isGregorian = event.calendarType === 'gregorian'
	const dateDisplay = isGregorian
		? displayGregorianDate(event.nextBirthday)
		: displayHijriDate(event.nextBirthday)

	const genderEmoji =
		event.name.toLowerCase().includes('fatima') ||
		event.name.toLowerCase().includes('maryam') ||
		event.name.toLowerCase().includes('aisha')
			? '🌸'
			: '⭐'

	return (
		<div
			className={`card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-shadow ${className}`}
		>
			<div className="card-body p-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						<span className="text-2xl">{genderEmoji}</span>
						<div>
							<h3 className="card-title text-lg font-bold">{event.name}</h3>
							<div className="flex items-center gap-2 mt-1">
								<CalendarBadge calendarType={event.calendarType} />
								{event.relationship && (
									<span className="text-xs text-base-content/60">
										{event.relationship}
									</span>
								)}
							</div>
						</div>
					</div>
					<CountdownBadge timeUntil={event.timeUntilNext} />
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm text-base-content/70">Next Date:</span>
						<span className="font-medium">{dateDisplay}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-base-content/70">Age:</span>
						<span className="font-medium">
							{event.ageOnNextBirthday} years old
						</span>
					</div>
				</div>

				<div className="card-actions justify-end mt-4">
					<button type="button" className="btn btn-xs btn-ghost">
						📅 Set Reminder
					</button>
				</div>
			</div>
		</div>
	)
}
