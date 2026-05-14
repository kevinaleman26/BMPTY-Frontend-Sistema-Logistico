/**
 * ⚡ Iconos SVG optimizados
 *
 * Estos iconos son versiones ligeras de MUI icons
 * Cada icono: ~0.5 KB (vs ~3-5 KB de @mui/icons-material)
 *
 * Ahorro estimado: ~20 KB al reemplazar los 6 iconos más usados
 */

import SvgIcon from '@mui/material/SvgIcon'

export function EditIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </SvgIcon>
    )
}

export function AddIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </SvgIcon>
    )
}

export function VisibilityIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </SvgIcon>
    )
}

export function CloseIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </SvgIcon>
    )
}

export function DescriptionIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </SvgIcon>
    )
}

export function SearchIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </SvgIcon>
    )
}

// Re-export AccountCircle de MUI (se usa solo 1 vez, no vale la pena reemplazar)
export { default as AccountCircle } from '@mui/icons-material/AccountCircle'

// Timeline icons para cronología
export { default as TimelineIcon } from '@mui/icons-material/Timeline'
export { default as CheckCircleIcon } from '@mui/icons-material/CheckCircle'
export { default as CancelIcon } from '@mui/icons-material/Cancel'
export { default as AddBoxIcon } from '@mui/icons-material/AddBox'
export { default as LocalShippingIcon } from '@mui/icons-material/LocalShipping'
export { default as ReceiptIcon } from '@mui/icons-material/Receipt'
export { default as PersonIcon } from '@mui/icons-material/Person'

// Business icons (usados en dashboards)
export { default as TrendingUpIcon } from '@mui/icons-material/TrendingUp'
export { default as PeopleIcon } from '@mui/icons-material/People'
export { default as InventoryIcon } from '@mui/icons-material/Inventory'
export { default as AccountBalanceIcon } from '@mui/icons-material/AccountBalance'
export { default as BusinessIcon } from '@mui/icons-material/Business'
export { default as StoreIcon } from '@mui/icons-material/Store'

// Form icons
export { default as ExpandMoreIcon } from '@mui/icons-material/ExpandMore'
export { default as SendIcon } from '@mui/icons-material/Send'

// Payment icons
export { default as PaymentIcon } from '@mui/icons-material/Payment'
export { default as MoneyOffIcon } from '@mui/icons-material/MoneyOff'
export { default as AttachMoneyIcon } from '@mui/icons-material/AttachMoney'

// Other
export { default as NavigateNextIcon } from '@mui/icons-material/NavigateNext'
export { default as QrCodeIcon } from '@mui/icons-material/QrCode'
export { default as CategoryIcon } from '@mui/icons-material/Category'
export { default as ScaleIcon } from '@mui/icons-material/Scale'
export { default as StraightenIcon } from '@mui/icons-material/Straighten'
export { default as InboxIcon } from '@mui/icons-material/Inbox'
export { default as CallReceivedIcon } from '@mui/icons-material/CallReceived'
