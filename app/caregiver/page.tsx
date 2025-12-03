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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
  DateCalendar,
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
  const [slotLength, setSlotLength] = useState<number>(60)

  const [calendarDate, setCalendarDate] = useState<Dayjs | null>(null)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [openError, setOpenError] = useState(false)

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null)
  const [editDate, setEditDate] = useState<Dayjs | null>(null)
  const [editStartTime, setEditStartTime] = useState<Dayjs | null>(null)
  const [editEndTime, setEditEndTime] = useState<Dayjs | null>(null)
  const [editSlotLength, setEditSlotLength] = useState<number>(60)

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

      // Merge appointments with their associated change requests for display
      // pendingRequest: change requests initiated by this caregiver
      // isPending: change requests initiated by clients for this caregiver's appointments
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
          date: selectedDate.format('YYYY-MM-DDTHH:mm:ss'),
          startTime: startTime.format('HH:mm'),
          endTime: endTime.format('HH:mm'),
          caregiverId: caregiver ? caregiver.userId : 0,
          slotLengthMinutes: slotLength,
        }
        const response: UpdateAvailabilityResponse = await createAvailability(
          availability
        )
        setAvailabilities(response.availabilities)
        setSelectedDate(null)
        setStartTime(null)
        setEndTime(null)
        setSlotLength(60)
      }
    } catch (error: any) {
      console.error('Error adding availability:', error)
      // Display backend error messages (e.g., "No new slots created (may already exist)")
      if (error.message) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Failed to create availability')
      }
      setOpenError(true)
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
    setEditSlotLength(60) // Default to 60 minutes for editing
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setEditingAvailability(null)
    setEditDate(null)
    setEditStartTime(null)
    setEditEndTime(null)
    setEditSlotLength(60)
  }

  const handleUpdateAvailability = async () => {
    try {
      if (editingAvailability && editDate && editStartTime && editEndTime) {
        const updatedData = {
          date: editDate.format('YYYY-MM-DDTHH:mm:ss'),
          startTime: editStartTime.format('HH:mm'),
          endTime: editEndTime.format('HH:mm'),
          caregiverId: caregiver ? caregiver.userId : 0,
          slotLengthMinutes: editSlotLength,
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
                              views={['hours', 'minutes']}
                              format="HH:mm"
                              minutesStep={15}
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
                              views={['hours', 'minutes']}
                              format="HH:mm"
                              minutesStep={15}
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
                          <FormControl fullWidth>
                            <InputLabel>Time Slot Length</InputLabel>
                            <Select
                              value={slotLength}
                              onChange={(e) =>
                                setSlotLength(Number(e.target.value))
                              }
                              label="Time Slot Length"
                            >
                              <MenuItem value={30}>30 minutes</MenuItem>
                              <MenuItem value={60}>60 minutes</MenuItem>
                              <MenuItem value={90}>90 minutes</MenuItem>
                              <MenuItem value={120}>120 minutes</MenuItem>
                            </Select>
                          </FormControl>
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
                {/* Calendar View */}
                <div className={styles.availabilitySection}>
                  <Typography variant="h5" gutterBottom>
                    Your Availabilities
                  </Typography>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Calendar on the left */}
                        <Box sx={{ flex: '0 0 auto' }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateCalendar
                              value={calendarDate}
                              onChange={(newValue) => setCalendarDate(newValue)}
                              sx={{
                                maxWidth: '100%',
                                '& .MuiPickersCalendarHeader-root': {
                                  paddingLeft: 2,
                                  paddingRight: 1,
                                },
                                '& .MuiDayCalendar-header': {
                                  justifyContent: 'space-between',
                                  paddingLeft: 1,
                                  paddingRight: 1,
                                },
                                '& .MuiDayCalendar-weekContainer': {
                                  justifyContent: 'space-between',
                                  margin: 0,
                                },
                                '& .MuiPickersDay-root': {
                                  fontSize: '0.875rem',
                                  margin: 0.25,
                                },
                                '& .MuiDayCalendar-monthContainer': {
                                  position: 'relative',
                                },
                                '& .MuiPickersSlideTransition-root': {
                                  minHeight: 240,
                                },
                              }}
                              showDaysOutsideCurrentMonth
                              shouldDisableDate={(date) => {
                                // Disable dates that don't have any availability slots
                                const dateStr = date.format('YYYY-MM-DD')
                                return !availabilities.some(
                                  (av) =>
                                    dayjs(av.date).format('YYYY-MM-DD') ===
                                    dateStr
                                )
                              }}
                            />
                          </LocalizationProvider>
                        </Box>

                        {/* Time Slots on the right */}
                        {calendarDate && (
                          <Box
                            sx={{
                              flex: 1,
                              borderLeft: '1px solid #333',
                              paddingLeft: 2,
                            }}
                          >
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ mb: 2 }}
                            >
                              Time Slots for {calendarDate.format('DD.MM.YYYY')}
                            </Typography>
                            <Box
                              sx={{
                                maxHeight: 320,
                                overflowY: 'auto',
                                pr: 1,
                                // Custom scrollbar styling for dark theme
                                '&::-webkit-scrollbar': {
                                  width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  backgroundColor: '#1a1a1a',
                                  borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  backgroundColor: '#555',
                                  borderRadius: '4px',
                                  '&:hover': {
                                    backgroundColor: '#777',
                                  },
                                },
                              }}
                            >
                              {availabilities
                                .filter(
                                  (av) =>
                                    dayjs(av.date).format('YYYY-MM-DD') ===
                                    calendarDate.format('YYYY-MM-DD')
                                )
                                .map((availability: Availability) => (
                                  <Box
                                    key={availability.availabilityId}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: 1,
                                      border: '1px solid #333',
                                      borderRadius: 1,
                                      backgroundColor: '#2a2a2a',
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                    >
                                      {availability.startTime} -{' '}
                                      {availability.endTime}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() =>
                                          handleOpenEditDialog(availability)
                                        }
                                        sx={{ padding: 0.5 }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() =>
                                          handleDeleteAvailability(
                                            availability.availabilityId!
                                          )
                                        }
                                        sx={{ padding: 0.5 }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
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
                    views={['hours', 'minutes']}
                    format="HH:mm"
                    minutesStep={15}
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
                    views={['hours', 'minutes']}
                    format="HH:mm"
                    minutesStep={15}
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
                <FormControl fullWidth>
                  <InputLabel>Time Slot Length</InputLabel>
                  <Select
                    value={editSlotLength}
                    onChange={(e) => setEditSlotLength(Number(e.target.value))}
                    label="Time Slot Length"
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>60 minutes</MenuItem>
                    <MenuItem value={90}>90 minutes</MenuItem>
                    <MenuItem value={120}>120 minutes</MenuItem>
                  </Select>
                </FormControl>
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

        {/* Error Snackbar */}
        <Snackbar
          open={openError}
          autoHideDuration={6000}
          onClose={() => setOpenError(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setOpenError(false)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ProtectedRoute>
  )
}
