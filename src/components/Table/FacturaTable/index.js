// src/components/Table/FacturaTable/index.js
'use client'

import NotaEntregaPDF from '@/components/PDF/FacturaPDF'
import { useFacturas } from '@/hooks/useFacturas'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Chip, CircularProgress, IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useRouter, useSearchParams } from 'next/navigation'
import FacturaFilters from './FacturaFilters'

export default function FacturaTable({ onEdit }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = useFacturas()

    const columns = [
        { field: 'id', headerName: 'Número', width: 80 },

        {
            field: 'cliente',
            headerName: 'Cliente',
            flex: 1,
            renderCell: (params) =>
                params.row.cliente?.full_name || params.row.cliente?.email || '—'
        },

        {
            field: 'sucursal',
            headerName: 'Sucursal',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => (
                <Chip label={params.row.sucursal?.name || '—'} color="primary" />
            )
        },

        {
            field: 'metodo_pago',
            headerName: 'Método de pago',
            flex: 1,
            renderCell: (params) => (
                <Chip label={params.row.metodo_pago?.name || '—'} color="primary" />
            )
        },

        {
            field: 'delivery_status',
            headerName: 'Estado Entrega',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.row.delivery_status ? 'Entregado' : 'Pendiente'}
                    color={params.row.delivery_status ? 'success' : 'error'}
                />
            )
        },

        {
            field: 'payment_status',
            headerName: 'Estado Pago',
            flex: 1,
            renderCell: (params) => (
                <Chip
                    label={params.row.payment_status ? 'Pagado' : 'Pendiente'}
                    color={params.row.payment_status ? 'success' : 'error'}
                />
            )
        },

        {
            field: 'total',
            headerName: 'Total',
            flex: 1,
            renderCell: ({ value }) =>
                value != null ? `$${Number(value).toFixed(2)}` : '—'
        },

        {
            field: 'created_at',
            headerName: 'Fecha',
            flex: 1,
            renderCell: ({ value }) =>
                value ? new Date(value).toLocaleString() : '—'
        },

        {
            field: 'accion',
            headerName: 'Acción',
            width: 120,
            renderCell: (params) => {
                const { sucursal, factura_detalle, subtotal, descuento, otros, impuestos, total } = params.row
                const paquetes = factura_detalle.map(item => {
                    const { proveedor_paquetes } = item;
                    const respuesta = {
                        ...proveedor_paquetes,
                        id: item.id,
                        tracking: item.paquete_id,
                        precioLb: proveedor_paquetes.precio,
                        total: proveedor_paquetes.precio
                    };
                    return respuesta;
                })
                const datosFactura = {
                    ruc: sucursal.ruc,
                    direccion: sucursal.address,
                    sucursal: sucursal.name,
                    logoUrl: '/logo.png', // agrega aquí la ruta o base64 del logo
                    items: paquetes,
                    subtotal,
                    descuento,
                    otros,
                    itbms: impuestos,
                    total
                };
                return (<>
                    <IconButton onClick={() => onEdit(params.row)}>
                        <EditIcon sx={{ color: '#fff' }} />
                    </IconButton>
                    <PDFDownloadLink
                        document={<NotaEntregaPDF data={datosFactura} />}
                        fileName="factura.pdf"
                    >
                        <IconButton>
                            <DescriptionIcon sx={{ color: '#fff' }} />
                        </IconButton>
                    </PDFDownloadLink>
                </>)
            }
        }
    ]


    return (
        <Box width="100%">
            <FacturaFilters />

            <Box height={520}>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <DataGrid
                        rows={data?.data || []}
                        getRowId={(row) => row.id}
                        columns={columns}
                        rowCount={count || 0}
                        paginationMode="server"
                        pageSizeOptions={[5, 10, 20]}
                        paginationModel={{
                            page: Math.max(page - 1, 0),
                            pageSize: limit
                        }}
                        onPaginationModelChange={({ page: newPage, pageSize }) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('page', String(newPage + 1))
                            params.set('limit', String(pageSize))
                            router.push(`?${params.toString()}`)
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            backgroundColor: '#111',
                            color: '#fff',
                            borderColor: '#444',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#222',
                                color: '#000',
                                fontWeight: 'bold'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#222 !important'
                            },
                            '& .MuiDataGrid-footerContainer': {
                                backgroundColor: '#222',
                                color: '#000',
                                fontWeight: 'bold',
                                borderTop: '1px solid #444',
                            },
                            '& .MuiTablePagination-root': {
                                color: '#fff',
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                color: '#fff',
                            },
                            '& .MuiTablePagination-input .MuiSelect-select': {
                                color: '#fff',
                                backgroundColor: 'transparent',
                            },
                            '& .MuiTablePagination-actions .MuiIconButton-root': {
                                color: '#fff',
                            },
                        }}
                    />
                )}
            </Box>
        </Box>
    )
}
