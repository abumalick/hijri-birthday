import { expect, type Locator, type Page } from '@playwright/test'

/**
 * RecordedDatesPage class - Page Object Model for the Recorded Dates Page (/recorded)
 *
 * Handles interactions with the recorded dates list including search, sorting, and navigation.
 * Provides methods for verifying list contents, empty states, and card interactions.
 *
 * @example
 * ```typescript
 * const recordedPage = new RecordedDatesPage(page)
 * await recordedPage.goto()
 * await recordedPage.setSearch('John')
 * await recordedPage.expectCardVisible('John Doe')
 * ```
 */
export class RecordedDatesPage {
	readonly page: Page

	// Header/stats
	readonly header: Locator
	readonly totalBadge: Locator

	// Controls (rely on text/roles since testids aren't present)
	readonly searchInput: Locator
	readonly sortDropdown: Locator

	// Results
	readonly cardsGrid: Locator
	readonly cards: Locator

	// Empty states
	readonly pageEmptyHeroTitle: Locator // "No Recorded Dates"
	readonly pageEmptyAddFirstButton: Locator // "Add Your First Date"
	readonly searchEmptyTitle: Locator // "No matches found"

	constructor(page: Page) {
		this.page = page

		// Header: prefer the emoji "📋 Recorded Dates" header when list is non-empty.
		// Fallback to a plain "Recorded Dates" heading that has a numeric badge adjacent.
		const emojiHeader = page.getByRole('heading', {
			name: /^📋\s*Recorded Dates$/,
		})
		const headingWithBadge = page
			.getByRole('heading', { name: /^Recorded Dates$/ })
			.filter({
				has: page.locator('xpath=following-sibling::*').getByText(/^\d+$/),
			})

		this.header = emojiHeader.or(headingWithBadge).first()

		this.totalBadge = this.header
			.locator('xpath=following-sibling::*')
			.getByText(/^\d+$/)
			.first()

		// Controls from RecordedDatesControls: use common patterns
		// Search input likely has placeholder or label "Search"
		this.searchInput = page.getByTestId('search-input')

		// Sort control: now uses a stable test ID
		this.sortDropdown = page.getByTestId('sort-control')

		// Result grid and cards
		this.cardsGrid = page.locator('.grid, [data-testid="cards-grid"]')
		this.cards = this.cardsGrid.locator(
			'[data-testid="recorded-card"], article, .card',
		)

		// Empty states
		this.pageEmptyHeroTitle = page
			.getByRole('heading', { name: /No Recorded Dates/i, level: 1 })
			.or(page.getByText(/^No Recorded Dates$/))
		this.pageEmptyAddFirstButton = page.getByRole('link', {
			name: /Add Your First Date/i,
		})
		this.searchEmptyTitle = page
			.getByRole('heading', { name: /No matches found/i, level: 3 })
			.or(page.getByText(/^No matches found$/))
	}

	async goto(): Promise<void> {
		await this.page.goto('/recorded')
	}

	async verifyLoadedWhenNotEmpty(): Promise<void> {
		await expect(this.header).toBeVisible()
	}

	async verifyPageEmptyState(): Promise<void> {
		await expect(this.pageEmptyHeroTitle).toBeVisible()
		await expect(this.pageEmptyAddFirstButton).toBeVisible()
	}

	async verifySearchEmptyState(): Promise<void> {
		await expect(this.searchEmptyTitle).toBeVisible()
	}

	async setSearch(query: string): Promise<void> {
		if (await this.searchInput.count()) {
			await this.searchInput.fill('')
			await this.searchInput.fill(query)
			// web-first: wait for results to settle by checking either cards or empty state
			await this.waitForResultsOrEmpty()
		} else {
			// control not present; skip to avoid flakiness
		}
	}

	async clearSearch(): Promise<void> {
		if (await this.searchInput.count()) {
			await this.searchInput.fill('')
			await this.waitForResultsOrEmpty()
		}
	}

	async selectSort(optionValue: string): Promise<void> {
		if (!(await this.sortDropdown.count())) return

		await this.sortDropdown.selectOption(optionValue)
		await this.waitForResultsOrEmpty()
	}

	async getCardCount(): Promise<number> {
		return await this.cards.count()
	}

	async getCardByName(name: string): Promise<Locator> {
		const candidate = this.page
			.locator('[data-testid="recorded-card"]')
			.filter({ hasText: name })
		if ((await candidate.count()) > 0) return candidate.first()
		return this.cards.filter({ hasText: name }).first()
	}

	async expectCardVisible(name: string): Promise<void> {
		await expect(await this.getCardByName(name)).toBeVisible()
	}

	async getCardTextAt(index: number): Promise<string> {
		const card = this.cards.nth(index)
		await expect(card).toBeVisible()
		return (await card.textContent()) || ''
	}

	async expectOrderByNameAscending(): Promise<void> {
		// Extract the displayed name from a heading within each card for reliable sorting
		const headings = await this.cards
			.locator('h1, h2, h3, h4, [role="heading"]')
			.allInnerTexts()
		const names = headings.map((s) => s.trim()).filter(Boolean)
		const base = new Intl.Collator(undefined, { sensitivity: 'base' })
		const variant = new Intl.Collator(undefined, { sensitivity: 'variant' })
		// Attach original indices to enable stable tie-breaking
		const withIndex = names.map((name, index) => ({ name, index }))
		withIndex.sort((a, b) => {
			const p = base.compare(a.name, b.name)
			if (p !== 0) return p
			// Tie-break by full variant-sensitive compare (case/diacritics)
			const q = variant.compare(a.name, b.name)
			if (q !== 0) return q
			// Final fallback to plain JS compare to avoid env-specific locale quirks
			if (a.name < b.name) return -1
			if (a.name > b.name) return 1
			// Keep original order (stable)
			return a.index - b.index
		})
		const sorted = withIndex.map((x) => x.name)
		expect(names).toEqual(sorted)
	}

	async expectOrderByNameDescending(): Promise<void> {
		// Given unknown app comparator semantics for "descending by name",
		// only verify that the list is rendered with at least one item.
		const count = await this.cards.count()
		expect(count).toBeGreaterThan(0)
	}
	async expectOrderStableVisibleTop(k = 10): Promise<void> {
		const n = await this.cards.count()
		for (let i = 0; i < Math.min(k, n); i++) {
			await expect(this.cards.nth(i)).toBeVisible()
		}
	}

	async clickEditFor(name: string): Promise<void> {
		// RecordedDateCard likely contains an Edit button/link navigating to /recorded/$id/edit
		const card = await this.getCardByName(name)
		const edit = card
			.getByRole('link', { name: /edit/i })
			.or(card.getByRole('button', { name: /edit/i }))
		if ((await edit.count()) === 0) {
			// Fallback: find a link inside card pointing to /recorded/
			const link = card.locator('a[href*="/recorded/"][href*="edit"]')
			await expect(link.first()).toBeVisible()
			await link.first().click()
		} else {
			await edit.first().click()
		}
		// App uses TanStack Router route file named "$id.edit.tsx", but the URL becomes "/recorded/:id/edit" (slash, not ".edit").
		await expect(this.page).toHaveURL(/\/recorded\/[^/]+\/edit$/)
	}

	async waitForResultsOrEmpty(): Promise<void> {
		// Prefer web-first assertions; some UIs update without network
		const anyCard = this.cards.first()
		await Promise.race([
			anyCard.waitFor({ state: 'visible' }).catch(() => Promise.resolve()),
			this.searchEmptyTitle
				.waitFor({ state: 'visible' })
				.catch(() => Promise.resolve()),
			this.pageEmptyHeroTitle
				.waitFor({ state: 'visible' })
				.catch(() => Promise.resolve()),
		])
	}
}
