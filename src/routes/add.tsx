import { Temporal } from '@js-temporal/polyfill'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DateEntryForm } from '../components/DateEntryForm'
import { Layout } from '../components/Layout'
import { LocalStorageService } from '../services/LocalStorageService'

export const Route = createFileRoute('/add')({
	component: AddDate,
})

function AddDate() {
	const navigate = useNavigate()
	const storageService = new LocalStorageService()

	async function onSubmit(values: {
		name: string
		gregorianDate: string
		relationship: string
	}) {
		// throws on error so the form can display it
		storageService.addEvent({
			name: values.name.trim(),
			gregorianDate: Temporal.PlainDate.from(values.gregorianDate),
			relationship: values.relationship.trim() || undefined,
		})
		// Navigate after success
		navigate({ to: '/', replace: true })
	}

	return (
		<Layout title="Add Date">
			<div className="container p-4 mx-auto max-w-md">
				<div className="mb-6">
					<h2
						className="text-2xl font-bold text-base-content"
						data-testid="page-title"
					>
						New Date Entry
					</h2>
					<p className="text-base-content/70 mt-1">
						Add a new date to track for practical purposes
					</p>
				</div>
				<DateEntryForm
					initialValues={{ name: '', gregorianDate: '', relationship: '' }}
					onSubmit={onSubmit}
					onCancel={() => navigate({ to: '/' })}
					submitLabel="Add Date"
					submitTestId="submit-button"
					cancelTestId="cancel-button"
				/>
			</div>
		</Layout>
	)
}
