'use client'


import SucursalModal from '@/components/Modal/SucursalModal'
import SucursalTable from '@/components/Table/SucursalTable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

export default function SucursalesPage() {
    const [open, setOpen] = useState(false)
    const [sucursalToEdit, setSucursalToEdit] = useState(null)

    const handleOpenCreate = () => {
        setSucursalToEdit(null)
        setOpen(true)
    }

    const handleEdit = (sucursal) => {
        setSucursalToEdit(sucursal)
        setOpen(true)
    }

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
                onClose={() => setOpen(false)}
                sucursal={sucursalToEdit} // se pasa al modal
            />
        </Box>
    )
}
