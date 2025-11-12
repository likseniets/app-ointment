'use client';

import { useEffect, useState } from 'react';
import styles from "../page.module.css";
import { Button, TextField, Card, CardContent, Typography, Box, Chip, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { getUser } from '../../api/api';


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
});

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  duration: string;
}

export default function CaregiverPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { id: '1', date: '2025-11-11', startTime: '09:00', endTime: '17:00' },
    { id: '2', date: '2025-11-13', startTime: '10:00', endTime: '16:00' },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', clientName: 'John Doe', date: '2025-11-10', time: '10:00', duration: '1 hour' },
    { id: '2', clientName: 'Jane Smith', date: '2025-11-12', time: '14:00', duration: '30 min' },
  ]);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const [user, setUser] = useState<any>(null);

  const handleAddAvailability = () => {
    if (selectedDate && startTime && endTime) {
      const availability: Availability = {
        id: Date.now().toString(),
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
      };
      setAvailabilities([...availabilities, availability]);
      setSelectedDate(null);
      setStartTime(null);
      setEndTime(null);
    }
  };

  const handleDeleteAvailability = (id: string) => {
    setAvailabilities(availabilities.filter(a => a.id !== id));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUser(1);
      setUser(user);
      console.log(user);
    }
    fetchUserData();
    // Fetch availabilities and appointments from backend here
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.page}>
        <h1>Caregiver Dashboard</h1>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, maxWidth: '1400px', height: '60vh', margin: '0 auto', padding: 2 }}>
          
          {/* Left Side - Booked Appointments */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Booked Appointments
              </Typography>
              {appointments.length === 0 ? (
                <Typography color="text.secondary">No appointments booked yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, overflowY: 'auto' }}>
                {appointments.map((appointment) => (
                  <Box
                    key={appointment.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 2,
                      border: '1px solid #333',
                      borderRadius: 1,
                      backgroundColor: '#2a2a2a',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {appointment.clientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.date} at {appointment.time}
                      </Typography>
                      <Chip label={appointment.duration} size="small" sx={{ mt: 1 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Right Side - Availability Management */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
          {/* Add Availability Section */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Set Your Availability
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        onClick: (e) => {
                          e.currentTarget.querySelector('button')?.click();
                        }
                      } 
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TimePicker
                      label="Start Time"
                      value={startTime}
                      onChange={(newValue) => setStartTime(newValue)}
                      ampm={false}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          onClick: (e) => {
                            e.currentTarget.querySelector('button')?.click();
                          }
                        } 
                      }}
                    />
                    <TimePicker
                      label="End Time"
                      value={endTime}
                      onChange={(newValue) => setEndTime(newValue)}
                      ampm={false}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          onClick: (e) => {
                            e.currentTarget.querySelector('button')?.click();
                          }
                        } 
                      }}
                    />
                  </Box>
                  <Button variant="contained" onClick={handleAddAvailability}>
                    Add Availability
                  </Button>
                </Box>
              </LocalizationProvider>
            </CardContent>
          </Card>

          {/* Current Availabilities */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your Availabilities
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, overflowY: 'auto', height: '100%' }}>
                {user.availability && user.availability.length > 0 && user.availability.map((availability: any) => (
                  <Box
                    key={availability.availabilityId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 2,
                      border: '1px solid #333',
                      borderRadius: 1,
                      backgroundColor: '#2a2a2a',
                    }}
                  >
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {availability.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {availability.startTime} - {availability.endTime}
                    </Typography>
                  </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteAvailability(availability.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </div>
    </ThemeProvider>
  );
}
