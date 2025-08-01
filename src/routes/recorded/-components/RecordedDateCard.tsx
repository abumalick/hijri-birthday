import { Link } from '@tanstack/react-router'
import { displayGregorianDate, displayHijriDate } from '../../../utils/dates'
import type { RecordedDateEntry } from '../-hooks/useRecordedDates'

interface RecordedDateCardProps {
	entry: RecordedDateEntry
}

export function RecordedDateCard({ entry }: RecordedDateCardProps) {
	return (
		<div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
			<div className="card-body p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="card-title text-lg mb-2">{entry.name}</h3>

						{/* Birth Dates */}
						<div className="space-y-2 mb-4">
							<div className="flex items-center gap-2 text-sm">
								<span className="badge badge-outline badge-sm">
									📅 Gregorian
								</span>
								<span className="text-base-content/70">
									{displayGregorianDate(entry.gregorianDate)}
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<span className="badge badge-outline badge-sm">🌙 Hijri</span>
								<span className="text-base-content/70">
									{displayHijriDate(entry.hijriDate)}
								</span>
							</div>
						</div>

						{/* Ages */}
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-primary">
									{entry.gregorianAge}
								</div>
								<div className="text-xs text-base-content/60">
									Gregorian Age
								</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-secondary">
									{entry.hijriAge}
								</div>
								<div className="text-xs text-base-content/60">Hijri Age</div>
							</div>
						</div>
					</div>

					{/* Top-right corner actions */}
					<div className="flex items-start">
						{/* Edit Button - Small icon in corner */}
						<Link
							to="/recorded/$id/edit"
							params={{ id: entry.id }}
							className="btn btn-ghost btn-xs size-8 p-0 hover:bg-base-200 opacity-60 hover:opacity-100 transition-opacity"
							data-testid={`edit-button-${entry.id}`}
							title="Edit entry"
						>
							✏️
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
