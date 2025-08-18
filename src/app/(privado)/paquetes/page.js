'use client'

import PaqueteModal from '@/components/Modal/PaqueteModal'
import PaqueteTable from '@/components/Table/PequeteTable'
import { Box, Typography } from '@mui/material'
import { useState } from 'react'

export default function PaquetePage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPaquete, setSelectedPaquete] = useState(null)

    const handleClose = () => {
        setModalOpen(false)
        setSelectedPaquete(null)
    }

    const handleEdit = (paquete) => {
        setSelectedPaquete(paquete)
        setModalOpen(true)
    }

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
