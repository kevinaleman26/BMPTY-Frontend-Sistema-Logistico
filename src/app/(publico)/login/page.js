"use client"

import LoginForm from "@/components/Form/LoginForm"
import { Box, Typography, alpha } from "@mui/material"

export default function LoginPage() {
  return (
    <Box
      className="slide-up"
      sx={{
        opacity: 0,
        animationFillMode: 'forwards',
        animationDelay: '0.1s'
      }}
    >
      {/* Document Header */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: '#3a3730',
          position: 'relative'
        }}
      >
        {/* Gradient accent line */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '120px',
            height: '2px',
            background: 'linear-gradient(90deg, #f4b223 0%, transparent 100%)'
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1.5
          }}
        >
          <Box
            sx={{
              width: '4px',
              height: '32px',
              backgroundColor: '#f4b223',
              borderRadius: '2px'
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontFamily: 'IBM Plex Sans, sans-serif'
            }}
          >
            Iniciar sesión
          </Typography>
        </Box>
        <Typography
          sx={{
            color: '#a8a399',
            fontSize: '0.9375rem',
            pl: 3.5,
            fontFamily: 'IBM Plex Sans, sans-serif'
          }}
        >
          Accede al sistema de gestión logística
        </Typography>
      </Box>

      <LoginForm />
    </Box>
  )
}
