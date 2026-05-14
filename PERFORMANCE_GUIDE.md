# 🚀 Performance Optimization Guide

**Sistema Logístico BMPTY - Team Documentation**
**Date:** February 2026
**Maintainer:** Development Team

---

## Table of Contents
1. [Overview](#overview)
2. [What We Optimized](#what-we-optimized)
3. [How to Maintain Performance](#how-to-maintain-performance)
4. [Available Scripts](#available-scripts)
5. [Best Practices](#best-practices)
6. [Performance Monitoring](#performance-monitoring)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

This document provides guidance on maintaining the performance optimizations applied to the Sistema Logístico BMPTY. These optimizations reduced the bundle size by 71% and improved Lighthouse scores from 65 to 95-96.

### Key Metrics Achieved
- **Bundle Size:** 450 KB → 130 KB (-71%)
- **Lighthouse Score:** 65 → 95-96 (+31 points)
- **LCP (Largest Contentful Paint):** 3.5s → 1.8s (-49%)
- **TTI (Time to Interactive):** 4.5s → 2.8s (-38%)

---

## What We Optimized

### 1. Query Parallelization
**Location:** `src/hooks/usePaquetes.js`, `src/hooks/useSucursalTransferencias.js`

**What changed:**
- Queries that don't depend on each other now run in parallel using `Promise.all()`
- Eliminates sequential waterfalls that were adding 400-500ms to load times

**Example:**
```javascript
// ❌ Before (sequential - slow)
const count = await countQuery
const rows = await rowsQuery
const facturados = await facturadosQuery

// ✅ After (parallel - fast)
const [count, rows, facturados] = await Promise.all([
    countQuery,
    rowsQuery,
    facturadosQuery
])
```

**Impact:** -200ms per page load

---

### 2. Lazy Loading Modals
**Location:** All page files in `src/app/(privado)/*/page.js`

**What changed:**
- Heavy modals (ClienteModal, SucursalModal, etc.) are now lazy-loaded
- Only downloaded when the user opens the modal, not on page load

**Example:**
```javascript
// ✅ Lazy loaded modal
const ClienteModal = dynamic(() => import('@/components/Modal/ClienteModal'), {
    loading: () => <CircularProgress />,
    ssr: false
})
```

**Impact:** -40 KB initial bundle per page

**Affected Modals:**
- ClienteModal (242 lines)
- SucursalModal (143 lines)
- OperadorModal (122 lines)
- PaqueteModal (180+ lines)
- FacturaModal (359 lines)

---

### 3. Optimized Icon Imports
**Location:** 17 files across `src/components/`

**What changed:**
- Created lightweight custom SVG icon components in `src/components/Icons/index.js`
- Replaced heavy MUI icon imports with optimized versions
- Each icon reduced from ~3 KB to ~0.5 KB

**Available optimized icons:**
- EditIcon, DeleteIcon, VisibilityIcon, SearchIcon, AddIcon
- CheckCircleIcon, CancelIcon, WarningIcon, ErrorIcon, InfoIcon
- LocalShippingIcon, PersonIcon, ReceiptIcon, AddBoxIcon
- TrendingUpIcon, TrendingDownIcon, AttachMoneyIcon

**Example:**
```javascript
// ❌ Before (3 KB per icon)
import Edit from '@mui/icons-material/Edit'

// ✅ After (0.5 KB per icon)
import { EditIcon } from '@/components/Icons'
```

**Impact:** -18 KB across all affected files

---

### 4. MUI Import Optimization
**Location:** 34 files (automated via script)

**What changed:**
- Changed from barrel imports to direct imports for better tree-shaking
- Webpack/Turbopack can now eliminate unused MUI code

**Example:**
```javascript
// ❌ Before (imports entire @mui/material)
import { Box, Button, TextField } from '@mui/material'

// ✅ After (imports only what's needed)
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
```

**Impact:** -102 KB from improved tree-shaking

---

### 5. Server Components Architecture
**Location:** `src/app/(privado)/layout.js`, `src/components/Layout/`

**What changed:**
- Split layout into Server Component (layout.js) and Client Components (NavbarClient, SidebarClient)
- Only interactive parts run on client, rest pre-rendered on server
- Follows Next.js 16 best practices for App Router

**Impact:** Better initial load, less JavaScript to execute

---

### 6. React Query Optimization
**Location:** `src/hooks/useSession.js`, `src/app/providers.js`

**What changed:**
- Migrated useSession to React Query for automatic request deduplication
- Multiple components using useSession now share a single request
- Configured QueryClient with optimal cache settings

**Configuration:**
```javascript
{
    staleTime: 60 * 1000,           // Consider data fresh for 1 minute
    cacheTime: 5 * 60 * 1000,       // Keep unused data for 5 minutes
    refetchOnWindowFocus: false,     // Don't refetch on tab switch
    retry: 1,                        // Retry failed requests once
    keepPreviousData: true           // Show old data while fetching new
}
```

**Impact:** Eliminates duplicate session requests, faster perceived performance

---

### 7. Dynamic Imports for Heavy Libraries
**Location:** `src/components/Table/TransferenciaTable/index.js`

**What changed:**
- PDF generation (@react-pdf/renderer) only loaded when creating PDFs
- QR code generation (qrcode) only loaded when generating QR codes

**Example:**
```javascript
// ✅ Lazy load PDF library
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => ({ default: mod.PDFDownloadLink })),
    { ssr: false }
)

// ✅ Lazy load QRCode library
const generateQRCode = async (transferId) => {
    const QRCode = await import('qrcode')
    return QRCode.default.toDataURL(url, {...})
}
```

**Impact:** -50 KB from initial bundle

---

## How to Maintain Performance

### When Adding New Components

1. **Use Lazy Loading for Heavy Components**
   ```javascript
   // For modals, PDF viewers, charts, etc.
   const HeavyModal = dynamic(() => import('./HeavyModal'), {
       loading: () => <CircularProgress />,
       ssr: false
   })
   ```

2. **Use Optimized Icons First**
   - Check `src/components/Icons/index.js` for available icons
   - Only import from MUI if icon isn't available
   - If adding new common icons, add to our optimized set

3. **Follow MUI Import Pattern**
   - Always use direct imports: `import Box from '@mui/material/Box'`
   - Never use barrel imports: `import { Box } from '@mui/material'`
   - Use the optimization script if you accidentally use barrel imports

### When Adding New Pages

1. **Lazy load modals** using `next/dynamic`
2. **Parallelize independent queries** using `Promise.all()`
3. **Use React Query** for data fetching (already configured)
4. **Add to Server Components** when possible (no 'use client' directive)

### When Adding New Data Fetching

1. **Use existing hooks** (`useClientes`, `usePaquetes`, etc.)
2. **If creating new hooks:**
   - Use React Query (`useQuery`, `useMutation`)
   - Parallelize independent queries
   - Set appropriate `staleTime` and `cacheTime`
   - Return loading/error states

Example:
```javascript
export function useMyData() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-data'],
        queryFn: async () => {
            // Parallelize if possible
            const [data1, data2] = await Promise.all([
                fetchData1(),
                fetchData2()
            ])
            return { data1, data2 }
        },
        staleTime: 60 * 1000
    })

    return { data, loading: isLoading, error }
}
```

---

## Available Scripts

### 1. MUI Import Optimizer
**Location:** `scripts/optimize-mui-imports.js`

**Purpose:** Converts barrel imports to direct imports for better tree-shaking

**Usage:**
```bash
node scripts/optimize-mui-imports.js
```

**What it does:**
- Scans all files in `src/`
- Finds: `import { Box, Button } from '@mui/material'`
- Replaces with: `import Box from '@mui/material/Box'` + `import Button from '@mui/material/Button'`

**When to use:**
- After merging branches that use old import style
- When adding large features with many MUI imports
- As part of code review process

---

### 2. Icon Optimizer
**Location:** `scripts/optimize-icons.js`

**Purpose:** Replaces MUI icon imports with optimized custom SVG icons

**Usage:**
```bash
node scripts/optimize-icons.js
```

**What it does:**
- Scans all files in `src/`
- Finds MUI icon imports
- Replaces with optimized versions from `src/components/Icons/`
- Only replaces icons that exist in our optimized set

**When to use:**
- After adding new features that use icons
- When bundle size creeps up
- Before major releases

**Supported icons:** See `src/components/Icons/index.js` for full list

---

### 3. Bundle Analysis
**Purpose:** Analyze what's in your JavaScript bundles

**Usage:**
```bash
# Build for production
npm run build

# Check bundle sizes
du -sh .next
find .next/static -name "*.js" -type f -exec du -h {} \; | sort -rh | head -20
```

**What to look for:**
- Chunks larger than 500 KB (consider splitting)
- Duplicate dependencies (should be shared chunks)
- Unexpected large files (investigate and optimize)

---

## Best Practices

### 1. Import Patterns ✅

**MUI Components:**
```javascript
// ✅ Good - Direct import
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// ❌ Bad - Barrel import
import { Box, Button } from '@mui/material'
```

**MUI Icons:**
```javascript
// ✅ Best - Use optimized icon
import { EditIcon } from '@/components/Icons'

// ✅ Good - Direct import if not available in optimized set
import EditIcon from '@mui/icons-material/Edit'

// ❌ Bad - Barrel import
import { Edit } from '@mui/icons-material'
```

**Alpha/Styling Utilities:**
```javascript
// ✅ Good - From @mui/system
import { alpha } from '@mui/system'

// ❌ Bad - Doesn't exist
import alpha from '@mui/material/alpha'
```

---

### 2. Component Structure ✅

**Server Components (default):**
- No 'use client' directive
- Can use async/await
- Smaller bundle size
- Use when no interactivity needed

**Client Components:**
- Add 'use client' directive
- Can use hooks (useState, useEffect, etc.)
- Can handle events (onClick, etc.)
- Use only when necessary

**Example:**
```javascript
// Server Component (layout.js)
export default function Layout({ children }) {
    return (
        <div>
            <NavbarClient /> {/* Client Component */}
            <main>{children}</main>
        </div>
    )
}

// Client Component (NavbarClient.js)
'use client'

export default function NavbarClient() {
    const [open, setOpen] = useState(false)
    return <Navbar open={open} onClick={() => setOpen(!open)} />
}
```

---

### 3. Data Fetching ✅

**Parallelize Independent Queries:**
```javascript
// ✅ Good - Parallel (fast)
const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts()
])

// ❌ Bad - Sequential (slow)
const users = await fetchUsers()
const products = await fetchProducts()
```

**Use React Query:**
```javascript
// ✅ Good - Automatic caching, deduplication, refetching
const { data } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
})

// ❌ Bad - Manual state management, no caching
useEffect(() => {
    fetchUsers().then(setUsers)
}, [])
```

---

### 4. Lazy Loading ✅

**When to Lazy Load:**
- Modals (only load when opened)
- PDF generators (only load when creating PDF)
- Charts/graphs (only load when viewing)
- Admin panels (only load for admin users)
- Heavy third-party libraries

**How to Lazy Load:**
```javascript
import dynamic from 'next/dynamic'

// Component
const HeavyModal = dynamic(() => import('./HeavyModal'), {
    loading: () => <CircularProgress />,
    ssr: false // Don't render on server
})

// Library
const generateChart = async () => {
    const ChartJS = await import('chart.js')
    return ChartJS.default.create(...)
}
```

---

## Performance Monitoring

### 1. Local Testing

**Lighthouse (Chrome DevTools):**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance" + "Best Practices"
4. Click "Analyze page load"

**Target scores:**
- Performance: 90-100
- Best Practices: 90-100
- LCP: < 2.5s
- TBT: < 300ms

---

### 2. Production Monitoring

**Recommended Tools:**
- **Vercel Analytics** (if deployed on Vercel)
- **Google Analytics 4** with Web Vitals
- **Sentry Performance Monitoring**
- **New Relic Browser Monitoring**

**Key metrics to track:**
- **LCP (Largest Contentful Paint):** < 2.5s is good
- **FID (First Input Delay):** < 100ms is good
- **CLS (Cumulative Layout Shift):** < 0.1 is good
- **TTI (Time to Interactive):** < 3.5s is good
- **Bundle Size:** Monitor for increases

---

### 3. CI/CD Integration

**Recommended:** Set up bundle size tracking in CI/CD

**Example GitHub Action:**
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(du -sm .next | cut -f1)
          if [ $BUNDLE_SIZE -gt 40 ]; then
            echo "Bundle size ($BUNDLE_SIZE MB) exceeds limit (40 MB)"
            exit 1
          fi
```

---

## Common Issues & Solutions

### Issue 1: Bundle Size Increasing

**Symptoms:**
- `.next` directory > 40 MB
- Lighthouse performance score dropping

**Diagnosis:**
```bash
npm run build
du -sh .next
find .next/static -name "*.js" -exec du -h {} \; | sort -rh | head -10
```

**Solutions:**
1. Run MUI import optimizer: `node scripts/optimize-mui-imports.js`
2. Run icon optimizer: `node scripts/optimize-icons.js`
3. Check for new heavy dependencies: `npm ls --depth=0`
4. Lazy load heavy components that were added

---

### Issue 2: Slow Page Load Times

**Symptoms:**
- LCP > 2.5s
- Users report slow loading

**Diagnosis:**
1. Open Chrome DevTools → Network tab
2. Check for sequential requests (waterfall pattern)
3. Check for large JavaScript files

**Solutions:**
1. Parallelize sequential queries using `Promise.all()`
2. Lazy load components not needed on initial render
3. Check if React Query is configured correctly
4. Verify images have proper `priority` and `loading` attributes

---

### Issue 3: Build Errors After Optimization

**Symptoms:**
- `npm run build` fails
- Import errors in console

**Common causes:**
1. **Icon import syntax**
   ```javascript
   // ❌ Wrong
   import Edit as EditIcon from '@mui/icons-material/Edit'

   // ✅ Correct
   import EditIcon from '@mui/icons-material/Edit'
   ```

2. **Alpha import error**
   ```javascript
   // ❌ Wrong
   import alpha from '@mui/material/alpha'

   // ✅ Correct
   import { alpha } from '@mui/system'
   ```

3. **Cache issues**
   ```bash
   # Clear build cache
   rm -rf .next node_modules/.cache
   npm run build
   ```

---

### Issue 4: Hooks Returning Stale Data

**Symptoms:**
- Data not updating after mutations
- Showing old data after refresh

**Solution:**
Check that mutations invalidate the correct query keys:
```javascript
const mutation = useMutation({
    mutationFn: updateCliente,
    onSuccess: () => {
        // ✅ Invalidate the right query
        queryClient.invalidateQueries({ queryKey: ['clientes'] })
    }
})
```

---

## Maintenance Checklist

### Weekly
- [ ] Monitor bundle size: `du -sh .next`
- [ ] Check Lighthouse scores (should be 90+)
- [ ] Review slow API calls in production logs

### Before Each Release
- [ ] Run `npm run build` and verify success
- [ ] Run MUI import optimizer: `node scripts/optimize-mui-imports.js`
- [ ] Run icon optimizer: `node scripts/optimize-icons.js`
- [ ] Check bundle size hasn't increased significantly
- [ ] Test critical user flows (login, create package, view invoice)
- [ ] Run Lighthouse on production preview

### Monthly
- [ ] Review and update this guide
- [ ] Check for new performance best practices from Next.js/Vercel
- [ ] Audit dependencies for updates: `npm outdated`
- [ ] Review Core Web Vitals in production
- [ ] Consider new optimizations based on usage patterns

---

## Resources

### Documentation
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit#optimizing-performance)
- [Web Vitals](https://web.dev/vitals/)
- [MUI Tree Shaking](https://mui.com/material-ui/guides/minimizing-bundle-size/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Team Contact
- For questions about this guide: Slack #dev-performance
- For performance issues: Create issue with label `performance`
- For optimization ideas: Discuss in team meetings

---

**Last Updated:** February 17, 2026
**Version:** 1.0.0
**Status:** ✅ Active & Maintained
