'use client'

import SucursalModal from '@/components/Modal/SucursalModal'
import SucursalTable from '@/components/Table/SucursalTable'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useState, useCallback } from 'react'

export default function SucursalesPage() {
    const [open, setOpen] = useState(false)
    const [sucursalToEdit, setSucursalToEdit] = useState(null)

    const handleOpenCreate = useCallback(() => {
        setSucursalToEdit(null)
        setOpen(true)
    }, [])

    const handleEdit = useCallback((sucursal) => {
        setSucursalToEdit(sucursal)
        setOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    return (
        <Box sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h2" color="white">
                    Lista de Sucursales
                </Typography>
                <Button variant="contained" onClick={handleOpenCreate} startIcon={<AddIcon />}>
                    Crear Sucursal
                </Button>
            </Box>

            <SucursalTable onEdit={handleEdit} />

            <SucursalModal
                open={open}
                onClose={handleClose}
                sucursal={sucursalToEdit}
            />
        </Box>
    )
}
