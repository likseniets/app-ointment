'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./styles.module.css";
import {TextField, Button} from '@mui/material';
import { login } from '@/api/api';

const textFieldSx = {
  '& .MuiInput-underline:before': { borderBottomColor: '#1976d2' },
  '& .MuiInput-underline:after': { borderBottomColor: '#1976d2' },
  '& .MuiInputLabel-root': { color: '#1976d2' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
  '& .MuiInputBase-input': { color: 'white' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: string, p: string) => {
    setError('');
    setLoading(true);
    // skal byttes ut med riktig autentisering hvor vi får tilbake brukerrolle
   try {
    const user = await login(e, p);
    localStorage.setItem('user', JSON.stringify(user));
    console.log(user);
    if (user && user.role) {
      if (user.role === 1) {
        router.push('/caregiver');
      } else if (user.role === 2) {
        router.push('/client');
      }
    }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <h1>Login Page</h1>
        <div className={styles.inputContainer}>
          <TextField
          required
          id="email-input"
          label="Email"
          type="email"
          defaultValue="Email"
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <Button
            variant='contained'
            disabled={loading}
            onClick={() => handleLogin(email, password)}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
        
    </div>
  );
}
