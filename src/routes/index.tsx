import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { LocalStorageService } from '../services/LocalStorageService'
import type { BirthdayEvent } from '../services/types'
import {
	displayGregorianDate,
	displayHijriDate,
	getAge,
	getHijriDate,
	getNextBirthday,
} from '../utils/dates'

export const Route = createFileRoute('/')({
	component: BirthdayList,
})

function BirthdayList() {
	const [events, setEvents] = useState<BirthdayEvent[]>([])
	const storageService = useMemo(() => new LocalStorageService(), [])

	useEffect(() => {
		const storedEvents = storageService.getEvents()
		const sortedEvents = storedEvents.sort((a, b) => {
			const nextBirthdayA = getNextBirthday(a.gregorianDate)
			const nextBirthdayB = getNextBirthday(b.gregorianDate)
			return nextBirthdayA.since(nextBirthdayB).total({ unit: 'day' })
		})
		setEvents(sortedEvents)
	}, [storageService])

	return (
		<Layout title="Hijri Birthday">
			<div className="container p-4 mx-auto">
				{events.length === 0 ? (
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
							<h2 className="text-2xl font-bold text-base-content">
								Upcoming Birthdays
							</h2>
							<p className="text-base-content/70 mt-1">
								{events.length} birthday{events.length !== 1 ? 's' : ''} tracked
							</p>
						</div>
						<div className="grid gap-4 pb-20">
							{events.map((event) => (
								<div
									key={event.id}
									className="card bg-base-100 shadow-lg border border-base-300"
									data-testid="event-card"
								>
									<div className="card-body p-4">
										<h3 className="card-title text-xl" data-testid="event-name">
											{event.name}
										</h3>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
											<div className="bg-base-200 p-3 rounded-lg">
												<p className="font-semibold text-sm text-base-content/70 uppercase tracking-wide">
													Gregorian
												</p>
												<p className="text-lg font-medium">
													{displayGregorianDate(event.gregorianDate)}
												</p>
												<p className="text-sm text-base-content/70">
													Age: {getAge(event.gregorianDate)}
												</p>
											</div>
											<div className="bg-base-200 p-3 rounded-lg">
												<p className="font-semibold text-sm text-base-content/70 uppercase tracking-wide">
													Hijri
												</p>
												<p className="text-lg font-medium">
													{displayHijriDate(getHijriDate(event.gregorianDate))}
												</p>
												<p className="text-sm text-base-content/70">
													Age: {getAge(getHijriDate(event.gregorianDate))}
												</p>
											</div>
										</div>
									</div>
								</div>
							))}
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
