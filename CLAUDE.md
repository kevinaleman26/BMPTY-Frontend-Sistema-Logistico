# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a logistics management system (Sistema Logístico BMPTY) built with Next.js 16, using Supabase for authentication and data management. The system handles package tracking, invoicing, branch transfers, and multi-role user management for a logistics company.

## Development Commands

```bash
# Development server (starts on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Material-UI (MUI) v7 with DataGrid
- **Authentication/Database**: Supabase (v2)
- **State Management**: TanStack Query (React Query v5) for server state
- **Forms**: Formik + Yup validation
- **PDF Generation**: @react-pdf/renderer
- **HTTP Client**: Axios

### Project Structure

```
src/
├── app/
│   ├── (publico)/          # Public routes (login, registro)
│   ├── (privado)/          # Protected routes with shared layout
│   │   ├── layout.js       # Main layout with sidebar, navbar, role-based menu
│   │   ├── dashboard/
│   │   ├── cliente/
│   │   ├── operador/
│   │   ├── sucursal/
│   │   ├── paquetes/
│   │   ├── facturacion/
│   │   └── transferencia-sucursal/
│   └── api/                # API routes (Next.js Route Handlers)
│       ├── cliente/
│       └── operador/
├── components/
│   ├── Dashboard/          # Role-specific dashboards (SuperAdmin, Admin, Operador, Cliente)
│   ├── Table/              # DataGrid tables with filters and pagination
│   ├── Modal/              # Formik-based modals for CRUD operations
│   ├── Menu/               # Role-based navigation menus
│   ├── Form/               # Reusable form components
│   ├── Dropdown/           # Dropdown components (Sucursal, TipoDocumento, Role)
│   ├── PDF/                # PDF generation components
│   └── ProtectedRoute.js   # Auth guard component
├── hooks/
│   ├── useSession.js       # Custom session management hook
│   ├── use[Entity].js      # Data fetching hooks (useClientes, usePaquetes, etc.)
│   └── useMutate[Entity].js # Mutation hooks for create/update operations
├── lib/
│   ├── supabase.js         # Client-side Supabase client
│   └── supabaseAdmin.js    # Server-side admin Supabase client
└── services/
    └── authService.js      # Authentication service functions
```

## Key Architectural Patterns

### Authentication & Authorization

- **4 User Roles**: SuperAdmin (id: 1), Admin (id: 2), Operador (id: 3), Cliente (id: 4)
- **Session Management**: `useSession` hook fetches user data from either `cliente` or `operador` table based on auth user ID
- **Protected Routes**: All routes under `(privado)` are wrapped with `ProtectedRoute` component
- **Role-based Navigation**: Different menu components render based on `session.role.id` in layout.js:47-52

### Data Layer

1. **Supabase Clients**:
   - `supabase.js`: Client-side operations (queries, auth state)
   - `supabaseAdmin.js`: Server-side operations requiring service role (user creation, admin operations)

2. **Data Fetching Pattern** (TanStack Query):
   - Query hooks: `use[Entity].js` (e.g., `useClientes`) - fetch data with filters, pagination
   - Mutation hooks: `useMutate[Entity].js` - handle create/update/delete with automatic cache invalidation
   - Server-side pagination using query params (page, limit)

3. **API Routes**:
   - Located in `src/app/api/`
   - Use `supabaseAdmin` for operations requiring elevated permissions
   - Handle both user creation in Auth and corresponding table inserts
   - Implement manual rollback for failed transactions (see cliente/create/route.js:43)

### UI/Component Patterns

1. **Tables**:
   - Use MUI DataGrid with server-side pagination
   - Paired with filter components (`[Entity]Filters.js`)
   - URL state management for filters via `useSearchParams` and `useRouter`
   - Consistent dark theme styling (#111 background, #222 headers)

2. **Modals**:
   - Formik + Yup for form management and validation
   - Dual-mode: create (no initial data) vs edit (with cliente/operador object)
   - Disable certain fields during edit (e.g., document_type, document)
   - Password fields only required for creation

3. **Dashboards**:
   - Role-specific dashboard components
   - Display metrics, tables, and role-appropriate data
   - Each role has a separate dashboard implementation

### Styling Conventions

- Dark theme throughout: `#000` (main bg), `#111` (cards), `#222` (headers), `#444` (borders)
- Text color: `#fff` for primary text
- Consistent sidebar width: 260px (drawerWidth constant)
- MUI theme customization via sx prop

## Important Development Notes

### User Creation Flow
When creating users (Cliente or Operador):
1. First create auth user via `supabaseAdmin.auth.admin.createUser()`
2. Use the returned `user.id` as the primary key in the corresponding table
3. If table insert fails, perform manual rollback by deleting the auth user
4. This ensures data consistency between Auth and database tables

### Session Management
- `useSession` distinguishes between Cliente and Operador by attempting to fetch from `cliente` table first
- Cliente users get a hardcoded role object: `{id: 4, name: 'Cliente'}`
- Operador users fetch role via join: `operador.select("*, sucursal(id, name), role(id, name)")`

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Query Key Patterns
React Query cache keys use array format:
- `['clientes']` - all clients
- `['paquetes']` - all packages
- `['facturas']` - all invoices
Always invalidate relevant queries after mutations.

### Route Groups
- `(publico)` - Public routes, separate layout for login/register
- `(privado)` - Protected routes, shared layout with sidebar navigation
- These folder names don't appear in the URL path

## Common Workflows

### Adding a New Entity
1. Create table component in `src/components/Table/[Entity]Table/`
2. Add filter component `[Entity]Filters.js`
3. Create modal in `src/components/Modal/[Entity]Modal.js`
4. Add data fetching hook: `src/hooks/use[Entity].js`
5. Add mutation hook: `src/hooks/useMutate[Entity].js`
6. If admin operations needed, create API route in `src/app/api/[entity]/`
7. Add page route in `src/app/(privado)/[entity]/page.js`
8. Update appropriate Menu component with new navigation item

### Modifying Permissions
- Check role ID in layout or page components: `session?.role?.id`
- Update corresponding Menu component (SuperAdminMenu, AdminMenu, OperadorMenu, ClienteMenu)
- Consider adding conditional rendering in dashboards

## Database Schema Notes
- `cliente` table: Stores customer data, uses auth user ID as primary key
- `operador` table: Stores operator data, references `sucursal` and `role` tables
- `sucursal` table: Branch/location data, contains `tasa` (rate) field used for pricing
- `paquete` table: Package tracking
- `factura` table: Invoice records
- `transferencia` table: Branch transfer records
