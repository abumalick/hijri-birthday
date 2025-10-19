# E2E Test Architecture Documentation

## Overview

This document describes the end-to-end (E2E) test architecture for the Hijri Birthday tracking application. The test suite is built using Playwright and follows a modular, maintainable design pattern that separates concerns into specialized helper classes and page objects.

The architecture emphasizes:
- **Separation of Concerns**: Page objects handle navigation and basic interactions, while helpers encapsulate complex logic
- **Reusability**: Helper classes provide static or instance methods that can be used across multiple page objects
- **Maintainability**: Centralized selectors and consistent error handling patterns
- **Readability**: Clear method names and comprehensive JSDoc documentation

## Architecture Overview

```
e2e/
├── README.md (this file)
├── test-plan.md (test strategy and coverage)
├── global-setup.ts (global test configuration)
├── playwright.config.ts (Playwright configuration)
├── fixtures/
│   ├── index.ts (fixture exports)
│   ├── debugFixture.ts (debug utilities)
│   └── testDataFixture.ts (test data management)
├── helpers/
│   ├── AssertionHelper.ts (verification utilities)
│   └── FormHelper.ts (form interaction utilities)
├── pages/
│   ├── BasePage.ts (abstract base class)
│   ├── HomePage.ts (home page interactions)
│   ├── AddEventPage.ts (add event form)
│   ├── EditEventPage.ts (edit event form)
│   ├── RecordedDatesPage.ts (recorded dates list)
│   ├── DeleteConfirmationModal.ts (delete confirmation)
│   ├── TimelineHelper.ts (timeline operations)
│   ├── FilterHelper.ts (filter operations)
│   ├── NavigationHelper.ts (navigation operations)
│   └── DateDisplayHelper.ts (date display operations)
├── selectors/
│   └── Selectors.ts (centralized element selectors)
├── tests/
│   └── core/
│       ├── add-event-comprehensive.spec.ts
│       ├── edit-delete-functionality.spec.ts
│       ├── home-timeline.spec.ts
│       ├── navigation-user-flows.spec.ts
│       └── recorded-dates-management.spec.ts
└── utils/
    └── dateUtils.ts (date formatting utilities)
```

## Helper Classes

### AssertionHelper

Static utility class for centralizing complex verification logic. All methods are static and require no instance creation.

**Key Responsibilities:**
- Form field verification
- Validation error checking
- Page navigation verification
- Element visibility checks
- Timeline event verification
- Storage data verification

**Usage Examples:**
```typescript
// Verify form fields match expected data
await AssertionHelper.assertFormFilled(page, eventData, {
  nameInput: page.getByTestId('name-input'),
  dateInput: page.getByTestId('date-input'),
  relationshipInput: page.getByTestId('relationship-input')
})

// Verify validation error appears
await AssertionHelper.assertValidationError(page, 'name', 'Name is required')

// Verify page URL
await AssertionHelper.assertPageURL(page, '/add')

// Verify element visibility
await AssertionHelper.assertElementVisible(page.getByTestId('submit-button'), true)

// Verify event in timeline
await AssertionHelper.assertEventInTimeline(page, 'John Doe', 'This Week')

// Verify event count
await AssertionHelper.assertEventCount(page, page.getByTestId('event-card'), 5)

// Verify storage contains events
await AssertionHelper.assertStorageContains(testData, [eventData1, eventData2])
```

### FormHelper

Instance class for reusable form interaction patterns. Eliminates duplication between AddEventPage and EditEventPage.

**Key Responsibilities:**
- Text and date field filling
- Form clearing and submission
- Complete event form filling
- Consistent error handling

**Usage Examples:**
```typescript
const formHelper = new FormHelper()

// Fill individual fields
await formHelper.fillTextField(page.getByTestId('name-input'), 'John Doe')
await formHelper.fillDateField(page.getByTestId('date-input'), '2000-06-15')

// Clear entire form
await formHelper.clearForm([nameInput, dateInput, relationshipInput])

// Submit form
await formHelper.submitForm(page.getByTestId('submit-button'))

// Fill complete event form
await formHelper.fillEventForm({
  nameInput: page.getByTestId('name-input'),
  dateInput: page.getByTestId('date-input'),
  relationshipInput: page.getByTestId('relationship-input')
}, eventData)
```

### TimelineHelper

Specialized helper for timeline-specific operations and verifications. Handles complex timeline analysis logic.

**Key Responsibilities:**
- Timeline section identification and navigation
- Event grouping and counting within sections
- Timeline structure verification
- Section-specific event verification

**Usage Examples:**
```typescript
const timelineHelper = new TimelineHelper(page)

// Get all timeline sections
const sections = await timelineHelper.getTimelineSections()

// Get events in specific section
const events = await timelineHelper.getEventsInSection('This Week')

// Verify section exists
await timelineHelper.verifyTimelineSectionExists('This Month')

// Verify event count in section
await timelineHelper.verifyTimelineSectionHasEvents('This Week', 3)

// Verify event in specific section
await timelineHelper.verifyEventInSection('This Month', 'Alice Smith')
```

### FilterHelper

Helper class for filter-related operations on the HomePage. Manages filter state and verification.

**Key Responsibilities:**
- Active filter verification
- Filter persistence across page reloads
- Empty state verification for filters
- Filter badge count retrieval and verification

**Usage Examples:**
```typescript
const filterHelper = new FilterHelper(page)

// Verify active filter
await filterHelper.verifyActiveFilter('gregorian')

// Verify filter persists across reload
await filterHelper.verifyFilterPersistence('hijri')

// Verify no events for current filter
await filterHelper.verifyNoEventsForFilter()

// Get filter counts
const counts = await filterHelper.getFilterCounts()
// Returns: { gregorian: 5, hijri: 3, both: 8 }

// Verify filter counts match expected
await filterHelper.verifyFilterCounts({ gregorian: 5, hijri: 3, both: 8 })
```

### NavigationHelper

Helper for navigation operations including sidebar, FAB, and URL verification.

**Key Responsibilities:**
- Sidebar/drawer navigation
- FAB button interactions
- URL verification
- Active navigation state checking

**Usage Examples:**
```typescript
const navHelper = new NavigationHelper(page)

// Navigate via sidebar
await navHelper.navigateToHome()
await navHelper.navigateToRecorded()
await navHelper.navigateToAdd()

// Verify FAB is visible
const fabVisible = await navHelper.verifyFABVisible()

// Click FAB and navigate to add page
await navHelper.clickFAB()

// Verify current page URL
await navHelper.verifyCurrentPage('/recorded')

// Verify active navigation section
await navHelper.verifyActiveNavigation('home')
```

### DateDisplayHelper

Helper for date display verification on the Home Page. Handles current date widget operations.

**Key Responsibilities:**
- Current Hijri and Gregorian date retrieval
- Date format verification
- Date widget visibility checks

**Usage Examples:**
```typescript
const dateHelper = new DateDisplayHelper(page)

// Get current dates
const hijriDate = await dateHelper.getCurrentHijriDate()
const gregorianDate = await dateHelper.getCurrentGregorianDate()

// Verify date displays are visible
await dateHelper.verifyCurrentDateDisplays()

// Verify date formats
await dateHelper.verifyHijriDateFormat()
await dateHelper.verifyGregorianDateFormat()
```

## Page Objects

### BasePage

Abstract base class providing common functionality for all page objects.

**Features:**
- Page instance management
- Common waiting patterns
- Input field utilities
- Protected methods for subclass use

### HomePage

Page object for the home page with delegation to specialized helpers.

**Key Features:**
- Navigation to other pages
- Calendar filter selection
- Event verification and interaction
- Timeline section access via TimelineHelper
- Filter operations via FilterHelper
- Date display via DateDisplayHelper

### AddEventPage

Page object for the add event form with FormHelper and AssertionHelper integration.

**Key Features:**
- Form field filling and clearing
- Form submission with success/error verification
- Validation error checking
- Preview updates verification
- Accessibility verification

### EditEventPage & RecordedDatesPage

Similar structure to AddEventPage but for editing existing events and managing recorded dates list.

## Test Data Management

### TestDataManager (Fixture)

Centralized test data management with factory methods and storage utilities.

**Key Features:**
- Event data factory methods
- Storage manipulation (add, remove, clear)
- Data validation and consistency checks
- Test data isolation between tests

**Usage Examples:**
```typescript
// Create test event
const event = testData.factory.createEvent({
  name: 'John Doe',
  gregorianDate: Temporal.PlainDate.from('2000-06-15'),
  relationship: 'Friend'
})

// Add to storage
await testData.addEventToStorage(event)

// Get storage data
const storedEvents = await testData.getStorageData()

// Clear all data
await testData.clearStorage()
```

## Best Practices

### When to Use Helpers vs Page Objects

**Use Helpers when:**
- Logic is complex and reusable across multiple pages
- Verification patterns are consistent
- Encapsulating business logic separate from UI interactions
- Creating utility functions for common operations

**Use Page Objects when:**
- Defining page-specific navigation and basic interactions
- Managing page-specific element locators
- Coordinating multiple helpers for complex workflows
- Providing high-level, descriptive method names

### Test Organization

**File Structure:**
- Keep tests in `e2e/tests/core/` for main functionality
- Use descriptive test file names (e.g., `add-event-comprehensive.spec.ts`)
- Group related tests in the same file

**Test Patterns:**
- Use `describe` blocks to group related tests
- Use `beforeEach` for common setup
- Use fixtures for test data management
- Use descriptive test names that explain the scenario

### Error Handling

**Consistent Error Messages:**
- Include context about what failed
- Show expected vs actual values
- Provide actionable error information

**Timeouts:**
- Use appropriate timeouts for different operations
- Balance reliability with test speed
- Use polling for dynamic content

### Selectors

**Selector Strategy:**
- Prefer `data-testid` attributes for reliable selection
- Use semantic selectors (role, label) when testids aren't available
- Avoid CSS selectors that may change with styling updates
- Centralize selectors in `Selectors.ts` for consistency

## Examples

### Complete Test Scenario

```typescript
import { test } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { AddEventPage } from '../pages/AddEventPage'

test('add new birthday event', async ({ page, testData }) => {
  // Navigate to home page
  const homePage = new HomePage(page)
  await homePage.goto()

  // Navigate to add event page
  await homePage.navigateToAddEvent()

  // Fill and submit event
  const addPage = new AddEventPage(page)
  const eventData = testData.factory.createEvent({
    name: 'Alice Smith',
    gregorianDate: Temporal.PlainDate.from('1995-03-20'),
    relationship: 'Sister'
  })

  await addPage.addEvent(eventData)

  // Verify event appears on home page
  await homePage.verifyEventExists(eventData)
  await homePage.verifyEventInSection('This Month', eventData.name)
})
```

### Helper Integration Example

```typescript
// Using multiple helpers in a page object method
async verifyEventInTimeline(eventName: string, sectionName?: string): Promise<void> {
  // Use TimelineHelper for section-specific logic
  if (sectionName) {
    await this.timelineHelper.verifyEventInSection(sectionName, eventName)
  } else {
    // Use AssertionHelper for general verification
    await AssertionHelper.assertEventInTimeline(this.page, eventName)
  }
}
```

This architecture provides a solid foundation for maintainable, scalable E2E tests that can easily adapt to application changes while providing clear separation of concerns and comprehensive documentation.
