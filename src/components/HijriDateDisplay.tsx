import {
	formatCurrentHijriDateShort,
	getCurrentGregorianDate,
	getCurrentHijriDate,
} from '../utils/dates'

export function HijriDateDisplay() {
	const hijriDate = getCurrentHijriDate()
	const gregorianDate = getCurrentGregorianDate()
	const formattedHijriDate = formatCurrentHijriDateShort()
	const formattedGregorianDate = gregorianDate.toLocaleString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})

	return (
		<div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-6">
			<div className="card-body p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="avatar placeholder">
							<div className="bg-primary text-primary-content rounded-full w-12">
								<span className="text-xl">🌙</span>
							</div>
						</div>
						<div>
							<div className="text-sm text-base-content/70 font-medium mb-1">
								Today's Date
							</div>
							<div className="text-lg font-bold text-primary">
								{formattedHijriDate}
							</div>
							<div className="text-sm text-base-content/60">
								{formattedGregorianDate}
							</div>
						</div>
					</div>
					<div className="badge badge-primary badge-outline">
						{hijriDate.year} AH
					</div>
				</div>
			</div>
		</div>
	)
}
