'use client'

import PaqueteTable from '@/components/Table/PequeteTable'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'

// ⚡ Lazy load modal (PaqueteEditModal - 378 líneas)
const PaqueteModal = dynamic(() => import('@/components/Modal/PaqueteModal'), {
    loading: () => (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={24} />
        </Box>
    ),
    ssr: false
})

export default function PaquetePage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPaquete, setSelectedPaquete] = useState(null)

    const handleClose = useCallback(() => {
        setModalOpen(false)
        setSelectedPaquete(null)
    }, [])

    const handleEdit = useCallback((paquete) => {
        setSelectedPaquete(paquete)
        setModalOpen(true)
    }, [])

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h2" color="white">
                    Gestión de Paquetes
                </Typography>
            </Box>
            <PaqueteTable onEdit={handleEdit} />
            <PaqueteModal open={modalOpen} onClose={handleClose} paquete={selectedPaquete} />
        </Box>
    )
}
