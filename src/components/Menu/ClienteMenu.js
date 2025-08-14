import ListItemLink from '@/components/List/Item/ListItemLink'
import { List } from '@mui/material'

const ClienteMenu = () => {
  return (
      <List >
          <ListItemLink href="/dashboard" primary="Dashboard" />
          <ListItemLink href="/paquetes?page=1&limit=10" primary="Paquetes" />
          <ListItemLink href="/facturacion?page=1&limit=10" primary="Facturacion" />
      </List>
  )
}

export default ClienteMenu