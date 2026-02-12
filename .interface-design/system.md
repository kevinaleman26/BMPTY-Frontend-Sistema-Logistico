# BMPTY Logistics System - Design System

## Direction & Feel

**Theme:** Industrial Precision — Warehouse operations meet Swiss design elegance
**Metaphor:** Well-organized warehouse workspace with technical precision instrumentation
**Color world:** Cardboard brown, warehouse safety yellow, steel gray, electric blue (secondary actions), safety orange (urgency)

The interface feels like a professional logistics operation — organized, efficient, technically precise. Like stacked documents on a warehouse desk with modern digital precision instrumentation, not floating cards in abstract digital space.

**Signature Element:** JetBrains Mono for all numeric data + SVG noise texture overlays on all surfaces (3-5% opacity)

## Color System

### Surfaces (Warm Paper Grays)
- **Base:** `#1a1815` — Foundation, main background
- **Elevated:** `#252218` — Slightly lifted surfaces (sidebar, navbar, tables)
- **Card:** `#2f2c24` — Modal dialogs, card components, table headers
- **Header:** `#2f2c24` — Table headers, emphasized sections

### Borders (Whisper-Light Dividers)
- **Subtle:** `#2d2a25` — Barely-visible structural lines
- **Soft:** `#3a3730` — Focus states, slightly more visible
- **Emphasis:** `#4a453c` — Active/selected states

### Text (Warm Off-White Hierarchy)
- **Primary:** `#e8e6e0` — Body text, readable cream
- **Emphasis:** `#ffffff` — Headlines, important data
- **Secondary:** `#a8a399` — De-emphasized text, hints
- **Muted:** `#6d685f` — Disabled states

### Brand & Accent
- **Primary:** `#f4b223` — Warehouse yellow for primary actions
- **Primary Hover:** `#f7c14a` — Lighter on hover
- **Primary Active:** `#d69b1e` — Darker when pressed
- **Secondary:** `#2196f3` — Electric blue for secondary actions
- **Tertiary:** `#ff9800` — Safety orange for urgency indicators

### Data Visualization (Logistics Palette)
- **Branches:** `#f4b223` — Yellow
- **Packages:** `#2196f3` — Blue
- **Operators:** `#4caf50` — Green
- **Clients:** `#e67e22` — Orange
- **Transfers:** `#9c27b0` — Purple

## Typography

**Font Families:**
- **Primary:** IBM Plex Sans (300, 400, 500, 600, 700) — Industrial heritage
- **Data/Code:** JetBrains Mono (400, 500, 600, 700) — Technical precision
- **Display:** IBM Plex Sans

### Hierarchy
- **Headlines:** IBM Plex Sans, 600-700 weight, tight tracking (-0.02em to -0.04em)
- **Subheadings:** IBM Plex Sans, 600 weight, tight tracking
- **Body:** IBM Plex Sans, 400-500 weight, normal tracking
- **Data:** JetBrains Mono, 500-700 weight, tight tracking (-0.02em to -0.04em)
- **Labels:** IBM Plex Sans, 600 weight, uppercase, wide tracking (0.05em to 0.08em)

### Scale
12px (xs) → 14px (sm) → 16px (base) → 18px (lg) → 20px (xl) → 24px (2xl) → 30px (3xl) → 36px (4xl) → 48px (5xl)

## Depth Strategy

**Layered Shadows with Color Glows + Borders** — Documents stack with subtle depth and interactive lift

### Shadows
- **Small:** `0 2px 4px rgba(0, 0, 0, 0.3)`
- **Medium:** `0 4px 6px rgba(0, 0, 0, 0.4)`
- **Large:** `0 10px 25px rgba(0, 0, 0, 0.5)`
- **Hover Lift:** `0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(244, 178, 35, 0.2)`

### Borders
- Surface elevation via background color shifts (#1a1815 → #252218 → #2f2c24)
- Whisper-light borders (1px solid divider) on all cards
- Active states: 2-3px borders with color glow (`0 0 12px rgba(244, 178, 35, 0.6)`)
- Never harsh, always purposeful

### Border Radius
- Standard: 6-8px
- Small: 4px
- Large: 10px

### Noise Texture (Applied to All Surfaces)
```javascript
backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
opacity: 0.03
```

## Spacing & Animation

**Base unit:** 8px
**Scale:** xs(8px) → sm(16px) → md(24px) → lg(32px) → xl(40px) → 2xl(48px) → 3xl(64px)

All spacing is strict multiples. No random values.

### Animation Timing
- **Instant:** 100ms
- **Fast:** 150ms
- **Base:** 200ms (default)
- **Slow:** 300ms
- **Bounce:** 400ms cubic-bezier(0.34, 1.56, 0.64, 1)

**Easing:** cubic-bezier(0.4, 0, 0.2, 1) for all non-bounce animations

### Entrance Animations
- `fadeIn` — Opacity 0 → 1 (300ms)
- `slideUp` — TranslateY 20px → 0 (400ms)
- `slideDown` — TranslateY -20px → 0 (400ms)
- `slideInLeft` — TranslateX -30px → 0 (500ms)
- `slideInRight` — TranslateX 30px → 0 (500ms)
- `scaleIn` — Scale 0.9 → 1 with bounce (300ms)

**Staggered Delays:** 0.05s, 0.1s, 0.15s, 0.2s, 0.25s, 0.3s

### Hover Effects
- **Lift:** translateY(-4px) on cards, translateY(-2px) on buttons
- **Glow:** Radial gradient overlays with accent color
- **Scale:** 1.0 → 1.05 on icons and badges
- **Slide:** translateX(4px) on menu items

### Micro-interactions
- Pulsing indicators: 2s infinite for active states
- Icon rotations: 5deg on hover
- Button shine: Gradient sweep on hover (400ms)

## Component Patterns

### InfoCard (Document Stat)
```
- Slide-up entrance animation with configurable delay
- Gradient top accent bar (4px → 6px on hover)
- Icon badge (40x40px, top-right, rotates 5deg on hover)
- Background: surface.card with noise texture
- Border: 1px solid divider
- Hover: translateY(-4px), border-color changes to accent, radial glow, enhanced shadow
- Label: uppercase, 0.08em tracking, color transitions to accent on hover
- Value: 2.5rem, JetBrains Mono, scales 1.05 on hover
```

### DataGrid Tables
```
- Background: surface.elevated with noise texture overlay
- Border: 1px solid divider, 8px radius, enhanced shadows
- Header: Gradient background with 2px top yellow accent line
- Column titles: Uppercase, 0.05em tracking, 700 weight
- Row hover: translateX(2px), left border highlight (3px yellow), text brightens
- Row borders: subtle divider color
- Footer: Gradient background
- Pagination: Styled controls with hover effects
- Scrollbar: Custom 8px width, rounded, color-matched
```

### Navigation (Sidebar)
```
- Slide-in-left entrance animation
- Background: surface.elevated with noise texture
- Logo: Hover glow effect (drop-shadow)
- Menu items: Slide-right on hover (translateX 4px)
- Active indicator: 3px glowing yellow bar on left (with box-shadow)
- Active background: Linear gradient (yellow tint)
- Pulsing indicator dot (6px) on active items
- Icon support with scale animation (1.0 → 1.1)
- User info card: Enhanced with gradient left accent bar, role badge, active status dot
```

### Modals
```
- Background: background.paper
- Border: 1px solid divider
- Title has border-bottom divider
- No shadows
```

### ActionButton Component (4 Variants)
```
**Primary (Main Actions):**
- Yellow filled (#f4b223), black text, 600 weight
- Hover: translateY(-2px), enhanced shadow + glow, shine animation (gradient sweep)
- Active: translateY(0), reduced shadow
- Shadow: Colored glow matching button

**Secondary (Alternative Actions):**
- Yellow outlined (2px border)
- Hover: translateY(-2px), background tint, border glow

**Tertiary (Subtle Actions):**
- Ghost button (text only)
- Hover: Yellow tint background

**Danger (Destructive Actions):**
- Red filled (#d32f2f), white text
- Same hover lift behavior as primary

**Sizes:** small (6px/16px), medium (10px/24px), large (12px/32px)
**Border radius:** 8px
**Text transform:** none
```

### PageHeader Component
```
- Breadcrumbs with animated arrows (uppercase, 0.05em tracking)
- Icon badge (48x48px) with rotation hover effect
- Title (h4) with responsive typography
- Optional subtitle (body1, max-width 600px)
- Bottom border with 120px gradient accent (yellow fade)
- Actions slot (right-aligned buttons)
- Slide-down entrance animation
```

### Loading States
```
**TableSkeleton Component:**
- Mimics table structure exactly
- Pulsing animation (1.5s infinite)
- Staggered delays per row (0.05s increments)
- Fading opacity for depth (1 - rowIndex * 0.1)
- Yellow-tinted skeleton bars
- Never use CircularProgress alone
```

### Empty States
```
**EmptyState Component:**
- Floating icon badge (100x100px circle)
- Float animation (3s infinite, -10px amplitude)
- Decorative background circles
- Radial gradient atmosphere
- Typography hierarchy (h5 + body1)
- Action button slot
- Scale-in entrance animation
```

## Files & Imports

**Design Tokens:** `src/styles/tokens.js`
**DataGrid Styles:** `src/styles/dataGridStyles.js`
**Global Animations:** `src/app/globals.css` (10 keyframe animations + utility classes)
**Theme Provider:** Applied in `src/app/layout.js`
**Fonts:** IBM Plex Sans + JetBrains Mono (loaded via Google Fonts)

### Component Imports
```javascript
import ActionButton from '@/components/Button/ActionButton'
import PageHeader from '@/components/Layout/PageHeader'
import TableSkeleton from '@/components/Loading/TableSkeleton'
import EmptyState from '@/components/EmptyState/EmptyState'
import InfoCard from '@/components/Card/InfoCard'
import { tokens } from '@/styles/tokens'
```

## Signature Element (Future)

**Status Timeline Track** — Horizontal rail visualization showing package journey:
- Origin branch → Current location → Destination
- Branch badges positioned on rail
- Not a generic stepper — actual transit visualization
- Use in dashboard for recent shipments and package detail views

## Implementation Rules

**Always Include:**
- Noise texture overlay on surfaces (3-5% opacity)
- Entrance animations with staggered delays
- Hover states with lift effects (cards: -4px, buttons: -2px)
- Focus outlines (2px yellow, 2px offset)
- Responsive grid breakpoints (xs, sm, md, lg, xl)
- TableSkeleton for loading (never CircularProgress alone)
- EmptyState with actions for empty data
- JetBrains Mono for all numeric values

**Never Use:**
- Generic Inter font (use IBM Plex Sans)
- Instant component appearance (use entrance animations)
- Flat shadows without color (use layered shadows with glows)
- Hardcoded color values (always use tokens or theme)
- Fixed grid columns (always responsive with breakpoints)
- Basic MUI buttons (use ActionButton component)
- Simple "No data" text (use EmptyState component)
- CircularProgress alone (use TableSkeleton)

## What Makes This Unique

This design **only works for logistics tracking**. The color world (cardboard browns, warehouse safety yellow, steel grays), the industrial typography (IBM Plex Sans + JetBrains Mono), the noise textures evoking printed documentation, and the kinetic entrance animations reflecting package movement are specific to this domain. A finance app or social platform couldn't use this direction without it feeling forced.

The signature element—JetBrains Mono for all data + noise overlays—creates a technical precision feel that matches the warehouse operations metaphor while maintaining warmth through color temperature.

## Design Principles

1. **Industrial Precision** — Every element serves logistics operations with technical accuracy
2. **Layered Depth** — Subtle surface elevation with noise textures and color-glowed shadows
3. **Kinetic Energy** — Smooth, purposeful animations that guide attention without distraction
4. **Data First** — JetBrains Mono for all numeric values, clear hierarchy, scannable layouts
5. **Warm Industrial** — Dark warm surfaces balanced with technical precision in data display

---

**Last Updated:** 2026-02-05
**Version:** 2.0 (Enhanced with Industrial Precision improvements)
