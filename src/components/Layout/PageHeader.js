'use client'

import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Link from 'next/link'
import { memo } from 'react'

/**
 * PageHeader Component per Design System
 * Spec: .interface-design/system.md lines 200-209
 *
 * Features:
 * - Breadcrumbs with animated arrows
 * - Icon badge (48x48px) with rotation hover effect
 * - Title (h4) with responsive typography
 * - Optional subtitle (body1, max-width 600px)
 * - Bottom border with 120px gradient accent (yellow fade)
 * - Actions slot (right-aligned buttons)
 * - Slide-down entrance animation
 */
const PageHeader = memo(function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = '#f4b223',
  breadcrumbs = [],
  actions,
}) {
  return (
    <Box
      className="slide-down"
      sx={{
        mb: 4,
        pb: 3,
        borderBottom: '1px solid #3a3730',
        position: 'relative',
        opacity: 0,
        animationFillMode: 'forwards',
        animationDelay: '0.1s',
        // Bottom gradient accent (120px yellow fade)
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: '120px',
          height: '2px',
          background: 'linear-gradient(90deg, #f4b223 0%, transparent 100%)',
        },
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16, color: '#6d685f' }} />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return isLast ? (
              <Typography
                key={crumb.label}
                sx={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#f4b223',
                  fontWeight: 600,
                }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.label}
                href={crumb.href}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#a8a399',
                  fontWeight: 600,
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#f4b223')}
                onMouseLeave={(e) => (e.target.style.color = '#a8a399')}
              >
                {crumb.label}
              </Link>
            )
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
          {/* Icon Badge */}
          {Icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                backgroundColor: `${iconColor}15`,
                border: `1px solid ${iconColor}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 300ms ease',
                flexShrink: 0,
                '&:hover': {
                  transform: 'rotate(5deg) scale(1.1)',
                  backgroundColor: `${iconColor}25`,
                },
              }}
            >
              <Icon sx={{ color: iconColor, fontSize: 24 }} />
            </Box>
          )}

          {/* Title & Subtitle */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                mb: subtitle ? 1 : 0,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: '#a8a399',
                  maxWidth: '600px',
                  fontSize: '0.9375rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Actions Slot */}
        {actions && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  )
})

export default PageHeader
