interface IconProps {
	className?: string
	'aria-hidden'?: boolean
}

export function MenuIcon({
	className = 'w-5 h-5',
	'aria-hidden': ariaHidden = true,
}: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			className={`inline-block stroke-current ${className}`}
			aria-hidden={ariaHidden}
		>
			<title>Menu</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	)
}
