import { Temporal } from '@js-temporal/polyfill'
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { DateEntryForm } from '../../components/DateEntryForm'
import { Layout } from '../../components/Layout'
import { LocalStorageService } from '../../services/LocalStorageService'

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

	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	function onSubmit(values: {
		name: string
		gregorianDate: string
		relationship: string
	}) {
		storageService.updateEvent(event.id, {
			name: values.name,
			gregorianDate: Temporal.PlainDate.from(values.gregorianDate),
			relationship: values.relationship.trim() || undefined,
		})
		navigate({ to: '/recorded' })
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

				<DateEntryForm
					initialValues={{
						name: event.name,
						gregorianDate: event.gregorianDate.toString(),
						relationship: event.relationship || '',
					}}
					onSubmit={onSubmit}
					onCancel={() => navigate({ to: '/recorded' })}
					submitLabel="Save Changes"
					submitTestId="save-button"
					cancelTestId="cancel-button"
					extraActionsRight={
						<button
							type="button"
							onClick={() => setShowDeleteConfirm(true)}
							className="btn btn-error btn-outline"
							data-testid="delete-button"
						>
							Delete
						</button>
					}
				/>

				{/* Delete Confirmation Modal */}
				{showDeleteConfirm && (
					<div className="modal modal-open">
						<div className="modal-box">
							<h3 className="font-bold text-lg">Delete {event.name}?</h3>
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
