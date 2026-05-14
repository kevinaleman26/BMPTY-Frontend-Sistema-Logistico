'use client'

import { memo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { PieChart } from '@mui/x-charts/PieChart'

// ─── Shared styles ────────────────────────────────────────────────────────────

const CARD_SX = {
    backgroundColor: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
}

const CARD_TITLE_SX = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    mb: 0.5,
    letterSpacing: '-0.01em',
}

const CARD_SUBTITLE_SX = {
    fontSize: '0.75rem',
    color: '#555',
    mb: 2.5,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-jetbrains), "JetBrains Mono", monospace',
}

// Shared axis styling for dark theme
const AXIS_STYLE = {
    tickLabelStyle: { fill: '#555', fontSize: 11 },
}

const CHART_SX = {
    '& .MuiChartsAxis-line': { stroke: '#222' },
    '& .MuiChartsAxis-tick': { stroke: '#222' },
    '& .MuiChartsGrid-line': { stroke: '#1a1a1a' },
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────

const ChartSkeleton = ({ height = 220 }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={height / 4} sx={{ bgcolor: '#151515', borderRadius: 1 }} />
        ))}
    </Box>
)

// ─── Paquetes por semana (Bar) ────────────────────────────────────────────────

export const WeeklyPackagesChart = memo(function WeeklyPackagesChart({ data, isLoading }) {
    return (
        <Box sx={CARD_SX}>
            <Typography sx={CARD_TITLE_SX}>Paquetes registrados</Typography>
            <Typography sx={CARD_SUBTITLE_SX}>Últimas 8 semanas</Typography>
            {isLoading ? (
                <ChartSkeleton height={220} />
            ) : (
                <Box sx={{ flex: 1, minHeight: 220 }}>
                    <BarChart
                        dataset={data}
                        xAxis={[{ scaleType: 'band', dataKey: 'semana', ...AXIS_STYLE }]}
                        yAxis={[{ ...AXIS_STYLE }]}
                        series={[{ dataKey: 'paquetes', label: 'Paquetes', color: '#f4b223' }]}
                        height={220}
                        margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
                        slotProps={{ legend: { hidden: true } }}
                        sx={CHART_SX}
                        borderRadius={4}
                    />
                </Box>
            )}
        </Box>
    )
})

// ─── Estado de paquetes (Donut) ───────────────────────────────────────────────

export const PackageStatusChart = memo(function PackageStatusChart({ data, isLoading }) {
    const total = data?.reduce((s, d) => s + d.value, 0) || 0

    return (
        <Box sx={CARD_SX}>
            <Typography sx={CARD_TITLE_SX}>Estado de paquetes</Typography>
            <Typography sx={CARD_SUBTITLE_SX}>Distribución actual</Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Skeleton variant="circular" width={160} height={160} sx={{ bgcolor: '#151515' }} />
                </Box>
            ) : total === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#444' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#444' }}>Sin datos</Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PieChart
                        series={[{
                            data: data || [],
                            innerRadius: 55,
                            outerRadius: 90,
                            paddingAngle: 2,
                            cornerRadius: 3,
                        }]}
                        height={200}
                        slotProps={{ legend: { hidden: true } }}
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    />
                    {/* Custom legend */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(data || []).map(item => (
                            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                                    {item.id} <span style={{ color: '#fff', fontWeight: 600 }}>{item.value}</span>
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    )
})

// ─── Ingresos por semana (Area / Line) ───────────────────────────────────────

export const WeeklyRevenueChart = memo(function WeeklyRevenueChart({ data, isLoading }) {
    return (
        <Box sx={CARD_SX}>
            <Typography sx={CARD_TITLE_SX}>Ingresos semanales</Typography>
            <Typography sx={CARD_SUBTITLE_SX}>Facturas pagadas · Últimas 8 semanas</Typography>
            {isLoading ? (
                <ChartSkeleton height={220} />
            ) : (
                <Box sx={{ flex: 1, minHeight: 220 }}>
                    <LineChart
                        dataset={data}
                        xAxis={[{ scaleType: 'band', dataKey: 'semana', ...AXIS_STYLE }]}
                        yAxis={[{ ...AXIS_STYLE }]}
                        series={[{
                            dataKey: 'ingresos',
                            label: 'Ingresos',
                            color: '#4caf50',
                            area: true,
                            showMark: false,
                        }]}
                        height={220}
                        margin={{ top: 10, right: 10, bottom: 30, left: 60 }}
                        slotProps={{ legend: { hidden: true } }}
                        sx={{
                            ...CHART_SX,
                            '& .MuiAreaElement-root': { fill: '#4caf5020' },
                        }}
                    />
                </Box>
            )}
        </Box>
    )
})

// ─── Facturas por estado de pago (Pie) ────────────────────────────────────────

export const InvoiceStatusChart = memo(function InvoiceStatusChart({ data, isLoading }) {
    const total = data?.reduce((s, d) => s + d.value, 0) || 0

    return (
        <Box sx={CARD_SX}>
            <Typography sx={CARD_TITLE_SX}>Facturas</Typography>
            <Typography sx={CARD_SUBTITLE_SX}>Pagadas vs pendientes</Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Skeleton variant="circular" width={160} height={160} sx={{ bgcolor: '#151515' }} />
                </Box>
            ) : total === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#444' }}>Sin datos</Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PieChart
                        series={[{
                            data: data || [],
                            innerRadius: 55,
                            outerRadius: 90,
                            paddingAngle: 2,
                            cornerRadius: 3,
                        }]}
                        height={200}
                        slotProps={{ legend: { hidden: true } }}
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(data || []).map(item => (
                            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                                    {item.id} <span style={{ color: '#fff', fontWeight: 600 }}>{item.value}</span>
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    )
})

// ─── Transferencias por semana (Line) ────────────────────────────────────────

export const WeeklyTransfersChart = memo(function WeeklyTransfersChart({ data, isLoading }) {
    return (
        <Box sx={CARD_SX}>
            <Typography sx={CARD_TITLE_SX}>Transferencias</Typography>
            <Typography sx={CARD_SUBTITLE_SX}>Movimientos · Últimas 8 semanas</Typography>
            {isLoading ? (
                <ChartSkeleton height={220} />
            ) : (
                <Box sx={{ flex: 1, minHeight: 220 }}>
                    <LineChart
                        dataset={data}
                        xAxis={[{ scaleType: 'band', dataKey: 'semana', ...AXIS_STYLE }]}
                        yAxis={[{ ...AXIS_STYLE }]}
                        series={[{
                            dataKey: 'transferencias',
                            label: 'Transferencias',
                            color: '#9c27b0',
                            showMark: true,
                        }]}
                        height={220}
                        margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
                        slotProps={{ legend: { hidden: true } }}
                        sx={CHART_SX}
                    />
                </Box>
            )}
        </Box>
    )
})

// ─── Ingresos por sucursal (Horizontal Bar) ───────────────────────────────────

export const RevenueBySucursalChart = memo(function RevenueBySucursalChart({ data, isLoading }) {
    const chartHeight = Math.max(200, (data?.length || 4) * 40 + 40)

    return (
        <Box sx={CARD_SX}>
            <Typography sx={CARD_TITLE_SX}>Ingresos por sucursal</Typography>
            <Typography sx={CARD_SUBTITLE_SX}>Facturas cobradas · Total acumulado</Typography>
            {isLoading ? (
                <ChartSkeleton height={chartHeight} />
            ) : !data?.length ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#444' }}>Sin datos</Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1 }}>
                    <BarChart
                        dataset={data}
                        yAxis={[{ scaleType: 'band', dataKey: 'sucursal', ...AXIS_STYLE }]}
                        xAxis={[{ ...AXIS_STYLE }]}
                        series={[{ dataKey: 'total', label: 'Ingresos ($)', color: '#2196f3' }]}
                        layout="horizontal"
                        height={chartHeight}
                        margin={{ top: 10, right: 30, bottom: 30, left: 100 }}
                        slotProps={{ legend: { hidden: true } }}
                        sx={CHART_SX}
                        borderRadius={4}
                    />
                </Box>
            )}
        </Box>
    )
})
