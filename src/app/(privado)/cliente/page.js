'use client'

import ClienteModal from '@/components/Modal/ClienteModal'
import ClienteTable from '@/components/Table/ClienteTable'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useState, useCallback } from 'react'

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
