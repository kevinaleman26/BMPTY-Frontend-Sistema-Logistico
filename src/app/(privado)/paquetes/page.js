'use client'

import PaqueteTable from '@/components/Table/PequeteTable'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'

const PaqueteModal = dynamic(() => import('@/components/Modal/PaqueteModal'), {
    loading: () => (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={24} />
        </Box>
    ),
    ssr: false
})

const PaqueteEditModal = dynamic(() => import('@/components/Modal/PaqueteEditModal'), {
    ssr: false
})

export default function PaquetePage() {
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedPaquete, setSelectedPaquete] = useState(null)

    const handleOpenCreate = useCallback(() => setCreateModalOpen(true), [])
    const handleCloseCreate = useCallback(() => setCreateModalOpen(false), [])

    const handleEdit = useCallback((paquete) => {
        setSelectedPaquete(paquete)
        setEditModalOpen(true)
    }, [])

    const handleCloseEdit = useCallback(() => {
        setEditModalOpen(false)
        setSelectedPaquete(null)
    }, [])

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h2" color="white">
                    Gestión de Paquetes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ backgroundColor: '#f4b223', color: '#000', '&:hover': { backgroundColor: '#d4991e' } }}
                >
                    Registrar Paquete
                </Button>
            </Box>

            <PaqueteTable onEdit={handleEdit} />

            <PaqueteModal open={createModalOpen} onClose={handleCloseCreate} />
            <PaqueteEditModal open={editModalOpen} onClose={handleCloseEdit} paquete={selectedPaquete} />
        </Box>
    )
}
