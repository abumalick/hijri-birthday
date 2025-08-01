import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['line'],
		// ['html', { outputFolder: 'playwright-report' }],
		// ['json', { outputFile: 'test-results/results.json' }],
		// ['junit', { outputFile: 'test-results/junit.xml' }],
	],
	/* Global test timeout */
	timeout: 30000,
	/* Expect timeout for assertions */
	expect: {
		timeout: 10000,
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
		},
	},
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		/* Take screenshot on failure */
		screenshot: 'only-on-failure',

		/* Record video on failure */
		video: 'retain-on-failure',

		/* Viewport size for consistent testing */
		viewport: { width: 360, height: 640 },

		/* Ignore HTTPS errors */
		ignoreHTTPSErrors: true,

		/* Action timeout */
		actionTimeout: 10000,

		/* Navigation timeout */
		navigationTimeout: 15000,
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'mobile-chrome',
			use: {
				...devices['Pixel 5'],
				// Override viewport for consistent mobile testing
				viewport: { width: 360, height: 640 },
			},
			testDir: './e2e/tests',
			testMatch: ['**/*.spec.ts'],
		},
		// {
		// 	name: 'desktop-chrome',
		// 	use: {
		// 		...devices['Desktop Chrome'],
		// 		viewport: { width: 1280, height: 720 },
		// 	},
		// 	testDir: './e2e/tests',
		// 	testMatch: ['**/*.spec.ts'],
		// 	// Run desktop tests only when specifically requested
		// 	testIgnore: process.env.DESKTOP_TESTS ? [] : ['**/*'],
		// },
		// {
		// 	name: 'core-tests',
		// 	use: {
		// 		...devices['Pixel 5'],
		// 		viewport: { width: 360, height: 640 },
		// 	},
		// 	testDir: './e2e/tests/core',
		// 	testMatch: ['**/*.spec.ts'],
		// },
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'bun run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 60000,
		stdout: 'pipe',
		stderr: 'pipe',
	},

	/* Output directories */
	outputDir: 'test-results/',

	/* Global setup and teardown */
	// globalSetup: require.resolve('./e2e/global-setup.ts'),
	// globalTeardown: require.resolve('./e2e/global-teardown.ts'),
})
