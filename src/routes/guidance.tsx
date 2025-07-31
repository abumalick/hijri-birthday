import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '../components/Layout'

export const Route = createFileRoute('/guidance')({
	component: IslamicGuidancePage,
})

function IslamicGuidancePage() {
	return (
		<Layout title="Islamic Guidance">
			<div className="container mx-auto p-6 max-w-4xl">
				<div className="prose prose-lg max-w-none">
					{/* Header Section */}
					<div className="text-center mb-8">
						<div className="text-6xl mb-4">📖</div>
						<h1 className="text-4xl font-bold text-primary mb-4">
							Islamic Guidance on Birthday Celebrations
						</h1>
						<p className="text-xl text-base-content/70 leading-relaxed">
							Understanding the Salafi perspective on commemorating birthdays
						</p>
					</div>

					{/* Important Notice */}
					<div className="alert alert-info mb-8">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							className="stroke-current shrink-0 w-6 h-6"
						>
							<title>Information</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<div>
							<h3 className="font-bold">Important Notice</h3>
							<div className="text-sm">
								This application is designed to help you track dates for
								practical purposes only, not to encourage celebration of
								birthdays.
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="space-y-8">
						{/* The Salafi Position */}
						<section className="card bg-base-200 p-6">
							<h2 className="text-2xl font-bold text-primary mb-4">
								The Salafi Position on Birthday Celebrations
							</h2>
							<div className="space-y-4 text-base-content">
								<p>
									According to the Salafi understanding of Islam, celebrating
									birthdays is considered a form of innovation (bid'ah) in
									religion that was not practiced by the Prophet Muhammad (peace
									be upon him) or his companions.
								</p>
								<p>
									The scholars following the Salafi methodology hold that
									birthday celebrations fall under the category of religious
									innovations because they involve:
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>Ritualistic commemoration of a specific date</li>
									<li>Gathering for celebration purposes</li>
									<li>Treating the day as special or blessed</li>
									<li>
										Following practices that originated from non-Islamic
										cultures
									</li>
								</ul>
							</div>
						</section>

						{/* Evidence from Islamic Sources */}
						<section className="card bg-base-200 p-6">
							<h2 className="text-2xl font-bold text-primary mb-4">
								Evidence from Islamic Sources
							</h2>
							<div className="space-y-4 text-base-content">
								<div className="bg-base-100 p-4 rounded-lg border-l-4 border-primary">
									<p className="font-semibold mb-2">
										Hadith of the Prophet (ﷺ):
									</p>
									<p className="italic">
										"Whoever introduces something into this matter of ours that
										is not part of it, it will be rejected."
									</p>
									<p className="text-sm text-base-content/70 mt-2">
										- Sahih al-Bukhari and Sahih Muslim
									</p>
								</div>
								<p>
									This hadith establishes the principle that any religious
									practice not found in the Quran or authentic Sunnah is to be
									rejected.
								</p>
								<div className="bg-base-100 p-4 rounded-lg border-l-4 border-primary">
									<p className="font-semibold mb-2">
										Another narration states:
									</p>
									<p className="italic">
										"Every innovation is misguidance, and every misguidance is
										in the Fire."
									</p>
									<p className="text-sm text-base-content/70 mt-2">
										- Sahih Muslim
									</p>
								</div>
							</div>
						</section>

						{/* Scholarly Opinions */}
						<section className="card bg-base-200 p-6">
							<h2 className="text-2xl font-bold text-primary mb-4">
								Scholarly Opinions
							</h2>
							<div className="space-y-4 text-base-content">
								<p>
									Prominent Salafi scholars have consistently ruled against
									birthday celebrations:
								</p>
								<div className="grid md:grid-cols-2 gap-4">
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">Sheikh Ibn Baz</h4>
										<p className="text-sm">
											Ruled that birthday celebrations are forbidden innovations
											that have no basis in Islamic law.
										</p>
									</div>
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">Sheikh Al-Albani</h4>
										<p className="text-sm">
											Classified birthday celebrations as religious innovations
											that Muslims should avoid.
										</p>
									</div>
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">
											Sheikh Ibn Uthaymeen
										</h4>
										<p className="text-sm">
											Explained that celebrating birthdays imitates non-Muslim
											practices and constitutes bid'ah.
										</p>
									</div>
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">
											Permanent Committee
										</h4>
										<p className="text-sm">
											The Saudi Permanent Committee for Islamic Research has
											issued fatwas prohibiting birthday celebrations.
										</p>
									</div>
								</div>
							</div>
						</section>

						{/* Proper Use of This Application */}
						<section className="card bg-success/10 border border-success p-6">
							<h2 className="text-2xl font-bold text-success mb-4">
								Proper Use of This Application
							</h2>
							<div className="space-y-4 text-base-content">
								<p className="font-semibold">
									This application should be used for practical purposes only:
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4">
									<li>
										Tracking family members' ages for legal or administrative
										purposes
									</li>
									<li>Remembering important dates for documentation</li>
									<li>Calculating ages according to the Islamic calendar</li>
									<li>Maintaining family records and genealogy</li>
								</ul>
								<div className="alert alert-warning">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="stroke-current shrink-0 h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
									>
										<title>Warning</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
										/>
									</svg>
									<span>
										<strong>Please avoid using this app to:</strong> Plan
										birthday parties, buy celebration gifts, or organize any
										form of birthday commemoration.
									</span>
								</div>
							</div>
						</section>

						{/* Alternative Islamic Celebrations */}
						<section className="card bg-base-200 p-6">
							<h2 className="text-2xl font-bold text-primary mb-4">
								Islamic Alternatives
							</h2>
							<div className="space-y-4 text-base-content">
								<p>Instead of birthday celebrations, Islam encourages:</p>
								<div className="grid md:grid-cols-2 gap-4">
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">Eid Celebrations</h4>
										<p className="text-sm">
											Eid al-Fitr and Eid al-Adha are the only celebrations
											prescribed in Islam.
										</p>
									</div>
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">Weekly Friday</h4>
										<p className="text-sm">
											Friday is described as a weekly celebration for Muslims.
										</p>
									</div>
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">Good Deeds</h4>
										<p className="text-sm">
											Express love through charity, du'a, and righteous actions.
										</p>
									</div>
									<div className="bg-base-100 p-4 rounded-lg">
										<h4 className="font-bold text-primary">
											Islamic Occasions
										</h4>
										<p className="text-sm">
											Commemorate Islamic events like the Night of Power (Laylat
											al-Qadr).
										</p>
									</div>
								</div>
							</div>
						</section>

						{/* Conclusion */}
						<section className="card bg-primary/10 border border-primary p-6">
							<h2 className="text-2xl font-bold text-primary mb-4">
								Conclusion
							</h2>
							<div className="space-y-4 text-base-content">
								<p>
									The Salafi understanding emphasizes following the Quran and
									authentic Sunnah while avoiding innovations in religious
									matters. Birthday celebrations, being absent from early
									Islamic practice, are considered innovations to be avoided.
								</p>
								<p>
									We encourage users to seek knowledge from qualified Islamic
									scholars and to use this application responsibly, in
									accordance with their understanding of Islamic teachings.
								</p>
								<div className="text-center mt-6">
									<p className="text-sm text-base-content/70">
										May Allah guide us all to what is correct and beneficial.
									</p>
									<p className="text-sm text-base-content/70 mt-2">
										وَاللَّهُ أَعْلَمُ (And Allah knows best)
									</p>
								</div>
							</div>
						</section>

						{/* Disclaimer */}
						<section className="card bg-base-300 p-6">
							<h2 className="text-xl font-bold text-base-content mb-4">
								Disclaimer
							</h2>
							<div className="text-sm text-base-content/80 space-y-2">
								<p>
									This guidance represents the Salafi scholarly position on
									birthday celebrations. Muslims may have different
									interpretations of Islamic law.
								</p>
								<p>
									For specific religious guidance, please consult with qualified
									Islamic scholars in your area who can provide personalized
									advice based on your circumstances.
								</p>
								<p>
									This application and its developers do not claim religious
									authority and encourage users to seek knowledge from authentic
									Islamic sources.
								</p>
							</div>
						</section>
					</div>
				</div>
			</div>
		</Layout>
	)
}
