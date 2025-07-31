import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '../components/Layout'

const hijriMonths = [
	{ number: 1, name: 'Muharram', nameArabic: 'مُحَرَّم' },
	{ number: 2, name: 'Safar', nameArabic: 'صَفَر' },
	{ number: 3, name: "Rabi' al-Awwal", nameArabic: 'رَبِيع الأَوَّل' },
	{ number: 4, name: "Rabi' al-Thani", nameArabic: 'رَبِيع الثَّانِي' },
	{ number: 5, name: 'Jumada al-Awwal', nameArabic: 'جُمَادَىٰ الأُولَىٰ' },
	{ number: 6, name: 'Jumada al-Thani', nameArabic: 'جُمَادَىٰ الثَّانِيَة' },
	{ number: 7, name: 'Rajab', nameArabic: 'رَجَب' },
	{ number: 8, name: "Sha'ban", nameArabic: 'شَعْبَان' },
	{ number: 9, name: 'Ramadan', nameArabic: 'رَمَضَان' },
	{ number: 10, name: 'Shawwal', nameArabic: 'شَوَّال' },
	{ number: 11, name: "Dhu al-Qi'dah", nameArabic: 'ذُو القِعْدَة' },
	{ number: 12, name: 'Dhu al-Hijjah', nameArabic: 'ذُو الحِجَّة' },
]

export const Route = createFileRoute('/months')({
	component: MonthsComponent,
})

function MonthsComponent() {
	return (
		<Layout title="Hijri Months Reference">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-base-content mb-2">
						Hijri Months Reference
					</h1>
					<p className="text-base-content/70 text-lg">
						Learn the names and order of the Islamic calendar months
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{hijriMonths.map((month) => (
						<div
							key={month.number}
							className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200"
						>
							<div className="card-body p-6">
								<div className="flex items-center justify-between mb-3">
									<div className="badge badge-primary badge-lg font-bold">
										{month.number}
									</div>
									<div className="text-right">
										<div className="text-2xl font-arabic text-primary">
											{month.nameArabic}
										</div>
									</div>
								</div>

								<h3 className="card-title text-xl mb-2 text-base-content">
									{month.name}
								</h3>

								{/* Special month indicators */}
								{month.number === 1 && (
									<div className="badge badge-info badge-sm">New Year</div>
								)}
								{month.number === 7 && (
									<div className="badge badge-warning badge-sm">
										Sacred Month
									</div>
								)}
								{month.number === 9 && (
									<div className="badge badge-success badge-sm">Ramadan</div>
								)}
								{month.number === 12 && (
									<div className="badge badge-secondary badge-sm">
										Hajj Month
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="mt-12 bg-base-200 rounded-lg p-6">
					<h2 className="text-2xl font-bold text-base-content mb-4">
						Did You Know?
					</h2>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="bg-base-100 rounded-lg p-4">
							<h3 className="font-semibold text-primary mb-2">Sacred Months</h3>
							<p className="text-base-content/80 text-sm">
								Four months are considered sacred: Muharram (1), Rajab (7), Dhu
								al-Qi'dah (11), and Dhu al-Hijjah (12).
							</p>
						</div>
						<div className="bg-base-100 rounded-lg p-4">
							<h3 className="font-semibold text-primary mb-2">
								Lunar Calendar
							</h3>
							<p className="text-base-content/80 text-sm">
								The Hijri calendar is based on lunar cycles, with each month
								lasting 29 or 30 days.
							</p>
						</div>
						<div className="bg-base-100 rounded-lg p-4">
							<h3 className="font-semibold text-primary mb-2">Ramadan</h3>
							<p className="text-base-content/80 text-sm">
								The 9th month is when Muslims observe fasting from dawn to
								sunset.
							</p>
						</div>
						<div className="bg-base-100 rounded-lg p-4">
							<h3 className="font-semibold text-primary mb-2">Hajj Season</h3>
							<p className="text-base-content/80 text-sm">
								The pilgrimage to Mecca takes place during Dhu al-Hijjah, the
								12th month.
							</p>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	)
}
