import type { FullConfig } from '@playwright/test'
import { chromium } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * Ensures clean state before test execution
 */
async function globalSetup(_config: FullConfig) {
	console.log('🧪 Setting up global test environment...')

	const browser = await chromium.launch()
	const page = await browser.newPage()

	try {
		// Navigate to the application
		await page.goto('http://localhost:3000')

		// Clear all storage to ensure clean state
		await page.evaluate(() => {
			try {
				localStorage.clear()
				sessionStorage.clear()
				// Clear any IndexedDB if used
				if ('indexedDB' in window) {
					indexedDB.databases?.().then((databases) => {
						databases.forEach((db) => {
							if (db.name) indexedDB.deleteDatabase(db.name)
						})
					})
				}
				console.log('✅ Storage cleared for test setup')
			} catch (error) {
				console.warn(
					'⚠️ Could not clear storage:',
					error instanceof Error ? error.message : String(error),
				)
			}
		})

		console.log('✅ Global test setup completed successfully')
	} catch (error) {
		console.error('❌ Global setup failed:', error)
		throw error
	} finally {
		await browser.close()
	}
}

export default globalSetup
