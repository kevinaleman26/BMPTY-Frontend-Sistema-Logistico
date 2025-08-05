// app/(privado)/transferencia/page.js
'use client'


import TransferenciaModal from '@/components/Modal/TransferenciaModal'
import TransferenciaTable from '@/components/Table/TransferenciaTable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button } from '@mui/material'
import { useState } from 'react'

export default function TransferenciaPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedTransferencia, setSelectedTransferencia] = useState(null)

    const handleOpen = () => {
        setSelectedTransferencia(null)
        setModalOpen(true)
    }

    const handleEdit = (transferencia) => {
        setSelectedTransferencia(transferencia)
        setModalOpen(true)
    }

    const handleClose = () => {
        setModalOpen(false)
        setSelectedTransferencia(null)
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <h2>Gestión de Transferencias</h2>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                >
                    Nueva Transferencia
                </Button>
            </Box>

            <TransferenciaTable onEdit={handleEdit} />

            <TransferenciaModal
                open={modalOpen}
                onClose={handleClose}
                transferencia={selectedTransferencia}
            />
        </Box>
    )
}
