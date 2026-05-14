'use client'

import ClienteTable from '@/components/Table/ClienteTable'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { AddIcon } from '@/components/Icons'


// ⚡ Lazy load modal pesado (242 líneas)
// Solo se carga cuando se abre el modal
const ClienteModal = dynamic(() => import('@/components/Modal/ClienteModal'), {
    loading: () => (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
        </Box>
    ),
    ssr: false
})

export default function ClientePage() {
    const [open, setOpen] = useState(false)
    const [clienteEdit, setClienteEdit] = useState(null)

    const handleOpen = useCallback(() => {
        setClienteEdit(null)
        setOpen(true)
    }, [])

    const handleEdit = useCallback((cliente) => {
        setClienteEdit(cliente)
        setOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
        setClienteEdit(null)
    }, [])

    return (
        <Box sx={{ px: 4, py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" color="white">
                    Gestión de Clientes
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Nuevo Cliente
                </Button>
            </Box>

            <ClienteTable onEdit={handleEdit} />
            <ClienteModal open={open} onClose={handleClose} cliente={clienteEdit} />
        </Box>
    )
}
