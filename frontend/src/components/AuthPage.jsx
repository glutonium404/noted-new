import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import LoginRounded from '@mui/icons-material/LoginRounded'
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import { PASSWORD_MIN_LENGTH } from '../lib/noted'

function PasswordField({ label, value, onChange, autoComplete, helperText, error }) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      required
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      helperText={helperText}
      error={error}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              tabIndex={-1}
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible((previous) => !previous)}
            >
              {visible ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

function AuthPage({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState(0)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [confirmMismatch, setConfirmMismatch] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const succeeded = await onLogin(loginEmail, loginPassword)
    setSubmitting(false)
    if (succeeded) {
      setLoginEmail('')
      setLoginPassword('')
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    if (registerPassword !== registerConfirmPassword) {
      setConfirmMismatch(true)
      return
    }
    setConfirmMismatch(false)

    setSubmitting(true)
    const succeeded = await onRegister(registerName, registerEmail, registerPassword)
    setSubmitting(false)
    if (succeeded) {
      setRegisterName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setRegisterConfirmPassword('')
    }
  }

  return (
    <Box className="auth-shell">
      <Paper elevation={0} className="auth-card">
        <Stack spacing={0.5} className="auth-header">
          <Typography variant="h5" className="auth-wordmark">
            Noted
          </Typography>
          <span className="auth-scribble" aria-hidden="true" />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            Sign in or create an account
          </Typography>
        </Stack>

        <Tabs
          value={authMode}
          onChange={(_, nextValue) => {
            setAuthMode(nextValue)
            setConfirmMismatch(false)
          }}
          variant="fullWidth"
          sx={{ mb: 2.5 }}
        >
          <Tab icon={<LoginRounded />} iconPosition="start" label="Login" />
          <Tab
            icon={<PersonAddAlt1Rounded />}
            iconPosition="start"
            label="Register"
          />
        </Tabs>

        {authMode === 0 ? (
          <Box component="form" onSubmit={handleLoginSubmit} className="auth-form">
            <TextField
              required
              fullWidth
              label="Email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              type="email"
              autoComplete="email"
            />
            <PasswordField
              label="Password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegisterSubmit} className="auth-form">
            <TextField
              required
              fullWidth
              label="Name"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              autoComplete="name"
            />
            <TextField
              required
              fullWidth
              label="Email"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              type="email"
              autoComplete="email"
            />
            <PasswordField
              label="Password"
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              autoComplete="new-password"
              helperText={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            />
            <PasswordField
              label="Confirm password"
              value={registerConfirmPassword}
              onChange={(event) => {
                setRegisterConfirmPassword(event.target.value)
                setConfirmMismatch(false)
              }}
              autoComplete="new-password"
              error={confirmMismatch}
              helperText={confirmMismatch ? "Passwords don't match." : ' '}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
            >
              Create account
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default AuthPage
