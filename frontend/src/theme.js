import { createTheme } from '@mui/material/styles'

// Design tokens — see /design notes for rationale.
// Background base #0a0f0d, surface #121a17, raised #1a2420
// Accent (lime) #baff29, danger #ff6b5e
// Display face: Fraunces (titles/wordmark only). Body/UI: Inter.

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#baff29',
      contrastText: '#0a0f0d',
    },
    error: {
      main: '#ff6b5e',
    },
    background: {
      default: '#0a0f0d',
      paper: '#121a17',
    },
    text: {
      primary: '#f3f7f4',
      secondary: '#9fb3a8',
    },
    divider: 'rgba(186, 255, 41, 0.16)',
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    h5: {
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
})

export default theme
