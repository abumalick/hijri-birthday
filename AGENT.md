# AGENT instructions

## Package Management
- Use `bun` as the package manager for all commands (install, run, test, etc.)

## Development Server
- Server typically runs at `http://localhost:3000`, when I am working on the app it usually runs in the background. You don't need to start it manually unless specified.

## Documentation Loading Requirements

Load relevant documentation from Context7 MCP before starting work on specific areas:

### UI/Styling Tasks
- **Tailwind CSS** - Load before any styling or CSS-related work
- **DaisyUI** - Load before using DaisyUI components or themes

### Routing Tasks
- **TanStack Router** - Load before working on routing, navigation, or route-related components

### Testing Tasks
- **Playwright** - Load before writing or modifying e2e tests
- **Vitest** (if needed) - Load before working on unit tests

### Build/Deployment Tasks
- **Vite** - Load before modifying build configuration or optimization
- **Cloudflare Workers** (if deploying) - Load before working on deployment or edge functions

**Note:** Always load documentation for the primary technology being worked on, even if not explicitly listed above.

## File Organization Principles

### Route-Specific vs Shared Resources

**Route-Specific Resources** (use co-location):
- Components used by only ONE route
- Hooks used by only ONE route
- Utilities used by only ONE route

**Shared Resources** (use global directories):
- Components used by MULTIPLE routes
- Hooks used by MULTIPLE routes
- Utilities used by MULTIPLE routes
- Layout components
- UI primitives (buttons, badges, etc.)

### Directory Structure

#### Route-Specific Resources
Place near their route using these naming conventions:
- `src/routes/[route-name]/-components/` - Route-specific components
- `src/routes/[route-name]/-hooks/` - Route-specific hooks
- `src/routes/[route-name]/-utils.ts` - Route-specific utilities (single file)

**Important:** When a route has route-specific resources (components, hooks, or utilities), the route file should be moved inside the folder and named `index.tsx`:
- `src/routes/[route-name]/index.tsx` - The route component file
- `src/routes/[route-name]/-components/` - Route-specific components
- `src/routes/[route-name]/-hooks/` - Route-specific hooks

#### Shared Resources
Place in global directories:
- `src/components/` - Shared components
- `src/hooks/` - Shared hooks
- `src/utils/` - Shared utilities

#### Examples

```
src/
├── components/           # Shared components
│   ├── Layout.tsx
│   ├── CalendarBadge.tsx
│   └── icons/
├── hooks/               # Shared hooks
├── utils/               # Shared utilities
│   └── dates.ts
├── routes/
│   ├── index.tsx
│   ├── recorded.tsx
│   ├── recorded/
│   │   ├── -components/
│   │   │   ├── RecordedDatesControls.tsx
│   │   │   └── RecordedDateCard.tsx
│   │   └── -hooks/
│   │       └── useRecordedDates.ts
│   └── dashboard/
│       ├── -components/
│       │   └── DashboardStats.tsx
│       └── -utils.ts
└── services/            # Shared services
```

## Asset Organization
- Place SVG icons in separate JSX files in `src/components/icons/`
- Export all icons from `src/components/icons/index.ts`

## Testing Requirements
- Write unit tests for all utility functions
- Write e2e tests for main application flows using Playwright
- Place tests near the code they test when possible

## Instructions while working on tests
- Please only run the tests that you are working on, do not run all tests at once.

## Quality Assurance Before Task Completion
Before wrapping up any task, always run the following commands and fix all issues:
- `bun run lint` - Fix all linting errors and warnings
- `bun run test` - Ensure all tests pass

Do not consider a task complete until both commands run successfully without errors.

## Decision Criteria

**Move to route-specific location when:**
- Component/hook/utility is used by only one route
- Component/hook/utility contains route-specific business logic
- Component/hook/utility is tightly coupled to a specific route's data

**Keep in shared location when:**
- Component/hook/utility is used by multiple routes
- Component/hook/utility provides general-purpose functionality
- Component/hook/utility is a UI primitive or layout component
