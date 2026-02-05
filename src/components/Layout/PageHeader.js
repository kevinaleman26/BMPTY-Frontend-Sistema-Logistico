'use client'

import { Box, Breadcrumbs, Link, Typography } from '@mui/material'
import NextLink from 'next/link'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

/**
 * PageHeader component - Consistent page title and breadcrumb navigation
 *
 * @param {string} title - Main page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {Array} breadcrumbs - Array of { label, href } objects
 * @param {ReactNode} actions - Optional action buttons (right-aligned)
 * @param {ReactNode} icon - Optional icon component
 */
export default function PageHeader({
    title,
    subtitle,
    breadcrumbs = [],
    actions,
    icon: Icon,
}) {
    return (
        <Box
            className="slide-down"
            sx={{
                mb: 4,
                pb: 3,
                borderBottom: '2px solid',
                borderColor: 'divider',
                position: 'relative',
                animationDelay: '0.1s',
                opacity: 0,
                animationFillMode: 'forwards',

                // Bottom accent gradient
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    width: '120px',
                    height: '2px',
                    background: 'linear-gradient(90deg, #f4b223 0%, transparent 100%)',
                }
            }}
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{
                        mb: 2,
                        '& .MuiBreadcrumbs-separator': {
                            color: 'text.secondary',
                            mx: 0.5,
                        }
                    }}
                >
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1

                        if (isLast) {
                            return (
                                <Typography
                                    key={crumb.label}
                                    variant="body2"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    {crumb.label}
                                </Typography>
                            )
                        }

                        return (
                            <Link
                                key={crumb.label}
                                component={NextLink}
                                href={crumb.href}
                                underline="hover"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    transition: 'color 150ms ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    '&:hover': {
                                        color: 'primary.main',
                                    }
                                }}
                            >
                                {crumb.label}
                            </Link>
                        )
                    })}
                </Breadcrumbs>
            )}

            {/* Title Row */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {/* Title Section */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: subtitle ? 1 : 0 }}>
                        {/* Icon Badge */}
                        {Icon && (
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(244, 178, 35, 0.15)',
                                    border: '2px solid rgba(244, 178, 35, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'all 200ms ease',
                                    boxShadow: '0 4px 12px rgba(244, 178, 35, 0.2)',

                                    '&:hover': {
                                        transform: 'rotate(5deg) scale(1.05)',
                                        boxShadow: '0 6px 16px rgba(244, 178, 35, 0.3)',
                                    }
                                }}
                            >
                                <Icon sx={{ color: 'primary.main', fontSize: 24 }} />
                            </Box>
                        )}

                        {/* Title */}
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: 'text.emphasis',
                                letterSpacing: '-0.02em',
                                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                lineHeight: 1.2,
                                fontFamily: '"IBM Plex Sans", sans-serif',
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>

                    {/* Subtitle */}
                    {subtitle && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '0.95rem',
                                maxWidth: '600px',
                                lineHeight: 1.6,
                                mt: 0.5,
                                ml: Icon ? 8 : 0,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {/* Action Buttons */}
                {actions && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1.5,
                            alignItems: 'flex-start',
                        }}
                    >
                        {actions}
                    </Box>
                )}
            </Box>
        </Box>
    )
}
