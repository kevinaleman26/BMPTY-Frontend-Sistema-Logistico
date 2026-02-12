// app/(privado)/deudas-sucursales/page.js
'use client'

import DeudaSucursalesCard from '@/components/Dashboard/DeudaSucursalesCard'
import { Box, Typography } from '@mui/material'

/**
 * Page to display debts by sucursal
 * Shows a comprehensive view of all pending transfers and amounts owed
 */
export default function DeudaSucursalesPage() {
    return (
        <Box p={3}>
            <Box mb={3}>
                <Typography variant="h2" color="white" gutterBottom>
                    Gestión de Deudas por Sucursal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualiza las transferencias pendientes de pago y el monto total adeudado por cada sucursal receptora.
                </Typography>
            </Box>

            <DeudaSucursalesCard />
        </Box>
    )
}
