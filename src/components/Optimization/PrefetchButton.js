import Button from '@mui/material/Button'
import { useCallback } from 'react'

/**
 * ⚡ Botón optimizado que precarga chunks lazy al hacer hover
 *
 * Mejora la perceived performance:
 * - Usuario hace hover → chunk empieza a cargar
 * - Usuario hace click → chunk ya está listo
 * - Resultado: Modal abre instantáneamente
 *
 * @param {Function} prefetchFn - Función que retorna import() del chunk
 * @param {*} props - Props del Button de MUI
 */
export default function PrefetchButton({ prefetchFn, ...props }) {
    const handleMouseEnter = useCallback(() => {
        if (prefetchFn) {
            // Preload the dynamic import
            prefetchFn()
        }
    }, [prefetchFn])

    const handleFocus = useCallback(() => {
        if (prefetchFn) {
            // También preload en focus (keyboard navigation)
            prefetchFn()
        }
    }, [prefetchFn])

    return (
        <Button
            {...props}
            onMouseEnter={handleMouseEnter}
            onFocus={handleFocus}
        />
    )
}
