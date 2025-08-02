import { createFileRoute, Link } from '@tanstack/react-router'
import { Layout } from '../../components/Layout'
import { RecordedDateCard } from './-components/RecordedDateCard'
import { RecordedDatesControls } from './-components/RecordedDatesControls'
import { useRecordedDates } from './-hooks/useRecordedDates'

export const Route = createFileRoute('/recorded/')({
	component: RecordedDatesScreen,
})

function RecordedDatesScreen() {
	const {
		recordedDates,
		stats,
		sortBy,
		setSortBy,
		searchQuery,
		setSearchQuery,
		isEmpty,
	} = useRecordedDates()

	return (
		<Layout title="Recorded Dates">
			<div className="container p-4 mx-auto">
				{isEmpty ? (
					<div className="hero bg-base-200 min-h-[calc(100vh-4rem)]">
						<div className="hero-content text-center">
							<div className="max-w-md">
								<div className="text-6xl mb-4">📋</div>
								<h1 className="text-4xl font-bold mb-4">No Recorded Dates</h1>
								<p className="py-6 text-base-content/70">
									You haven't added any dates yet. Start by adding your first
									important date to track birthdays and anniversaries.
								</p>
								<Link to="/add" className="btn btn-primary btn-lg">
									Add Your First Date
								</Link>
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="mb-6">
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-3xl font-bold text-base-content">
									📋 Recorded Dates
								</h1>
								<div className="badge badge-neutral">{stats.total}</div>
							</div>
							<p className="text-base-content/70">
								View and manage all your recorded dates with both Gregorian and
								Hijri ages
							</p>
						</div>

						{/* Controls */}
						<RecordedDatesControls
							sortBy={sortBy}
							onSortChange={setSortBy}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							totalCount={stats.total}
							filteredCount={recordedDates.length}
						/>

						{/* Results */}
						{recordedDates.length === 0 ? (
							<div className="text-center py-12 animate-in fade-in duration-500">
								<div className="text-4xl mb-4">🔍</div>
								<h3 className="text-xl font-semibold mb-2">No matches found</h3>
								<p className="text-base-content/70">
									Try adjusting your search or filter criteria.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
								{recordedDates.map((entry, index) => (
									<div
										key={entry.id}
										className="animate-in fade-in slide-in-from-bottom-4 duration-500"
										style={{ animationDelay: `${index * 50}ms` }}
									>
										<RecordedDateCard entry={entry} />
									</div>
								))}
							</div>
						)}
					</>
				)}

				{/* Floating Action Button */}
				<Link
					to="/add"
					className="btn btn-primary btn-circle fixed bottom-6 right-6 shadow-lg z-40"
					data-testid="add-event-button"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-6 h-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<title>Add Event</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 6v12m6-6H6"
						/>
					</svg>
				</Link>
			</div>
		</Layout>
	)
}
