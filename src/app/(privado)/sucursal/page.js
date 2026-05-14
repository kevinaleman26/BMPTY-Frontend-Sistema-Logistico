'use client'

import SucursalTable from '@/components/Table/SucursalTable'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { AddIcon } from '@/components/Icons'


// ⚡ Lazy load modal (143 líneas)
const SucursalModal = dynamic(() => import('@/components/Modal/SucursalModal'), {
    loading: () => (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={24} />
        </Box>
    ),
    ssr: false
})

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
