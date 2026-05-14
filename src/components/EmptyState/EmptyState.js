'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InboxIcon from '@mui/icons-material/Inbox'

/**
 * EmptyState component - Display when no data is available
 *
 * @param {string} title - Main message
 * @param {string} description - Supporting text
 * @param {ReactNode} icon - Custom icon component
 * @param {ReactNode} action - Optional action button
 */
export default function EmptyState({
    title = 'No hay datos disponibles',
    description = 'No se encontraron resultados con los filtros aplicados.',
    icon: CustomIcon,
    action,
}) {
    const Icon = CustomIcon || InboxIcon

    return (
        <Box
            className="scale-in"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center',
                minHeight: 400,
                backgroundColor: 'surface.elevated',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',

                // Subtle background pattern
                backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(244, 178, 35, 0.03) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(244, 178, 35, 0.03) 0%, transparent 50%)
                `,
            }}
        >
            {/* Decorative circles */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'divider',
                    opacity: 0.2,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'divider',
                    opacity: 0.15,
                }}
            />

            {/* Icon */}
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(244, 178, 35, 0.1)',
                    border: '3px solid rgba(244, 178, 35, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    animation: 'float 3s ease-in-out infinite',
                    position: 'relative',
                    zIndex: 1,

                    // Inner glow
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -10,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(244, 178, 35, 0.2) 0%, transparent 70%)',
                        filter: 'blur(15px)',
                        zIndex: -1,
                    }
                }}
            >
                <Icon
                    sx={{
                        fontSize: 48,
                        color: 'primary.main',
                        opacity: 0.8,
                    }}
                />
            </Box>

            {/* Title */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 600,
                    color: 'text.emphasis',
                    mb: 1.5,
                    letterSpacing: '-0.01em',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {title}
            </Typography>

            {/* Description */}
            <Typography
                variant="body1"
                sx={{
                    color: 'text.secondary',
                    maxWidth: 480,
                    lineHeight: 1.6,
                    mb: action ? 3 : 0,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {description}
            </Typography>

            {/* Action Button */}
            {action && (
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {action}
                </Box>
            )}
        </Box>
    )
}
