'use client'

import { Box, Card, CardContent, Typography } from '@mui/material'

export default function InfoCard({ color = '#1976d2', label, value }) {
    return (
        <Card sx={{ backgroundColor: color, color: '#fff', borderRadius: 2, py:1, px:3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight="bold">
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {value}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )
}
