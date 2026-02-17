"use client";

import { useMutatePaquete } from "@/hooks/useMutatePaquete";
import { usePaqueteFacturado } from "@/hooks/usePaqueteFacturado";
import { tokens } from "@/styles/tokens";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import BlockIcon from "@mui/icons-material/Block";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const validationSchema = Yup.object({
  peso: Yup.number()
    .required("Peso requerido")
    .positive("El peso debe ser mayor a 0")
    .min(0.01, "El peso mínimo es 0.01 kg"),
  precio: Yup.number()
    .required("Precio requerido")
    .positive("El precio debe ser mayor a 0")
    .min(0.01, "El precio mínimo es $0.01"),
});

/**
 * Modal de edición de paquete
 * Permite editar principalmente el peso con advertencia antes de guardar
 */
export default function PaqueteEditModal({ open, onClose, paquete }) {
  const { updatePaquete } = useMutatePaquete();
  const { estaFacturado, isLoading: checkingFacturado } = usePaqueteFacturado(
    paquete?.codigo,
  );
  const [showWarning, setShowWarning] = useState(false);

  const formik = useFormik({
    initialValues: {
      peso: paquete?.peso || "",
      precio: paquete?.precio || "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      // Si no se ha mostrado la advertencia, mostrarla
      if (!showWarning) {
        setShowWarning(true);
        return;
      }

      // Si ya se mostró la advertencia, proceder a guardar
      try {
        await updatePaquete.mutateAsync({
          id: paquete.id,
          codigo: paquete.codigo, // Necesitamos el código para actualizar en proveedor_paquetes
          ...values,
        });
        setShowWarning(false);
        onClose();
      } catch (err) {
        console.error("Error al actualizar paquete:", err);
      }
    },
  });

  const handleClose = () => {
    setShowWarning(false);
    formik.resetForm();
    onClose();
  };

  const hasChanges = () => {
    return (
      formik.values.peso !== paquete?.peso ||
      formik.values.precio !== paquete?.precio
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: tokens.surface.card,
          border: `1px solid ${tokens.border.soft}`,
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${tokens.border.soft}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: tokens.text.emphasis, fontWeight: 600 }}
        >
          Editar Paquete
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: tokens.text.secondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {checkingFacturado ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress sx={{ color: tokens.accent.primary }} />
          </Box>
        ) : estaFacturado ? (
          /* Paquete ya facturado - Mostrar mensaje de error */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert
              severity="error"
              sx={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                color: tokens.text.primary,
                "& .MuiAlert-icon": { color: "#f44336" },
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                🚫 No se puede editar este paquete
              </Typography>
              <Typography variant="body2">
                Este paquete ya fue <strong>facturado</strong> y no puede ser
                modificado. Editar el peso o precio alteraría los cálculos de la
                factura existente.
              </Typography>
            </Alert>

            {/* Información del paquete (solo lectura) */}
            <Box
              sx={{
                p: 2,
                backgroundColor: tokens.surface.elevated,
                borderRadius: "8px",
                border: `1px solid ${tokens.border.subtle}`,
                opacity: 0.7,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: tokens.text.secondary, mb: 1 }}
              >
                Código del paquete
              </Typography>
              <Typography
                sx={{
                  color: tokens.text.emphasis,
                  fontFamily:
                    'var(--font-jetbrains), "JetBrains Mono", monospace',
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                {paquete?.codigo}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: tokens.text.muted, mt: 1, display: "block" }}
              >
                {paquete?.tipo} • Peso: {paquete?.peso} kg • Precio: $
                {paquete?.precio}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <Button
                onClick={handleClose}
                variant="contained"
                sx={{
                  backgroundColor: tokens.accent.primary,
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#e0a01f" },
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        ) : (
          /* Paquete NO facturado - Permitir edición */
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Información del paquete (read-only) */}
            <Box
              sx={{
                p: 2,
                backgroundColor: tokens.surface.elevated,
                borderRadius: "8px",
                border: `1px solid ${tokens.border.subtle}`,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: tokens.text.secondary, mb: 1 }}
              >
                Código del paquete
              </Typography>
              <Typography
                sx={{
                  color: tokens.text.emphasis,
                  fontFamily:
                    'var(--font-jetbrains), "JetBrains Mono", monospace',
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                {paquete?.codigo}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: tokens.text.muted, mt: 1, display: "block" }}
              >
                {paquete?.tipo}
              </Typography>
            </Box>

            {/* Campos editables */}
            <TextField
              label="Peso (kg)"
              name="peso"
              type="number"
              value={formik.values.peso}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.peso && Boolean(formik.errors.peso)}
              helperText={formik.touched.peso && formik.errors.peso}
              fullWidth
              inputProps={{
                step: "0.01",
                min: "0.01",
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: tokens.surface.elevated,
                  "& fieldset": { borderColor: tokens.border.soft },
                  "&:hover fieldset": { borderColor: tokens.accent.primary },
                  "&.Mui-focused fieldset": {
                    borderColor: tokens.accent.primary,
                  },
                },
                "& .MuiInputLabel-root": { color: tokens.text.secondary },
                "& .MuiInputBase-input": {
                  color: tokens.text.primary,
                  fontFamily:
                    'var(--font-jetbrains), "JetBrains Mono", monospace',
                  fontWeight: 600,
                },
              }}
            />

            <TextField
              label="Precio ($)"
              name="precio"
              type="number"
              value={formik.values.precio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.precio && Boolean(formik.errors.precio)}
              helperText={formik.touched.precio && formik.errors.precio}
              fullWidth
              inputProps={{
                step: "0.01",
                min: "0.01",
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: tokens.surface.elevated,
                  "& fieldset": { borderColor: tokens.border.soft },
                  "&:hover fieldset": { borderColor: tokens.accent.primary },
                  "&.Mui-focused fieldset": {
                    borderColor: tokens.accent.primary,
                  },
                },
                "& .MuiInputLabel-root": { color: tokens.text.secondary },
                "& .MuiInputBase-input": {
                  color: tokens.text.primary,
                  fontFamily:
                    'var(--font-jetbrains), "JetBrains Mono", monospace',
                  fontWeight: 600,
                },
              }}
            />

            {/* Advertencia de cambios */}
            {showWarning && hasChanges() && (
              <Alert
                severity="warning"
                icon={<WarningIcon />}
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                  color: tokens.text.primary,
                  "& .MuiAlert-icon": { color: "#ff9800" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⚠️ Advertencia: Está a punto de modificar información del
                  paquete
                </Typography>
                <Typography variant="body2">
                  Esta acción modificará el <strong>peso</strong> y/o{" "}
                  <strong>precio</strong> del paquete en el sistema. Esto puede
                  afectar cálculos de transferencias y facturación.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  ¿Está seguro de que desea continuar?
                </Typography>
              </Alert>
            )}

            {/* Botones */}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                onClick={handleClose}
                sx={{
                  color: tokens.text.secondary,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!hasChanges() || updatePaquete.isPending}
                sx={{
                  backgroundColor: showWarning
                    ? "#f44336"
                    : tokens.accent.primary,
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: showWarning ? "#d32f2f" : "#e0a01f",
                  },
                  "&:disabled": {
                    backgroundColor: tokens.border.soft,
                    color: tokens.text.muted,
                  },
                }}
              >
                {showWarning ? "Confirmar Cambios" : "Guardar"}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
