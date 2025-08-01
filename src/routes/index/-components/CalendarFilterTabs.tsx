import type { CalendarType } from '../../../services/types'

interface CalendarFilterTabsProps {
	activeFilter: CalendarType | 'both'
	onFilterChange: (filter: CalendarType | 'both') => void
	gregorianCount: number
	hijriCount: number
	bothCount: number
}

export function CalendarFilterTabs({
	activeFilter,
	onFilterChange,
	gregorianCount,
	hijriCount,
	bothCount,
}: CalendarFilterTabsProps) {
	const tabs = [
		{
			key: 'gregorian' as const,
			label: '📅 Gregorian',
			count: gregorianCount,
			colorClass: 'text-info',
		},
		{
			key: 'hijri' as const,
			label: '🌙 Hijri',
			count: hijriCount,
			colorClass: 'text-success',
		},
		{
			key: 'both' as const,
			label: '🔄 Both',
			count: bothCount,
			colorClass: 'text-primary',
		},
	]

	return (
		<div
			className="tabs tabs-boxed bg-base-200 mb-6"
			data-testid="calendar-filter-tabs"
		>
			{tabs.map((tab) => (
				<button
					key={tab.key}
					type="button"
					className={`tab gap-2 transition-all duration-200 ease-in-out ${
						activeFilter === tab.key ? 'tab-active' : ''
					} ${tab.colorClass} hover:scale-105`}
					onClick={() => onFilterChange(tab.key)}
					data-testid={`calendar-filter-${tab.key}`}
				>
					<span>{tab.label}</span>
					<span className="badge badge-sm badge-neutral transition-all duration-200">
						{tab.count}
					</span>
				</button>
			))}
		</div>
	)
}
