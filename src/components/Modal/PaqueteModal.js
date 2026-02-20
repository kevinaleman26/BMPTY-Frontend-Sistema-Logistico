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

const validationSchema = Yup.object({
    codigo: Yup.string().required('Código requerido'),
    tipo: Yup.string().required('Tipo requerido'),
    peso: Yup.number().typeError('Debe ser un número').required('Peso requerido').positive('Debe ser positivo'),
    precio: Yup.number().typeError('Debe ser un número').required('Precio requerido').min(0, 'Debe ser 0 o mayor'),
    largo: Yup.number().typeError('Debe ser un número').nullable(),
    alto: Yup.number().typeError('Debe ser un número').nullable(),
    ancho: Yup.number().typeError('Debe ser un número').nullable(),
    volumen: Yup.number().typeError('Debe ser un número').nullable(),
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
            tipo: '',
            peso: '',
            precio: '',
            largo: '',
            alto: '',
            ancho: '',
            volumen: '',
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                // Convert empty strings to null for optional numeric fields
                const payload = {
                    ...values,
                    largo: values.largo !== '' ? Number(values.largo) : null,
                    alto: values.alto !== '' ? Number(values.alto) : null,
                    ancho: values.ancho !== '' ? Number(values.ancho) : null,
                    volumen: values.volumen !== '' ? Number(values.volumen) : null,
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
                        {/* Código */}
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

                        {/* Tipo */}
                        <TextField
                            label="Tipo"
                            name="tipo"
                            value={formik.values.tipo}
                            onChange={formik.handleChange}
                            error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                            helperText={formik.touched.tipo && formik.errors.tipo}
                            fullWidth
                            required
                            placeholder="Ej: Caja, Sobre, Paquete"
                        />

                        {/* Peso y Precio */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Peso (kg)"
                                name="peso"
                                type="number"
                                value={formik.values.peso}
                                onChange={formik.handleChange}
                                error={formik.touched.peso && Boolean(formik.errors.peso)}
                                helperText={formik.touched.peso && formik.errors.peso}
                                fullWidth
                                required
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                            <TextField
                                label="Precio ($)"
                                name="precio"
                                type="number"
                                value={formik.values.precio}
                                onChange={formik.handleChange}
                                error={formik.touched.precio && Boolean(formik.errors.precio)}
                                helperText={formik.touched.precio && formik.errors.precio}
                                fullWidth
                                required
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                        </Box>

                        {/* Dimensiones (opcionales) */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Largo (cm)"
                                name="largo"
                                type="number"
                                value={formik.values.largo}
                                onChange={formik.handleChange}
                                error={formik.touched.largo && Boolean(formik.errors.largo)}
                                helperText={formik.touched.largo && formik.errors.largo}
                                fullWidth
                                inputProps={{ min: 0, step: '0.1' }}
                            />
                            <TextField
                                label="Alto (cm)"
                                name="alto"
                                type="number"
                                value={formik.values.alto}
                                onChange={formik.handleChange}
                                error={formik.touched.alto && Boolean(formik.errors.alto)}
                                helperText={formik.touched.alto && formik.errors.alto}
                                fullWidth
                                inputProps={{ min: 0, step: '0.1' }}
                            />
                            <TextField
                                label="Ancho (cm)"
                                name="ancho"
                                type="number"
                                value={formik.values.ancho}
                                onChange={formik.handleChange}
                                error={formik.touched.ancho && Boolean(formik.errors.ancho)}
                                helperText={formik.touched.ancho && formik.errors.ancho}
                                fullWidth
                                inputProps={{ min: 0, step: '0.1' }}
                            />
                        </Box>

                        {/* Volumen (opcional) */}
                        <TextField
                            label="Volumen (cm³)"
                            name="volumen"
                            type="number"
                            value={formik.values.volumen}
                            onChange={formik.handleChange}
                            error={formik.touched.volumen && Boolean(formik.errors.volumen)}
                            helperText={formik.touched.volumen && formik.errors.volumen}
                            fullWidth
                            inputProps={{ min: 0, step: '0.1' }}
                        />

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
