import { Temporal } from '@js-temporal/polyfill'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
		<div className="container p-4 mx-auto">
			<h1 className="mb-4 text-4xl font-bold">Add Birthday</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block font-bold">
						Name
					</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full input input-bordered"
						required
						data-testid="name-input"
					/>
				</div>
				<div>
					<label htmlFor="gregorianDate" className="block font-bold">
						Gregorian Date
					</label>
					<input
						type="date"
						id="gregorianDate"
						value={gregorianDate}
						onChange={handleDateChange}
						className="w-full input input-bordered"
						required
						data-testid="gregorian-date-input"
					/>
				</div>
				{hijriDate && (
					<div>
						<p className="font-bold">Hijri Date</p>
						<p data-testid="hijri-date-preview">{hijriDate}</p>
					</div>
				)}
				<button
					type="submit"
					className="btn btn-primary"
					data-testid="submit-button"
				>
					Add Birthday
				</button>
			</form>
		</div>
	)
}
