'use client'

import OperadorTable from '@/components/Table/OperadorTable'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { AddIcon } from '@/components/Icons'


// ⚡ Lazy load modal (122 líneas)
const OperadorModal = dynamic(() => import('@/components/Modal/OperadorModal'), {
    loading: () => (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={24} />
        </Box>
    ),
    ssr: false
})

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
