import { Temporal } from '@js-temporal/polyfill'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { LocalStorageService } from '../services/LocalStorageService'
import { displayHijriDate, getHijriDate } from '../utils/dates'

export const Route = createFileRoute('/add')({
	component: AddDate,
})

function AddDate() {
	const navigate = useNavigate()
	const storageService = new LocalStorageService()
	const [name, setName] = useState('')
	const [gregorianDate, setGregorianDate] = useState('')
	const [relationship, setRelationship] = useState('')
	const [errors, setErrors] = useState<{
		name?: string
		gregorianDate?: string
		form?: string
	}>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newGregorianDate = e.target.value
		setGregorianDate(newGregorianDate)
		// Clear date error when user starts typing
		if (errors.gregorianDate) {
			setErrors((prev) => ({ ...prev, gregorianDate: undefined }))
		}
	}

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value)
		// Clear name error when user starts typing
		if (errors.name) {
			setErrors((prev) => ({ ...prev, name: undefined }))
		}
	}

	const hijriDate = useMemo(() => {
		if (gregorianDate) {
			try {
				const temporalDate = Temporal.PlainDate.from(gregorianDate)
				return displayHijriDate(getHijriDate(temporalDate))
			} catch {
				return ''
			}
		}
		return ''
	}, [gregorianDate])

	const validateForm = () => {
		const newErrors: typeof errors = {}

		if (!name.trim()) {
			newErrors.name = 'Name is required'
		}

		if (!gregorianDate) {
			newErrors.gregorianDate = 'Date is required'
		} else {
			// Validate date format and value
			try {
				const dateValue = Temporal.PlainDate.from(gregorianDate)
				const today = Temporal.Now.plainDateISO()

				if (Temporal.PlainDate.compare(dateValue, today) > 0) {
					newErrors.gregorianDate = 'Birth date cannot be in the future'
				}
			} catch {
				newErrors.gregorianDate = 'Please enter a valid date'
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Prevent multiple submissions
		if (isSubmitting) {
			return
		}

		if (!validateForm()) {
			return
		}

		setIsSubmitting(true)
		setErrors({})

		try {
			storageService.addEvent({
				name: name.trim(),
				gregorianDate: Temporal.PlainDate.from(gregorianDate),
				relationship: relationship.trim() || undefined,
			})

			// Clear form state before navigation
			setName('')
			setGregorianDate('')
			setRelationship('')

			// Use replace to ensure proper navigation
			navigate({ to: '/', replace: true })
		} catch (error) {
			let errorMsg =
				error instanceof Error
					? error.message
					: 'Failed to add event. Please try again.'

			// Map quota exceeded error to user-friendly message
			if (
				typeof errorMsg === 'string' &&
				(errorMsg.includes('QuotaExceededError') ||
					errorMsg.includes('ErrorQuotaExceededError'))
			) {
				errorMsg = 'Storage quota exceeded. Please clear some data.'
			}

			setErrors({
				form: errorMsg,
			})
		} finally {
			setIsSubmitting(false)
		}
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
				<form onSubmit={handleSubmit} className="space-y-6">
					{errors.form && (
						<div className="alert alert-error" data-testid="form-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
							>
								<title>Error</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{errors.form}</span>
						</div>
					)}

					<div className="form-control">
						<label htmlFor="name" className="label">
							<span className="label-text font-medium">Name</span>
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={handleNameChange}
							className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
							placeholder="Enter full name"
							data-testid="name-input"
							aria-label="Enter full name"
							aria-invalid={!!errors.name}
							aria-describedby={errors.name ? 'name-error' : undefined}
						/>
						{errors.name && (
							<div className="label">
								<span
									className="label-text-alt text-error"
									data-testid="name-error"
									id="name-error"
									role="alert"
								>
									{errors.name}
								</span>
							</div>
						)}
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
							className={`input input-bordered w-full ${errors.gregorianDate ? 'input-error' : ''}`}
							data-testid="gregorian-date-input"
							aria-label="Select date"
							aria-invalid={!!errors.gregorianDate}
							aria-describedby={
								errors.gregorianDate ? 'date-error' : 'date-help'
							}
						/>
						<div className="label">
							{errors.gregorianDate ? (
								<span
									className="label-text-alt text-error"
									data-testid="date-error"
									id="date-error"
									role="alert"
								>
									{errors.gregorianDate}
								</span>
							) : (
								<span
									className="label-text-alt text-base-content/60"
									id="date-help"
								>
									We'll automatically calculate the Hijri date
								</span>
							)}
						</div>
					</div>
					<div className="form-control">
						<label htmlFor="relationship" className="label">
							<span className="label-text font-medium">
								Relationship (Optional)
							</span>
						</label>
						<input
							type="text"
							id="relationship"
							value={relationship}
							onChange={(e) => setRelationship(e.target.value)}
							className="input input-bordered w-full"
							placeholder="e.g., Friend, Family, Colleague"
							data-testid="relationship-input"
							aria-label="Enter relationship"
							tabIndex={0}
						/>
					</div>
					{hijriDate && (
						<div className="alert alert-info" tabIndex={-1}>
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
							type="button"
							onClick={() => navigate({ to: '/' })}
							className="btn btn-outline flex-1"
							data-testid="cancel-button"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary flex-1 btn-lg"
							data-testid="submit-button"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Adding...
								</>
							) : (
								'Add Date'
							)}
						</button>
					</div>
				</form>
			</div>
		</Layout>
	)
}
