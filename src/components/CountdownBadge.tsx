import {
	formatCountdown,
	getCountdownColor,
	type TimeUntilBirthday,
} from '../utils/dates'

interface CountdownBadgeProps {
	timeUntil: TimeUntilBirthday
	className?: string
}

export function CountdownBadge({
	timeUntil,
	className = '',
}: CountdownBadgeProps) {
	const colorClass = getCountdownColor(timeUntil.totalDays)
	const countdownText = formatCountdown(timeUntil)

	return (
		<div
			className={`badge badge-lg badge-${colorClass} font-bold ${className}`}
		>
			{countdownText}
		</div>
	)
}
