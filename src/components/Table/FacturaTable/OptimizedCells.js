// Enhanced optimized cells for FacturaTable
'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { EditIcon, DescriptionIcon } from '@/components/Icons'

/**
 * Memoized Chip component
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
            ${Number(value).toFixed(2)}
        </Box>
    )
})

/**
 * Memoized date display
 */
export const DateCell = memo(function DateCell({ value }) {
    if (!value) return '—'
    return new Date(value).toLocaleString('es-ES')
})

/**
 * Triggers PDF download outside the render phase to avoid setState-during-render errors.
 * Must be a real component so useEffect runs after commit.
 */
function PDFTrigger({ url, loading, filename, onDone }) {
    useEffect(() => {
        if (!loading && url) {
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            onDone()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, loading])
    return null
}

/**
 * ⚡ OPTIMIZED Action Buttons for FacturaTable
 * Lazy loads PDF components only when needed
 */
export const FacturaActionButtons = memo(function FacturaActionButtons({ row, onEdit }) {
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
    const [pdfComponents, setPdfComponents] = useState(null)

    // ⚡ Memoize heavy data processing
    const datosFactura = useMemo(() => {
        if (!row) return null

        const { id, sucursal, factura_detalle, subtotal, descuento, otros, impuestos, total, cliente } = row

        const paquetes = factura_detalle?.map(item => {
            const { proveedor_paquetes } = item
            return {
                ...proveedor_paquetes,
                id: item.id,
                tracking: item.paquete_id,
                precioLb: cliente.tarifa,
                total: (proveedor_paquetes.peso * cliente.tarifa)
            }
        }) || []

        return {
            id,
            nombreCliente: cliente.full_name,
            codigoCliente: cliente.codigo || '',
            clienteId: cliente.id || '',
            clienteSucursal: cliente.sucursal?.name || '',
            clienteEmail: cliente.email || '',
            clienteTelefono: cliente.phone || '',
            ruc: sucursal.ruc,
            razonSocial: sucursal.razon_social,
            telefono: sucursal.telefono,
            emailEmpresa: sucursal.email,
            direccion: sucursal.address,
            sucursal: sucursal.name,
            logoUrl: '/logo.png',
            items: paquetes,
            subtotal,
            descuento,
            otros,
            itbms: impuestos,
            total,
            sucursalId: sucursal.id,
            fechaEmision: row.created_at
        }
    }, [row])

    const handleEdit = useCallback(() => {
        onEdit(row)
    }, [onEdit, row])

    // ⚡ Lazy load PDF components only when PDF button is clicked
    const handlePDFClick = useCallback(async () => {
        if (!pdfComponents) {
            try {
                const [{ PDFDownloadLink }, NotaEntregaPDF] = await Promise.all([
                    import('@react-pdf/renderer'),
                    import('@/components/PDF/FacturaPDF')
                ])
                setPdfComponents({ PDFDownloadLink, NotaEntregaPDF: NotaEntregaPDF.default })
            } catch (error) {
                console.error('Error loading PDF components:', error)
                return
            }
        }
        setPdfDialogOpen(true)
    }, [pdfComponents])

    const filename = useMemo(() => {
        if (!datosFactura) return 'factura.pdf'
        return `BM${datosFactura.sucursalId}-Factura${datosFactura.id}-${datosFactura.nombreCliente}`
    }, [datosFactura])

    return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Edit button */}
            <IconButton onClick={handleEdit} size="small">
                <EditIcon sx={{ color: '#fff', fontSize: 20 }} />
            </IconButton>

            {/* PDF button */}
            <IconButton onClick={handlePDFClick} size="small">
                <DescriptionIcon sx={{ color: '#f4b223', fontSize: 20 }} />
            </IconButton>

            {/* Hidden PDF generator - only renders when clicked and components loaded */}
            {pdfDialogOpen && pdfComponents && datosFactura && (() => {
                const { PDFDownloadLink, NotaEntregaPDF } = pdfComponents
                return (
                    <PDFDownloadLink
                        document={<NotaEntregaPDF data={datosFactura} />}
                        fileName={filename}
                        style={{ display: 'none' }}
                    >
                        {({ url, loading }) => (
                            <PDFTrigger
                                url={url}
                                loading={loading}
                                filename={filename}
                                onDone={() => setPdfDialogOpen(false)}
                            />
                        )}
                    </PDFDownloadLink>
                )
            })()}
        </Box>
    )
})
