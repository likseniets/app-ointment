'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import {
  getAppointments,
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getRequestedRequests,
  getPendingRequests,
} from '../../api/api'
import {
  Appointment,
  Availability,
  Caregiver,
  CreateAvailabilityDTO,
  PendingRequest,
  UpdateAvailabilityResponse,
  UserRole,
} from '../../interfaces/interfaces'
import { CollapseCard, ProtectedRoute } from '@/components/index'
import GlobalStyle from '../globalStyle.module.css'
import styles from './styles.module.css'

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

interface MergedAppointment {
  appointment: Appointment
  pendingRequest: PendingRequest | undefined
  isPending: PendingRequest | undefined
}

export default function CaregiverPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [appointments, setAppointments] = useState<MergedAppointment[]>([])
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null)

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [startTime, setStartTime] = useState<Dayjs | null>(null)
  const [endTime, setEndTime] = useState<Dayjs | null>(null)

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null)
  const [editDate, setEditDate] = useState<Dayjs | null>(null)
  const [editStartTime, setEditStartTime] = useState<Dayjs | null>(null)
  const [editEndTime, setEditEndTime] = useState<Dayjs | null>(null)

  useEffect(() => {
    // Get caregiver data from localStorage
    const userStr =
      typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (userStr) {
      setCaregiver(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
    fetchAvailabilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caregiver])

  const fetchAvailabilities = async () => {
    try {
      const availabilitiesData = await getAvailabilities()
      setAvailabilities(availabilitiesData)
    } catch (error) {
      console.error('Error fetching availabilities:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const appointmentsData = await getAppointments()
      const requestedRequestsData = await getRequestedRequests()
      const pendingRequestsData = await getPendingRequests()

      const mergedAppointments: MergedAppointment[] = appointmentsData.map(
        (appointment: Appointment) => {
          const matchingRequest = requestedRequestsData.find(
            (req: PendingRequest) =>
              req.appointmentId === appointment.appointmentId
          )
          const isPending = pendingRequestsData.find(
            (req: PendingRequest) =>
              req.appointmentId === appointment.appointmentId
          )
          return {
            appointment: appointment,
            pendingRequest: matchingRequest || null,
            isPending: isPending || null,
          }
        }
      )
      setAppointments(mergedAppointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const handleAddAvailability = async () => {
    try {
      if (selectedDate && startTime && endTime) {
        const availability: CreateAvailabilityDTO = {
          date: selectedDate.format('YYYY-MM-DD'),
          startTime: startTime.format('HH:mm'),
          endTime: endTime.format('HH:mm'),
          caregiverId: caregiver ? caregiver.userId : 0,
        }
        const response: UpdateAvailabilityResponse = await createAvailability(
          availability
        )
        setAvailabilities(response.availabilities)
        setSelectedDate(null)
        setStartTime(null)
        setEndTime(null)
      }
    } catch (error) {
      console.error('Error adding availability:', error)
    }
  }

  const handleDeleteAvailability = async (id: number) => {
    const updatedAvailabilities: UpdateAvailabilityResponse =
      await deleteAvailability(id)
    setAvailabilities(updatedAvailabilities.availabilities)
  }

  const handleOpenEditDialog = (availability: Availability) => {
    setEditingAvailability(availability)
    setEditDate(dayjs(availability.date))
    setEditStartTime(dayjs(`2000-01-01 ${availability.startTime}`))
    setEditEndTime(dayjs(`2000-01-01 ${availability.endTime}`))
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setEditingAvailability(null)
    setEditDate(null)
    setEditStartTime(null)
    setEditEndTime(null)
  }

  const handleUpdateAvailability = async () => {
    try {
      if (editingAvailability && editDate && editStartTime && editEndTime) {
        const updatedData = {
          date: editDate.format('YYYY-MM-DD'),
          startTime: editStartTime.format('HH:mm'),
          endTime: editEndTime.format('HH:mm'),
          caregiverId: caregiver ? caregiver.userId : 0,
        }
        await updateAvailability(
          editingAvailability.availabilityId!,
          updatedData
        )
        await fetchAvailabilities()
        handleCloseEditDialog()
      }
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.Caregiver]}>
      <ThemeProvider theme={darkTheme}>
        <div className={GlobalStyle.page}>
          <div className={GlobalStyle.pageContent}>
            <div className={styles.pageContainer}>
              <div className={styles.pageContainerLeft}>
                <h1>Caregiver Dashboard</h1>
                <Typography variant="h5" gutterBottom>
                  Booked Appointments
                </Typography>
                <div className={styles.appointmentList}>
                  {appointments.length === 0 ? (
                    <Typography color="text.secondary">
                      No appointments booked yet.
                    </Typography>
                  ) : (
                    <>
                      {appointments.map((appointment) => (
                        <CollapseCard
                          key={appointment.appointment.appointmentId}
                          appointment={appointment.appointment}
                          pendingRequest={appointment.pendingRequest}
                          isPending={appointment.isPending}
                          onUpdate={() => fetchAppointments()}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className={styles.pageContainerRight}>
                {/* Add Availability Section */}
                <div>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Set Your Availability
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            mt: 2,
                          }}
                        >
                          <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                onClick: (e) => {
                                  e.currentTarget
                                    .querySelector('button')
                                    ?.click()
                                },
                              },
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TimePicker
                              label="Start Time"
                              value={startTime}
                              onChange={(newValue) => setStartTime(newValue)}
                              ampm={false}
                              views={['hours']}
                              format="HH:00"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  onClick: (e) => {
                                    e.currentTarget
                                      .querySelector('button')
                                      ?.click()
                                  },
                                },
                              }}
                            />
                            <TimePicker
                              label="End Time"
                              value={endTime}
                              onChange={(newValue) => setEndTime(newValue)}
                              ampm={false}
                              views={['hours']}
                              format="HH:00"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  onClick: (e) => {
                                    e.currentTarget
                                      .querySelector('button')
                                      ?.click()
                                  },
                                },
                              }}
                            />
                          </Box>
                          <Button
                            variant="contained"
                            onClick={handleAddAvailability}
                            disabled={!selectedDate || !startTime || !endTime}
                          >
                            Add Availability
                          </Button>
                        </Box>
                      </LocalizationProvider>
                    </CardContent>
                  </Card>
                </div>
                {/* Current Availabilities */}
                <div className={styles.availabilitySection}>
                  <Typography variant="h5" gutterBottom>
                    Your Availabilities
                  </Typography>
                  <div className={styles.availabilityList}>
                    {availabilities &&
                      availabilities.length > 0 &&
                      availabilities.map((availability: Availability) => (
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
                              {dayjs(availability.date).format('DD.MM.YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {availability.startTime} - {availability.endTime}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenEditDialog(availability)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleDeleteAvailability(
                                  availability.availabilityId!
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Availability Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Availability</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mt: 2,
                }}
              >
                <DatePicker
                  label="Select Date"
                  value={editDate}
                  onChange={(newValue) => setEditDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onClick: (e) => {
                        e.currentTarget.querySelector('button')?.click()
                      },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TimePicker
                    label="Start Time"
                    value={editStartTime}
                    onChange={(newValue) => setEditStartTime(newValue)}
                    ampm={false}
                    views={['hours']}
                    format="HH:00"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        onClick: (e) => {
                          e.currentTarget.querySelector('button')?.click()
                        },
                      },
                    }}
                  />
                  <TimePicker
                    label="End Time"
                    value={editEndTime}
                    onChange={(newValue) => setEditEndTime(newValue)}
                    ampm={false}
                    views={['hours']}
                    format="HH:00"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        onClick: (e) => {
                          e.currentTarget.querySelector('button')?.click()
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateAvailability}
              variant="contained"
              disabled={!editDate || !editStartTime || !editEndTime}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </ProtectedRoute>
  )
}
