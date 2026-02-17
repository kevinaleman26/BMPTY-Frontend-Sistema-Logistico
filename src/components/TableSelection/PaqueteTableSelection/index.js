'use client'

import { usePaquetes } from '@/hooks/usePaquetes'
import { supabase } from '@/lib/supabase'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    IconButton,
    InputAdornment,
    Snackbar,
    TextField,
    Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { DataGrid } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function PaqueteTableSelection({ formik }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data, count, isLoading, page, limit } = usePaquetes()

    const [initDT, setInitDt] = useState(() =>
        Array.isArray(formik?.values?.paqueteList)
            ? formik.values.paqueteList.map(item => item.paquete_id)
            : []
    )
    const [selectedRows, setSelectedRows] = useState([])
    const [search, setSearch] = useState('')
    const [barcodeInput, setBarcodeInput] = useState('')
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
    const [pendingPackage, setPendingPackage] = useState(null)

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
                .select(`
                    *, 
                    solicitud_paquete:solicitud_paquete(paquete_id)
                `)
                .is('solicitud_paquete.paquete_id', null)
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
            const isSelected = prev.some(r => (r.id ?? r.codigo) === (row.id ?? r.codigo))
            if (isSelected) {
                // Deseleccionar
                return prev.filter(r => (r.id ?? r.codigo) !== (row.id ?? row.codigo))
            } else {
                // Seleccionar
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

    // Buscar paquete por código de barras
    const searchPackageByBarcode = useCallback(async (barcode) => {
        if (!barcode.trim()) {
            showNotification('Por favor ingrese un código de barras', 'warning')
            return
        }

        try {
            // Buscar en todos los paquetes disponibles (no facturados)
            const { data, error } = await supabase
                .from('proveedor_paquetes')
                .select(`
                    *,
                    solicitud_paquete:solicitud_paquete(paquete_id)
                `)
                .is('solicitud_paquete.paquete_id', null)

            if (error) throw error

            // Buscar paquete cuyos últimos 7 caracteres coincidan
            const matchingPackage = data?.find(pkg =>
                validateLast7Chars(barcode, pkg.codigo)
            )

            if (!matchingPackage) {
                showNotification('No se encontró un paquete con código coincidente', 'error')
                return
            }

            // Verificar si ya está seleccionado
            const alreadySelected = selectedRows.some(
                r => (r.id ?? r.codigo) === (matchingPackage.id ?? matchingPackage.codigo)
            )

            if (alreadySelected) {
                showNotification('Este paquete ya está seleccionado', 'warning')
                return
            }

            // Mostrar confirmación
            setPendingPackage(matchingPackage)
            showNotification(
                `Paquete encontrado: ${matchingPackage.codigo}. Presione Enter nuevamente para confirmar o Esc para cancelar`,
                'info'
            )

        } catch (error) {
            console.error('Error searching package:', error)
            showNotification('Error al buscar el paquete', 'error')
        }
    }, [validateLast7Chars, showNotification, selectedRows])

    // Confirmar adición del paquete
    const confirmAddPackage = useCallback(() => {
        if (pendingPackage) {
            setSelectedRows(prev => [...prev, pendingPackage])
            showNotification(`Paquete ${pendingPackage.codigo} agregado exitosamente`, 'success')
            setPendingPackage(null)
            setBarcodeInput('')
        }
    }, [pendingPackage, showNotification])

    // Cancelar adición del paquete
    const cancelAddPackage = useCallback(() => {
        setPendingPackage(null)
        setBarcodeInput('')
        showNotification('Operación cancelada', 'info')
    }, [showNotification])

    // Manejar búsqueda manual con botón
    const handleManualSearch = useCallback(() => {
        if (pendingPackage) {
            confirmAddPackage()
        } else {
            searchPackageByBarcode(barcodeInput)
        }
    }, [barcodeInput, pendingPackage, searchPackageByBarcode, confirmAddPackage])

    // Manejar evento de teclado en campo de código de barras
    const handleBarcodeKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault() // Prevenir submit del formulario
            handleManualSearch()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            if (pendingPackage) {
                cancelAddPackage()
            }
        }
    }, [handleManualSearch, pendingPackage, cancelAddPackage])

    // Actualizar formik cuando cambia la selección
    useEffect(() => {
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
                    disabled={initDT.length > 0}
                    sx={{ color: '#f4b223', '&.Mui-checked': { color: '#f4b223' } }}
                />
            ),
            renderCell: (params) => {
                const isSelected = selectedRows.some(r => (r.id ?? r.codigo) === (params.row.id ?? params.row.codigo))
                return (
                    <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectOne(params.row)}
                        disabled={initDT.length > 0}
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
                            helperText={pendingPackage
                                ? '⚠️ Presione Enter o haga clic en buscar para confirmar (Esc para cancelar)'
                                : 'Escanee con lector o escriba el código. Presione Enter o haga clic en buscar'
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleManualSearch}
                                            edge="end"
                                            disabled={!barcodeInput.trim()}
                                            sx={{
                                                color: pendingPackage ? '#f4b223' : '#2196f3',
                                                '&:hover': {
                                                    backgroundColor: pendingPackage
                                                        ? 'rgba(244, 178, 35, 0.1)'
                                                        : 'rgba(33, 150, 243, 0.1)'
                                                }
                                            }}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: pendingPackage ? 'rgba(244, 178, 35, 0.1)' : 'transparent',
                                    borderColor: pendingPackage ? '#f4b223' : undefined
                                }
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
                                <Box
                                    key={idx}
                                    sx={{
                                        backgroundColor: '#222',
                                        color: '#fff',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        border: '1px solid #444'
                                    }}
                                >
                                    {item.codigo}
                                </Box>
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
                        const params = new URLSearchParams(searchParams.toString())
                        params.set('page', String(newPage + 1))
                        params.set('limit', String(newPageSize))
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
