'use client'


import OperadorModal from '@/components/Modal/OperadorModal'
import OperadorTable from '@/components/Table/OperadorTable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

export default function OperadorPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedOperador, setSelectedOperador] = useState(null)

    const handleClose = () => {
        setModalOpen(false)
        setSelectedOperador(null)
    }

    const handleEdit = (operador) => {
        setSelectedOperador(operador)
        setModalOpen(true)
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" color="white">
                    Gestión de Operadores
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setModalOpen(true)}
                >
                    Nuevo Operador
                </Button>
            </Box>

            <OperadorTable onEdit={handleEdit} />
            <OperadorModal open={modalOpen} onClose={handleClose} operador={selectedOperador} />
        </Box>
    )
}
