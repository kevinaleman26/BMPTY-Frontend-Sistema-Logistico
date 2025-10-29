// src/hooks/useMutateCliente.js
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useMutateCliente() {
    const queryClient = useQueryClient()

    const createCliente = useMutation({
        mutationFn: async (nuevo) => {
            const { data } = await axios.post('/api/cliente/create', nuevo)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['clientes'])
        },
        onError: (error) => {
            alert(error.response.data.error)
        }
    })

    const updateCliente = useMutation({
        mutationFn: async (nuevo) => {
            const { data } = await axios.put('/api/cliente/update', nuevo)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['clientes'])
        },
        onError: (error) => {
            alert(error.response.data.error)
        }
    })

    return { createCliente, updateCliente }
}
