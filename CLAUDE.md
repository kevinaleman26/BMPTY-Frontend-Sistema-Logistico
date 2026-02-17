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
│   ├── api/                # API routes (Next.js Route Handlers)
│   │   ├── cliente/
│   │   └── operador/
│   └── providers.js        # React Query provider wrapper
├── components/
│   ├── Dashboard/          # Role-specific dashboards (SuperAdmin, Admin, Operador, Cliente)
│   ├── Table/              # DataGrid tables with filters and pagination
│   ├── Modal/              # Formik-based modals for CRUD operations
│   │   ├── ClienteDetailModal.js    # Cliente details with packages/invoices
│   │   ├── SucursalDetailModal.js   # Sucursal details with packages
│   │   ├── PaqueteTimelineModal.js  # Package chronology modal
│   │   └── ...
│   ├── Timeline/           # Timeline visualization components
│   │   └── PaqueteTimeline.js       # Visual package chronology with events
│   ├── Card/               # Card components
│   │   └── SucursalDebtCard.js      # Shows inter-branch debt
│   ├── Menu/               # Role-based navigation menus
│   ├── Form/               # Reusable form components
│   ├── Dropdown/           # Dropdown components (Sucursal, TipoDocumento, Role)
│   ├── PDF/                # PDF generation components
│   └── ProtectedRoute.js   # Auth guard component
├── hooks/
│   ├── useSession.js       # Custom session management hook
│   ├── use[Entity].js      # Data fetching hooks (useClientes, usePaquetes, etc.)
│   ├── useMutate[Entity].js # Mutation hooks for create/update operations
│   ├── useClientePackages.js  # Fetch client packages and invoices
│   ├── usePaqueteTimeline.js  # Fetch package chronology
│   └── useSucursalPackages.js # Fetch branch packages
├── lib/
│   ├── supabase.js         # Client-side Supabase client
│   └── supabaseAdmin.js    # Server-side admin Supabase client
├── services/
│   └── authService.js      # Authentication service functions
└── styles/
    └── tokens.js           # Design system tokens (colors, spacing, etc.)
```

## Key Architectural Patterns

### Authentication & Authorization

- **4 User Roles**: SuperAdmin (id: 1), Admin (id: 2), Operador (id: 3), Cliente (id: 4)
- **Session Management**: `useSession` hook fetches user data from either `cliente` or `operador` table based on auth user ID
- **Protected Routes**: All routes under `(privado)` are wrapped with `ProtectedRoute` component
- **Role-based Navigation**: Different menu components render based on `session.role.id` in layout.js:47-52

#### Detailed Role Permissions

**SuperAdmin (role_id: 1) - System-wide access:**
- Access: All modules (Sucursales, Operadores, Clientes, Paquetes, Transferencias, Deudas, Facturación)
- Scope: ALL data across ALL branches
- Query restriction: None - sees everything
- Can: Create/edit/delete all entities, manage all branches, view all reports
- Menu: 8 items (Dashboard, Sucursales, Operadores, Clientes, Transferencias, Deudas, Facturación, Paquetes)

**Admin (role_id: 2) - Branch administrator:**
- Access: Operadores, Clientes, Paquetes, Facturación
- Scope: ONLY their branch (`sucursal_id = session.sucursal.id`)
- Query restriction: `if (session.role.id !== 1) query = query.eq("sucursal_id", session.sucursal.id)`
- Can: Manage operators and clients in their branch, create invoices, register packages
- Cannot: View other branches, create transfers, manage branch settings
- Menu: 5 items (Dashboard, Operadores, Clientes, Paquetes, Facturación)

**Operador (role_id: 3) - Branch employee:**
- Access: Clientes (read-only), Paquetes, Facturación (limited)
- Scope: ONLY their branch (`sucursal_id = session.sucursal.id`)
- Query restriction: Same as Admin but with read-only restrictions
- Can: Register packages, create invoices, mark as delivered (registers their ID), view clients
- Cannot: Create/edit clients, create/edit operators, manage branch data
- Menu: 4 items (Dashboard, Clientes, Paquetes, Facturación)

**Cliente (role_id: 4) - End customer:**
- Access: Paquetes (own only), Facturación (own only)
- Scope: ONLY their own data (`cliente_id = session.id`)
- Query restriction: `query = query.eq("cliente_id", session.id)`
- Can: View their packages, view their invoices, download PDFs, see timeline of their packages
- Cannot: Create/edit anything, view other clients' data
- Menu: 3 items (Dashboard, Paquetes, Facturación)

#### Permission Matrix by Module

| Module | SuperAdmin | Admin | Operador | Cliente |
|--------|-----------|-------|----------|---------|
| **Sucursales** | CRUD | ❌ | ❌ | ❌ |
| **Operadores** | CRUD all branches | CRUD own branch | ❌ | ❌ |
| **Clientes** | CRUD all branches | CRUD own branch | Read own branch | ❌ |
| **Paquetes** | CRUD all | CRUD own branch | CRUD own branch | Read own only |
| **Transferencias** | CRUD all | ❌ | ❌ | ❌ |
| **Deudas** | View all | ❌ | ❌ | ❌ |
| **Facturación** | CRUD all branches | CRUD own branch | Create + mark delivered | Read own only |
| **Timeline** | View all | View own branch | View own branch | View own packages |

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

   **CRITICAL: MUI DataGrid Column Configuration**
   - **ALL columns with `renderCell` MUST include these properties:**
     ```javascript
     {
         field: 'column_name',
         headerName: 'Column Name',
         sortable: false,          // REQUIRED
         filterable: false,        // REQUIRED
         disableColumnMenu: true,  // REQUIRED
         renderCell: (params) => (...)
     }
     ```
   - **Flex columns:** Always add `minWidth` to prevent collapsing (e.g., `flex: 1, minWidth: 150`)
   - **Common use cases:** Status chips, action buttons, formatted dates, reference lookups
   - See detailed documentation in project memory: `mui-datagrid-patterns.md`

   **CRITICAL: Custom Checkbox Pattern**
   - **NEVER use `checkboxSelection` prop** - it has a critical bug in MUI X DataGrid 8.27.x
   - **ALWAYS use custom checkbox column** - see reference implementation in `SucursalTable/index.js`
   - Pattern includes:
     * Custom checkbox column as FIRST column
     * `handleSelectAll` and `handleSelectOne` callbacks
     * Selection counter indicator
     * Themed checkboxes (#f4b223)
   - See complete guide: `.claude/memory/custom-checkbox-pattern.md`

2. **Modals**:
   - Formik + Yup for form management and validation
   - Dual-mode: create (no initial data) vs edit (with cliente/operador object)
   - Disable certain fields during edit (e.g., document_type, document)
   - Password fields only required for creation

3. **Dashboards**:
   - Role-specific dashboard components
   - Display metrics, tables, and role-appropriate data
   - Each role has a separate dashboard implementation

4. **Timeline Component** (`PaqueteTimeline.js`):
   - Visual chronology of package lifecycle
   - 6 event types with unique icons and colors:
     * INGRESO (green, AddBoxIcon)
     * TRANSFERENCIA_ENVIADA (blue, LocalShippingIcon)
     * TRANSFERENCIA_RECIBIDA (green, CheckCircleIcon)
     * FACTURADO (yellow #f4b223, ReceiptIcon)
     * ENTREGADO (purple, PersonIcon)
     * TRANSFERENCIA_CANCELADA (red, CancelIcon)
   - Vertical layout with connecting lines and gradients
   - Displays: timestamp, branch, operator, client, invoice #
   - Industrial design with hover effects and color-coded shadows

5. **Detail Modals**:
   - `ClienteDetailModal`: Shows client info, payment summary, and accordions for:
     * Facturas: Paid vs Unpaid invoices with totals
     * Paquetes: Delivered vs Pending packages with timeline access
   - `SucursalDetailModal`: Shows branch info and packages by status
   - `PaqueteTimelineModal`: Wrapper for timeline component

6. **Debt Tracking**:
   - `SucursalDebtCard`: Displays inter-branch debt in transfer modal
   - Real-time debt calculation based on transferred package values
   - Shown when creating transfers to help track financial obligations

### Styling Conventions

- **Industrial Dark Theme**:
  - Main bg: `#000`
  - Cards: `#111`
  - Headers: `#222`
  - Borders: `#444`
  - Accent: `#f4b223` (yellow/gold)
- **Design Tokens** (`src/styles/tokens.js`):
  - Centralized color system (text.primary, text.secondary, text.muted, etc.)
  - Surface colors (surface.base, surface.elevated)
  - Border colors (border.subtle, border.soft)
- **Typography**:
  - Primary: System fonts
  - Monospace: JetBrains Mono for codes and timestamps
- **Glassmorphism**: Semi-transparent backgrounds with backdrop-blur
- **Sidebar**: Consistent 260px width (drawerWidth constant)
- **MUI Customization**: All styling via sx prop for consistency

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

## Key Features & Modules

### 1. Package Chronology System (Timeline)

**Purpose**: Complete audit trail of package lifecycle from entry to delivery.

**How it works**:
- Automatic event logging via database triggers
- Captures operator, timestamp, branch, and client for each event
- Visual timeline component shows complete history

**Event Types**:
1. **INGRESO**: Package registered in system
2. **TRANSFERENCIA_ENVIADA**: Package sent to another branch
3. **TRANSFERENCIA_RECIBIDA**: Package received at destination branch
4. **FACTURADO**: Package invoiced to client
5. **ENTREGADO**: Package delivered to client
6. **TRANSFERENCIA_CANCELADA**: Transfer cancelled

**User Experience**:
- Click eye icon on any client in Clientes module
- View accordions with Facturas and Paquetes
- Click timeline icon (📈) next to package code
- See complete chronology in visual timeline modal

**Technical Implementation**:
- Database: `paquete_evento` table + 5 triggers
- RPC: `obtener_cronologia_paquete(codigo)`
- Frontend: `PaqueteTimeline.js` + `PaqueteTimelineModal.js`
- Hooks: `usePaqueteTimeline.js`

### 2. Inter-Branch Debt Management

**Business Logic**:
When Branch A transfers packages to Branch B:
- B receives packages and invoices clients
- B collects payment from clients
- B owes money to A (A paid the original provider)

**Features**:
- Automatic debt calculation based on package weight × tarifa
- Real-time debt display in transfer creation modal
- Payment status tracking on transfers
- Debt card shows: "Sucursal [Name] debe: $X.XX"

**Components**:
- `SucursalDebtCard.js`: Displays current debt
- Shown in `TransferenciaModal.js` when receptor branch is selected

**Database**:
- `transferencia_sucursal.total`: Transfer value
- `transferencia_sucursal.payment_status`: Debt paid/unpaid

### 3. Client Detail Modal

**Features**:
- Complete client information
- Payment summary cards (Total Paid / Total Unpaid)
- Two accordions:
  * **Facturas**: Tables for paid and unpaid invoices with totals
  * **Paquetes**: Tables for delivered and pending packages
- Timeline access: Click 📈 icon on any package code

**Component**: `ClienteDetailModal.js`
**Hook**: `useClientePackages.js` (aggregates invoices and packages)

### 4. Branch Detail Modal

**Features**:
- Branch information
- Packages currently in branch by status
- Similar accordion structure to client modal

**Component**: `SucursalDetailModal.js`
**Hook**: `useSucursalPackages.js`

## Role-Based Access Control (RBAC)

### Code-Level Permission Checks

#### Query Restrictions
All data fetching hooks implement role-based filtering:

```javascript
// Pattern used in useFacturas.js, useClientes.js, useTransferencias.js, useOperadores.js
if (session.role.id !== 1) {
    query = query.eq("sucursal_id", session.sucursal.id)
}
// SuperAdmin (id: 1) bypasses restriction, others see only their branch
```

#### Menu Rendering
Menu components are selected based on role:

```javascript
// In layout.js:47-52
{session?.role?.id === 1 && <SuperAdminMenu />}
{session?.role?.id === 2 && <AdminMenu />}
{session?.role?.id === 3 && <OperadorMenu />}
{session?.role?.id === 4 && <ClienteMenu />}
```

### Permission Implementation Details

#### SuperAdmin (role_id: 1)
**Menu Items**: Dashboard, Sucursales, Operadores, Clientes, Transferencias, Deudas, Facturación, Paquetes

**Data Access**:
- No query restrictions - `session.role.id !== 1` check bypasses all filters
- Sees all branches, all operators, all clients, all packages, all invoices
- Full CRUD on all entities

**Special Capabilities**:
- Create/edit/delete branches
- Assign operators to any branch
- View inter-branch debts
- Create transfers between any branches
- Access system-wide analytics

#### Admin (role_id: 2)
**Menu Items**: Dashboard, Operadores, Clientes, Paquetes, Facturación

**Data Access**:
- Branch-restricted: `query.eq("sucursal_id", session.sucursal.id)`
- Sees only operators, clients, packages, invoices from their branch
- Cannot see data from other branches

**Capabilities**:
- Create operators for their branch (role: Operador only, not Admin)
- Full CRUD on clients in their branch
- Register packages in their branch
- Create and manage invoices for their branch
- View package timeline for their branch

**Restrictions**:
- Cannot create/edit branches
- Cannot create transfers (no access to Transferencias module)
- Cannot view inter-branch debts
- Cannot promote operators to Admin role

#### Operador (role_id: 3)
**Menu Items**: Dashboard, Clientes, Paquetes, Facturación

**Data Access**:
- Branch-restricted: `query.eq("sucursal_id", session.sucursal.id)`
- Read-only access to clients
- Full access to packages in their branch
- Limited access to invoices (can create and mark delivered)

**Capabilities**:
- View client list and details (read-only)
- Register new packages (records their ID as operador_registro_id)
- Create invoices
- Mark invoices as delivered (records their ID as operador_entrega_id)
- View package timeline

**Restrictions**:
- Cannot create/edit clients
- Cannot create/edit operators
- Cannot change invoice payment status (only delivery)
- Cannot access Transferencias module

#### Cliente (role_id: 4)
**Menu Items**: Dashboard, Paquetes, Facturación

**Data Access**:
- Self-restricted: `query.eq("cliente_id", session.id)`
- Only sees their own packages and invoices
- No access to other clients' data

**Capabilities**:
- View their packages with status
- View package timeline (their packages only)
- View their invoices (paid/unpaid)
- Download PDF of their invoices
- Filter by status and date

**Restrictions**:
- Cannot create/edit anything
- Read-only access to all modules
- Cannot see other clients' data
- No access to operators, branches, or transfers

### Operator Tracking in Chronology System

When operators perform actions, their ID is automatically recorded:

| Action | Table | Column | Trigger/Manual |
|--------|-------|--------|----------------|
| Register package | proveedor_paquetes | operador_registro_id | Manual (from session) |
| Create transfer | transferencia_sucursal | operador_emisor_id | Manual (from session) |
| Receive transfer | transferencia_sucursal | operador_receptor_id | Manual (on status change) |
| Create invoice | factura | operador_factura_id | Manual (from session) |
| Mark delivered | factura | operador_entrega_id | Manual (on status change) |
| All events | paquete_evento | operador_id | Automatic (via triggers) |

This creates a complete audit trail of who did what and when.

## Database Schema Notes

### Core Tables
- `cliente` table: Stores customer data, uses auth user ID as primary key
- `operador` table: Stores operator data, references `sucursal` and `role` tables
- `sucursal` table: Branch/location data, contains `tasa` (rate) field used for pricing
- `proveedor_paquetes` table: Package tracking with dimensions, weight, price
- `factura` table: Invoice records with payment/delivery status
- `transferencia_sucursal` table: Branch transfer records
- `solicitud_paquete` table: Links packages to transfers
- `factura_detalle` table: Links packages to invoices

### Package Chronology System (Audit Trail)

#### paquete_evento table
Stores all lifecycle events for each package:
- `id`: BIGSERIAL primary key
- `paquete_id`: Package tracking code (references proveedor_paquetes.codigo)
- `evento_tipo`: Event type (INGRESO, TRANSFERENCIA_ENVIADA, TRANSFERENCIA_RECIBIDA, FACTURADO, ENTREGADO, TRANSFERENCIA_CANCELADA)
- `sucursal_id`: Branch where event occurred
- `operador_id`: Operator who performed the action
- `cliente_id`: Client involved (for invoicing/delivery events)
- `transferencia_id`: Related transfer (if applicable)
- `factura_id`: Related invoice (if applicable)
- `detalles`: JSONB field for additional event-specific data
- `created_at`: Timestamp of the event

#### Operator Tracking Columns
Added to existing tables for audit trail:
- `proveedor_paquetes`: created_at, sucursal_origen_id, operador_registro_id
- `transferencia_sucursal`: operador_emisor_id, operador_receptor_id, received_at
- `factura`: operador_factura_id, operador_entrega_id, delivery_date
- `solicitud_paquete`: created_at
- `factura_detalle`: created_at

#### Automatic Event Registration (Triggers)
5 triggers automatically log events:
1. `trg_paquete_ingreso`: Fires on INSERT to proveedor_paquetes
2. `trg_transferencia_enviada`: Fires on INSERT to solicitud_paquete
3. `trg_transferencia_recibida`: Fires on UPDATE to transferencia_sucursal (delivery_status change)
4. `trg_paquete_facturado`: Fires on INSERT to factura_detalle
5. `trg_paquete_entregado`: Fires on UPDATE to factura (delivery_status change)

#### RPC Functions
- `registrar_evento_paquete(...)`: Manually register an event (used by triggers)
- `obtener_cronologia_paquete(p_paquete_id TEXT)`: Returns complete chronological timeline with joined data (sucursal name, operador name, cliente name)

### Inter-Branch Debt System

When Sucursal A transfers packages to Sucursal B, and B invoices/collects from clients, B owes money to A. The system tracks:
- `transferencia_sucursal.total`: Calculated total value of transferred packages
- `transferencia_sucursal.payment_status`: Whether receiving branch has paid sending branch
- `SucursalDebtCard` component displays current debt when creating transfers

## Database Migrations

Located in `supabase/migrations/`:

### 20260205_add_total_to_transferencias.sql
- Adds `total` column to transferencia_sucursal
- Implements inter-branch debt tracking

### 20260216_add_package_timeline.sql
**Major migration - Package Chronology System**

Creates:
- `paquete_evento` table with indexes
- 5 triggers for automatic event logging
- 2 RPC functions (registrar_evento_paquete, obtener_cronologia_paquete)
- New audit columns in existing tables
- Backfill script for historical INGRESO events (781 packages)
- Grants permissions to authenticated users

Steps: 7 major sections, ~450 lines of SQL

### 20260216_fix_obtener_cronologia_function.sql
**Fix migration**
- Corrects return types in obtener_cronologia_paquete function
- Adds explicit `::TEXT` casts for VARCHAR columns
- Fixes "structure of query does not match function result type" error

### Applying Migrations

**Via Supabase Dashboard** (Recommended):
1. Go to SQL Editor in Supabase Dashboard
2. Copy migration file content
3. Execute

**Via Supabase CLI**:
```bash
npx supabase link --project-ref iidnphzcihsdjplgcnqo
npx supabase db push
```

See `INSTRUCCIONES_MIGRACION.md` and `SETUP_SUPABASE_CLI.md` for detailed instructions.

### Migration Verification

Run queries in `VERIFICACION_MIGRACION.sql` to verify:
- Tables exist
- Triggers are active
- Functions are created
- Indexes are present
- Permissions are granted
- Summary query shows OK/FALTA status for each component
