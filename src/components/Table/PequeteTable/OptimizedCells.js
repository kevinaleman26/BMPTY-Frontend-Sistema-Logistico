// Auto-generated optimized cells for better performance
'use client'

import { memo } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

/**
 * Memoized Chip component
 * Prevents re-renders during scroll
 */
export const OptimizedChip = memo(function OptimizedChip({ label, color = 'primary', size = 'small' }) {
    return <Chip label={label || '—'} color={color} size={size} sx={{ maxWidth: '100%' }} />
})

/**
 * Memoized status chip
 */
export const StatusChip = memo(function StatusChip({ value, trueLabel, falseLabel, trueColor = 'success', falseColor = 'error' }) {
    return (
        <Chip
            label={value ? trueLabel : falseLabel}
            color={value ? trueColor : falseColor}
            size="small"
        />
    )
})

/**
 * Memoized currency display
 */
export const CurrencyCell = memo(function CurrencyCell({ value }) {
    if (value == null) return '—'
    return (
        <Box sx={{
            fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
            fontWeight: 600,
            color: '#f4b223'
        }}>
            $${Number(value).toFixed(2)}
        </Box>
    )
})

/**
 * Memoized date display
 */
export const DateCell = memo(function DateCell({ value, format = 'full' }) {
    if (!value) return '—'

    const date = new Date(value)

    if (format === 'full') {
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return date.toLocaleDateString('es-ES')
})
