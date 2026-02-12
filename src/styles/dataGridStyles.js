// Shared DataGrid styling for consistent table appearance with enhanced industrial design
export const dataGridStyles = {
  backgroundColor: 'surface.elevated',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  transition: 'box-shadow 200ms ease',
  position: 'relative',

  // Subtle background texture
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,

  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },

  // Column Headers - enhanced with gradient
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'surface.header',
    borderBottom: '2px solid',
    borderColor: 'primary.main',
    fontWeight: 600,
    fontSize: '0.875rem',
    background: 'linear-gradient(180deg, #2f2c24 0%, #252218 100%)',
    position: 'relative',

    // Top accent line
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'linear-gradient(90deg, #f4b223 0%, #d69b1e 100%)',
    }
  },

  '& .MuiDataGrid-columnHeader': {
    '&:focus, &:focus-within': {
      outline: 'none',
    },
  },

  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    color: 'text.emphasis',
  },

  // Column separator lines
  '& .MuiDataGrid-columnSeparator': {
    color: 'divider',
    opacity: 0.3,
  },

  // Rows - hover lift effect
  '& .MuiDataGrid-row': {
    borderBottom: '1px solid',
    borderColor: 'divider',
    transition: 'all 150ms ease',
    cursor: 'default',

    '&:hover': {
      backgroundColor: 'rgba(244, 178, 35, 0.06)',
      transform: 'translateX(2px)',
      borderLeftColor: 'primary.main',
      borderLeft: '3px solid',

      '& .MuiDataGrid-cell': {
        color: 'text.emphasis',
      }
    },

    '&.Mui-selected': {
      backgroundColor: 'rgba(244, 178, 35, 0.12)',

      '&:hover': {
        backgroundColor: 'rgba(244, 178, 35, 0.16)',
      }
    }
  },

  // Cells
  '& .MuiDataGrid-cell': {
    borderBottom: 'none',
    fontSize: '0.875rem',
    color: 'text.primary',
    transition: 'color 150ms ease',

    '&:focus, &:focus-within': {
      outline: 'none',
    }
  },

  // Footer - gradient background
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: 'surface.header',
    borderTop: '2px solid',
    borderColor: 'divider',
    background: 'linear-gradient(180deg, #252218 0%, #2f2c24 100%)',
    minHeight: '56px',
  },

  // Pagination controls
  '& .MuiTablePagination-root': {
    color: 'text.primary',
  },

  '& .MuiTablePagination-select': {
    backgroundColor: 'surface.elevated',
    borderRadius: '6px',
    padding: '4px 8px',
    transition: 'all 150ms ease',

    '&:hover': {
      backgroundColor: 'rgba(244, 178, 35, 0.08)',
    }
  },

  '& .MuiTablePagination-actions button': {
    color: 'text.primary',
    transition: 'all 150ms ease',

    '&:hover': {
      backgroundColor: 'rgba(244, 178, 35, 0.12)',
      color: 'primary.main',
    },

    '&.Mui-disabled': {
      color: 'text.muted',
    }
  },

  // Scrollbar styling
  '& .MuiDataGrid-virtualScroller': {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#1a1815',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#3a3730',
      borderRadius: '4px',

      '&:hover': {
        background: '#4a453c',
      }
    }
  },

  // No rows overlay
  '& .MuiDataGrid-overlay': {
    backgroundColor: 'rgba(26, 24, 21, 0.95)',
    backdropFilter: 'blur(4px)',
  }
}
