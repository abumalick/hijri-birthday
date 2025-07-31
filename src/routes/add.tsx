import { Temporal } from '@js-temporal/polyfill'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { LocalStorageService } from '../services/LocalStorageService'
import { displayHijriDate, getHijriDate } from '../utils/dates'

export const Route = createFileRoute('/add')({
	component: AddBirthday,
})

function AddBirthday() {
	const navigate = useNavigate()
	const storageService = new LocalStorageService()
	const [name, setName] = useState('')
	const [gregorianDate, setGregorianDate] = useState('')

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newGregorianDate = e.target.value
		setGregorianDate(newGregorianDate)
	}

	const hijriDate = useMemo(() => {
		if (gregorianDate) {
			const temporalDate = Temporal.PlainDate.from(gregorianDate)
			return displayHijriDate(getHijriDate(temporalDate))
		}
		return ''
	}, [gregorianDate])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (name && gregorianDate) {
			storageService.addEvent({
				name,
				gregorianDate: Temporal.PlainDate.from(gregorianDate),
			})
			navigate({ to: '/' })
		}
	}

	return (
		<Layout title="Add Birthday">
			<div className="container p-4 mx-auto max-w-md">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-base-content">New Birthday</h2>
					<p className="text-base-content/70 mt-1">
						Add a new birthday to track
					</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="form-control">
						<label htmlFor="name" className="label">
							<span className="label-text font-medium">Name</span>
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="input input-bordered w-full"
							placeholder="Enter full name"
							required
							data-testid="name-input"
						/>
					</div>
					<div className="form-control">
						<label htmlFor="gregorianDate" className="label">
							<span className="label-text font-medium">
								Birthday (Gregorian)
							</span>
						</label>
						<input
							type="date"
							id="gregorianDate"
							value={gregorianDate}
							onChange={handleDateChange}
							className="input input-bordered w-full"
							required
							data-testid="gregorian-date-input"
						/>
						<div className="label">
							<span className="label-text-alt text-base-content/60">
								We'll automatically calculate the Hijri date
							</span>
						</div>
					</div>
					{hijriDate && (
						<div className="alert alert-info">
							<div>
								<h3 className="font-bold">Hijri Date Preview</h3>
								<div className="text-xs" data-testid="hijri-date-preview">
									{hijriDate}
								</div>
							</div>
						</div>
					)}
					<button
						type="submit"
						className="btn btn-primary w-full btn-lg"
						data-testid="submit-button"
					>
						Add Birthday
					</button>
				</form>
			</div>
		</Layout>
	)
}
