'use client'

import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

/**
 * TableSkeleton - Loading skeleton for DataGrid tables
 *
 * @param {number} rows - Number of skeleton rows to display (default: 5)
 * @param {number} columns - Number of columns (default: 5)
 */
export default function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <Box
            className="fade-in"
            sx={{
                backgroundColor: 'surface.elevated',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                overflow: 'hidden',
                p: 2,
            }}
        >
            {/* Header Row */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: 2,
                    mb: 2,
                    pb: 2,
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                }}
            >
                {Array.from({ length: columns }).map((_, index) => (
                    <Skeleton
                        key={`header-${index}`}
                        variant="text"
                        width="80%"
                        height={24}
                        sx={{
                            backgroundColor: 'rgba(244, 178, 35, 0.1)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: `${index * 0.1}s`,
                        }}
                    />
                ))}
            </Box>

            {/* Data Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <Box
                    key={`row-${rowIndex}`}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: 2,
                        mb: 1.5,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        opacity: 1 - (rowIndex * 0.1),
                    }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={`cell-${rowIndex}-${colIndex}`}
                            variant="text"
                            width={colIndex === 0 ? '90%' : '70%'}
                            height={20}
                            sx={{
                                backgroundColor: 'rgba(168, 163, 153, 0.1)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: `${(rowIndex + colIndex) * 0.05}s`,
                            }}
                        />
                    ))}
                </Box>
            ))}

            {/* Footer Pagination Skeleton */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Skeleton
                    variant="text"
                    width={150}
                    height={32}
                    sx={{ backgroundColor: 'rgba(168, 163, 153, 0.1)' }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{ backgroundColor: 'rgba(168, 163, 153, 0.1)' }}
                    />
                    <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{ backgroundColor: 'rgba(168, 163, 153, 0.1)' }}
                    />
                </Box>
            </Box>
        </Box>
    )
}
