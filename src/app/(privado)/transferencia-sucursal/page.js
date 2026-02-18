// app/(privado)/transferencia/page.js
'use client'

import SucursalDebtCard from '@/components/Card/SucursalDebtCard'
import TransferenciaModal from '@/components/Modal/TransferenciaModal'
import TransferenciaTable from '@/components/Table/TransferenciaTable'
import { useSucursal } from '@/hooks/useSucursal'
import { useSession } from '@/hooks/useSession'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { AddIcon } from '@/components/Icons'


export default function TransferenciaPage() {
    const searchParams = useSearchParams()
    const { session } = useSession()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedTransferencia, setSelectedTransferencia] = useState(null)

    // Get receptor_sucursal from URL params
    const receptorSucursalId = searchParams.get('receptor_sucursal')
    const { data: sucursales } = useSucursal()

    // Only SuperAdmin and Admin can create transfers
    const canCreate = session?.role?.id === 1 || session?.role?.id === 2

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

    // Find selected sucursal name
    const selectedSucursal = sucursales?.find(s => s.id === Number(receptorSucursalId))

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h2" color="white">
                    Gestión de Transferencias
                </Typography>
                {canCreate && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                    >
                        Nueva Transferencia
                    </Button>
                )}
            </Box>

            {/* Show debt card when receptor sucursal is filtered */}
            {receptorSucursalId && (
                <Box mb={3}>
                    <SucursalDebtCard
                        sucursalId={Number(receptorSucursalId)}
                        sucursalName={selectedSucursal?.name}
                    />
                </Box>
            )}

            <TransferenciaTable onEdit={handleEdit} />
            <TransferenciaModal
                open={modalOpen}
                onClose={handleClose}
                transferencia={selectedTransferencia}
            />
        </Box>
    )
}
