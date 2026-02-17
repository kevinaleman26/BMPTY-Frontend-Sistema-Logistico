// src/components/Modals/FacturaModal.js
'use client'

import PaqueteTableSelection from '@/components/TableSelection/PaqueteTableSelection'
import { useClientesBasic } from '@/hooks/useClientesBasic'
import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useMutateFactura } from '@/hooks/useMutateFactura'
import { useSession } from '@/hooks/useSession'
import { useSucursal } from '@/hooks/useSucursal'
import { supabase } from '@/lib/supabase'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState, useCallback } from 'react'
import * as Yup from 'yup'

function flattenProveedorPaquetes(detalle) {
    if (!detalle || !detalle.proveedor_paquetes) return detalle
    const { proveedor_paquetes, ...rest } = detalle
    return {
        ...rest,
        proveedor_id: proveedor_paquetes.id,
        codigo: proveedor_paquetes.codigo,
        tipo: proveedor_paquetes.tipo,
        largo: proveedor_paquetes.largo,
        alto: proveedor_paquetes.alto,
        ancho: proveedor_paquetes.ancho,
        peso: proveedor_paquetes.peso,
        precio: proveedor_paquetes.precio
    }
}

export default function FacturaModal({ open, onClose, factura }) {
    const [sucursalSelected, setSucursalSelected] = useState(0)
    const { session } = useSession()
    const { data: sucursales } = useSucursal()
    const { data: metodosPago } = useMetodoPago()
    const { data: clientes } = useClientesBasic(sucursalSelected)
    const { createFactura, updateFactura } = useMutateFactura()
    const [clientDetail, setClientDetail] = useState(null)
    const [loadingClient, setLoadingClient] = useState(false)

    // Prevenir cierre accidental del modal
    const handleModalClose = (event, reason) => {
        // Solo permitir cerrar con el botón cancelar, no con click fuera o ESC
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return
        }
        onClose()
    }


    const getClient = async (clientId) => {
        const { data, error } = await supabase.from('cliente').select('*').single().eq('id', clientId)
        return data
    }

    const formik = useFormik({
        initialValues: {
            sucursal_id: factura?.sucursal?.id || (session?.role?.id !== 1 ? session?.sucursal?.id : ''),
            cliente_id: factura?.cliente?.id || '',
            metodo_pago_id: factura?.metodo_pago?.id ?? 0,  // Por defecto "Ninguno" (ID = 0)
            paqueteList: factura?.factura_detalle?.map(item => flattenProveedorPaquetes(item)) || [],
            delivery_status: factura?.delivery_status ?? false,
            payment_status: factura?.payment_status ?? false
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            sucursal_id: Yup.string().required('Sucursal requerida'),
            cliente_id: Yup.string().required('Cliente requerido')
            // metodo_pago_id ya no es requerido, se establece por defecto
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const trackingCodes = values.paqueteList.map(p => p.codigo)
                if (!trackingCodes.length) {
                    alert('Debes seleccionar al menos 1 paquete.')
                    return
                }

                // Totales calculados (mantengo tu lógica actual)
                const descuento = factura?.descuento || 0
                const otros = factura?.otros || 0
                const impuestos = factura?.impuestos || 0
                const subtotalCalc = values.paqueteList.reduce((acc, p) => acc + ((Number(p.peso) || 0) * (clientDetail.tarifa || 1)), 0)
                const totalCalc = subtotalCalc - descuento + otros + impuestos

                if (factura) {
                    const updatePayload = {
                        id: factura.id,
                        sucursal_id: values.sucursal_id,
                        cliente_id: values.cliente_id,
                        metodo_pago_id: values.metodo_pago_id,
                        delivery_status: values.delivery_status,
                        payment_status: values.payment_status
                    }

                    // If marking as delivered, add operator
                    if (values.delivery_status === true && factura.delivery_status === false) {
                        updatePayload.operador_entrega_id = session?.id
                    }

                    await updateFactura.mutateAsync(updatePayload)
                } else {
                    await createFactura.mutateAsync({
                        sucursal_id: values.sucursal_id,
                        cliente_id: values.cliente_id,
                        metodo_pago_id: values.metodo_pago_id,
                        subtotal: subtotalCalc,
                        descuento,
                        otros,
                        impuestos,
                        total: totalCalc,
                        trackingCodes,
                        operador_factura_id: session?.id,
                        delivery_status: false,  // Siempre pendiente al crear
                        payment_status: false    // Siempre pendiente al crear
                    })
                }

                resetForm()
                onClose()
            } catch (err) {
                console.error(err)
                alert(err?.message || 'Error guardando la factura')
            }
        }
    })

    useEffect(() => {
        const funct = async () => {
            if (formik.values.cliente_id) {
                setLoadingClient(true)
                try {
                    const client = await getClient(formik.values.cliente_id)
                    setClientDetail(client)
                } catch (error) {
                    console.error('Error loading client:', error)
                    setClientDetail(null)
                } finally {
                    setLoadingClient(false)
                }
            } else {
                setClientDetail(null)
            }
        }
        funct()
    }, [formik.values.cliente_id])

    useEffect(() => {
        if (formik.values.sucursal_id) {
            setSucursalSelected(formik.values.sucursal_id)
        }
    }, [formik.values.sucursal_id])

    // Calcular totales visibles
    const subtotal = useMemo(() => {
        if (!formik.values.paqueteList?.length) return 0
        return formik.values.paqueteList.reduce((acc, p) => acc + ((Number(p.peso) || 0) * (clientDetail.tarifa || 1)), 0)
    }, [formik.values.paqueteList, formik.values.cliente_id])

    const descuento = factura?.descuento || 0
    const otros = factura?.otros || 0
    const impuestos = factura?.impuestos || 0
    const total = useMemo(() => subtotal - descuento + otros + impuestos, [subtotal, descuento, otros, impuestos])

    return (
        <Dialog open={open} onClose={handleModalClose} fullWidth maxWidth="lg" PaperProps={{sx:{backgroundColor:"background.paper",border:"1px solid",borderColor:"divider"}}}>
            <DialogTitle sx={{borderBottom:"1px solid",borderColor:"divider"}}>{factura ? 'Editar Factura' : 'Crear Factura'}</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ display: 'grid', gap: 2, mt: 2 }}
                >
                    {/* Selects principales */}
                    {/* Campo de sucursal: solo editable para SuperAdmin */}
                    {session?.role?.id === 1 ? (
                        <TextField
                            select
                            label="Sucursal"
                            name="sucursal_id"
                            value={formik.values.sucursal_id}
                            onChange={formik.handleChange}
                            error={formik.touched.sucursal_id && Boolean(formik.errors.sucursal_id)}
                            helperText={formik.touched.sucursal_id && formik.errors.sucursal_id}
                            fullWidth
                        >
                            {sucursales?.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <TextField
                            label="Sucursal"
                            name="sucursal_id"
                            value={session?.sucursal?.name || ''}
                            disabled
                            fullWidth
                            helperText="Sucursal asignada automáticamente"
                        />
                    )}

                    <TextField
                        select
                        label="Cliente"
                        name="cliente_id"
                        value={formik.values.cliente_id}
                        onChange={formik.handleChange}
                        error={formik.touched.cliente_id && Boolean(formik.errors.cliente_id)}
                        helperText={formik.touched.cliente_id && formik.errors.cliente_id}
                        fullWidth
                    >

                        {
                            clientes && clientes.length > 0 ? (
                                clientes?.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.full_name ? `${c.full_name} • ${c.email}` : c.email}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="">
                                    <em>{'Seleccione una sucursal primero'}</em>
                                </MenuItem>
                            )
                        }
                    </TextField>

                    {/* Método de pago: solo visible en modo edición */}
                    {factura && (
                        <TextField
                            select
                            label="Método de pago"
                            name="metodo_pago_id"
                            value={formik.values.metodo_pago_id}
                            onChange={formik.handleChange}
                            error={formik.touched.metodo_pago_id && Boolean(formik.errors.metodo_pago_id)}
                            helperText={formik.touched.metodo_pago_id && formik.errors.metodo_pago_id}
                            fullWidth
                        >
                            {metodosPago?.map((m) => (
                                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Estados: solo visibles en modo edición */}
                    {factura && (
                        <>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="delivery_status"
                                        checked={formik.values.delivery_status}
                                        onChange={(e) => formik.setFieldValue('delivery_status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Estado de entrega"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        name="payment_status"
                                        checked={formik.values.payment_status}
                                        onChange={(e) => formik.setFieldValue('payment_status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Estado del pago"
                            />
                        </>
                    )}

                    {/* Selector de paquetes */}
                    <Box>
                        {!formik.values.cliente_id ? (
                            <Box sx={{
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: 'rgba(244, 178, 35, 0.1)',
                                borderRadius: 1,
                                border: '1px solid rgba(244, 178, 35, 0.3)'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    Seleccione un cliente para ver los paquetes disponibles
                                </Typography>
                            </Box>
                        ) : loadingClient ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : clientDetail ? (
                            <PaqueteTableSelection formik={formik} />
                        ) : (
                            <Box sx={{
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                borderRadius: 1,
                                border: '1px solid rgba(244, 67, 54, 0.3)'
                            }}>
                                <Typography variant="body2" color="error">
                                    Error al cargar los datos del cliente
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Resumen calculado */}
                    <Box sx={{ px: 1, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Resumen</Typography>
                        <Box display="grid" gridTemplateColumns="1fr auto" rowGap={1}>
                            <Typography variant="body2">Subtotal</Typography>
                            <Typography variant="body2">${subtotal.toFixed(2)}</Typography>

                            <Typography variant="body2">Descuento</Typography>
                            <Typography variant="body2">${descuento.toFixed(2)}</Typography>

                            <Typography variant="body2">Otros</Typography>
                            <Typography variant="body2">${otros.toFixed(2)}</Typography>

                            <Typography variant="body2">Impuestos</Typography>
                            <Typography variant="body2">${impuestos.toFixed(2)}</Typography>

                            <Divider sx={{ gridColumn: '1 / -1', my: 1 }} />
                            <Typography variant="subtitle2">Total</Typography>
                            <Typography variant="subtitle2">${total.toFixed(2)}</Typography>
                        </Box>
                    </Box>

                    {/* Acciones */}
                    <Box
                        sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}
                    >
                        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="contained">
                            {factura ? 'Guardar cambios' : 'Crear factura'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
