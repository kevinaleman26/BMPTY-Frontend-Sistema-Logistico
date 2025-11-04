// src/components/Modals/FacturaModal.js
'use client'

import PaqueteTableSelection from '@/components/TableSelection/PaqueteTableSelection'
import { useClientesBasic } from '@/hooks/useClientesBasic'
import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useMutateFactura } from '@/hooks/useMutateFactura'
import { useSucursal } from '@/hooks/useSucursal'
import { supabase } from '@/lib/supabase'
import {
    Box, Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    MenuItem,
    Switch,
    TextField,
    Typography
} from '@mui/material'
import { useFormik } from 'formik'
import { useEffect, useMemo, useState } from 'react'
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
    const { data: sucursales } = useSucursal()
    const { data: metodosPago } = useMetodoPago()
    const { data: clientes } = useClientesBasic(sucursalSelected)
    const { createFactura, updateFactura } = useMutateFactura()
    const [clientDetail, setClientDetail] = useState(0)


    const getClient = async (clientId) => {
        const { data, error } = await supabase.from('cliente').select('*').single().eq('id', clientId)
        return data
    }

    const formik = useFormik({
        initialValues: {
            sucursal_id: factura?.sucursal?.id || '',
            cliente_id: factura?.cliente?.id || '',
            metodo_pago_id: factura?.metodo_pago?.id || '',
            paqueteList: factura?.factura_detalle?.map(item => flattenProveedorPaquetes(item)) || [],
            delivery_status: factura?.delivery_status ?? false,
            payment_status: factura?.payment_status ?? false
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            sucursal_id: Yup.string().required('Sucursal requerida'),
            cliente_id: Yup.string().required('Cliente requerido'),
            metodo_pago_id: Yup.string().required('Método de pago requerido')
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
                    await updateFactura.mutateAsync({
                        id: factura.id,
                        sucursal_id: values.sucursal_id,
                        cliente_id: values.cliente_id,
                        metodo_pago_id: values.metodo_pago_id,
                        delivery_status: values.delivery_status,
                        payment_status: values.payment_status
                    })
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
                        trackingCodes
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
                setClientDetail(await getClient(formik.values.cliente_id))
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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>{factura ? 'Editar Factura' : 'Crear Factura'}</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ display: 'grid', gap: 2, mt: 2 }}
                >
                    {/* Selects principales */}
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

                    {/* Estados */}
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

                    {/* Selector de paquetes */}
                    <Box>
                        {
                            clientDetail ? (<PaqueteTableSelection formik={formik} />) : null
                        }
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
