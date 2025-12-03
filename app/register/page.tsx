'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../login/styles.module.css'
import GlobalStyles from '../globalStyle.module.css'
import { TextField, Button, Alert, Snackbar } from '@mui/material'
import { registerClient } from '@/api/api'
import Link from 'next/link'

const textFieldSx = {
  '& .MuiInput-underline:before': { borderBottomColor: '#1976d2' },
  '& .MuiInput-underline:after': { borderBottomColor: '#1976d2' },
  '& .MuiInputLabel-root': { color: '#1976d2' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
  '& .MuiInputBase-input': { color: 'white' },
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    setError('')

    // Validation
    if (!name || !email || !password || !phone || !address) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const userData = {
        name,
        role: 1, // Client role
        adress: address,
        phone,
        email,
        password,
        imageUrl: '',
      }

      await registerClient(userData)
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={GlobalStyles.page}>
      <h1>Register</h1>
      <div className={styles.inputContainer}>
        <TextField
          required
          id="name-input"
          label="Full Name"
          type="text"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={textFieldSx}
        />
        <TextField
          required
          id="email-input"
          label="Email"
          type="email"
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={textFieldSx}
        />
        <TextField
          required
          id="phone-input"
          label="Phone"
          type="tel"
          variant="standard"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={textFieldSx}
        />
        <TextField
          required
          id="address-input"
          label="Address"
          type="text"
          variant="standard"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={textFieldSx}
        />
        <TextField
          required
          id="password-input"
          label="Password"
          type="password"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={textFieldSx}
        />
        <TextField
          required
          id="confirm-password-input"
          label="Confirm Password"
          type="password"
          variant="standard"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={textFieldSx}
        />
        {error && (
          <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>
        )}

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleRegister}
          sx={{ marginTop: '1rem' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <div style={{ marginTop: '1rem', color: '#1976d2' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: '#1976d2', textDecoration: 'underline' }}
          >
            Login here
          </Link>
        </div>
      </div>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </div>
  )
}
