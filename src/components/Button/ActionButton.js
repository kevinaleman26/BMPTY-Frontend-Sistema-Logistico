'use client'

import Button from '@mui/material/Button'
import { memo } from 'react'

/**
 * ActionButton Component - 4 Variants per Design System
 * Spec: .interface-design/system.md lines 175-198
 *
 * Variants:
 * - primary: Yellow filled, black text (main actions)
 * - secondary: Yellow outlined (alternative actions)
 * - tertiary: Ghost button, text only (subtle actions)
 * - danger: Red filled, white text (destructive actions)
 */
const ActionButton = memo(function ActionButton({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  ...props
}) {
  // Size mappings per spec (small: 6px/16px, medium: 10px/24px, large: 12px/32px)
  const sizeStyles = {
    small: {
      padding: '6px 16px',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '10px 24px',
      fontSize: '0.9375rem',
    },
    large: {
      padding: '12px 32px',
      fontSize: '1rem',
    },
  }

  // Variant styles per spec
  const variantStyles = {
    primary: {
      backgroundColor: '#f4b223',
      color: '#000',
      fontWeight: 600,
      border: 'none',
      boxShadow: '0 4px 12px rgba(244, 178, 35, 0.3)',
      '&:hover': {
        backgroundColor: '#f7c14a',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(244, 178, 35, 0.5)',
        // Shine animation effect
        background: 'linear-gradient(135deg, #f4b223 0%, #f7c14a 50%, #f4b223 100%)',
        backgroundSize: '200% 100%',
        animation: 'shine 0.4s ease',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(244, 178, 35, 0.3)',
      },
      '&:disabled': {
        backgroundColor: '#6d685f',
        color: '#3a3730',
        boxShadow: 'none',
        cursor: 'not-allowed',
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#f4b223',
      fontWeight: 600,
      border: '2px solid #f4b223',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'rgba(244, 178, 35, 0.1)',
        transform: 'translateY(-2px)',
        borderColor: '#f7c14a',
        boxShadow: '0 0 12px rgba(244, 178, 35, 0.4)',
      },
      '&:active': {
        transform: 'translateY(0)',
        backgroundColor: 'rgba(244, 178, 35, 0.15)',
      },
      '&:disabled': {
        borderColor: '#6d685f',
        color: '#6d685f',
        cursor: 'not-allowed',
      },
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: '#e8e6e0',
      fontWeight: 500,
      border: 'none',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'rgba(244, 178, 35, 0.1)',
        color: '#f4b223',
      },
      '&:active': {
        backgroundColor: 'rgba(244, 178, 35, 0.15)',
      },
      '&:disabled': {
        color: '#6d685f',
        cursor: 'not-allowed',
      },
    },
    danger: {
      backgroundColor: '#d32f2f',
      color: '#fff',
      fontWeight: 600,
      border: 'none',
      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
      '&:hover': {
        backgroundColor: '#e53935',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(211, 47, 47, 0.5)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
      },
      '&:disabled': {
        backgroundColor: '#6d685f',
        color: '#3a3730',
        boxShadow: 'none',
        cursor: 'not-allowed',
      },
    },
  }

  return (
    <>
      <Button
        type={type}
        disabled={disabled}
        onClick={onClick}
        startIcon={startIcon}
        endIcon={endIcon}
        fullWidth={fullWidth}
        disableRipple
        sx={{
          ...sizeStyles[size],
          ...variantStyles[variant],
          borderRadius: '8px',
          textTransform: 'none',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif',
          letterSpacing: '-0.01em',
          '&:focus-visible': {
            outline: '2px solid #f4b223',
            outlineOffset: '2px',
          },
        }}
        {...props}
      >
        {children}
      </Button>

      {/* Keyframe for shine animation */}
      <style jsx global>{`
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  )
})

export default ActionButton
