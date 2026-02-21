'use client'

import { useEffect } from 'react'

/**
 * Global error boundary — last resort safety net.
 * Catches errors thrown inside the root layout.js (e.g. Providers crash).
 * Must include its own <html> and <body> since it replaces the root layout.
 * Cannot use MUI or tokens (no ThemeProvider available at this level).
 */
export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error('[GlobalError]', error)
    }, [error])

    return (
        <html lang="es">
            <body
                style={{
                    margin: 0,
                    backgroundColor: '#1a1815',
                    color: '#e8e6e0',
                    fontFamily: '"IBM Plex Sans", -apple-system, system-ui, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <div
                    style={{
                        padding: '2.5rem',
                        backgroundColor: '#252218',
                        border: '1px solid #3a3730',
                        borderRadius: '12px',
                        maxWidth: '480px',
                        width: '100%',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Red accent bar */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '3px',
                            background: '#d32f2f',
                        }}
                    />

                    {/* Icon */}
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(211, 47, 47, 0.12)',
                            border: '1px solid rgba(211, 47, 47, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '1.75rem',
                        }}
                    >
                        ⚠
                    </div>

                    <h2
                        style={{
                            color: '#ffffff',
                            margin: '0 0 0.5rem',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                        }}
                    >
                        Error crítico de la aplicación
                    </h2>

                    <p
                        style={{
                            color: '#a8a399',
                            margin: '0 0 1.75rem',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                        }}
                    >
                        La aplicación encontró un error inesperado y no pudo continuar.
                        Intenta recargar la página.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button
                            onClick={reset}
                            style={{
                                backgroundColor: '#f4b223',
                                color: '#000',
                                border: 'none',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                            }}
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => { window.location.href = '/dashboard' }}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#e8e6e0',
                                border: '1px solid #3a3730',
                                padding: '0.625rem 1.25rem',
                                borderRadius: '6px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                            }}
                        >
                            Ir al inicio
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
