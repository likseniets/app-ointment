'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "../page.module.css";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);


    // skal byttes ut med riktig autentisering hvor vi får tilbake brukerrolle
    if (email === 'client@example.com' && password === 'clientpassword') {
      router.push('/client');
    } else if (email === 'caregiver@example.com' && password === 'caregiverpassword') {
      router.push('/caregiver');
    } else {
      setError('Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin} style={{ marginTop: '2rem', maxWidth: '400px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
