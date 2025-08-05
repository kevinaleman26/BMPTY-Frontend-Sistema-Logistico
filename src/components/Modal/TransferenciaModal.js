'use client'

import PaqueteTableSelection from '@/components/TableSelection/PaqueteTableSelection'
import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useMutateTransferencia } from '@/hooks/useMutateTransferencia'
import { useSucursal } from '@/hooks/useSucursal'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    TextField
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function TransferenciaModal({ open, onClose, transferencia }) {
    const { createTransferencia, updateTransferencia } = useMutateTransferencia()
    const { data: sucursales } = useSucursal()
    const { data: metodosPago } = useMetodoPago()

    console.log(transferencia)

    const formik = useFormik({
        initialValues: {
            emisor_sucursal_id: transferencia?.emisor_sucursal?.id || '',
            receptor_sucursal_id: transferencia?.receptor_sucursal?.id || '',
            metodo_pago_id: transferencia?.metodo_pago?.id || '',
            delivery_status: transferencia ? String(transferencia.delivery_status) : '',
            payment_status: transferencia ? String(transferencia.payment_status) : '',
            paqueteList: transferencia?.solicitud_paquete || []
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            emisor_sucursal_id: Yup.string().required('Requerido'),
            receptor_sucursal_id: Yup.string().required('Requerido'),
            metodo_pago_id: Yup.string().required('Requerido'),
            delivery_status: Yup.string().required('Requerido'),
            payment_status: Yup.string().required('Requerido'),
            paqueteList: Yup.array().required('Requerido')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const now = new Date().toISOString()

                const payload = {
                    ...values,
                    delivery_status: values.delivery_status === 'true',
                    payment_status: values.payment_status === 'true',
                    delivery_date: values.delivery_status === 'true' ? now : null,
                    payment_date: values.payment_status === 'true' ? now : null
                }

                if (transferencia) {
                    await updateTransferencia.mutateAsync({
                        id: transferencia.id,
                        ...payload
                    })
                } else {
                    await createTransferencia.mutateAsync(payload)
                }

                onClose()
                resetForm()
            } catch (error) {
                console.error('Error al guardar transferencia:', error)
            }
        }
    })

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {transferencia ? 'Editar Transferencia' : 'Crear Transferencia'}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2 }}
                >
                    <TextField
                        select
                        label="Sucursal Emisora"
                        name="emisor_sucursal_id"
                        value={formik.values.emisor_sucursal_id}
                        onChange={formik.handleChange}
                        error={formik.touched.emisor_sucursal_id && Boolean(formik.errors.emisor_sucursal_id)}
                        helperText={formik.touched.emisor_sucursal_id && formik.errors.emisor_sucursal_id}
                        fullWidth
                    >
                        {sucursales?.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Sucursal Receptora"
                        name="receptor_sucursal_id"
                        value={formik.values.receptor_sucursal_id}
                        onChange={formik.handleChange}
                        error={formik.touched.receptor_sucursal_id && Boolean(formik.errors.receptor_sucursal_id)}
                        helperText={formik.touched.receptor_sucursal_id && formik.errors.receptor_sucursal_id}
                        fullWidth
                    >
                        {sucursales?.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Método de Pago"
                        name="metodo_pago_id"
                        value={formik.values.metodo_pago_id}
                        onChange={formik.handleChange}
                        error={formik.touched.metodo_pago_id && Boolean(formik.errors.metodo_pago_id)}
                        helperText={formik.touched.metodo_pago_id && formik.errors.metodo_pago_id}
                        fullWidth
                    >
                        {metodosPago?.map((m) => (
                            <MenuItem key={m.id} value={m.id}>
                                {m.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Estado de Entrega"
                        name="delivery_status"
                        value={formik.values.delivery_status}
                        onChange={formik.handleChange}
                        error={formik.touched.delivery_status && Boolean(formik.errors.delivery_status)}
                        helperText={formik.touched.delivery_status && formik.errors.delivery_status}
                        fullWidth
                    >
                        <MenuItem value="false">Pendiente</MenuItem>
                        <MenuItem value="true">Entregado</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Estado de Pago"
                        name="payment_status"
                        value={formik.values.payment_status}
                        onChange={formik.handleChange}
                        error={formik.touched.payment_status && Boolean(formik.errors.payment_status)}
                        helperText={formik.touched.payment_status && formik.errors.payment_status}
                        fullWidth
                    >
                        <MenuItem value="false">Pendiente</MenuItem>
                        <MenuItem value="true">Pagado</MenuItem>
                    </TextField>

                    <Divider />
                    
                    <PaqueteTableSelection formik={formik}/>

                    <Divider />
                    
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained">
                            Guardar
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
