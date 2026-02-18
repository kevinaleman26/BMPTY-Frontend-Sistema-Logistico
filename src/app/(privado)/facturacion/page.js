// app/(privado)/facturacion/page.js
'use client'

import FacturaTable from '@/components/Table/FacturaTable'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { AddIcon } from '@/components/Icons'


// ⚡ Lazy load modal pesado (359 líneas)
const FacturaModal = dynamic(() => import('@/components/Modal/FacturaModal'), {
    loading: () => (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={24} />
        </Box>
    ),
    ssr: false
})

export default function FacturacionPage() {
    const [open, setOpen] = useState(false)
    const [facturaEdit, setFacturaEdit] = useState(null)
    const router = useRouter()
    const searchParams = useSearchParams()

    // Inicializa page & limit en la URL si no existen (evita NaN/undefined)
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        let changed = false
        if (!params.get('page')) { params.set('page', '1'); changed = true }
        if (!params.get('limit')) { params.set('limit', '10'); changed = true }
        if (changed) router.replace(`?${params.toString()}`)
    }, [searchParams, router])

    const handleOpenCreate = useCallback(() => {
        setFacturaEdit(null)
        setOpen(true)
    }, [])

    const handleEdit = useCallback((row) => {
        setFacturaEdit(row)
        setOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
        setFacturaEdit(null)
    }, [])

    // Más adelante conectamos onSubmit con tu hook useMutateFactura
    const handleSubmit = useCallback(async (values) => {
        console.log('Enviar al backend:', values, facturaEdit ? '(editar)' : '(crear)')
        // if (facturaEdit) await updateFactura.mutateAsync({ id: facturaEdit.id, ...values })
        // else await createFactura.mutateAsync(values)
    }, [facturaEdit])

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h2" color="white">
                    Gestión de Facturación
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Crear factura
                </Button>
            </Box>

            <FacturaTable onEdit={handleEdit} />
            <FacturaModal
                open={open}
                onClose={handleClose}
                factura={facturaEdit}
                onSubmit={handleSubmit}
            />
        </Box>
    )
}
