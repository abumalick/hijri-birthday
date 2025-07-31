# TanStack Router Instructions

TanStack Router is a fully type-safe React router with built-in caching, 1st-class search-param APIs, client-side cache integration and isomorphic rendering.

## Core Concepts

### Router Configuration
- Use [`createRouter()`](https://tanstack.com/router/latest/docs/framework/react/api/router/createRouterFunction) to create a router instance
- Configure with route tree and other options
- Router should be created outside of React components

### Route Tree
- Routes are organized in a tree structure
- Use file-based routing with route files
- Route files should export route definitions using [`createFileRoute()`](https://tanstack.com/router/latest/docs/framework/react/api/router/createFileRouteFunction)

## File-Based Routing

### Route File Naming Conventions

#### Directory Structure Mapping
```
Filename/Directory          | Route Path              | Component Output
---------------------------|-------------------------|------------------
__root.tsx                 |                         | <Root>
index.tsx                  | / (exact)               | <Root><RootIndex>
about.tsx                  | /about                  | <Root><About>
posts.tsx                  | /posts                  | <Root><Posts>
posts/index.tsx            | /posts (exact)          | <Root><Posts><PostsIndex>
posts/$postId.tsx          | /posts/$postId          | <Root><Posts><Post>
posts_/$postId/edit.tsx    | /posts/$postId/edit     | <Root><EditPost>
settings.tsx               | /settings               | <Root><Settings>
settings/profile.tsx       | /settings/profile       | <Root><Settings><Profile>
_pathlessLayout.tsx        |                         | <Root><PathlessLayout>
_pathlessLayout/route-a.tsx| /route-a               | <Root><PathlessLayout><RouteA>
files/$.tsx                | /files/$                | <Root><Files>
account/route.tsx          | /account                | <Root><Account>
```

#### Flat Routing (Dot Notation)
```typescript
// Flat routing examples
__root.tsx                 // Root route
index.tsx                  // / route
about.tsx                  // /about route
posts.tsx                  // /posts route
posts.index.tsx            // /posts (exact) route
posts.$postId.tsx          // /posts/$postId route
posts_.$postId.edit.tsx    // /posts/$postId/edit route
settings.profile.tsx       // /settings/profile route
_pathlessLayout.route-a.tsx // /route-a route (with pathless layout)
```

### Configuration Options

#### Basic Configuration
```json
{
  "routesDirectory": "./src/routes",
  "generatedRouteTree": "./src/routeTree.gen.ts"
}
```

#### Advanced Configuration
```typescript
// File-based routing configuration options
{
  routesDirectory: "./src/routes",           // Required: Route files directory
  generatedRouteTree: "./src/routeTree.gen.ts", // Required: Generated route tree output
  routeFilePrefix: "",                       // Prefix for route files
  routeFileIgnorePrefix: "-",                // Prefix to ignore files/directories
  routeFileIgnorePattern: undefined,         // Regex pattern to ignore files
  indexToken: "index",                       // Token for index routes
  routeToken: "route",                       // Token for layout routes
  quoteStyle: "single",                      // Quote style for generated files
  semicolons: false,                         // Use semicolons in generated files
  apiBase: undefined,                        // Base URL for API routes
  autoCodeSplitting: false,                  // Enable automatic code splitting
  disableTypes: false,                       // Disable TypeScript generation
  addExtensions: false,                      // Add file extensions to imports
  disableLogging: false,                     // Disable logging messages
  enableRouteTreeFormatting: true,           // Enable formatting for route tree
}
```

### Vite Plugin Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react', // or 'solid'
      autoCodeSplitting: true,
    }),
    // ... other plugins
  ],
})
```

## Route Definition

### Basic Route Creation
```typescript
// Using createFileRoute (recommended for file-based routing)
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  return <div>Post ID: {postId}</div>
}
```

### Route with Loader
```typescript
import { createFileRoute } from '@tanstack/react-router'

async function fetchPost(postId: string) {
  // Fetch post data
  return { id: postId, title: 'Post Title', content: 'Post content' }
}

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => fetchPost(params.postId),
  component: PostComponent,
})

function PostComponent() {
  const post = Route.useLoaderData()
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  )
}
```

### Route with Search Params
```typescript
import { createFileRoute } from '@tanstack/react-router'

type ProductSearch = {
  page: number
  filter: string
  sort: 'newest' | 'oldest' | 'price'
}

export const Route = createFileRoute('/shop/products')({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    page: Number(search?.page ?? 1),
    filter: (search.filter as string) || '',
    sort: (search.sort as ProductSearch['sort']) || 'newest',
  }),
  component: ProductsComponent,
})

function ProductsComponent() {
  const search = Route.useSearch()
  return (
    <div>
      <p>Page: {search.page}</p>
      <p>Filter: {search.filter}</p>
      <p>Sort: {search.sort}</p>
    </div>
  )
}
```

### Route with Loader Dependencies
```typescript
import { createFileRoute } from '@tanstack/react-router'

async function getUser(userId: string) {
  return { id: userId, name: 'Example User' }
}

export const Route = createFileRoute('/users/user')({
  validateSearch: (search) => search as { userId: string },
  loaderDeps: ({ search: { userId } }) => ({ userId }),
  loader: async ({ deps: { userId } }) => getUser(userId),
  component: UserComponent,
})
```

## Navigation

### Link Component
```typescript
import { Link } from '@tanstack/react-router'

// Basic navigation
<Link to="/about">About</Link>

// Navigation with params
<Link to="/posts/$postId" params={{ postId: '123' }}>
  View Post
</Link>

// Navigation with search params
<Link
  to="/search"
  search={{ query: 'tanstack', page: 1 }}
>
  Search
</Link>

// Functional search param updates
<Link
  to="."
  search={(prev) => ({ ...prev, page: prev.page + 1 })}
>
  Next Page
</Link>
```

### Programmatic Navigation
```typescript
import { useNavigate } from '@tanstack/react-router'

function MyComponent() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({
      to: '/posts/$postId',
      params: { postId: '123' },
      search: { tab: 'comments' }
    })
  }

  return <button onClick={handleClick}>Go to Post</button>
}
```

### Type-Safe Navigation with Route References
```typescript
import { Route as aboutRoute } from './routes/about.tsx'

function Comp() {
  return <Link to={aboutRoute.to}>About</Link>
}
```

## Path Parameters

### Dynamic Parameters
```typescript
// Route: /posts/$postId
export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams() // postId: string
  return <div>Post ID: {postId}</div>
}
```

### Optional Parameters
```typescript
// Route: /posts/{-$category} (optional category parameter)
export const Route = createFileRoute('/posts/{-$category}')({
  component: PostsComponent,
})

function PostsComponent() {
  const { category } = Route.useParams() // category: string | undefined
  const categoryUpper = category?.toUpperCase()
  return <div>{categoryUpper || 'All Categories'}</div>
}

// Navigation with optional params
<Link
  to="/posts/{-$category}"
  params={{ category: 'tech' }} // ✅ Valid
>
  Tech Posts
</Link>

<Link
  to="/posts/{-$category}"
  params={{ category: undefined }} // ✅ Valid - removes param
>
  All Posts
</Link>
```

### Catch-All Parameters
```typescript
// Route: /files/$
export const Route = createFileRoute('/files/$')({
  component: FilesComponent,
})

function FilesComponent() {
  const { '*': splat } = Route.useParams() // splat: string
  return <div>File path: {splat}</div>
}
```

## Search Parameters

### Basic Search Param Validation
```typescript
import { createFileRoute } from '@tanstack/react-router'

type ProductSearch = {
  page: number
  filter: string
  sort: 'newest' | 'oldest' | 'price'
}

export const Route = createFileRoute('/shop/products')({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    page: Number(search?.page ?? 1),
    filter: (search.filter as string) || '',
    sort: (search.sort as ProductSearch['sort']) || 'newest',
  }),
  component: ProductsComponent,
})
```

### Search Param Middleware
```typescript
export const Route = createFileRoute('/shop/products')({
  validateSearch: (search) => search as ProductSearch,
  search: {
    middlewares: [
      // Transform search params
      ({ search, next }) => {
        // Apply transformations
        const transformed = { ...search, page: Math.max(1, search.page) }
        return next(transformed)
      }
    ]
  },
})
```

### Updating Search Params
```typescript
// Using Link component
<Link
  to="."
  search={(prev) => ({ ...prev, page: prev.page + 1 })}
>
  Next Page
</Link>

// Using navigate function
const navigate = useNavigate()

const handleNextPage = () => {
  navigate({
    to: '.',
    search: (prev) => ({ ...prev, page: prev.page + 1 })
  })
}
```

## Data Loading

### Basic Loader
```typescript
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await fetchPosts()
    return posts
  },
  component: PostsComponent,
})

function PostsComponent() {
  const posts = Route.useLoaderData()
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

### Loader with Dependencies
```typescript
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    return post
  },
})
```

### Loader with Search Dependencies
```typescript
export const Route = createFileRoute('/users/user')({
  validateSearch: (search) => search as { userId: string },
  loaderDeps: ({ search: { userId } }) => ({ userId }),
  loader: async ({ deps: { userId } }) => getUser(userId),
})
```

### Stale Time Configuration
```typescript
export const Route = createFileRoute('/posts')({
  loader: async () => fetchPosts(),
  staleTime: 10_000, // 10 seconds
  preloadStaleTime: 30_000, // 30 seconds for preloading
})
```

## Type Safety

### Route Hooks with Type Safety
```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
})

function PostComponent() {
  // Type-safe access to route data
  const params = Route.useParams() // Typed based on route definition
  const search = Route.useSearch() // Typed based on validateSearch

  // Type-safe navigation with context
  const navigate = useNavigate({ from: Route.fullPath })

  return <div>Post ID: {params.postId}</div>
}
```

### Narrowing Types for Performance
```typescript
// Good for TypeScript performance - narrows the scope
<Link from={Route.fullPath} to=".." search={{ page: 0 }} />
<Link from="/posts" to=".." search={{ page: 0 }} />

// Avoid - resolves against all route search params
<Link to=".." search={{ page: 0 }} />
```

### Type Utilities
```typescript
import type {
  ValidateNavigateOptions,
  ValidateLinkOptionsArray,
  ValidateFromPath
} from '@tanstack/react-router'

// Type-safe navigation options
export function useConditionalNavigate<TOptions>(
  navigateOptions: ValidateNavigateOptions<RegisteredRouter, TOptions>
) {
  const [enabled, setEnabled] = useState(false)
  const navigate = useNavigate()

  return {
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
    navigate: () => {
      if (enabled) {
        navigate(navigateOptions)
      }
    },
  }
}
```

## Route API

### RouteApi Instance
```typescript
import { getRouteApi } from '@tanstack/react-router'

// Create a route API instance
const routeApi = getRouteApi('/posts/$postId')

function PostComponent() {
  // Use route-specific hooks
  const params = routeApi.useParams()
  const search = routeApi.useSearch()
  const loaderData = routeApi.useLoaderData()
  const navigate = routeApi.useNavigate()

  return <div>Post: {params.postId}</div>
}
```

### Available RouteApi Methods
```typescript
// RouteApi provides these type-safe methods:
routeApi.useParams()        // Access path parameters
routeApi.useSearch()        // Access search parameters
routeApi.useLoaderData()    // Access loader data
routeApi.useLoaderDeps()    // Access loader dependencies
routeApi.useNavigate()      // Get navigation function
```

## Code Splitting

### Automatic Code Splitting
```typescript
// Enable in Vite plugin
tanstackRouter({
  autoCodeSplitting: true,
})

// Or in configuration
{
  autoCodeSplitting: true
}
```

### Manual Code Splitting
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const LazyComponent = lazy(() => import('./LazyComponent'))

export const Route = createFileRoute('/lazy')({
  component: LazyComponent,
})
```

## Error Handling

### Route-Level Error Boundaries
```typescript
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    if (!post) {
      throw new Error('Post not found')
    }
    return post
  },
  errorComponent: ({ error }) => (
    <div>Error loading post: {error.message}</div>
  ),
  component: PostComponent,
})
```

### Global Error Handling
```typescript
// In __root.tsx
export const Route = createRootRoute({
  errorComponent: ({ error }) => (
    <div>
      <h1>Something went wrong!</h1>
      <pre>{error.message}</pre>
    </div>
  ),
})
```

## Best Practices

### File Organization
```
src/
├── routes/
│   ├── __root.tsx          # Root route
│   ├── index.tsx           # Home page
│   ├── about.tsx           # About page
│   ├── posts/              # Posts section
│   │   ├── index.tsx       # Posts list
│   │   ├── $postId.tsx     # Individual post
│   │   └── create.tsx      # Create post
│   └── settings/           # Settings section
│       ├── profile.tsx     # Profile settings
│       └── account.tsx     # Account settings
├── components/             # Reusable components
├── services/              # API services
└── routeTree.gen.ts       # Generated route tree
```

### Type Safety Guidelines
1. Always use [`createFileRoute()`](https://tanstack.com/router/latest/docs/framework/react/api/router/createFileRouteFunction) for route definitions
2. Define search param schemas with [`validateSearch`](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#validatesearch)
3. Use route-specific hooks ([`Route.useParams()`](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteApiType#useparams)) for type safety
4. Provide [`from`](https://tanstack.com/router/latest/docs/framework/react/guide/navigation#the-tooptions-interface) prop in [`Link`](https://tanstack.com/router/latest/docs/framework/react/api/router/LinkComponent) components for better TypeScript performance

### Performance Optimization
1. Use [`staleTime`](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#staletime) to cache loader data
2. Enable [`autoCodeSplitting`](https://tanstack.com/router/latest/docs/router/api/file-based-routing#autocodesplitting) for better bundle sizes
3. Use [`preloadStaleTime`](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#preloadstaletime) for preloading optimization
4. Narrow route types with [`from`](https://tanstack.com/router/latest/docs/framework/react/guide/navigation#the-tooptions-interface) prop to improve TypeScript performance

### Search Param Patterns
1. Always validate search params with [`validateSearch`](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#validatesearch)
2. Use functional updates for search param modifications
3. Inherit search params from parent routes when needed
4. Use [`loaderDeps`](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType#loaderdeps) to tie search params to data loading

### Navigation Patterns
1. Use [`Link`](https://tanstack.com/router/latest/docs/framework/react/api/router/LinkComponent) component for declarative navigation
2. Use [`useNavigate`](https://tanstack.com/router/latest/docs/framework/react/api/router/useNavigateHook) hook for programmatic navigation
3. Provide type context with [`from`](https://tanstack.com/router/latest/docs/framework/react/guide/navigation#the-tooptions-interface) prop for better type inference
4. Use route references for type-safe navigation targets

## Common Patterns

### Layout Routes
```typescript
// _layout.tsx - Pathless layout route
export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div>
      <nav>Navigation</nav>
      <Outlet /> {/* Child routes render here */}
    </div>
  )
}
```

### Protected Routes
```typescript
export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardComponent,
})
```

### Search with Pagination
```typescript
type SearchParams = {
  page: number
  query: string
  sort: 'date' | 'relevance'
}

export const Route = createFileRoute('/search')({
  validateSearch: (search): SearchParams => ({
    page: Number(search.page) || 1,
    query: (search.query as string) || '',
    sort: (search.sort as SearchParams['sort']) || 'relevance',
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => searchResults(deps),
  component: SearchComponent,
})

function SearchComponent() {
  const search = Route.useSearch()

  return (
    <div>
      <Link
        to="."
        search={(prev) => ({ ...prev, page: prev.page + 1 })}
      >
        Next Page
      </Link>
    </div>
  )
}
```

This documentation covers the essential concepts and patterns for using TanStack Router effectively with full type safety and modern React development practices.
