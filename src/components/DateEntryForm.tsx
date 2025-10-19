import { Temporal } from '@js-temporal/polyfill'
import type React from 'react'
import { useMemo, useState } from 'react'
import { displayHijriDate, getHijriDate } from '../utils/dates'

type DateEntryValues = {
	name: string
	gregorianDate: string
	relationship: string
}

type DateEntryErrors = {
	name?: string
	gregorianDate?: string
	form?: string
}

type Props = {
	initialValues: DateEntryValues
	onSubmit: (values: DateEntryValues) => Promise<void> | void
	onCancel: () => void
	submitLabel: string
	submitTestId?: string
	cancelTestId?: string
	extraActionsRight?: React.ReactNode
	// Optional external submit control; if not provided, internal state is used
	isSubmittingExternal?: boolean
	setIsSubmittingExternal?: (v: boolean) => void
	// Optional custom validation (return errors object). If not provided, default is used.
	validate?: (values: DateEntryValues) => DateEntryErrors
	// Whether to show Hijri preview
	showHijriPreview?: boolean
}

function defaultValidate(values: DateEntryValues): DateEntryErrors {
	const errors: DateEntryErrors = {}
	const name = values.name?.trim()
	const dateStr = values.gregorianDate

	if (!name) {
		errors.name = 'Name is required'
	}

	if (!dateStr) {
		errors.gregorianDate = 'Date is required'
	} else {
		try {
			const dateValue = Temporal.PlainDate.from(dateStr)
			const today = Temporal.Now.plainDateISO()
			if (Temporal.PlainDate.compare(dateValue, today) > 0) {
				errors.gregorianDate = 'Birth date cannot be in the future'
			}
		} catch {
			errors.gregorianDate = 'Please enter a valid date'
		}
	}
	return errors
}

export function DateEntryForm({
	initialValues,
	onSubmit,
	onCancel,
	submitLabel,
	submitTestId,
	cancelTestId,
	extraActionsRight,
	isSubmittingExternal,
	setIsSubmittingExternal,
	validate,
	showHijriPreview = true,
}: Props) {
	const [values, setValues] = useState<DateEntryValues>(initialValues)
	const [errors, setErrors] = useState<DateEntryErrors>({})
	const [isSubmittingInternal, setIsSubmittingInternal] = useState(false)

	const isSubmitting = isSubmittingExternal ?? isSubmittingInternal
	const setIsSubmitting = setIsSubmittingExternal ?? setIsSubmittingInternal

	const hijriDate = useMemo(() => {
		if (values.gregorianDate) {
			try {
				const temporalDate = Temporal.PlainDate.from(values.gregorianDate)
				return displayHijriDate(getHijriDate(temporalDate))
			} catch {
				return ''
			}
		}
		return ''
	}, [values.gregorianDate])

	const currentValidate = validate ?? defaultValidate

	function updateField<K extends keyof DateEntryValues>(
		key: K,
		val: DateEntryValues[K],
	) {
		setValues((prev) => ({ ...prev, [key]: val }))
	}

	function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = e.target.value
		updateField('name', v)
		if (errors.name) {
			setErrors((prev) => ({ ...prev, name: undefined }))
		}
	}

	function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = e.target.value
		updateField('gregorianDate', v)
		if (errors.gregorianDate) {
			setErrors((prev) => ({ ...prev, gregorianDate: undefined }))
		}
	}

	function handleRelationshipChange(e: React.ChangeEvent<HTMLInputElement>) {
		updateField('relationship', e.target.value)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (isSubmitting) return
		const newErrors = currentValidate(values)
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setIsSubmitting(true)
		setErrors((_) => ({}))
		try {
			await onSubmit({
				name: values.name.trim(),
				gregorianDate: values.gregorianDate,
				relationship: values.relationship,
			})
		} catch (err) {
			const errorMsg =
				err instanceof Error
					? err.message
					: 'Operation failed. Please try again.'
			setErrors({ form: errorMsg })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
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
					value={values.name}
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
					value={values.gregorianDate}
					onChange={handleDateChange}
					className={`input input-bordered w-full ${errors.gregorianDate ? 'input-error' : ''}`}
					data-testid="gregorian-date-input"
					aria-label="Select date"
					aria-invalid={!!errors.gregorianDate}
					aria-describedby={errors.gregorianDate ? 'date-error' : 'date-help'}
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
					value={values.relationship}
					onChange={handleRelationshipChange}
					className="input input-bordered w-full"
					placeholder="e.g., Friend, Family, Colleague"
					data-testid="relationship-input"
					aria-label="Enter relationship"
					tabIndex={0}
				/>
			</div>

			{showHijriPreview && hijriDate && (
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
					onClick={onCancel}
					className="btn btn-outline flex-1"
					data-testid={cancelTestId ?? 'cancel-button'}
				>
					Cancel
				</button>

				{extraActionsRight}

				<button
					type="submit"
					className="btn btn-primary flex-1 btn-lg"
					data-testid={submitTestId ?? 'submit-button'}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<span className="loading loading-spinner loading-sm"></span>
							Processing...
						</>
					) : (
						submitLabel
					)}
				</button>
			</div>
		</form>
	)
}
