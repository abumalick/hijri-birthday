interface IconProps {
	className?: string
	'aria-hidden'?: boolean
}

export function AddIcon({
	className = 'h-5 w-5',
	'aria-hidden': ariaHidden = true,
}: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden={ariaHidden}
		>
			<title>Add</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 6v12m6-6H6"
			/>
		</svg>
	)
}
