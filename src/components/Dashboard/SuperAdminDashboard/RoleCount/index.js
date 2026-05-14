import InfoCard from '@/components/Card/InfoCard'
import { supabase } from '@/lib/supabase'
import { tokens } from '@/styles/tokens'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { useQuery } from '@tanstack/react-query'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'

const fetchCounts = async () => {
    const { data, error } = await supabase.rpc('get_counts')
    if (error) throw error
    return data
}

const RoleCount = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['counts'],
        queryFn: fetchCounts
    })

    // Enhanced loading state with skeleton cards
    if (isLoading) {
        return (
            <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                gap={3}
                sx={{ maxWidth: '100%' }}
            >
                {[0, 1, 2].map((index) => (
                    <Box
                        key={index}
                        className="slide-up"
                        sx={{
                            backgroundColor: 'surface.card',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '8px',
                            p: 3,
                            animationDelay: `${index * 0.1}s`,
                            opacity: 0,
                            animationFillMode: 'forwards',
                        }}
                    >
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={16}
                            sx={{
                                mb: 2,
                                backgroundColor: 'rgba(244, 178, 35, 0.1)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                        <Skeleton
                            variant="text"
                            width="40%"
                            height={40}
                            sx={{
                                backgroundColor: 'rgba(244, 178, 35, 0.1)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '0.2s',
                            }}
                        />
                    </Box>
                ))}
            </Box>
        )
    }

    // Enhanced error state
    if (isError) {
        return (
            <Alert
                severity="error"
                className="slide-up"
                sx={{
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    border: '1px solid',
                    borderColor: 'error.main',
                    borderRadius: '8px',
                    '& .MuiAlert-icon': {
                        color: 'error.main',
                    }
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Error al cargar estadísticas
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {error.message}
                </Typography>
            </Alert>
        )
    }

    // Icon and color mapping
    const configMap = {
        clientes: {
            color: tokens.dataViz.clients,
            label: 'Clientes',
            icon: PeopleIcon,
        },
        operadores: {
            color: tokens.dataViz.operators,
            label: 'Operadores',
            icon: PersonIcon,
        },
        sucursal: {
            color: tokens.dataViz.branches,
            label: 'Sucursales',
            icon: BusinessIcon,
        }
    }

    return (
        <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
            gap={3}
            sx={{ maxWidth: '100%' }}
        >
            {data.map(({ tipo, cantidad }, index) => {
                const config = configMap[tipo] || {
                    color: tokens.accent.primary,
                    label: tipo,
                    icon: PeopleIcon,
                }

                return (
                    <InfoCard
                        key={tipo}
                        color={config.color}
                        label={config.label}
                        value={cantidad}
                        icon={config.icon}
                        delay={index * 0.1}
                    />
                )
            })}
        </Box>
    )
}

export default RoleCount