
import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useMutateSucursal = () => {
    const queryClient = useQueryClient()

    const createSucursal = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('sucursal').insert([data])
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sucursales'])
        }
    })

    const updateSucursal = useMutation({
        mutationFn: async ({ id, ...rest }) => {
            const { error } = await supabase
                .from('sucursal')
                .update(rest)
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sucursales'])
        }
    })

    return {
        createSucursal,
        updateSucursal
    }
}
