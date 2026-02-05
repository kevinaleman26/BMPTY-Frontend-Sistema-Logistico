// Design tokens for BMPTY Logistics System
// Theme: Warehouse documentation — warm, industrial, precise

export const tokens = {
  // Surface hierarchy — stacked paper/documents metaphor
  surface: {
    base: '#1a1815',      // Warm paper-gray foundation
    elevated: '#252218',  // Slightly lifted surface
    card: '#2f2c24',      // Card/modal surfaces
    header: '#2f2c24',    // Table headers, elevated sections
  },

  // Border system — whisper-light dividers
  border: {
    subtle: '#2d2a25',    // Barely-there structural lines
    soft: '#3a3730',      // Slightly more visible for focus states
    emphasis: '#4a453c',  // For active/selected states
  },

  // Text hierarchy — warm off-white to pure white
  text: {
    primary: '#e8e6e0',   // Body text, readable cream
    emphasis: '#ffffff',  // Headlines, important labels
    secondary: '#a8a399', // De-emphasized text, hints
    muted: '#6d685f',     // Disabled, least important
  },

  // Brand & Accent — warehouse yellow for primary actions
  accent: {
    primary: '#f4b223',       // Warehouse yellow
    primaryHover: '#f7c14a',  // Lighter on hover
    primaryActive: '#d69b1e', // Darker on active
    secondary: '#2196f3',     // Electric blue for secondary actions
    secondaryHover: '#42a5f5',
    secondaryActive: '#1976d2',
    tertiary: '#ff9800',      // Safety orange for urgency
    tertiaryHover: '#ffa726',
    tertiaryActive: '#f57c00',
  },

  // Semantic colors
  semantic: {
    success: '#4caf50',     // Keep green for success
    successBg: '#1b2e1d',   // Subtle bg for success states
    warning: '#e67e22',     // Transit orange for warnings
    warningBg: '#2d1e15',   // Subtle bg for warnings
    error: '#d32f2f',       // Safety red for errors
    errorBg: '#2d1515',     // Subtle bg for errors
    info: '#2196f3',        // Keep blue for info
    infoBg: '#151d2d',      // Subtle bg for info
  },

  // Data visualization — logistics-inspired palette
  dataViz: {
    branches: '#f4b223',   // Yellow for branch stats
    packages: '#2196f3',   // Blue for package tracking
    operators: '#4caf50',  // Green for operators
    clients: '#e67e22',    // Orange for clients
    transfers: '#9c27b0',  // Purple for transfers
  },

  // Typography — Industrial precision meets Swiss clarity
  font: {
    family: {
      base: '"IBM Plex Sans", -apple-system, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
      display: '"IBM Plex Sans", system-ui, sans-serif',
    },
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px — Added for hero elements
    },
    tracking: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em',
    },
  },

  // Spacing scale — base 8px
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },

  // Layout constants
  layout: {
    sidebarWidth: '260px',
    navbarHeight: '64px',
    maxContentWidth: '1400px',
  },

  // Transitions — smooth, snappy, purposeful
  transition: {
    instant: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful spring
  },

  // Effects — depth, texture, atmosphere
  effects: {
    noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
    glow: '0 0 20px rgba(244, 178, 35, 0.15)',
    glowBlue: '0 0 20px rgba(33, 150, 243, 0.15)',
    shadowSm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    shadowMd: '0 4px 6px rgba(0, 0, 0, 0.4)',
    shadowLg: '0 10px 25px rgba(0, 0, 0, 0.5)',
    liftHover: '0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(244, 178, 35, 0.2)',
  },

  // Animations — entrance, attention, interaction
  animation: {
    fadeIn: 'fadeIn 0.3s ease-out',
    slideUp: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    slideDown: 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    scaleIn: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
}

// MUI theme overrides
export const muiThemeOverrides = {
  palette: {
    mode: 'dark',
    background: {
      default: tokens.surface.base,
      paper: tokens.surface.card,
    },
    text: {
      primary: tokens.text.primary,
      secondary: tokens.text.secondary,
    },
    primary: {
      main: tokens.accent.primary,
      light: tokens.accent.primaryHover,
      dark: tokens.accent.primaryActive,
    },
    success: {
      main: tokens.semantic.success,
    },
    warning: {
      main: tokens.semantic.warning,
    },
    error: {
      main: tokens.semantic.error,
    },
    info: {
      main: tokens.semantic.info,
    },
    divider: tokens.border.subtle,
  },
  typography: {
    fontFamily: tokens.font.family.base,
    h1: {
      fontSize: tokens.font.size['4xl'],
      fontWeight: tokens.font.weight.bold,
      letterSpacing: tokens.font.tracking.tight,
      color: tokens.text.emphasis,
    },
    h2: {
      fontSize: tokens.font.size['3xl'],
      fontWeight: tokens.font.weight.bold,
      letterSpacing: tokens.font.tracking.tight,
      color: tokens.text.emphasis,
    },
    h3: {
      fontSize: tokens.font.size['2xl'],
      fontWeight: tokens.font.weight.semibold,
      letterSpacing: tokens.font.tracking.tight,
      color: tokens.text.emphasis,
    },
    h4: {
      fontSize: tokens.font.size.xl,
      fontWeight: tokens.font.weight.semibold,
      color: tokens.text.emphasis,
    },
    h5: {
      fontSize: tokens.font.size.lg,
      fontWeight: tokens.font.weight.medium,
      color: tokens.text.emphasis,
    },
    body1: {
      fontSize: tokens.font.size.base,
      color: tokens.text.primary,
    },
    body2: {
      fontSize: tokens.font.size.sm,
      color: tokens.text.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: tokens.font.weight.medium,
          borderRadius: tokens.radius.md,
          transition: tokens.transition.base,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: tokens.surface.elevated,
            '& fieldset': {
              borderColor: tokens.border.subtle,
            },
            '&:hover fieldset': {
              borderColor: tokens.border.soft,
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.accent.primary,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
}
