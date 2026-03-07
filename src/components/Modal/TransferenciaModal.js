'use client'

import SucursalDebtCard from '@/components/Card/SucursalDebtCard'
import PaqueteTableSelection from '@/components/TableSelection/PaqueteTableSelection'
import { useMetodoPago } from '@/hooks/useMetodoPago'
import { useMutateTransferencia } from '@/hooks/useMutateTransferencia'
import { useSession } from '@/hooks/useSession'
import { useSucursal } from '@/hooks/useSucursal'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useFormik } from 'formik'
import { useCallback, useMemo, useState } from 'react'
import * as Yup from 'yup'

export default function TransferenciaModal({ open, onClose, transferencia }) {
    const { createTransferencia, updateTransferencia } = useMutateTransferencia()
    const { session } = useSession()
    const { data: sucursales } = useSucursal()
    const { data: metodosPago } = useMetodoPago()
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // Prevenir cierre accidental del modal
    const handleModalClose = useCallback((event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return
        }
        onClose()
    }, [onClose])

    const handleSnackbarClose = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }, [])

    const formik = useFormik({
        initialValues: {
            // Auto-seleccionar sucursal emisora para Admin/Operador
            emisor_sucursal_id: transferencia?.emisor_sucursal?.id ||
                (session?.role?.id !== 1 ? session?.sucursal?.id : ''),
            receptor_sucursal_id: transferencia?.receptor_sucursal?.id || '',
            metodo_pago_id: transferencia?.metodo_pago?.id ?? 0,  // Ninguno por defecto
            tasa: transferencia?.tasa ?? '',
            delivery_status: transferencia?.delivery_status ?? false,
            payment_status: transferencia?.payment_status ?? false,
            paqueteList: transferencia?.solicitud_paquete || []
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            emisor_sucursal_id: Yup.string().required('Sucursal Emisora es requerido'),
            receptor_sucursal_id: Yup.string().required('Sucursal Receptora es requerido'),
            paqueteList: Yup.array().required('Lista de paquetes es requerido'),
            metodo_pago_id: Yup.string().required('Método de Pago es requerido'),
            tasa: Yup.number()
                .typeError('Debe ser un número')
                .required('La tasa es requerida')
                .min(0, 'Debe ser mayor o igual a 0'),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                // Validar que emisor y receptor sean diferentes
                if (values.emisor_sucursal_id === values.receptor_sucursal_id) {
                    setSnackbar({ open: true, message: 'La sucursal emisora y receptora deben ser diferentes', severity: 'error' })
                    return
                }

                const payload = {
                    ...values,
                    tasa: parseFloat(values.tasa) || 0,
                    delivery_status: Boolean(values.delivery_status),
                    payment_status: Boolean(values.payment_status)
                }

                if (transferencia) {
                    // When updating, if marking as delivered, add receptor operator
                    if (payload.delivery_status === true && transferencia.delivery_status === false) {
                        payload.operador_receptor_id = session?.id
                    }

                    await updateTransferencia.mutateAsync({
                        id: transferencia.id,
                        ...payload
                    })
                    setSnackbar({ open: true, message: 'Transferencia actualizada exitosamente', severity: 'success' })
                } else {
                    // Validar paquetes solo en modo creación
                    if (!values.paqueteList || values.paqueteList.length === 0) {
                        setSnackbar({ open: true, message: 'Debes seleccionar al menos un paquete', severity: 'warning' })
                        return
                    }

                    // When creating, add emisor operator and set defaults
                    payload.operador_emisor_id = session?.id
                    payload.delivery_status = false  // Siempre pendiente al crear
                    payload.payment_status = false    // Siempre pendiente al crear
                    await createTransferencia.mutateAsync(payload)
                    setSnackbar({ open: true, message: 'Transferencia creada exitosamente', severity: 'success' })
                }

                resetForm()
                onClose()
            } catch (error) {
                console.error('Error al guardar transferencia:', error)
                setSnackbar({
                    open: true,
                    message: error?.message || 'Error al guardar la transferencia',
                    severity: 'error'
                })
            }
        }
    })

    // Preview del total: SUM(peso) × tasa
    const { totalPeso, totalCalculado } = useMemo(() => {
        const tasa = parseFloat(formik.values.tasa) || 0
        const peso = (formik.values.paqueteList ?? []).reduce((sum, p) => {
            // Handles full proveedor_paquetes rows (.peso) and solicitud_paquete rows (.paquete.peso)
            return sum + (p.peso ?? p.paquete?.peso ?? 0)
        }, 0)
        return { totalPeso: peso, totalCalculado: peso * tasa }
    }, [formik.values.paqueteList, formik.values.tasa])

    return (
        <>
            <Dialog open={open} onClose={handleModalClose} fullWidth maxWidth="md" PaperProps={{sx:{backgroundColor:"background.paper",border:"1px solid",borderColor:"divider"}}}>
                <DialogTitle sx={{borderBottom:"1px solid",borderColor:"divider"}}>
                    {transferencia ? 'Editar Transferencia' : 'Crear Transferencia'}
                </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2 }}
                >
                    {/* Sucursal Emisora: Auto-asignada para Admin/Operador */}
                    {session?.role?.id === 1 && !transferencia ? (
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
                    ) : (
                        <TextField
                            label="Sucursal Emisora"
                            value={sucursales?.find(s => s.id === formik.values.emisor_sucursal_id)?.name || session?.sucursal?.name || ''}
                            disabled
                            fullWidth
                            helperText={transferencia ? "No se puede modificar" : "Sucursal asignada automáticamente"}
                        />
                    )}

                    {/* Sucursal Receptora: Disabled en modo edición */}
                    {transferencia ? (
                        <TextField
                            label="Sucursal Receptora"
                            value={sucursales?.find(s => s.id === formik.values.receptor_sucursal_id)?.name || ''}
                            disabled
                            fullWidth
                            helperText="No se puede modificar"
                        />
                    ) : (
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
                            {sucursales?.filter(s => s.id !== formik.values.emisor_sucursal_id)?.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Show debt card when receptor sucursal is selected */}
                    {formik.values.receptor_sucursal_id && (
                        <SucursalDebtCard
                            sucursalId={formik.values.receptor_sucursal_id}
                            sucursalName={sucursales?.find(s => s.id === formik.values.receptor_sucursal_id)?.name}
                        />
                    )}

                    {/* Tasa de transferencia — visible en creación y edición */}
                    <TextField
                        label="Tasa de transferencia ($/lb)"
                        name="tasa"
                        type="number"
                        value={formik.values.tasa}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.tasa && Boolean(formik.errors.tasa)}
                        helperText={formik.touched.tasa && formik.errors.tasa}
                        inputProps={{ step: '0.01', min: '0' }}
                        fullWidth
                    />

                    {/* Campos solo visibles en modo edición */}
                    {transferencia && (
                        <>
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

                            <FormControlLabel
                                control={
                                    <Switch
                                        name="delivery_status"
                                        checked={Boolean(formik.values.delivery_status)}
                                        onChange={(e) => formik.setFieldValue('delivery_status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Estado de Entrega (Recibida)"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        name="payment_status"
                                        checked={Boolean(formik.values.payment_status)}
                                        onChange={(e) => formik.setFieldValue('payment_status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Estado de Pago (Pagada)"
                            />
                        </>
                    )}

                    <Divider />
                    <PaqueteTableSelection formik={formik} />

                    {/* Resumen del total */}
                    {formik.values.paqueteList?.length > 0 && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 3,
                            p: 1.5,
                            backgroundColor: '#111',
                            border: '1px solid #333',
                            borderRadius: 1,
                        }}>
                            <Typography variant="body2" sx={{ color: '#aaa' }}>
                                Peso total: <strong style={{ color: '#fff' }}>{totalPeso.toFixed(2)} lbs</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#aaa' }}>
                                Tasa: <strong style={{ color: '#fff' }}>${parseFloat(formik.values.tasa || 0).toFixed(2)}/lb</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#aaa' }}>
                                Total estimado: <strong style={{ color: '#f4b223', fontFamily: 'monospace' }}>${totalCalculado.toFixed(2)}</strong>
                            </Typography>
                        </Box>
                    )}

                    <Divider />

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createTransferencia.isPending || updateTransferencia.isPending}
                        >
                            {(createTransferencia.isPending || updateTransferencia.isPending)
                                ? <CircularProgress size={20} />
                                : 'Guardar'
                            }
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
            <Alert
                onClose={handleSnackbarClose}
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </>
    )
}
