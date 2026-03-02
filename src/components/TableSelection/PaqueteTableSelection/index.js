'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SearchIcon } from '@/components/Icons'


export default function PaqueteTableSelection({ formik, editable = true }) {
    const { session } = useSession()
    const [localPage, setLocalPage] = useState(1)
    const [localLimit, setLocalLimit] = useState(10)
    const { data, count, isLoading, page, limit } = usePaquetes({ soloDisponibles: true, localPage, localLimit })

    // initDT: only used in read-only mode (editable=false) to fetch and display
    // current packages as a non-interactive list.
    const [initDT, setInitDt] = useState(() =>
        !editable && Array.isArray(formik?.values?.paqueteList)
            ? formik.values.paqueteList.map(item => item.paquete_id || item.codigo)
            : []
    )

    // selectedRows: pre-populated in editable edit mode from the existing paqueteList.
    // Items are normalized to the proveedor_paquetes shape so they're consistent
    // with packages added via barcode scanner or DataGrid selection.
    const [selectedRows, setSelectedRows] = useState(() => {
        if (
            editable &&
            Array.isArray(formik?.values?.paqueteList) &&
            formik.values.paqueteList.length > 0
        ) {
            return formik.values.paqueteList.map(item => ({
                id: item.proveedor_id ?? item.id,
                codigo: item.codigo,
                tipo: item.tipo,
                peso: item.peso,
                precio: item.precio,
                largo: item.largo,
                alto: item.alto,
                ancho: item.ancho,
                volumen: item.volumen,
            }))
        }
        return []
    })
    const [search, setSearch] = useState('')
    const [barcodeInput, setBarcodeInput] = useState('')
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

    // 🚀 Trae los paquetes por código (solo si hay initDT) — FUERA de useMemo
    const {
        data: initRows = [],
        isLoading: initLoading,
        isError: initError,
    } = useQuery({
        queryKey: ['proveedor_paquetesByCodigo', initDT],
        enabled: Array.isArray(initDT) && initDT.length > 0,
        staleTime: 30_000,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('proveedor_paquetes')
                .select('*')
                .in('codigo', initDT)
            if (error) throw error
            return data ?? []
        },
    })

    const baseRows = data?.data || []

    // ✅ Solo lógica sincrónica dentro de useMemo
    const filteredRows = useMemo(() => {
        if (initDT.length > 0) return initRows

        if (!search.trim()) return baseRows

        const lower = search.toLowerCase()
        const filtrados = baseRows.filter(row =>
            Object.values(row).some(value => String(value).toLowerCase().includes(lower))
        )
        const combined = [...selectedRows, ...filtrados]
        return Array.from(new Map(combined.map(item => [item.codigo, item])).values())
    }, [initDT, initRows, baseRows, search, selectedRows])

    // Handlers de selección (después de filteredRows)
    const handleSelectAll = useCallback((event) => {
        if (event.target.checked) {
            // Seleccionar todas las filas visibles
            setSelectedRows(filteredRows)
        } else {
            // Deseleccionar todas
            setSelectedRows([])
        }
    }, [filteredRows])

    const handleSelectOne = useCallback((row) => {
        setSelectedRows((prev) => {
            const isSelected = prev.some(r => (r.id ?? r.codigo) === (row.id ?? row.codigo))
            if (isSelected) {
                return prev.filter(r => (r.id ?? r.codigo) !== (row.id ?? row.codigo))
            } else {
                return [...prev, row]
            }
        })
    }, [])

    // Función para mostrar notificaciones
    const showNotification = useCallback((message, severity = 'info') => {
        setSnackbar({ open: true, message, severity })
    }, [])

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }, [])

    // Validar últimos 7 caracteres
    const validateLast7Chars = useCallback((barcode, packageCode) => {
        const barcodeLast7 = barcode.slice(-7)
        const packageLast7 = packageCode.slice(-7)
        return barcodeLast7 === packageLast7
    }, [])

    // Buscar paquete por código de barras y agregarlo directamente si está disponible
    const searchPackageByBarcode = useCallback(async (barcode) => {
        if (!barcode.trim()) return

        try {
            const last7 = barcode.slice(-7)

            const { data: candidates, error } = await supabase
                .from('proveedor_paquetes')
                .select('*')
                .ilike('codigo', `%${last7}`)

            if (error) throw error

            const matchingPackage = candidates?.find(pkg => validateLast7Chars(barcode, pkg.codigo))

            if (!matchingPackage) {
                showNotification('No se encontró un paquete con ese código', 'error')
                return
            }

            // Verificar si ya está seleccionado
            const alreadySelected = selectedRows.some(
                r => (r.id ?? r.codigo) === (matchingPackage.id ?? matchingPackage.codigo)
            )
            if (alreadySelected) {
                showNotification(`Paquete ${matchingPackage.codigo} ya está en la lista`, 'warning')
                setBarcodeInput('')
                return
            }

            // Verificar disponibilidad: no facturado y no en transferencia activa (cualquier sucursal)
            const { data: facturaCheck } = await supabase
                .from('factura_detalle')
                .select('paquete_id')
                .eq('paquete_id', matchingPackage.codigo)
                .maybeSingle()

            if (facturaCheck) {
                showNotification('Este paquete ya fue facturado y no está disponible', 'error')
                return
            }

            // Buscar si el paquete está en alguna transferencia aún no entregada (global)
            const { data: solicitudes } = await supabase
                .from('solicitud_paquete')
                .select('transferencia_id')
                .eq('paquete_id', matchingPackage.codigo)

            if (solicitudes?.length > 0) {
                const { data: activeTransfer } = await supabase
                    .from('transferencia_sucursal')
                    .select('id')
                    .in('id', solicitudes.map(s => s.transferencia_id))
                    .eq('delivery_status', false)
                    .maybeSingle()

                if (activeTransfer) {
                    showNotification('Este paquete ya está en una transferencia activa', 'error')
                    return
                }
            }

            // Agregar directamente sin confirmación
            setSelectedRows(prev => [...prev, matchingPackage])
            showNotification(`Paquete ${matchingPackage.codigo} agregado`, 'success')
            setBarcodeInput('')

        } catch (error) {
            console.error('Error searching package:', error)
            showNotification('Error al buscar el paquete', 'error')
        }
    }, [validateLast7Chars, showNotification, selectedRows, session])

    // Manejar búsqueda con botón o Enter
    const handleManualSearch = useCallback(() => {
        searchPackageByBarcode(barcodeInput)
    }, [barcodeInput, searchPackageByBarcode])

    // Manejar evento de teclado en campo de código de barras
    const handleBarcodeKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleManualSearch()
        }
    }, [handleManualSearch])

    // Actualizar formik cuando cambia la selección
    // En modo edición (initDT.length > 0), no sobreescribir el paqueteList original
    useEffect(() => {
        if (initDT.length > 0) return
        if (selectedRows?.length > 0) {
            formik.setFieldValue('paqueteList', selectedRows)
        } else {
            formik.setFieldValue('paqueteList', [])
        }
    }, [selectedRows])

    // Columnas con custom checkbox
    const columns = useMemo(() => [
        {
            field: 'select',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderHeader: () => (
                <Checkbox
                    checked={filteredRows.length > 0 && selectedRows.length === filteredRows.length}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredRows.length}
                    onChange={handleSelectAll}
                    disabled={!editable}
                    sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' } }}
                />
            ),
            renderCell: (params) => {
                const isSelected = selectedRows.some(r => (r.id ?? r.codigo) === (params.row.id ?? params.row.codigo))
                return (
                    <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(params.row)}
                        disabled={!editable}
                        sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' } }}
                    />
                )
            }
        },
        { field: 'codigo', headerName: 'Código', flex: 3 },
        { field: 'largo', headerName: 'Largo', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'alto', headerName: 'Alto', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'ancho', headerName: 'Ancho', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'peso', headerName: 'Peso', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'volumen', headerName: 'Volumen', type: 'number', flex: 1, align: 'center', headerAlign: 'center' },
    ], [filteredRows, selectedRows, handleSelectAll, handleSelectOne, initDT])

    return (
        <Box height="auto">
            <Typography variant="h6" gutterBottom>
                Lista de Paquetes
            </Typography>

            {initDT.length === 0 && (
                <Box my={2}>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Buscar paquete"
                            variant="outlined"
                            size="small"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            onKeyDown={handleBarcodeKeyDown}
                            placeholder="Escanee código de barras o escriba el código manualmente"
                            helperText="Escanee con lector o escriba el código y presione Enter"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleManualSearch}
                                            edge="end"
                                            disabled={!barcodeInput.trim()}
                                            sx={{
                                                color: '#2196f3',
                                                '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                                            }}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            autoComplete="off"
                        />
                    </Box>
                    <Typography variant="subtitle1" gutterBottom>
                        Seleccionados:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedRows.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No hay paquetes seleccionados.
                            </Typography>
                        ) : (
                            selectedRows.map((item, idx) => (
                                <Chip
                                    key={idx}
                                    label={item.codigo}
                                    size="small"
                                    onDelete={() => handleSelectOne(item)}
                                    sx={{
                                        backgroundColor: '#222',
                                        color: '#fff',
                                        border: '1px solid #444',
                                        fontFamily: 'monospace',
                                        '& .MuiChip-deleteIcon': {
                                            color: '#888',
                                            '&:hover': { color: '#fff' }
                                        }
                                    }}
                                />
                            ))
                        )}
                    </Box>
                </Box>
            )}

            {/* Tabla */}
            {isLoading ? (
                <CircularProgress />
            ) : (
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    loading={isLoading || initLoading}
                    getRowId={(row) => row.id ?? row.codigo}
                    rowCount={initDT.length > 0 ? initRows.length : (count || 0)}
                    paginationMode="server"
                    pageSizeOptions={[5, 10, 20]}
                    paginationModel={{
                        page: Math.max(page - 1, 0),
                        pageSize: limit
                    }}
                    onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
                        setLocalPage(newPage + 1)
                        setLocalLimit(newPageSize)
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
                        '& .MuiTablePagination-selectLabel': {
                            color: '#fff'
                        },
                        '& .MuiTablePagination-select': {
                            color: '#fff'
                        },
                        '& .MuiTablePagination-selectIcon': {
                            color: '#fff'
                        },
                        '& .MuiTablePagination-displayedRows': {
                            color: '#fff'
                        },
                        '& .MuiTablePagination-actions': {
                            color: '#fff'
                        },
                        '& .MuiIconButton-root': {
                            color: '#fff'
                        },
                    }}
                />
            )}

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
