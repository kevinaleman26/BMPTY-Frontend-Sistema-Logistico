import { useEffect, useRef, useCallback } from 'react'

const IDLE_TIMEOUT_MS = 14 * 60 * 1000  // 14 min → dispara advertencia
const WARN_TIMEOUT_MS = 1 * 60 * 1000   // 1 min adicional → dispara logout

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

/**
 * Detecta inactividad del usuario.
 * @param {object} params
 * @param {() => void} params.onWarn    - Se llama 1 min antes de cerrar sesión
 * @param {() => void} params.onLogout  - Se llama cuando el tiempo se agota
 * @param {boolean}    params.enabled   - Activa/desactiva el hook (usar false cuando el modal ya está visible)
 */
export function useIdleTimeout({ onWarn, onLogout, enabled = true }) {
    const warnTimer = useRef(null)
    const logoutTimer = useRef(null)

    const clearTimers = useCallback(() => {
        clearTimeout(warnTimer.current)
        clearTimeout(logoutTimer.current)
    }, [])

    const resetTimers = useCallback(() => {
        if (!enabled) return

        clearTimers()

        warnTimer.current = setTimeout(() => {
            onWarn()

            logoutTimer.current = setTimeout(() => {
                onLogout()
            }, WARN_TIMEOUT_MS)
        }, IDLE_TIMEOUT_MS)
    }, [enabled, clearTimers, onWarn, onLogout])

    useEffect(() => {
        if (!enabled) {
            clearTimers()
            return
        }

        // Iniciar timers al montar
        resetTimers()

        // Escuchar actividad del usuario
        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, resetTimers, { passive: true })
        })

        return () => {
            clearTimers()
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, resetTimers)
            })
        }
    }, [enabled, resetTimers, clearTimers])

    return { resetTimers }
}
