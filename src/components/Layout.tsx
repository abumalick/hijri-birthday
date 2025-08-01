import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
	MenuIcon,
	HomeIcon,
	AddIcon,
	// SettingsIcon,
	// AboutIcon,
	CalendarIcon,
	GuidanceIcon,
	RecordedDatesIcon,
} from './icons'

interface LayoutProps {
	title: string
	children: ReactNode
}

export function Layout({ title, children }: LayoutProps) {
	return (
		<div className="drawer">
			<input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content flex flex-col">
				{/* Navbar */}
				<div className="navbar bg-primary text-primary-content sticky top-0 z-50">
					<div className="navbar-start">
						<label
							htmlFor="drawer-toggle"
							className="btn btn-square btn-ghost"
							aria-label="Open menu"
						>
							<MenuIcon />
						</label>
					</div>
					<div className="navbar-center">
						<h1 className="text-xl font-bold">{title}</h1>
					</div>
					<div className="navbar-end">
						{/* Optional: Add action buttons here */}
					</div>
				</div>

				{/* Page content */}
				<main className="flex-1 min-h-screen bg-base-100">{children}</main>
			</div>

			{/* Sidebar */}
			<div className="drawer-side">
				<label
					htmlFor="drawer-toggle"
					className="drawer-overlay"
					aria-label="Close menu"
				/>
				<aside className="min-h-full w-80 bg-base-200 text-base-content">
					<div className="p-4">
						<div className="flex items-center gap-2 mb-8">
							<div className="avatar placeholder">
								<div className="bg-primary text-primary-content rounded-full w-12">
									<span className="text-xl">🌙</span>
								</div>
							</div>
							<div>
								<h2 className="text-lg font-bold">Islamic Date Tracker</h2>
								<p className="text-sm opacity-70">Track important dates</p>
							</div>
						</div>
					</div>

					<ul className="menu p-4 w-full">
						<li>
							<Link
								to="/"
								className="flex items-center gap-3"
								activeProps={{ className: 'active' }}
							>
								<HomeIcon />
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/add"
								className="flex items-center gap-3"
								activeProps={{ className: 'active' }}
							>
								<AddIcon />
								Add Date
							</Link>
						</li>
						<li>
							<Link
								to="/recorded"
								className="flex items-center gap-3"
								activeProps={{ className: 'active' }}
							>
								<RecordedDatesIcon />
								Recorded Dates
							</Link>
						</li>
						<li>
							<Link
								to="/months"
								className="flex items-center gap-3"
								activeProps={{ className: 'active' }}
							>
								<CalendarIcon />
								Hijri Months
							</Link>
						</li>
						<li>
							<Link
								to="/guidance"
								className="flex items-center gap-3"
								activeProps={{ className: 'active' }}
							>
								<GuidanceIcon />
								Islamic Guidance
							</Link>
						</li>
						{/* <div className="divider" />
						<li>
							<button type="button" className="flex items-center gap-3">
								<SettingsIcon />
								Settings
							</button>
						</li>
						<li>
							<button type="button" className="flex items-center gap-3">
								<AboutIcon />
								About
							</button>
						</li> */}
					</ul>
				</aside>
			</div>
		</div>
	)
}
