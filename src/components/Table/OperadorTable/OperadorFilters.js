// src/components/Table/OperadorTable/OperadorFilters.js
'use client'

import { Box, TextField } from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function OperadorFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [email, setEmail] = useState(searchParams.get('email') || '')
    const [fullName, setFullName] = useState(searchParams.get('full_name') || '')

    const [debouncedEmail] = useDebounce(email, 500)
    const [debouncedFullName] = useDebounce(fullName, 500)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (debouncedEmail) {
            params.set('email', debouncedEmail)
        } else {
            params.delete('email')
        }

        if (debouncedFullName) {
            params.set('full_name', debouncedFullName)
        } else {
            params.delete('full_name')
        }

        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }, [debouncedEmail, debouncedFullName, pathname, router, searchParams])

    return (
        <Box
            className="slide-up"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
                p: 2.5,
                backgroundColor: 'surface.elevated',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                opacity: 0,
                animationFillMode: 'forwards',
                animationDelay: '0.1s',
            }}
        >
            <TextField
                label="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                size="small"
                sx={{ minWidth: 250, flex: 1 }}
            />
            <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                sx={{ minWidth: 250, flex: 1 }}
            />
        </Box>
    )
}
