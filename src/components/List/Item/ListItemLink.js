'use client'

import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function ListItemLink({ href, primary, icon: Icon, ...props }) {
    const pathname = usePathname()
    const isActive = pathname.startsWith(href === '/dashboard' ? href : href.split('?')[0])
    const [isHovered, setIsHovered] = useState(false)

    return (
        <ListItemButton
            component={NextLink}
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                borderRadius: '8px',
                mb: 0.5,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                // Left accent bar
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    backgroundColor: 'primary.main',
                    opacity: isActive ? 1 : 0,
                    transition: 'all 200ms ease',
                    boxShadow: isActive ? '0 0 12px rgba(244, 178, 35, 0.6)' : 'none',
                },
                // Background gradient on active
                background: isActive
                    ? 'linear-gradient(90deg, rgba(244, 178, 35, 0.12) 0%, rgba(244, 178, 35, 0.04) 100%)'
                    : 'transparent',
                '&:hover': {
                    background: isActive
                        ? 'linear-gradient(90deg, rgba(244, 178, 35, 0.16) 0%, rgba(244, 178, 35, 0.06) 100%)'
                        : 'rgba(244, 178, 35, 0.06)',
                    '&::before': {
                        opacity: 1,
                        width: '4px',
                    }
                },
                // Subtle glow on hover
                boxShadow: isHovered && isActive ? '0 4px 12px rgba(244, 178, 35, 0.15)' : 'none',
            }}
            {...props}
        >
            {/* Optional Icon */}
            {Icon && (
                <Box
                    sx={{
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: isActive ? 'primary.main' : 'text.secondary',
                        transition: 'all 200ms ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}
                >
                    <Icon sx={{ fontSize: 20 }} />
                </Box>
            )}

            <ListItemText
                primary={primary}
                primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    color: isActive ? 'text.emphasis' : 'text.primary',
                    letterSpacing: '0.01em',
                    transition: 'all 200ms ease',
                }}
            />

            {/* Active indicator dot */}
            {isActive && (
                <Box
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        boxShadow: '0 0 8px rgba(244, 178, 35, 0.6)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                />
            )}
        </ListItemButton>
    )
}
