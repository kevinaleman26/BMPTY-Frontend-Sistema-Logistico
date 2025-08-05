import { useMutateSucursal } from '@/hooks/useMutateSucursal'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Snackbar,
    Switch,
    TextField
} from '@mui/material'
import { useFormik } from 'formik'
import { useState } from 'react'

export default function SucursalModal({ open, onClose, sucursal }) {

    const { createSucursal, updateSucursal } = useMutateSucursal()
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    const formik = useFormik({
        initialValues: {
            name: sucursal?.name || '',
            address: sucursal?.address || '',
            tasa: sucursal?.tasa || '',
            status: sucursal?.status ?? true
        },
        enableReinitialize: true,
        onSubmit: async (values, { resetForm }) => {
            try {
                if (sucursal?.id) {
                    await updateSucursal.mutateAsync({ id: sucursal.id, ...values })
                    setSnackbar({ open: true, message: 'Sucursal actualizada', severity: 'success' })
                } else {
                    await createSucursal.mutateAsync(values)
                    setSnackbar({ open: true, message: 'Sucursal creada', severity: 'success' })
                }
                resetForm()
                onClose()
            } catch (error) {
                console.error('Error guardando sucursal:', error.message)
                setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' })
            }
        }
    })

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>{sucursal ? 'Editar Sucursal' : 'Crear Sucursal'}</DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        onSubmit={formik.handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2, // 🔥 Aquí aumentamos el espacio entre campos
                            mt: 1,
                            py: 1
                        }}
                    >
                        <TextField
                            label="Nombre"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Dirección"
                            name="address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Tasa"
                            name="tasa"
                            type="number"
                            value={formik.values.tasa}
                            onChange={formik.handleChange}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formik.values.status}
                                    onChange={(e) =>
                                        formik.setFieldValue('status', e.target.checked)
                                    }
                                />
                            }
                            label="Activo"
                        />

                        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
