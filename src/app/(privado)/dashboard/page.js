'use client'

import InfoCard from '@/components/Card/InfoCard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

const fetchCounts = async () => {
    const { data, error } = await supabase.rpc('get_counts')
    if (error) throw error
    return data
}

export default function DashboardPage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['counts'],
        queryFn: fetchCounts
    })

    const colorMap = {
        clientes: '#4caf50',
        operadores: '#2196f3',
        sucursal: '#f44336'
    }

    const labelMap = {
        clientes: 'Clientes',
        operadores: 'Operadores',
        sucursal: 'Sucursal'
    }

    return (
        <ProtectedRoute>
            <Typography variant="h3" color="white" sx={{ p: 4 }}>
                Bienvenido
            </Typography>

            {isLoading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : isError ? (
                <Typography color="error" sx={{ p: 4 }}>
                    Error: {error.message}
                </Typography>
            ) : (
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} sx={{ px: 4 }}>
                    {data.map(({ tipo, cantidad }) => (
                        <InfoCard
                            key={tipo}
                            color={colorMap[tipo] || '#555'}
                            label={labelMap[tipo] || tipo}
                            value={cantidad}
                        />
                    ))}
                </Box>
            )}
        </ProtectedRoute>
    )
}
