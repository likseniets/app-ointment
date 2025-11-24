'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import EventIcon from '@mui/icons-material/Event'
import ScheduleIcon from '@mui/icons-material/Schedule'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
  },
})

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
    }
  }, [router])

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{ minHeight: '100vh', backgroundColor: 'background.default', p: 4 }}
      >
        <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => router.push('/admin/users')}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all users in the system
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => router.push('/admin/appointments')}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Appointments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all appointments
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => router.push('/admin/availabilities')}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ScheduleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Availabilities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage caregiver availability slots
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  )
}
