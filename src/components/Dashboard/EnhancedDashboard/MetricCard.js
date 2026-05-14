// components/Dashboard/EnhancedDashboard/MetricCard.js
'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { memo } from 'react'

/**
 * Enhanced Metric Card with Industrial Design
 * Features: Hover effects, icon badges, trend indicators
 */
const MetricCard = memo(function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#ff6b35',
  trend,
  subtitle,
  loading = false,
  delay = 0
}) {
  if (loading) {
    return (
      <Box sx={{
        backgroundColor: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '12px',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1, bgcolor: '#222' }} />
        <Skeleton variant="text" width="40%" height={40} sx={{ bgcolor: '#222' }} />
      </Box>
    )
  }

  return (
    <Box
      className="slide-up"
      sx={{
        backgroundColor: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '12px',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease',
        opacity: 0,
        animationFillMode: 'forwards',
        animationDelay: `${delay}s`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover': {
          borderColor: color,
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px ${color}20`,
          '&::before': {
            opacity: 1,
          },
        },
      }}
    >
      {/* Background Glow Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}10, transparent)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon Badge */}
      {Icon && (
        <Box sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: `${color}25`,
            transform: 'rotate(5deg) scale(1.1)',
          },
        }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
      )}

      {/* Label */}
      <Typography
        sx={{
          color: '#888',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '0.75rem',
          mb: 1.5,
          fontFamily: '"Roboto Mono", monospace',
        }}
      >
        {label}
      </Typography>

      {/* Value with Trend */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 0.5 }}>
        <Typography
          sx={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#fff',
            fontFamily: '"Roboto Mono", monospace',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </Typography>

        {trend !== undefined && trend !== null && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: '6px',
            backgroundColor: trend > 0 ? '#00ff9915' : '#ff354915',
            border: `1px solid ${trend > 0 ? '#00ff9930' : '#ff354930'}`,
          }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: trend > 0 ? '#00ff99' : '#ff3549',
                fontFamily: '"Roboto Mono", monospace',
              }}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#666',
            mt: 1,
          }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Noise Texture Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'3\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: 0.03,
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        }}
      />
    </Box>
  )
})

export default MetricCard
