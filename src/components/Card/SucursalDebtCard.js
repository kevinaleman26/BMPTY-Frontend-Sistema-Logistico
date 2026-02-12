// components/Card/SucursalDebtCard.js
'use client'

import { useDeudaSucursales } from '@/hooks/useDeudaSucursales'
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Typography } from '@mui/material'
import {
    AccountBalance as AccountBalanceIcon,
    LocalShipping as LocalShippingIcon,
    Inventory as InventoryIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material'

/**
 * Component to display debt information for a specific sucursal
 * Shows when a receptor sucursal is selected in the transfer modal
 */
export default function SucursalDebtCard({ sucursalId, sucursalName }) {
    const { deudas, isLoading, isError } = useDeudaSucursales()

    if (!sucursalId) {
        return null
    }

    if (isLoading) {
        return (
            <Card
                sx={{
                    backgroundColor: '#111',
                    border: '1px solid',
                    borderColor: '#444',
                }}
            >
                <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" height={100}>
                        <CircularProgress size={30} />
                    </Box>
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ backgroundColor: '#111', color: '#fff' }}>
                Error al cargar información de deuda
            </Alert>
        )
    }

    // Find debt info for this specific sucursal
    const debtInfo = deudas.find(d => d.sucursal_id === sucursalId)

    if (!debtInfo) {
        return (
            <Card
                sx={{
                    backgroundColor: '#111',
                    border: '1px solid',
                    borderColor: '#444',
                }}
            >
                <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <AccountBalanceIcon sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle1" fontWeight="bold" color="white">
                            Estado de Deuda: {sucursalName}
                        </Typography>
                    </Box>
                    <Alert severity="success" sx={{ backgroundColor: '#1a3a1a', borderColor: '#2e7d32' }}>
                        ✅ Esta sucursal no tiene deudas pendientes
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    const totalAdeudado = parseFloat(debtInfo.total_adeudado || 0)
    const transferencias = parseInt(debtInfo.transferencias_pendientes || 0)
    const paquetes = parseInt(debtInfo.paquetes_totales || 0)

    return (
        <Card
            sx={{
                backgroundColor: '#111',
                border: '1px solid',
                borderColor: totalAdeudado > 1000 ? '#d32f2f' : '#ed6c02',
                transition: 'border-color 0.3s',
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TrendingUpIcon sx={{ color: totalAdeudado > 1000 ? 'error.main' : 'warning.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="white">
                        Estado de Deuda: {debtInfo.sucursal_name}
                    </Typography>
                </Box>

                <Alert
                    severity={totalAdeudado > 1000 ? 'error' : 'warning'}
                    sx={{
                        backgroundColor: totalAdeudado > 1000 ? '#3a1a1a' : '#3a2a1a',
                        borderColor: totalAdeudado > 1000 ? '#d32f2f' : '#ed6c02',
                        mb: 2
                    }}
                >
                    Esta sucursal tiene transferencias pendientes de pago
                </Alert>

                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Total Adeudado */}
                    <Box
                        sx={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: 1,
                            p: 2,
                            border: '1px solid',
                            borderColor: '#333',
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <TrendingUpIcon sx={{ fontSize: 20, color: totalAdeudado > 1000 ? 'error.main' : 'warning.main' }} />
                            <Typography variant="caption" color="text.secondary">
                                Total Adeudado
                            </Typography>
                        </Box>
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{
                                color: totalAdeudado > 1000 ? 'error.main' : 'warning.main',
                                fontFamily: 'JetBrains Mono, monospace',
                            }}
                        >
                            ${totalAdeudado.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Typography>
                    </Box>

                    <Divider sx={{ borderColor: '#333' }} />

                    {/* Transfer and Package Stats */}
                    <Box display="flex" gap={2}>
                        <Box
                            flex={1}
                            sx={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: 1,
                                p: 1.5,
                                border: '1px solid',
                                borderColor: '#333',
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <LocalShippingIcon sx={{ fontSize: 18, color: 'info.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                    Transferencias
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="white">
                                {transferencias}
                            </Typography>
                        </Box>

                        <Box
                            flex={1}
                            sx={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: 1,
                                p: 1.5,
                                border: '1px solid',
                                borderColor: '#333',
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <InventoryIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                <Typography variant="caption" color="text.secondary">
                                    Paquetes
                                </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="white">
                                {paquetes}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}
