import { defineConfig, devices } from '@playwright/test'

/**
 * Enhanced Playwright configuration for better debugging and test reliability
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',

	/* Disable parallel execution to prevent race conditions and improve debugging */
	fullyParallel: false,

	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,

	/* Enhanced retry strategy */
	retries: process.env.CI ? 2 : 1,

	/* Use single worker for better test isolation */
	workers: 1,

	/* Enhanced reporting for better debugging insights */
	reporter: [
		['line'],
		[
			'html',
			{
				outputFolder: 'playwright-report',
				open: 'never', // Don't auto-open in CI
			},
		],
		['json', { outputFile: 'test-results/results.json' }],
		['junit', { outputFile: 'test-results/junit.xml' }],
		['list', { printSteps: true }], // Print detailed steps for debugging
	],

	/* Increased timeouts for complex interactions */
	timeout: 60000,

	/* Enhanced expect configuration */
	expect: {
		timeout: 15000, // Increased for better reliability
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css', // More consistent screenshots
		},
	},
	/* Enhanced shared settings for better debugging */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:3000',

		/* Enhanced tracing - always retain on failure for better debugging */
		trace: 'retain-on-failure',

		/* Take screenshot on failure */
		screenshot: 'only-on-failure',

		/* Record video on failure */
		video: 'retain-on-failure',

		/* Viewport size for consistent testing */
		viewport: { width: 360, height: 640 },

		/* Ignore HTTPS errors */
		ignoreHTTPSErrors: true,

		/* Increased timeouts for better reliability */
		actionTimeout: 15000,
		navigationTimeout: 30000,

		/* Enhanced context options for debugging */
		contextOptions: {
			recordVideo: {
				dir: 'test-results/videos',
				size: { width: 360, height: 640 },
			},
		},

		/* Add extra debugging headers */
		extraHTTPHeaders: {
			'Accept-Language': 'en-US,en;q=0.9',
		},
	},

	/* Configure projects for major browsers with enhanced debugging */
	projects: [
		{
			name: 'mobile-chrome',
			use: {
				...devices['Pixel 5'],
				// Override viewport for consistent mobile testing
				viewport: { width: 360, height: 640 },
				// Enhanced browser launch options for debugging
				launchOptions: {
					args: [
						'--disable-web-security',
						'--disable-features=VizDisplayCompositor',
						'--enable-logging',
						'--log-level=0',
						'--allow-running-insecure-content',
						'--disable-site-isolation-trials',
						'--disable-features=VizDisplayCompositor',
					],
				},
			},
			testDir: './e2e/tests',
			testMatch: ['**/*.spec.ts'],
		},
	],

	/* Enhanced web server configuration */
	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120000, // Increased timeout for server startup
		stdout: 'pipe',
		stderr: 'pipe',
	},

	/* Output directories */
	outputDir: 'test-results/',

	/* Enhanced metadata for reports */
	metadata: {
		title: 'Hijri Birthday Tracker E2E Tests',
		description: 'End-to-end tests for the Islamic Date Tracker application',
	},

	/* Global setup for better test isolation */
	globalSetup: './e2e/global-setup.ts',
})
