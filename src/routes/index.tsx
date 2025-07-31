import { createFileRoute, Link } from '@tanstack/react-router'
import { Layout } from '../components/Layout'
import { CalendarFilterTabs } from '../components/CalendarFilterTabs'
import { TimelineSectionComponent } from '../components/TimelineSection'
import { HijriDateDisplay } from '../components/HijriDateDisplay'
import { useTimelineEvents } from '../hooks/useTimelineEvents'

export const Route = createFileRoute('/')({
	component: BirthdayList,
})

function BirthdayList() {
	const {
		timelineSections,
		activeFilter,
		handleFilterChange,
		eventCounts,
		isEmpty,
	} = useTimelineEvents()

	return (
		<Layout title="Hijri Birthday">
			<div className="container p-4 mx-auto">
				{isEmpty ? (
					<div className="hero bg-base-200 min-h-[calc(100vh-4rem)]">
						<div className="hero-content text-center">
							<div className="max-w-md">
								<div className="text-6xl mb-4">🌙</div>
								<h1 className="text-4xl font-bold mb-4">
									Welcome to Hijri Birthday
								</h1>
								<p className="py-6 text-base-content/70">
									Never miss a Hijri birthday again! Add your friends and family
									to get started.
								</p>
								<Link to="/add" className="btn btn-primary btn-lg">
									Add Your First Birthday
								</Link>
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-base-content mb-2">
								🎂 Upcoming Birthdays
							</h1>
							<p className="text-base-content/70">
								Track birthdays in both Gregorian and Hijri calendars
							</p>
						</div>

						<HijriDateDisplay />

						<CalendarFilterTabs
							activeFilter={activeFilter}
							onFilterChange={handleFilterChange}
							gregorianCount={eventCounts.gregorian}
							hijriCount={eventCounts.hijri}
							bothCount={eventCounts.both}
						/>

						<div className="space-y-8 pb-20 transition-all duration-300 ease-in-out">
							{timelineSections.length === 0 ? (
								<div className="text-center py-12 animate-in fade-in duration-500">
									<div className="text-4xl mb-4">📅</div>
									<h3 className="text-xl font-semibold mb-2">
										No upcoming birthdays
									</h3>
									<p className="text-base-content/70">
										No birthdays found for the selected calendar filter.
									</p>
								</div>
							) : (
								timelineSections.map((section, index) => (
									<div
										key={`${section.timeRange}-${activeFilter}`}
										className="animate-in fade-in slide-in-from-bottom-4 duration-500"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<TimelineSectionComponent
											section={section}
											activeFilter={activeFilter}
										/>
									</div>
								))
							)}
						</div>
					</>
				)}

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
