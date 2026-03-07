// components/Dashboard/DeudaSucursalesCard.js
'use client'

import {
    useDeudaSucursales,
    useDeudaFacturasSucursales,
    useTransferenciasPendientes,
    useFacturasPendientes,
} from '@/hooks/useDeudaSucursales'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import InventoryIcon from '@mui/icons-material/Inventory'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import { useMemo, useState, useCallback } from 'react'

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'

const formatMoney = (v) => `$${parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <Card sx={{
        backgroundColor: '#111',
        border: '1px solid #444',
        borderRadius: '12px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, border-color 0.2s',
        '&:hover': { transform: 'translateY(-3px)', borderColor: '#666' },
    }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box sx={{
                    backgroundColor: `${color}.dark`,
                    borderRadius: '10px', p: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon sx={{ color: `${color}.main`, fontSize: 28 }} />
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom
                sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="white" sx={{ fontVariantNumeric: 'tabular-nums', mb: 0.5 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', fontSize: '0.75rem' }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
)

// ── Drill-down dialog: Transferencias pendientes de una sucursal ──────────────

function TransferenciasDetailDialog({ sucursal, onClose }) {
    const { transferencias, isLoading } = useTransferenciasPendientes(sucursal?.id ?? null)

    const columns = useMemo(() => [
        { field: 'transferencia_id', headerName: 'ID', width: 70, filterable: false },
        {
            field: 'emisor_sucursal_name', headerName: 'Sucursal Emisora', flex: 1, minWidth: 140,
            filterable: false,
            renderCell: (p) => (
                <Chip label={p.value} size="small"
                    sx={{ backgroundColor: '#1a2a3a', color: '#64b5f6', border: '1px solid #1565c0', fontSize: '0.72rem' }} />
            )
        },
        {
            field: 'created_at', headerName: 'Fecha', width: 110, filterable: false,
            valueGetter: (v) => formatDate(v),
        },
        {
            field: 'cantidad_paquetes', headerName: 'Paquetes', width: 90,
            filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (p) => (
                <Chip label={p.value} size="small" color="info" variant="outlined" sx={{ minWidth: 50 }} />
            )
        },
        {
            field: 'delivery_status', headerName: 'Entrega', width: 100,
            filterable: false,
            renderCell: (p) => (
                <Chip label={p.value ? 'Recibida' : 'Pendiente'} size="small"
                    color={p.value ? 'success' : 'warning'} />
            )
        },
        {
            field: 'total', headerName: 'Total', width: 120, filterable: false,
            renderCell: (p) => (
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#f4b223' }}>
                    {formatMoney(p.value)}
                </Typography>
            )
        },
    ], [])

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md"
            PaperProps={{ sx: { backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' } }}>
            <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                        Transferencias pendientes
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                        {sucursal?.name} — {transferencias.length} transferencia{transferencias.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#aaa' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : transferencias.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                        No hay transferencias pendientes
                    </Typography>
                ) : (
                    <Box sx={{ height: 380 }}>
                        <DataGrid
                            rows={transferencias}
                            columns={columns}
                            getRowId={(r) => r.transferencia_id}
                            pageSizeOptions={[5, 10]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableRowSelectionOnClick
                            sx={datagridSx}
                        />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ── Drill-down dialog: Facturas pendientes de una sucursal ───────────────────

function FacturasDetailDialog({ sucursal, onClose }) {
    const { facturas, isLoading } = useFacturasPendientes(sucursal?.id ?? null)

    const columns = useMemo(() => [
        { field: 'factura_id', headerName: 'ID', width: 70, filterable: false },
        {
            field: 'cliente_nombre', headerName: 'Cliente', flex: 1, minWidth: 160,
            filterable: false,
        },
        {
            field: 'metodo_pago_name', headerName: 'Método Pago', width: 130,
            filterable: false,
            valueGetter: (v) => v || 'Ninguno',
        },
        {
            field: 'created_at', headerName: 'Fecha', width: 110, filterable: false,
            valueGetter: (v) => formatDate(v),
        },
        {
            field: 'paquetes_count', headerName: 'Paquetes', width: 90,
            filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (p) => (
                <Chip label={p.value} size="small" color="info" variant="outlined" sx={{ minWidth: 50 }} />
            )
        },
        {
            field: 'delivery_status', headerName: 'Entrega', width: 100,
            filterable: false,
            renderCell: (p) => (
                <Chip label={p.value ? 'Entregada' : 'Pendiente'} size="small"
                    color={p.value ? 'success' : 'warning'} />
            )
        },
        {
            field: 'total', headerName: 'Total', width: 120, filterable: false,
            renderCell: (p) => (
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#f4b223' }}>
                    {formatMoney(p.value)}
                </Typography>
            )
        },
    ], [])

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="md"
            PaperProps={{ sx: { backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' } }}>
            <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                        Facturas pendientes de pago
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                        {sucursal?.name} — {facturas.length} factura{facturas.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#aaa' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : facturas.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                        No hay facturas pendientes
                    </Typography>
                ) : (
                    <Box sx={{ height: 380 }}>
                        <DataGrid
                            rows={facturas}
                            columns={columns}
                            getRowId={(r) => r.factura_id}
                            pageSizeOptions={[5, 10]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableRowSelectionOnClick
                            sx={datagridSx}
                        />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ── Shared DataGrid styles ────────────────────────────────────────────────────

const datagridSx = {
    backgroundColor: '#0d0d0d',
    color: '#fff',
    border: '1px solid #222',
    borderRadius: '8px',
    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#1a1a1a', color: '#fff', fontWeight: 700, borderBottom: '1px solid #333' },
    '& .MuiDataGrid-row': { borderBottom: '1px solid #1a1a1a', '&:hover': { backgroundColor: '#1a1a1a !important' } },
    '& .MuiDataGrid-cell': { borderColor: '#1a1a1a' },
    '& .MuiTablePagination-root': { color: '#fff' },
    '& .MuiTablePagination-selectIcon': { color: '#fff' },
    '& .MuiIconButton-root': { color: '#fff' },
    '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #1a1a1a' },
}

// ── Reusable section component ────────────────────────────────────────────────

function DeudaSection({ title, subtitle, statCards, columns, rows, emptyText, getRowId, isLoading }) {
    return (
        <Box mb={5}>
            <Box mb={3}>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: { xs: 2, md: 3 },
                mb: 3,
            }}>
                {statCards.map((card, i) => <StatCard key={i} {...card} />)}
            </Box>

            <Card sx={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                            <CircularProgress />
                        </Box>
                    ) : rows.length === 0 ? (
                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"
                            height={200} gap={1} sx={{ backgroundColor: '#111', borderRadius: '10px', border: '1px solid #1a1a1a' }}>
                            <Typography variant="h6" color="text.secondary">Sin deudas pendientes</Typography>
                            <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ height: { xs: 350, md: 420 } }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                getRowId={getRowId}
                                disableRowSelectionOnClick
                                pageSizeOptions={[5, 10, 20]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                sx={datagridSx}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DeudaSucursalesCard() {
    const { deudas: deudasTransf, totalGeneral: totalTransf, isLoading: loadingTransf } = useDeudaSucursales()
    const { deudas: deudasFact, totalGeneral: totalFact, isLoading: loadingFact } = useDeudaFacturasSucursales()

    const [drillTransf, setDrillTransf] = useState(null)
    const [drillFact, setDrillFact] = useState(null)

    // ── Columns: transfers table ──────────────────────────────────────────────
    const transferColumns = useMemo(() => [
        {
            field: 'sucursal_name', headerName: 'Sucursal Receptora', flex: 1, minWidth: 180,
            filterable: false,
            renderCell: (p) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">{p.value}</Typography>
                    {p.row.sucursal_ruc && (
                        <Typography variant="caption" color="text.secondary">RUC: {p.row.sucursal_ruc}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'transferencias_pendientes', headerName: 'Transferencias', width: 140,
            filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (p) => <Chip label={p.value} color="warning" size="small" sx={{ minWidth: 60 }} />
        },
        {
            field: 'paquetes_totales', headerName: 'Paquetes', width: 110,
            filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (p) => <Chip label={p.value} color="info" size="small" variant="outlined" sx={{ minWidth: 60 }} />
        },
        {
            field: 'total_adeudado', headerName: 'Total Adeudado', width: 160, filterable: false,
            renderCell: (p) => {
                const v = parseFloat(p.value || 0)
                return (
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: v > 1000 ? '#f44336' : '#ff9800', fontFamily: 'monospace' }}>
                        {formatMoney(v)}
                    </Typography>
                )
            }
        },
        {
            field: 'detalle', headerName: 'Detalle', width: 80,
            sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p) => (
                <IconButton size="small"
                    onClick={() => setDrillTransf({ id: p.row.sucursal_id, name: p.row.sucursal_name })}
                    sx={{ color: '#64b5f6', '&:hover': { color: '#fff', backgroundColor: 'rgba(100,181,246,0.1)' } }}>
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        },
    ], [])

    // ── Columns: facturas table ───────────────────────────────────────────────
    const facturaColumns = useMemo(() => [
        {
            field: 'sucursal_name', headerName: 'Sucursal', flex: 1, minWidth: 180,
            filterable: false,
            renderCell: (p) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">{p.value}</Typography>
                    {p.row.sucursal_ruc && (
                        <Typography variant="caption" color="text.secondary">RUC: {p.row.sucursal_ruc}</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'facturas_pendientes', headerName: 'Facturas', width: 110,
            filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (p) => <Chip label={p.value} color="warning" size="small" sx={{ minWidth: 60 }} />
        },
        {
            field: 'clientes_con_deuda', headerName: 'Clientes', width: 110,
            filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (p) => <Chip label={p.value} color="secondary" size="small" variant="outlined" sx={{ minWidth: 60 }} />
        },
        {
            field: 'total_adeudado', headerName: 'Total Pendiente', width: 160, filterable: false,
            renderCell: (p) => {
                const v = parseFloat(p.value || 0)
                return (
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: v > 1000 ? '#f44336' : '#ff9800', fontFamily: 'monospace' }}>
                        {formatMoney(v)}
                    </Typography>
                )
            }
        },
        {
            field: 'detalle', headerName: 'Detalle', width: 80,
            sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (p) => (
                <IconButton size="small"
                    onClick={() => setDrillFact({ id: p.row.sucursal_id, name: p.row.sucursal_name })}
                    sx={{ color: '#64b5f6', '&:hover': { color: '#fff', backgroundColor: 'rgba(100,181,246,0.1)' } }}>
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        },
    ], [])

    // ── Stat values ───────────────────────────────────────────────────────────
    const totalTransferencias = deudasTransf.reduce((s, d) => s + (parseInt(d.transferencias_pendientes) || 0), 0)
    const totalPaquetes = deudasTransf.reduce((s, d) => s + (parseInt(d.paquetes_totales) || 0), 0)
    const totalFacturas = deudasFact.reduce((s, d) => s + (parseInt(d.facturas_pendientes) || 0), 0)
    const totalClientes = deudasFact.reduce((s, d) => s + (parseInt(d.clientes_con_deuda) || 0), 0)

    return (
        <Box>
            {/* ── Sección: Deudas por Transferencias ── */}
            <DeudaSection
                title="Deudas por Transferencias"
                subtitle="Transferencias recibidas con pago pendiente, agrupadas por sucursal receptora"
                isLoading={loadingTransf}
                rows={deudasTransf}
                columns={transferColumns}
                getRowId={(r) => r.sucursal_id}
                emptyText="Todas las transferencias están pagadas"
                statCards={[
                    { title: 'Total Adeudado', value: formatMoney(totalTransf), icon: TrendingUpIcon, color: 'error', subtitle: 'Transferencias sin pagar' },
                    { title: 'Sucursales con Deuda', value: deudasTransf.length, icon: AccountBalanceIcon, color: 'warning', subtitle: 'Sucursales receptoras' },
                    { title: 'Transferencias Pendientes', value: totalTransferencias, icon: LocalShippingIcon, color: 'info', subtitle: 'Total de transferencias' },
                    { title: 'Paquetes en Tránsito', value: totalPaquetes, icon: InventoryIcon, color: 'success', subtitle: 'Total de paquetes' },
                ]}
            />

            {/* ── Sección: Deudas por Facturación ── */}
            <DeudaSection
                title="Deudas por Facturación"
                subtitle="Facturas pendientes de pago por clientes, agrupadas por sucursal"
                isLoading={loadingFact}
                rows={deudasFact}
                columns={facturaColumns}
                getRowId={(r) => r.sucursal_id}
                emptyText="Todas las facturas están pagadas"
                statCards={[
                    { title: 'Total Pendiente', value: formatMoney(totalFact), icon: TrendingUpIcon, color: 'error', subtitle: 'Facturas sin pagar' },
                    { title: 'Sucursales', value: deudasFact.length, icon: AccountBalanceIcon, color: 'warning', subtitle: 'Con facturas pendientes' },
                    { title: 'Facturas Pendientes', value: totalFacturas, icon: ReceiptIcon, color: 'info', subtitle: 'Total de facturas' },
                    { title: 'Clientes con Deuda', value: totalClientes, icon: PeopleIcon, color: 'secondary', subtitle: 'Clientes únicos' },
                ]}
            />

            {/* ── Drill-down dialogs ── */}
            {drillTransf && (
                <TransferenciasDetailDialog
                    sucursal={drillTransf}
                    onClose={() => setDrillTransf(null)}
                />
            )}
            {drillFact && (
                <FacturasDetailDialog
                    sucursal={drillFact}
                    onClose={() => setDrillFact(null)}
                />
            )}
        </Box>
    )
}
