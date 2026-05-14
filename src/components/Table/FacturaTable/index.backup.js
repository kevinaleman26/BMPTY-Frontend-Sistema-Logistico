// src/components/Table/FacturaTable/index.js
'use client'

import NotaEntregaPDF from '@/components/PDF/FacturaPDF'
import { useFacturas } from '@/hooks/useFacturas'
import { dataGridStyles } from '@/styles/dataGridStyles'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { DataGrid } from '@mui/x-data-grid'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'
import FacturaFilters from './FacturaFilters'
import { EditIcon, DescriptionIcon } from '@/components/Icons'


export default function FacturaTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = useFacturas()

    const handlePageChange = useCallback((newPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage + 1)
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const handlePageSizeChange = useCallback((newLimit) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit)
        params.set('page', 1)
        router.push(`?${params.toString()}`)
    }, [searchParams, router])

    const columns = useMemo(() => [
        { field: 'id', headerName: 'Número', width: 80 },
        {
            field: 'cliente',
            headerName: 'Cliente',
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) =>
                row.cliente?.full_name || row.cliente?.email || '—',
            renderCell: (params) => params.value
        },
        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            minWidth: 160,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.sucursal?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'metodo_pago',
            headerName: 'Método de pago',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            valueGetter: (value, row) => row.metodo_pago?.name || '—',
            renderCell: (params) => (
                <Chip label={params.value} color="primary" size="small" />
            )
        },
        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Entregado' : 'Pendiente'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            flex: 1,
            minWidth: 140,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Pagado' : 'Pendiente'}
                    color={params.value ? 'success' : 'error'}
                    size="small"
                />
            )
        },
        {
            field: 'total',
            headerName: 'Total',
            flex: 1,
            minWidth: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: ({ value }) =>
                value != null ? `$${Number(value).toFixed(2)}` : '—'
        },
        {
            field: 'created_at',
            headerName: 'Fecha',
            flex: 1,
            minWidth: 180,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: ({ value }) =>
                value ? new Date(value).toLocaleString() : '—'
        },
        {
            field: 'accion',
            headerName: 'Acción',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                const { id, sucursal, factura_detalle, subtotal, descuento, otros, impuestos, total, cliente } = params.row
                const paquetes = factura_detalle.map(item => {
                    const { proveedor_paquetes } = item;
                    const respuesta = {
                        ...proveedor_paquetes,
                        id: item.id,
                        tracking: item.paquete_id,
                        precioLb: cliente.tarifa,
                        total: (proveedor_paquetes.peso * cliente.tarifa)
                    };
                    return respuesta;
                })
                const datosFactura = {
                    nombreCliente: cliente.full_name,
                    ruc: sucursal.ruc,
                    direccion: sucursal.address,
                    sucursal: sucursal.name,
                    logoUrl: '/logo.png',
                    items: paquetes,
                    subtotal,
                    descuento,
                    otros,
                    itbms: impuestos,
                    total
                };
                return (
                    <>
                        <IconButton onClick={() => onEdit(params.row)}>
                            <EditIcon sx={{ color: '#fff' }} />
                        </IconButton>
                        <PDFDownloadLink
                            document={<NotaEntregaPDF data={datosFactura} />}
                            fileName={`BM${sucursal.id}-Factura${id}-${cliente.full_name}`}
                        >
                            <IconButton>
                                <DescriptionIcon sx={{ color: '#fff' }} />
                            </IconButton>
                        </PDFDownloadLink>
                    </>
                )
            }
        }
    ], [onEdit])

    return (
        <Box sx={{ width: '100%' }}>
            {/* Filtros */}
            <FacturaFilters />

            {/* Tabla */}
            <Box sx={{ height: 500, width: '100%' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        rows={data?.data || []}
                        columns={columns}
                        rowCount={count || 0}
                        paginationMode="server"
                        pageSizeOptions={[5, 10, 20]}
                        paginationModel={{
                            page: Math.max(page - 1, 0),
                            pageSize: limit
                        }}
                        onPaginationModelChange={({ page, pageSize }) => {
                            handlePageChange(page)
                            handlePageSizeChange(pageSize)
                        }}
                        disableRowSelectionOnClick
                        sx={dataGridStyles}
                    />
                )}
            </Box>
        </Box>
    )
}
