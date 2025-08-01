import type { SortOption } from '../hooks/useRecordedDates'

interface RecordedDatesControlsProps {
	sortBy: SortOption
	onSortChange: (sort: SortOption) => void
	searchQuery: string
	onSearchChange: (query: string) => void
	totalCount: number
	filteredCount: number
}

export function RecordedDatesControls({
	sortBy,
	onSortChange,
	searchQuery,
	onSearchChange,
	totalCount,
	filteredCount,
}: RecordedDatesControlsProps) {
	return (
		<div className="space-y-4 mb-6">
			{/* Search Bar */}
			<div className="form-control">
				<div className="input-group">
					<input
						type="text"
						placeholder="Search by name..."
						className="input input-bordered flex-1"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
					<button type="button" className="btn btn-square btn-ghost">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Search</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Controls Row */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				{/* Sort Dropdown */}
				<div className="form-control">
					<select
						className="select select-bordered select-sm"
						value={sortBy}
						onChange={(e) => onSortChange(e.target.value as SortOption)}
					>
						<option value="name">Sort by Name (A-Z)</option>
						<option value="name-desc">Sort by Name (Z-A)</option>
						<option value="date-asc">Date (Newest First)</option>
						<option value="date-desc">Date (Oldest First)</option>
					</select>
				</div>
			</div>

			{/* Results Count */}
			{searchQuery && (
				<div className="text-sm text-base-content/70">
					Showing {filteredCount} of {totalCount} records
				</div>
			)}
		</div>
	)
}
