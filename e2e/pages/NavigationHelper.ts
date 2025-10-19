import { expect, type Locator, type Page } from '@playwright/test'

/**
 * NavigationHelper class for navigation operations and verifications
 *
 * Handles drawer/sidebar navigation, FAB interactions, URL verification, and active navigation checks.
 * Uses stable data-testid selectors where possible based on current app components.
 * Provides centralized navigation logic for consistent behavior across tests.
 *
 * @example
 * ```typescript
 * const navHelper = new NavigationHelper(page)
 *
 * // Navigate via sidebar
 * await navHelper.navigateToHome()
 * await navHelper.navigateToRecorded()
 *
 * // Verify FAB and navigate
 * await navHelper.clickFAB()
 *
 * // Verify current page
 * await navHelper.verifyCurrentPage('/add')
 *
 * // Verify active navigation
 * await navHelper.verifyActiveNavigation('home')
 * ```
 */
export class NavigationHelper {
	public readonly page: Page

	// Drawer toggle and layout elements (from Layout.tsx)
	private readonly drawerToggle: Locator
	private readonly drawerToggleLabel: Locator
	private readonly drawerOverlay: Locator

	// Sidebar links (TanStack Link in Layout.tsx)
	private readonly homeLink: Locator
	private readonly addLink: Locator
	private readonly recordedLink: Locator
	private readonly monthsLink: Locator
	private readonly guidanceLink: Locator

	// FAB: present on Recorded page, and Home page via HomePage POM testid 'add-event-button'
	private readonly fabGlobal: Locator

	// Routes for URL verification
	private readonly homeUrl = '/'
	private readonly addUrl = '/add'
	private readonly recordedUrl = '/recorded'
	private readonly monthsUrl = '/months'
	private readonly guidanceUrl = '/guidance'

	constructor(page: Page) {
		this.page = page

		// Drawer mechanics
		this.drawerToggle = page.getByTestId('drawer-toggle')
		this.drawerToggleLabel = page.getByTestId('drawer-toggle-label')
		this.drawerOverlay = page.getByLabel('Close menu')

		// Sidebar links (use the visible text, combined with role=link to be robust)
		this.homeLink = page.getByRole('link', { name: /Home$/ })
		this.addLink = page.getByRole('link', { name: /Add Date$/ })
		this.recordedLink = page.getByRole('link', { name: /Recorded Dates$/ })
		this.monthsLink = page.getByRole('link', { name: /Hijri Months$/ })
		this.guidanceLink = page.getByRole('link', { name: /Islamic Guidance$/ })

		// FABs
		this.fabGlobal = page.getByTestId('add-event-button') // exists on Recorded page
	}

	// Utilities

	/**
	 * Open the sidebar/drawer if it's not already visible.
	 * Uses multiple fallback strategies to ensure the drawer opens reliably.
	 */
	async openSidebarIfNeeded(): Promise<void> {
		// If links already visible, nothing to do
		const sidebarVisible = await this.homeLink
			.first()
			.isVisible()
			.catch(() => false)
		if (sidebarVisible) return

		// Layered attempts to open the drawer
		const attempts: Array<() => Promise<void>> = [
			// Role-based button
			async () => {
				const btn = this.page.getByRole('button', { name: 'Open menu' }).first()
				if (await btn.isVisible().catch(() => false)) {
					await btn.click()
					return
				}
				throw new Error('role button not visible')
			},
			// Aria label
			async () => {
				const lbl = this.page.getByLabel('Open menu').first()
				if (await lbl.isVisible().catch(() => false)) {
					await lbl.click()
					return
				}
				throw new Error('label not visible')
			},
			// Direct label for the checkbox
			async () => {
				if (await this.drawerToggleLabel.isVisible().catch(() => false)) {
					await this.drawerToggleLabel.click()
					return
				}
				throw new Error('drawer-toggle-label not visible')
			},
			// Last resort: programmatically check the checkbox and dispatch change
			async () => {
				await this.page.evaluate(() => {
					const toggle = document.querySelector<HTMLInputElement>(
						'[data-testid="drawer-toggle"]',
					)
					if (toggle && !toggle.checked) {
						toggle.checked = true
						toggle.dispatchEvent(new Event('change', { bubbles: true }))
					}
				})
			},
		]

		let opened = false
		for (const fn of attempts) {
			try {
				await fn()
				await expect
					.poll(
						async () => {
							const checked = await this.drawerToggle
								.isChecked()
								.catch(() => false)
							const overlayVisible = await this.drawerOverlay
								.isVisible()
								.catch(() => false)
							return checked || overlayVisible
						},
						{ timeout: 1500 },
					)
					.toBeTruthy()
				opened = true
				break
			} catch {
				// try next attempt
			}
		}

		if (!opened) {
			// Ensure open or fail within a reasonable timeout
			await expect
				.poll(
					async () => {
						const checked = await this.drawerToggle
							.isChecked()
							.catch(() => false)
						const overlayVisible = await this.drawerOverlay
							.isVisible()
							.catch(() => false)
						return checked || overlayVisible
					},
					{ timeout: 3000 },
				)
				.toBeTruthy()
		}
	}

	/**
	 * Close the sidebar/drawer if it's currently open.
	 * Uses programmatic checkbox manipulation for reliable closing.
	 * @private
	 */
	private async closeSidebarIfOpen(): Promise<void> {
		// Prefer toggling the drawer checkbox directly to avoid overlay occlusion by aside.
		if ((await this.drawerToggle.count()) > 0) {
			const isOpen = await this.drawerToggle.isChecked().catch(() => false)
			if (isOpen) {
				// Programmatically close the drawer and dispatch change for React to update
				await this.drawerToggle.evaluate((el: HTMLInputElement) => {
					el.checked = false
					el.dispatchEvent(new Event('change', { bubbles: true }))
				})

				// As a fallback, click the overlay forcibly if it still exists
				if (await this.drawerOverlay.isVisible().catch(() => false)) {
					await this.drawerOverlay.click({ force: true })
				}

				// Wait for it to be closed
				await expect
					.poll(
						async () =>
							!(await this.drawerToggle.isChecked().catch(() => true)),
						{
							timeout: 3000,
						},
					)
					.toBeTruthy()
			}
		}
	}

	// Bottom/Sidebar navigation methods

	/**
	 * Navigate to the Home page via sidebar.
	 * Opens sidebar if needed, clicks the Home link, closes sidebar, and verifies URL.
	 */
	async navigateToHome(): Promise<void> {
		await this.openSidebarIfNeeded()
		await this.homeLink.first().click()
		await this.closeSidebarIfOpen()
		await this.verifyCurrentPage(this.homeUrl)
	}

	/**
	 * Navigate to the Recorded Dates page via sidebar.
	 * Opens sidebar if needed, clicks the Recorded Dates link, closes sidebar, and verifies URL.
	 */
	async navigateToRecorded(): Promise<void> {
		await this.openSidebarIfNeeded()
		await this.recordedLink.first().click()
		await this.closeSidebarIfOpen()
		await this.verifyCurrentPage(this.recordedUrl)
	}

	/**
	 * Navigate to the Add Date page via sidebar.
	 * Opens sidebar if needed, clicks the Add Date link, closes sidebar, and verifies URL.
	 */
	async navigateToAdd(): Promise<void> {
		await this.openSidebarIfNeeded()
		await this.addLink.first().click()
		await this.closeSidebarIfOpen()
		await this.verifyCurrentPage(this.addUrl)
	}

	/**
	 * Navigate to the Islamic Guidance page via sidebar.
	 * Opens sidebar if needed, clicks the Islamic Guidance link, closes sidebar, and verifies URL.
	 */
	async navigateToGuidance(): Promise<void> {
		await this.openSidebarIfNeeded()
		await this.guidanceLink.first().click()
		await this.closeSidebarIfOpen()
		await this.verifyCurrentPage(this.guidanceUrl)
	}

	/**
	 * Navigate to the Hijri Months page via sidebar.
	 * Opens sidebar if needed, clicks the Hijri Months link, closes sidebar, and verifies URL.
	 */
	async navigateToMonths(): Promise<void> {
		await this.openSidebarIfNeeded()
		await this.monthsLink.first().click()
		await this.closeSidebarIfOpen()
		await this.verifyCurrentPage(this.monthsUrl)
	}

	// FAB methods

	/**
	 * Verify FAB visible on the current page.
	 * On Home and Recorded pages we expect a FAB with testid 'add-event-button'.
	 * @returns true if FAB is visible, false otherwise
	 */
	async verifyFABVisible(): Promise<boolean> {
		const count = await this.fabGlobal.count()
		if (count === 0) return false
		await expect.soft(this.fabGlobal.first()).toBeVisible()
		return true
	}

	/**
	 * Click the FAB button and verify navigation to Add page.
	 * Verifies FAB is visible before clicking.
	 */
	async clickFAB(): Promise<void> {
		const hasFab = await this.verifyFABVisible()
		expect(hasFab).toBeTruthy()
		await this.fabGlobal.first().click()
		await this.verifyCurrentPage(this.addUrl)
	}

	// Navigation state verification

	/**
	 * Navigate to a specific path using page.goto.
	 * @param path - The URL path to navigate to (e.g., '/', '/add', '/recorded')
	 */
	async goto(path: string): Promise<void> {
		await this.page.goto(path)
	}

	/**
	 * Verify the current page URL matches the expected path.
	 * Accepts both absolute baseURL + path and plain path.
	 * @param expectedPath - The expected URL path
	 */
	async verifyCurrentPage(expectedPath: string): Promise<void> {
		// Accept both absolute baseURL + path and plain path
		const pathEsc = expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const pattern = new RegExp(
			`^(?:https?:\\/\\/[^/]+)?${pathEsc}(?:$|\\/?|\\?.*)$`,
		)
		await expect(this.page).toHaveURL(pattern)
	}

	/**
	 * Verify that the specified navigation section is currently active.
	 * The Layout uses activeProps={{ className: 'active' }}, so checks if the link has the 'active' class.
	 * @param expectedSection - The navigation section that should be active
	 * @throws Error if the section is unknown
	 */
	async verifyActiveNavigation(
		expectedSection: 'home' | 'add' | 'recorded' | 'months' | 'guidance',
	): Promise<void> {
		await this.openSidebarIfNeeded()
		const mapping: Record<string, Locator> = {
			home: this.homeLink,
			add: this.addLink,
			recorded: this.recordedLink,
			months: this.monthsLink,
			guidance: this.guidanceLink,
		}
		const target = mapping[expectedSection]
		if (!target) {
			throw new Error(`Unknown section: ${expectedSection}`)
		}
		// Use soft here to avoid flakiness if class handling differs; still meaningful verification
		await expect.soft(target.first()).toHaveClass(/active/)
		await this.closeSidebarIfOpen()
	}

	// Back/Cancel navigation

	/**
	 * Click the cancel button and verify navigation back to Home page.
	 * Used on forms and modals to cancel operations.
	 */
	async clickCancel(): Promise<void> {
		await this.page.getByTestId('cancel-button').click()
		await this.verifyCurrentPage(this.homeUrl)
	}

	/**
	 * Click the back button or use browser back navigation.
	 * Tries back-button testid first, falls back to browser back if not found.
	 */
	async clickBack(): Promise<void> {
		// The Add page has back button testid 'back-button' in POM, but in app it's 'cancel-button'.
		// Try back-button first, fallback to browser back if absent.
		const backBtn = this.page.getByTestId('back-button')
		if (await backBtn.count()) {
			await backBtn.first().click()
		} else {
			await this.page.goBack()
		}
	}
}
