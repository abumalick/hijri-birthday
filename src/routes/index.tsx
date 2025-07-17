import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
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
		<div className="container p-4 mx-auto">
			{events.length === 0 ? (
				<div className="hero bg-base-200">
					<div className="hero-content text-center">
						<div className="max-w-md">
							<h1 className="text-5xl font-bold">Hijri Birthday</h1>
							<p className="py-6">
								Never miss a Hijri birthday again! Add your friends and family
								to get started.
							</p>
							<Link to="/add" className="btn btn-primary">
								Get Started
							</Link>
						</div>
					</div>
				</div>
			) : (
				<>
					<h1 className="mb-4 text-4xl font-bold mt-10">Upcoming Birthdays</h1>
					<div className="grid gap-4">
						{events.map((event) => (
							<div
								key={event.id}
								className="p-4 shadow-lg card bg-base-100"
								data-testid="event-card"
							>
								<h2 className="text-2xl font-bold" data-testid="event-name">
									{event.name}
								</h2>
								<div className="grid grid-cols-2 gap-4 mt-4">
									<div>
										<p className="font-bold">Gregorian</p>
										<p>{displayGregorianDate(event.gregorianDate)}</p>
										<p>Age: {getAge(event.gregorianDate)}</p>
									</div>
									<div>
										<p className="font-bold">Hijri</p>
										<p>{displayHijriDate(getHijriDate(event.gregorianDate))}</p>
										<p>Age: {getAge(getHijriDate(event.gregorianDate))}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</>
			)}
			<Link
				to="/add"
				className="btn btn-primary btn-circle fixed bottom-4 right-4"
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
	)
}
