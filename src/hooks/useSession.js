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
                return
            }

            const getSesionInfo = session
            const { user } = getSesionInfo
            const id = user.id

            const cliente = await getClientInfo(id)

            if (cliente) {
                setSession(cliente)
            } else {
                const operador = await getOperadorInfo(id);
                setSession(operador)
            }

            setLoading(false)
        }

        const getSession = async () => {
            const { data, error } = await supabase.auth.getSession()
            return actionSession(data?.session)
        }

        getSession()

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(actionSession(session))
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    return { session, loading }
}
