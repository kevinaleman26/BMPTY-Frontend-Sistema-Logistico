import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const ClienteDashboard = ({ user }) => {
  return (
    <Box sx={{ width: '100%', py: 3 }}>
      <Grid
        container
        spacing={2}
        sx={{ width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}
      >
        {/* Header */}
        <Grid item xs={12}>
          <Typography variant="h3" color="white">
            Bienvenido, {user?.full_name}
          </Typography>
        </Grid>

      </Grid>
    </Box>
  )
}

export default ClienteDashboard
