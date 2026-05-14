// components/Table/TransferenciaTable/OptimizedCells.js
'use client'

import { memo } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { EditIcon, DescriptionIcon, CancelIcon } from '@/components/Icons'

/**
 * Optimized cell components for TransferenciaTable
 * Memoized to prevent unnecessary re-renders during scroll
 */

// Memoized Chip for sucursales
export const SucursalChip = memo(function SucursalChip({ name }) {
    return (
        <Chip
            label={name || '—'}
            color="primary"
            size="small"
            sx={{ maxWidth: '100%' }}
        />
    )
})

// Memoized total amount display
export const TotalAmount = memo(function TotalAmount({ value }) {
    return (
        <Box sx={{
            fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
            fontWeight: 600,
            color: '#f4b223'
        }}>
            ${Number(value || 0).toFixed(2)}
        </Box>
    )
})

// Memoized status chip
export const StatusChip = memo(function StatusChip({ status, type }) {
    if (type === 'delivery') {
        return (
            <Chip
                label={status ? 'Recibida' : 'Pendiente'}
                color={status ? 'success' : 'warning'}
                size="small"
            />
        )
    }

    if (type === 'payment') {
        return (
            <Chip
                label={status ? 'Pagada' : 'Pendiente'}
                color={status ? 'success' : 'error'}
                size="small"
            />
        )
    }

    // metodo_pago
    return (
        <Chip
            label={status || 'Pendiente'}
            color={status === 'Pendiente' ? 'default' : 'primary'}
            size="small"
        />
    )
})

// Memoized action buttons
export const ActionButtons = memo(function ActionButtons({
    row,
    canEdit,
    canCancel,
    onEdit,
    onCancel,
    onDownloadPDF
}) {
    return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* PDF Download Button */}
            <Tooltip title="Descargar PDF">
                <IconButton
                    size="small"
                    onClick={() => onDownloadPDF(row)}
                >
                    <DescriptionIcon sx={{ color: '#f4b223', fontSize: 20 }} />
                </IconButton>
            </Tooltip>

            {/* Edit Button - Only for SuperAdmin and Admin */}
            {canEdit && (
                <Tooltip title="Editar">
                    <IconButton
                        onClick={() => onEdit(row)}
                        size="small"
                    >
                        <EditIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            )}

            {/* Cancel Button - Only when transfer not yet received */}
            {canCancel && !row.delivery_status && (
                <Tooltip title="Cancelar transferencia">
                    <IconButton
                        onClick={() => onCancel(row)}
                        size="small"
                    >
                        <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    )
})
