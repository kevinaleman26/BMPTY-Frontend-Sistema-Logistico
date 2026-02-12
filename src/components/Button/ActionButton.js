'use client'

import { Button } from '@mui/material'
import { useState } from 'react'

/**
 * Enhanced ActionButton component with industrial styling and animations
 *
 * @param {string} variant - 'primary', 'secondary', 'tertiary', or standard MUI variants
 * @param {string} size - 'small', 'medium', 'large'
 * @param {boolean} fullWidth - If true, button takes full width
 * @param {ReactNode} children - Button content
 * @param {ReactNode} icon - Optional icon component
 * @param {string} type - Button type ('button', 'submit', 'reset')
 */
export default function ActionButton({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    children,
    icon: Icon,
    disabled = false,
    loading = false,
    ...props
}) {
    const [isHovered, setIsHovered] = useState(false)

    // Map custom variants to MUI variants and custom styles
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    muiVariant: 'contained',
                    sx: {
                        backgroundColor: 'primary.main',
                        color: '#000',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 32px' : '10px 24px',
                        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.875rem',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(244, 178, 35, 0.3)',
                        transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',

                        '&:hover': {
                            backgroundColor: 'primary.light',
                            boxShadow: '0 6px 16px rgba(244, 178, 35, 0.4), 0 0 0 1px rgba(244, 178, 35, 0.5)',
                        },

                        '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: '0 2px 4px rgba(244, 178, 35, 0.3)',
                        },

                        '&.Mui-disabled': {
                            backgroundColor: 'rgba(244, 178, 35, 0.3)',
                            color: 'rgba(0, 0, 0, 0.4)',
                        },

                        // Shine effect on hover
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            transition: 'left 400ms ease',
                        },

                        '&:hover::before': {
                            left: '100%',
                        }
                    }
                }

            case 'secondary':
                return {
                    muiVariant: 'outlined',
                    sx: {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        borderWidth: '2px',
                        padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 32px' : '10px 24px',
                        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.875rem',
                        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',

                        '&:hover': {
                            borderWidth: '2px',
                            borderColor: 'primary.light',
                            backgroundColor: 'rgba(244, 178, 35, 0.08)',
                            boxShadow: '0 4px 12px rgba(244, 178, 35, 0.2)',
                        },

                        '&:active': {
                            transform: 'translateY(0)',
                        },

                        '&.Mui-disabled': {
                            borderColor: 'rgba(244, 178, 35, 0.3)',
                            color: 'rgba(244, 178, 35, 0.3)',
                        }
                    }
                }

            case 'tertiary':
                return {
                    muiVariant: 'text',
                    sx: {
                        color: 'text.primary',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: '8px',
                        padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 32px' : '10px 24px',
                        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.875rem',
                        transition: 'all 200ms ease',

                        '&:hover': {
                            backgroundColor: 'rgba(244, 178, 35, 0.08)',
                            color: 'primary.main',
                        },

                        '&.Mui-disabled': {
                            color: 'text.muted',
                        }
                    }
                }

            case 'danger':
                return {
                    muiVariant: 'contained',
                    sx: {
                        backgroundColor: 'error.main',
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '8px',
                        padding: size === 'small' ? '6px 16px' : size === 'large' ? '12px 32px' : '10px 24px',
                        fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.875rem',
                        transition: 'all 200ms ease',
                        boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                        transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',

                        '&:hover': {
                            backgroundColor: '#e53935',
                            boxShadow: '0 6px 16px rgba(211, 47, 47, 0.4)',
                        },

                        '&:active': {
                            transform: 'translateY(0)',
                        },

                        '&.Mui-disabled': {
                            backgroundColor: 'rgba(211, 47, 47, 0.3)',
                            color: 'rgba(255, 255, 255, 0.4)',
                        }
                    }
                }

            default:
                return { muiVariant: variant, sx: {} }
        }
    }

    const { muiVariant, sx } = getVariantStyles()

    return (
        <Button
            variant={muiVariant}
            fullWidth={fullWidth}
            disabled={disabled || loading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                ...sx,
                display: 'flex',
                alignItems: 'center',
                gap: Icon ? 1 : 0,
                letterSpacing: '0.02em',
            }}
            {...props}
        >
            {Icon && <Icon sx={{ fontSize: size === 'small' ? 18 : size === 'large' ? 24 : 20 }} />}
            {loading ? 'Cargando...' : children}
        </Button>
    )
}
