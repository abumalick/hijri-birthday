import type { Locator, Page } from '@playwright/test'

/**
 * Centralized Selectors utility for e2e tests
 *
 * This module provides a single source of truth for all UI element selectors,
 * reducing duplication across page objects and making UI changes easier to maintain.
 *
 * Each selector group is organized by feature area and returns Locator objects
 * that can be used directly in Playwright assertions and interactions.
 *
 * @example
 * ```typescript
 * import { Selectors } from '../selectors/Selectors'
 *
 * // In a test or page object
 * const nameInput = Selectors.form.nameInput(page)
 * await nameInput.fill('John Doe')
 *
 * const addButton = Selectors.navigation.addButton(page)
 * await addButton.click()
 * ```
 */
export const Selectors = {
	/**
	 * Form input selectors
	 *
	 * Selectors for form fields used in Add Event and Edit Event pages.
	 * Primarily uses test IDs for stability and maintainability.
	 */
	form: {
		/**
		 * Name input field selector
		 * @param page - Playwright Page object
		 * @returns Locator for the name input field
		 */
		nameInput: (page: Page): Locator => page.getByTestId('name-input'),

		/**
		 * Gregorian date input field selector
		 * @param page - Playwright Page object
		 * @returns Locator for the gregorian date input field
		 */
		gregorianDateInput: (page: Page): Locator =>
			page.getByTestId('gregorian-date-input'),

		/**
		 * Relationship input field selector
		 * @param page - Playwright Page object
		 * @returns Locator for the relationship input field
		 */
		relationshipInput: (page: Page): Locator =>
			page.getByTestId('relationship-input'),

		/**
		 * Form submit button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the submit button
		 */
		submitButton: (page: Page): Locator => page.getByTestId('submit-button'),

		/**
		 * Form save button selector (used in edit forms)
		 * @param page - Playwright Page object
		 * @returns Locator for the save button
		 */
		saveButton: (page: Page): Locator => page.getByTestId('save-button'),

		/**
		 * Form cancel button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the cancel button
		 */
		cancelButton: (page: Page): Locator => page.getByTestId('cancel-button'),

		/**
		 * Name field error message selector
		 * @param page - Playwright Page object
		 * @returns Locator for the name error message
		 */
		nameError: (page: Page): Locator => page.getByTestId('name-error'),

		/**
		 * Date field error message selector
		 * @param page - Playwright Page object
		 * @returns Locator for the date error message
		 */
		dateError: (page: Page): Locator => page.getByTestId('date-error'),

		/**
		 * Form-level error message selector
		 * @param page - Playwright Page object
		 * @returns Locator for the form error message
		 */
		formError: (page: Page): Locator => page.getByTestId('form-error'),
	},

	/**
	 * Navigation selectors
	 *
	 * Selectors for navigation elements including buttons, links, and drawer controls.
	 */
	navigation: {
		/**
		 * Add event button selector (FAB or primary action button)
		 * @param page - Playwright Page object
		 * @returns Locator for the add event button
		 */
		addButton: (page: Page): Locator => page.getByTestId('add-event-button'),

		/**
		 * Recorded dates navigation link selector
		 * @param page - Playwright Page object
		 * @returns Locator for the recorded dates link
		 */
		recordedDatesLink: (page: Page): Locator =>
			page.getByTestId('recorded-dates-link'),

		/**
		 * Guidance navigation link selector
		 * @param page - Playwright Page object
		 * @returns Locator for the guidance link
		 */
		guidanceLink: (page: Page): Locator => page.getByTestId('guidance-link'),

		/**
		 * Back button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the back button
		 */
		backButton: (page: Page): Locator => page.getByTestId('back-button'),

		/**
		 * Navigation drawer selector
		 * @param page - Playwright Page object
		 * @returns Locator for the navigation drawer
		 */
		drawer: (page: Page): Locator =>
			page.locator('.drawer-side, [role="navigation"]').first(),

		/**
		 * Drawer toggle/menu button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the drawer toggle button
		 */
		drawerToggle: (page: Page): Locator =>
			page.locator('.drawer-button, [aria-label*="menu" i]').first(),
	},

	/**
	 * Timeline selectors
	 *
	 * Selectors for timeline sections, event cards, and filter controls.
	 */
	timeline: {
		/**
		 * Timeline section container selector
		 * @param page - Playwright Page object
		 * @returns Locator for the timeline section
		 */
		timelineSection: (page: Page): Locator =>
			page.getByTestId('timeline-section'),

		/**
		 * This week timeline section selector
		 * @param page - Playwright Page object
		 * @returns Locator for the this week section
		 */
		thisWeekSection: (page: Page): Locator =>
			page.getByTestId('this-week-section'),

		/**
		 * This month timeline section selector
		 * @param page - Playwright Page object
		 * @returns Locator for the this month section
		 */
		thisMonthSection: (page: Page): Locator =>
			page.getByTestId('this-month-section'),

		/**
		 * Next quarter timeline section selector
		 * @param page - Playwright Page object
		 * @returns Locator for the next quarter section
		 */
		nextQuarterSection: (page: Page): Locator =>
			page.getByTestId('next-quarter-section'),

		/**
		 * Rest of year timeline section selector
		 * @param page - Playwright Page object
		 * @returns Locator for the rest of year section
		 */
		restOfYearSection: (page: Page): Locator =>
			page.getByTestId('rest-of-year-section'),

		/**
		 * Event card selector (returns all event cards)
		 * @param page - Playwright Page object
		 * @returns Locator for event cards
		 */
		eventCard: (page: Page): Locator => page.getByTestId('event-card'),

		/**
		 * Event name within a card selector
		 * @param page - Playwright Page object
		 * @returns Locator for the event name
		 */
		eventName: (page: Page): Locator => page.getByTestId('event-name'),

		/**
		 * Event relationship within a card selector
		 * @param page - Playwright Page object
		 * @returns Locator for the event relationship
		 */
		eventRelationship: (page: Page): Locator =>
			page.getByTestId('event-relationship'),

		/**
		 * Calendar filter tabs container selector
		 * @param page - Playwright Page object
		 * @returns Locator for the filter tabs
		 */
		filterTabs: (page: Page): Locator =>
			page.getByTestId('calendar-filter-tabs'),

		/**
		 * Gregorian calendar filter tab selector
		 * @param page - Playwright Page object
		 * @returns Locator for the gregorian filter tab
		 */
		gregorianTab: (page: Page): Locator =>
			page.getByTestId('calendar-filter-gregorian'),

		/**
		 * Hijri calendar filter tab selector
		 * @param page - Playwright Page object
		 * @returns Locator for the hijri filter tab
		 */
		hijriTab: (page: Page): Locator =>
			page.getByTestId('calendar-filter-hijri'),

		/**
		 * Both calendars filter tab selector
		 * @param page - Playwright Page object
		 * @returns Locator for the both filter tab
		 */
		bothTab: (page: Page): Locator => page.getByTestId('calendar-filter-both'),
	},

	/**
	 * Modal selectors
	 *
	 * Selectors for modal dialogs including delete confirmation modals.
	 */
	modal: {
		/**
		 * Delete confirmation modal root selector
		 * @param page - Playwright Page object
		 * @returns Locator for the modal root
		 */
		deleteModal: (page: Page): Locator =>
			page.locator('.modal.modal-open').first(),

		/**
		 * Modal title/heading selector
		 * @param page - Playwright Page object
		 * @returns Locator for the modal title
		 */
		modalTitle: (page: Page): Locator =>
			page.locator('.modal h3, .modal [role="heading"]').first(),

		/**
		 * Modal description/content selector
		 * @param page - Playwright Page object
		 * @returns Locator for the modal description
		 */
		modalDescription: (page: Page): Locator => page.locator('.modal p').first(),

		/**
		 * Delete confirmation button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the confirm/delete button
		 */
		confirmButton: (page: Page): Locator =>
			page
				.getByRole('button', { name: /delete|confirm|yes/i })
				.or(page.locator('button.btn-error'))
				.first(),

		/**
		 * Modal cancel button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the cancel button
		 */
		cancelButton: (page: Page): Locator =>
			page
				.getByRole('button', { name: /cancel|no|dismiss|close/i })
				.or(page.locator('.modal button:not(.btn-error)'))
				.first(),

		/**
		 * Modal close button selector
		 * @param page - Playwright Page object
		 * @returns Locator for the close button
		 */
		closeButton: (page: Page): Locator =>
			page
				.getByRole('button', { name: /close/i })
				.or(page.locator('[aria-label="Close"]'))
				.first(),
	},

	/**
	 * Empty state selectors
	 *
	 * Selectors for empty state messages and related UI elements.
	 */
	empty: {
		/**
		 * Empty state message selector (general)
		 * @param page - Playwright Page object
		 * @returns Locator for the empty state message
		 */
		emptyStateMessage: (page: Page): Locator =>
			page.getByTestId('empty-state-message'),

		/**
		 * Empty state image selector
		 * @param page - Playwright Page object
		 * @returns Locator for the empty state image
		 */
		emptyStateImage: (page: Page): Locator =>
			page.getByTestId('empty-state-image'),

		/**
		 * No recorded dates empty state title selector
		 * @param page - Playwright Page object
		 * @returns Locator for the no recorded dates title
		 */
		noRecordedDatesTitle: (page: Page): Locator =>
			page
				.getByRole('heading', { name: /No Recorded Dates/i, level: 1 })
				.or(page.getByText(/^No Recorded Dates$/)),

		/**
		 * Add first date button selector (in empty state)
		 * @param page - Playwright Page object
		 * @returns Locator for the add first date button
		 */
		addFirstDateButton: (page: Page): Locator =>
			page.getByRole('link', { name: /Add Your First Date/i }),

		/**
		 * No search results title selector
		 * @param page - Playwright Page object
		 * @returns Locator for the no search results title
		 */
		noSearchResultsTitle: (page: Page): Locator =>
			page
				.getByRole('heading', { name: /No matches found/i, level: 3 })
				.or(page.getByText(/^No matches found$/)),
	},

	/**
	 * Preview and display selectors
	 *
	 * Selectors for preview elements and date displays.
	 */
	preview: {
		/**
		 * Hijri date preview selector
		 * @param page - Playwright Page object
		 * @returns Locator for the hijri date preview
		 */
		hijriDatePreview: (page: Page): Locator =>
			page.getByTestId('hijri-date-preview'),

		/**
		 * Age preview selector
		 * @param page - Playwright Page object
		 * @returns Locator for the age preview
		 */
		agePreview: (page: Page): Locator => page.getByTestId('age-preview'),

		/**
		 * Next birthday preview selector
		 * @param page - Playwright Page object
		 * @returns Locator for the next birthday preview
		 */
		nextBirthdayPreview: (page: Page): Locator =>
			page.getByTestId('next-birthday-preview'),

		/**
		 * Hijri date display selector
		 * @param page - Playwright Page object
		 * @returns Locator for the hijri date display
		 */
		hijriDateDisplay: (page: Page): Locator =>
			page.getByTestId('hijri-date-display'),

		/**
		 * Gregorian date display selector
		 * @param page - Playwright Page object
		 * @returns Locator for the gregorian date display
		 */
		gregorianDateDisplay: (page: Page): Locator =>
			page.getByTestId('gregorian-date-display'),

		/**
		 * Current date card selector
		 * @param page - Playwright Page object
		 * @returns Locator for the current date card
		 */
		currentDateCard: (page: Page): Locator =>
			page.getByTestId('current-date-card'),

		/**
		 * Hijri date widget selector
		 * @param page - Playwright Page object
		 * @returns Locator for the hijri date widget
		 */
		hijriDateWidget: (page: Page): Locator =>
			page.getByTestId('hijri-date-widget'),
	},

	/**
	 * Page element selectors
	 *
	 * Selectors for common page elements like titles and headings.
	 */
	page: {
		/**
		 * Page title selector
		 * @param page - Playwright Page object
		 * @returns Locator for the page title
		 */
		pageTitle: (page: Page): Locator => page.getByTestId('page-title'),

		/**
		 * Loading spinner selector
		 * @param page - Playwright Page object
		 * @returns Locator for the loading spinner
		 */
		loadingSpinner: (page: Page): Locator =>
			page.getByTestId('loading-spinner'),

		/**
		 * Submit button loading state selector
		 * @param page - Playwright Page object
		 * @returns Locator for the submit button loading indicator
		 */
		submitButtonLoading: (page: Page): Locator =>
			page.getByTestId('submit-button-loading'),
	},

	/**
	 * Recorded dates page selectors
	 *
	 * Selectors specific to the recorded dates management page.
	 */
	recordedDates: {
		/**
		 * Search input selector
		 * @param page - Playwright Page object
		 * @returns Locator for the search input
		 */
		searchInput: (page: Page): Locator => page.getByTestId('search-input'),

		/**
		 * Sort control selector
		 * @param page - Playwright Page object
		 * @returns Locator for the sort dropdown
		 */
		sortControl: (page: Page): Locator => page.getByTestId('sort-control'),

		/**
		 * Recorded date card selector
		 * @param page - Playwright Page object
		 * @returns Locator for recorded date cards
		 */
		recordedCard: (page: Page): Locator => page.getByTestId('recorded-card'),

		/**
		 * Cards grid container selector
		 * @param page - Playwright Page object
		 * @returns Locator for the cards grid
		 */
		cardsGrid: (page: Page): Locator =>
			page.locator('.grid, [data-testid="cards-grid"]'),

		/**
		 * Delete button selector (within a recorded card)
		 * @param page - Playwright Page object
		 * @returns Locator for the delete button
		 */
		deleteButton: (page: Page): Locator => page.getByTestId('delete-button'),

		/**
		 * Edit button selector (within a recorded card)
		 * @param page - Playwright Page object
		 * @returns Locator for the edit button
		 */
		editButton: (page: Page): Locator => page.getByTestId('edit-button'),
	},
}
