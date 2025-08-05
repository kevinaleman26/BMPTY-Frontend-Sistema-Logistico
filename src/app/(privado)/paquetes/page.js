'use client'


import PaqueteModal from '@/components/Modal/PaqueteModal'
import PaqueteTable from '@/components/Table/PequeteTable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button } from '@mui/material'
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
                <h2>Gestión de Paquetes</h2>
                <Button variant="contained" onClick={() => setModalOpen(true)} startIcon={<AddIcon />}>
                    Crear Paquete
                </Button>
            </Box>

            <PaqueteTable onEdit={handleEdit} />
            <PaqueteModal open={modalOpen} onClose={handleClose} paquete={selectedPaquete} />
        </Box>
    )
}
