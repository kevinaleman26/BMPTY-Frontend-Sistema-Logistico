'use client'


import ClienteModal from '@/components/Modal/ClienteModal'
import ClienteTable from '@/components/Table/ClienteTable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

export default function ClientePage() {
    const [open, setOpen] = useState(false)
    const [clienteEdit, setClienteEdit] = useState(null)

    const handleOpen = () => {
        setClienteEdit(null)
        setOpen(true)
    }

    const handleEdit = (cliente) => {
        setClienteEdit(cliente)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setClienteEdit(null)
    }

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
