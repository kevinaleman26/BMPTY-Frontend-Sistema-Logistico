'use client'

import { ListItemButton, ListItemText } from '@mui/material'
import NextLink from 'next/link'

export default function ListItemLink({ href, primary, ...props }) {
    return (
        <ListItemButton component={NextLink} href={href} {...props}>
            <ListItemText primary={primary} />
        </ListItemButton>
    )
}
