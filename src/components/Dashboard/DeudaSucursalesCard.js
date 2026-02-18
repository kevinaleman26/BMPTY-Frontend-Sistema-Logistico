// components/Dashboard/DeudaSucursalesCard.js
'use client'

import { useDeudaSucursales } from '@/hooks/useDeudaSucursales'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import InventoryIcon from '@mui/icons-material/Inventory'

/**
 * Stat card component for displaying key metrics
 */
const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <Card
        className="slide-up"
        sx={{
            backgroundColor: '#111',
            border: '1px solid',
            borderColor: '#444',
            borderRadius: '12px',
            opacity: 0,
            animationFillMode: 'forwards',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                borderColor: '#666',
            },
        }}
    >
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box
                    sx={{
                        backgroundColor: `${color}.dark`,
                        borderRadius: '10px',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon sx={{ color: `${color}.main`, fontSize: 28 }} />
                </Box>
            </Box>
            <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="h4"
                fontWeight="bold"
                color="white"
                gutterBottom
                sx={{
                    fontVariantNumeric: 'tabular-nums',
                    mb: 0.5,
                }}
            >
                {value}
            </Typography>
            {subtitle && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 'auto', fontSize: '0.75rem' }}
                >
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
)

/**
 * Dashboard card component to display debt information by sucursal
 * Shows pending transfers and total amounts owed to each receptor sucursal
 */
export default function DeudaSucursalesCard() {
    const { deudas, totalGeneral, isLoading, isError, error } = useDeudaSucursales()

    // Calculate statistics
    const sucursalesConDeuda = deudas.length
    const totalTransferencias = deudas.reduce((sum, d) => sum + (parseInt(d.transferencias_pendientes) || 0), 0)
    const totalPaquetes = deudas.reduce((sum, d) => sum + (parseInt(d.paquetes_totales) || 0), 0)
    const promedioDeuda = sucursalesConDeuda > 0 ? totalGeneral / sucursalesConDeuda : 0

    const columns = [
        {
            field: 'sucursal_name',
            headerName: 'Sucursal Receptora',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">
                        {params.value}
                    </Typography>
                    {params.row.sucursal_ruc && (
                        <Typography variant="caption" color="text.secondary">
                            RUC: {params.row.sucursal_ruc}
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'transferencias_pendientes',
            headerName: 'Transferencias',
            width: 150,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color="warning"
                    size="small"
                    sx={{ minWidth: 60 }}
                />
            )
        },
        {
            field: 'paquetes_totales',
            headerName: 'Paquetes',
            width: 120,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color="info"
                    size="small"
                    variant="outlined"
                    sx={{ minWidth: 60 }}
                />
            )
        },
        {
            field: 'total_adeudado',
            headerName: 'Total Adeudado',
            width: 180,
            type: 'number',
            renderCell: (params) => {
                const value = parseFloat(params.value || 0)
                return (
                    <Box
                        sx={{
                            color: value > 1000 ? 'error.main' : 'warning.main',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        ${value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </Box>
                )
            }
        }
    ]

    if (isError) {
        return (
            <Card
                sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent>
                    <Typography variant="h6" color="error" gutterBottom>
                        Error al cargar deudas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {error?.message || 'Ocurrió un error al obtener la información'}
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    return (
        <Box>
            {/* Statistics Cards */}
            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(4, 1fr)',
                            },
                            gap: { xs: 2, sm: 2.5, md: 3 },
                            mb: { xs: 3, md: 4 },
                        }}
                    >
                        <StatCard
                            title="Total Adeudado"
                            value={`$${totalGeneral.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`}
                            icon={TrendingUpIcon}
                            color="error"
                            subtitle="Total general pendiente"
                        />
                        <StatCard
                            title="Sucursales con Deuda"
                            value={sucursalesConDeuda}
                            icon={AccountBalanceIcon}
                            color="warning"
                            subtitle={sucursalesConDeuda === 1 ? 'Sucursal receptora' : 'Sucursales receptoras'}
                        />
                        <StatCard
                            title="Transferencias Pendientes"
                            value={totalTransferencias}
                            icon={LocalShippingIcon}
                            color="info"
                            subtitle="Total de transferencias"
                        />
                        <StatCard
                            title="Paquetes en Tránsito"
                            value={totalPaquetes}
                            icon={InventoryIcon}
                            color="success"
                            subtitle="Total de paquetes"
                        />
                    </Box>

                    {/* Main Data Table */}
                    <Card
                        className="slide-up"
                        sx={{
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #1a1a1a',
                            borderRadius: '12px',
                            opacity: 0,
                            animationFillMode: 'forwards',
                            animationDelay: '0.2s',
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box mb={3}>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    fontWeight="bold"
                                    sx={{
                                        color: '#fff',
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    }}
                                >
                                    Detalle por Sucursal
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Información detallada de transferencias pendientes
                                </Typography>
                            </Box>

                            {deudas.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    alignItems="center"
                                    height={300}
                                    gap={2}
                                    sx={{
                                        backgroundColor: '#111',
                                        borderRadius: '10px',
                                        border: '1px solid #1a1a1a',
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary">
                                        ✅ No hay deudas pendientes
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Todas las transferencias están pagadas
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        height: { xs: 350, sm: 400, md: 450 },
                                        width: '100%',
                                    }}
                                >
                                    <DataGrid
                                        rows={deudas}
                                        columns={columns}
                                        getRowId={(row) => row.sucursal_id}
                                        disableRowSelectionOnClick
                                        pageSizeOptions={[5, 10, 20]}
                                        initialState={{
                                            pagination: {
                                                paginationModel: { pageSize: 10 }
                                            }
                                        }}
                                        sx={{
                                            backgroundColor: '#111',
                                            color: '#fff',
                                            border: '1px solid #1a1a1a',
                                            borderRadius: '10px',
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: '#222',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                borderBottom: '1px solid #333',
                                            },
                                            '& .MuiDataGrid-row': {
                                                borderBottom: '1px solid #1a1a1a',
                                                '&:hover': {
                                                    backgroundColor: '#1a1a1a !important',
                                                },
                                            },
                                            '& .MuiDataGrid-cell': {
                                                borderColor: '#1a1a1a',
                                            },
                                            '& .MuiTablePagination-root': {
                                                color: '#fff',
                                                borderTop: '1px solid #1a1a1a',
                                            },
                                            '& .MuiTablePagination-selectIcon': {
                                                color: '#fff',
                                            },
                                            '& .MuiIconButton-root': {
                                                color: '#fff',
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                borderTop: '1px solid #1a1a1a',
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </Box>
    )
}
