'use client'

import { useMutatePaquete } from '@/hooks/useMutatePaquete'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { useCallback, useState } from 'react'
import * as Yup from 'yup'

// ─── Tarifa de facturación por libra ─────────────────────────────────────────
// Para actualizar la tarifa, cambia únicamente este valor.
// Ejemplo: si la tarifa sube a $2.00/lb → TARIFA_POR_LIBRA = 2.00
const TARIFA_POR_LIBRA = 1.80
// ─────────────────────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
    codigo: Yup.string().required('Código requerido'),
    peso: Yup.number().typeError('Debe ser un número').required('Peso requerido').positive('Debe ser positivo'),
})

export default function PaqueteModal({ open, onClose }) {
    const { createPaquete } = useMutatePaquete()
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    const handleSnackbarClose = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }, [])

    const formik = useFormik({
        initialValues: {
            codigo: '',
            peso: '',
            precio: '',
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                const payload = {
                    codigo: values.codigo,
                    peso: Number(values.peso),
                    precio: Number(values.precio),
                }
                await createPaquete.mutateAsync(payload)
                setSnackbar({ open: true, message: 'Paquete registrado exitosamente', severity: 'success' })
                resetForm()
                onClose()
            } catch (err) {
                console.error('Error al registrar paquete:', err)
                setSnackbar({ open: true, message: err.message || 'Error al registrar paquete', severity: 'error' })
            }
        }
    })

    const handleClose = useCallback(() => {
        formik.resetForm()
        onClose()
    }, [formik, onClose])

    // Calcula el precio automáticamente al cambiar el peso
    const handlePesoChange = useCallback((e) => {
        const peso = e.target.value
        formik.setFieldValue('peso', peso)
        const precioCalculado = peso !== '' && !isNaN(Number(peso)) && Number(peso) > 0
            ? (Number(peso) * TARIFA_POR_LIBRA).toFixed(2)
            : ''
        formik.setFieldValue('precio', precioCalculado)
    }, [formik])

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    Registrar Paquete
                </DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        onSubmit={formik.handleSubmit}
                        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        {/* Código de tracking */}
                        <TextField
                            label="Código de tracking"
                            name="codigo"
                            value={formik.values.codigo}
                            onChange={(e) => formik.setFieldValue('codigo', e.target.value.toUpperCase())}
                            error={formik.touched.codigo && Boolean(formik.errors.codigo)}
                            helperText={formik.touched.codigo && formik.errors.codigo}
                            fullWidth
                            required
                            inputProps={{ style: { fontFamily: 'monospace' } }}
                        />

                        {/* Peso y Precio (calculado automáticamente) */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Peso (lbs)"
                                name="peso"
                                type="number"
                                value={formik.values.peso}
                                onChange={handlePesoChange}
                                error={formik.touched.peso && Boolean(formik.errors.peso)}
                                helperText={formik.touched.peso && formik.errors.peso}
                                fullWidth
                                required
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                            <TextField
                                label="Precio ($)"
                                name="precio"
                                value={formik.values.precio}
                                fullWidth
                                disabled
                                helperText={`Calculado: $${TARIFA_POR_LIBRA.toFixed(2)} × peso`}
                                inputProps={{ style: { fontFamily: 'monospace' } }}
                            />
                        </Box>

                        <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
                            <Button variant="outlined" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={createPaquete.isPending}
                            >
                                {createPaquete.isPending ? 'Guardando...' : 'Registrar Paquete'}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert elevation={6} variant="filled" severity={snackbar.severity} onClose={handleSnackbarClose}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
