import { getCountdownColor, formatCountdown } from '../utils/dates'

interface CountdownBadgeProps {
	daysUntil: number
	className?: string
}

export function CountdownBadge({
	daysUntil,
	className = '',
}: CountdownBadgeProps) {
	const colorClass = getCountdownColor(daysUntil)
	const countdownText = formatCountdown(daysUntil)

	return (
		<div
			className={`badge badge-lg badge-${colorClass} font-bold ${className}`}
		>
			{countdownText}
		</div>
	)
}
