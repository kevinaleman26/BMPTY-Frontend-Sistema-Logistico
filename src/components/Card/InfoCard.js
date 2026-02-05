'use client'

import { Box, Typography } from '@mui/material'
import { useState } from 'react'

export default function InfoCard({ color = '#f4b223', label, value, icon: Icon, delay = 0 }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="slide-up"
            sx={{
                backgroundColor: 'surface.card',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                p: 3,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: `${delay}s`,
                opacity: 0,
                animationFillMode: 'forwards',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered
                    ? `0 8px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px ${color}40`
                    : '0 2px 4px rgba(0, 0, 0, 0.3)',
                '&:hover': {
                    borderColor: color,
                },
                // Top accent bar with gradient
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
                    transition: 'height 200ms ease',
                },
                '&:hover::before': {
                    height: '6px',
                },
                // Subtle noise texture overlay
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                    opacity: 0.03,
                    pointerEvents: 'none',
                },
            }}
        >
            {/* Icon Badge (optional) */}
            {Icon && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 200ms ease',
                        transform: isHovered ? 'rotate(5deg) scale(1.05)' : 'rotate(0) scale(1)',
                    }}
                >
                    <Icon sx={{ color: color, fontSize: 20 }} />
                </Box>
            )}

            {/* Label */}
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontSize: '0.7rem',
                    mb: 1.5,
                    transition: 'color 200ms ease',
                    ...(isHovered && { color: color }),
                }}
            >
                {label}
            </Typography>

            {/* Value */}
            <Typography
                sx={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'text.emphasis',
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'left center',
                }}
            >
                {value}
            </Typography>

            {/* Hover glow effect */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 300ms ease',
                    pointerEvents: 'none',
                    filter: 'blur(20px)',
                }}
            />
        </Box>
    )
}
