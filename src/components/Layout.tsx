import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

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
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="inline-block w-5 h-5 stroke-current"
								aria-hidden="true"
							>
								<title>Menu</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
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
								<h2 className="text-lg font-bold">Hijri Birthday</h2>
								<p className="text-sm opacity-70">Never miss a birthday</p>
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
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<title>Home</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/add"
								className="flex items-center gap-3"
								activeProps={{ className: 'active' }}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<title>Add</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6v12m6-6H6"
									/>
								</svg>
								Add Birthday
							</Link>
						</li>
						<div className="divider" />
						<li>
							<button type="button" className="flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<title>Settings</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								Settings
							</button>
						</li>
						<li>
							<button type="button" className="flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<title>About</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								About
							</button>
						</li>
					</ul>
				</aside>
			</div>
		</div>
	)
}
