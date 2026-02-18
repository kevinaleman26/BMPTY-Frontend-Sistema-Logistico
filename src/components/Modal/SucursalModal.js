import { useMutateSucursal } from '@/hooks/useMutateSucursal'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Snackbar from '@mui/material/Snackbar'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { useFormik } from 'formik'
import { useState, useCallback } from 'react'

export default function SucursalModal({ open, onClose, sucursal }) {

    const { createSucursal, updateSucursal } = useMutateSucursal()
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    const handleSnackbarClose = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }))
    }, [])

    const formik = useFormik({
        initialValues: {
            name: sucursal?.name || '',
            codigo: sucursal?.codigo || '',
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
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{sx:{backgroundColor:"background.paper",border:"1px solid",borderColor:"divider"}}}>
                <DialogTitle sx={{borderBottom:"1px solid",borderColor:"divider"}}>{sucursal ? 'Editar Sucursal' : 'Crear Sucursal'}</DialogTitle>
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
                            label="Código"
                            name="codigo"
                            value={formik.values.codigo}
                            onChange={(e) => {
                                // Convert to uppercase and limit to 10 characters
                                const value = e.target.value.toUpperCase().slice(0, 10)
                                formik.setFieldValue('codigo', value)
                            }}
                            fullWidth
                            placeholder="PAN, COL, DAV (3-4 letras)"
                            helperText="Código único de 3-4 letras mayúsculas. Ej: PAN, COL, DAV"
                            inputProps={{ maxLength: 10 }}
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
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    severity={snackbar.severity}
                    onClose={handleSnackbarClose}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}
