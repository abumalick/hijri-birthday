import { test as base, expect } from '@playwright/test'

/**
 * Enhanced debug context for better test debugging
 */
export interface DebugContext {
	capturePageState(): Promise<PageState>
	logTestStep(step: string, context?: unknown): Promise<void>
	logError(error: Error, context: string): Promise<void>
}

export interface PageState {
	url: string
	title: string
	localStorage: Record<string, string>
	sessionStorage: Record<string, string>
	viewport: { width: number; height: number } | null
	timestamp: string
	visibleElements: Array<{
		testId: string | null
		visible: boolean
		text: string
	}>
}

/**
 * Extended test with debug context
 */
export const test = base.extend<{ debugContext: DebugContext }>({
	debugContext: async ({ page }, use) => {
		const debugInfo: DebugContext = {
			async capturePageState(): Promise<PageState> {
				return {
					url: page.url(),
					title: await page.title(),
					localStorage: await page.evaluate(() => {
						const storage: Record<string, string> = {}
						for (let i = 0; i < localStorage.length; i++) {
							const key = localStorage.key(i)
							if (key) storage[key] = localStorage.getItem(key) || ''
						}
						return storage
					}),
					sessionStorage: await page.evaluate(() => {
						const storage: Record<string, string> = {}
						for (let i = 0; i < sessionStorage.length; i++) {
							const key = sessionStorage.key(i)
							if (key) storage[key] = sessionStorage.getItem(key) || ''
						}
						return storage
					}),
					viewport: page.viewportSize(),
					timestamp: new Date().toISOString(),
					visibleElements: await page.evaluate(() => {
						const elements = document.querySelectorAll('[data-testid]')
						return Array.from(elements).map((el) => ({
							testId: el.getAttribute('data-testid'),
							visible: el.checkVisibility?.() ?? true,
							text: el.textContent?.slice(0, 50) || '',
						}))
					}),
				}
			},

			async logTestStep(step: string, context?: unknown): Promise<void> {
				const state = await this.capturePageState()
				console.log(`🔍 [DEBUG] ${step}`, {
					context,
					pageState: state,
				})
			},

			async logError(error: Error, context: string): Promise<void> {
				const state = await this.capturePageState()
				console.error(`❌ [ERROR] ${context}:`, {
					error: error.message,
					stack: error.stack,
					pageState: state,
				})
			},
		}

		await use(debugInfo)
	},
})

export { expect }
