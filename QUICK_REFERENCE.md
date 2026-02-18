# ⚡ Performance Quick Reference

**Quick guide for developers - Keep this handy!**

---

## ✅ DO's

### Imports
```javascript
// ✅ Direct imports (MUI components)
import Box from '@mui/material/Box'

// ✅ Optimized icons first
import { EditIcon } from '@/components/Icons'

// ✅ Alpha from @mui/system
import { alpha } from '@mui/system'
```

### Data Fetching
```javascript
// ✅ Parallelize independent queries
const [data1, data2] = await Promise.all([fetch1(), fetch2()])

// ✅ Use React Query hooks
const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
```

### Components
```javascript
// ✅ Lazy load heavy components
const HeavyModal = dynamic(() => import('./HeavyModal'), {
    loading: () => <CircularProgress />,
    ssr: false
})

// ✅ Server Components (default)
export default function Page() { /* no 'use client' */ }

// ✅ Client Components (only when needed)
'use client'
export default function Interactive() { /* uses hooks */ }
```

---

## ❌ DON'Ts

### Imports
```javascript
// ❌ Barrel imports
import { Box, Button } from '@mui/material'

// ❌ MUI icons directly (use optimized first)
import Edit from '@mui/icons-material/Edit'

// ❌ Wrong alpha import
import alpha from '@mui/material/alpha'
```

### Data Fetching
```javascript
// ❌ Sequential queries (slow)
const data1 = await fetch1()
const data2 = await fetch2()

// ❌ Manual state management (use React Query)
useEffect(() => { fetchData().then(setData) }, [])
```

### Components
```javascript
// ❌ Heavy imports on initial load
import PdfGenerator from '@react-pdf/renderer'

// ❌ Use client everywhere
'use client' // Only add when needed!
```

---

## 🛠️ Quick Commands

```bash
# Build & check size
npm run build
du -sh .next

# Optimize imports
node scripts/optimize-mui-imports.js
node scripts/optimize-icons.js

# Clear cache
rm -rf .next node_modules/.cache

# Check bundle sizes
find .next/static -name "*.js" -exec du -h {} \; | sort -rh | head -10
```

---

## 📊 Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Bundle | < 150 KB | ~130 KB ✅ |
| Lighthouse | > 90 | 95-96 ✅ |
| LCP | < 2.5s | ~1.8s ✅ |
| TTI | < 3.5s | ~2.8s ✅ |

---

## 🚨 When to Optimize

**Immediately if:**
- Bundle size > 200 KB
- Lighthouse score < 85
- LCP > 3s
- Build time > 20s

**Soon if:**
- Bundle size > 150 KB
- Lighthouse score < 90
- LCP > 2.5s

**Run optimizers:**
- Before each release
- After merging feature branches
- When performance drops

---

## 🆘 Quick Fixes

**Build failing?**
```bash
rm -rf .next
npm run build
```

**Icons not working?**
```javascript
// Use correct import
import EditIcon from '@mui/icons-material/Edit'
```

**Alpha error?**
```javascript
// Use named import from @mui/system
import { alpha } from '@mui/system'
```

**Slow page load?**
1. Check Network tab for waterfalls
2. Parallelize queries with Promise.all()
3. Lazy load heavy components

---

## 📚 Learn More

- Full guide: `PERFORMANCE_GUIDE.md`
- Validation: `VALIDATION_REPORT.md`
- Optimization history: Git commit `3cd08ab`

**Questions?** Slack #dev-performance
