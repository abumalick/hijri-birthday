import { Temporal } from '@js-temporal/polyfill'
import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Layout } from '../../components/Layout'
import { LocalStorageService } from '../../services/LocalStorageService'
import { displayHijriDate, getHijriDate } from '../../utils/dates'

export const Route = createFileRoute('/recorded/$id/edit')({
	loader: ({ params }) => {
		const storageService = new LocalStorageService()
		const event = storageService.getEventById(params.id)

		if (!event) {
			throw notFound()
		}

		return { event }
	},
	component: EditDate,
})

function EditDate() {
	const navigate = useNavigate()
	const { event } = Route.useLoaderData()
	const storageService = new LocalStorageService()

	const [name, setName] = useState(event.name)
	const [gregorianDate, setGregorianDate] = useState(
		event.gregorianDate.toString(),
	)
	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
			storageService.updateEvent(event.id, {
				name,
				gregorianDate: Temporal.PlainDate.from(gregorianDate),
			})
			navigate({ to: '/recorded' })
		}
	}

	const handleDelete = () => {
		setIsDeleting(true)
		try {
			storageService.deleteEvent(event.id)
			navigate({ to: '/recorded' })
		} catch (error) {
			console.error('Failed to delete event:', error)
			setIsDeleting(false)
		}
	}

	return (
		<Layout title="Edit Date">
			<div className="container p-4 mx-auto max-w-md">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-base-content">
						Edit Date Entry
					</h2>
					<p className="text-base-content/70 mt-1">
						Update the information for {event.name}
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
							<span className="label-text font-medium">Date (Gregorian)</span>
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

					<div className="flex gap-3">
						<button
							type="submit"
							className="btn btn-primary flex-1"
							data-testid="save-button"
						>
							Save Changes
						</button>

						<button
							type="button"
							onClick={() => setShowDeleteConfirm(true)}
							className="btn btn-error btn-outline"
							data-testid="delete-button"
						>
							Delete
						</button>
					</div>

					<button
						type="button"
						onClick={() => navigate({ to: '/recorded' })}
						className="btn btn-ghost w-full"
					>
						Cancel
					</button>
				</form>

				{/* Delete Confirmation Modal */}
				{showDeleteConfirm && (
					<div className="modal modal-open">
						<div className="modal-box">
							<h3 className="font-bold text-lg">Delete {name}?</h3>
							<p className="py-4">
								Are you sure you want to delete this date entry? This action
								cannot be undone.
							</p>
							<div className="modal-action">
								<button
									type="button"
									onClick={handleDelete}
									disabled={isDeleting}
									className="btn btn-error"
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</button>
								<button
									type="button"
									onClick={() => setShowDeleteConfirm(false)}
									className="btn"
									disabled={isDeleting}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</Layout>
	)
}
