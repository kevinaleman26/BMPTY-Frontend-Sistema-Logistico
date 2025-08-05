// src/components/Table/OperadorTable/OperadorFilters.js
'use client'

import { Box, TextField } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export default function OperadorFilters() {
    const router = useRouter()
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

        params.set('page', 1)
        router.push(`?${params.toString()}`)
    }, [debouncedEmail, debouncedFullName])

    return (
        <Box display="flex" gap={2} mb={2}>
            <TextField
                label="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: '#ccc' } }}
                InputProps={{ style: { color: '#fff' } }}
            />
        </Box>
    )
}
