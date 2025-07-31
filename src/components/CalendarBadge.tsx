import type { CalendarType } from '../services/types'

interface CalendarBadgeProps {
	calendarType: CalendarType
	className?: string
}

export function CalendarBadge({
	calendarType,
	className = '',
}: CalendarBadgeProps) {
	const isGregorian = calendarType === 'gregorian'

	return (
		<div
			className={`badge badge-sm ${isGregorian ? 'badge-info' : 'badge-success'} gap-1 ${className}`}
		>
			<span className="text-xs">{isGregorian ? '📅' : '🌙'}</span>
			<span className="font-medium text-xs">
				{isGregorian ? 'Greg' : 'Hijri'}
			</span>
		</div>
	)
}
