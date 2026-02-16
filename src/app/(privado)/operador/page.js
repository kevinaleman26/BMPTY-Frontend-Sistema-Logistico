'use client'

import OperadorModal from '@/components/Modal/OperadorModal'
import OperadorTable from '@/components/Table/OperadorTable'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useState, useCallback } from 'react'

export default function OperadorPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedOperador, setSelectedOperador] = useState(null)

    const handleClose = useCallback(() => {
        setModalOpen(false)
        setSelectedOperador(null)
    }, [])

    const handleEdit = useCallback((operador) => {
        setSelectedOperador(operador)
        setModalOpen(true)
    }, [])

    const newOperator = useCallback(() => {
        setSelectedOperador(null)
        setModalOpen(true)
    }, [])

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" color="white">
                    Gestión de Operadores
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={newOperator}
                >
                    Nuevo Operador
                </Button>
            </Box>

            <OperadorTable onEdit={handleEdit} />
            <OperadorModal open={modalOpen} onClose={handleClose} operador={selectedOperador} />
        </Box>
    )
}
