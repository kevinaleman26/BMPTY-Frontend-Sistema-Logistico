'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const getClientInfo = async (id) => {
    let { data: cliente, error } = await supabase
        .from('cliente')
        .select("*")
        .eq('id', id)
        .single()

    if (error) return null;

    cliente['role'] = {
        id: 4,
        name: 'Cliente'
    }

    return cliente;
}

const getOperadorInfo = async (id) => {
    let { data: cliente, error } = await supabase
        .from('operador')
        .select("*, sucursal(id, name), role(id, name)")
        .eq('id', id)
        .single()

    if (error) return null;

    return cliente;
}

export function useSession() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const actionSession = async (session) => {

            if (!session) {
                setLoading(false)
                return
            }

            const { user } = session
            const id = user.id

            // Optimización: Hacer ambas consultas en paralelo en lugar de waterfall
            const [clienteResult, operadorResult] = await Promise.allSettled([
                getClientInfo(id),
                getOperadorInfo(id)
            ])

            // Usar el resultado que sea exitoso
            if (clienteResult.status === 'fulfilled' && clienteResult.value) {
                setSession(clienteResult.value)
            } else if (operadorResult.status === 'fulfilled' && operadorResult.value) {
                setSession(operadorResult.value)
            }

            setLoading(false)
        }

        const getSession = async () => {
            const { data } = await supabase.auth.getSession()
            await actionSession(data?.session)
        }

        getSession()

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            await actionSession(session)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    return { session, loading }
}
