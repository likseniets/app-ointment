/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import {
  getAppointments,
  getPendingRequests,
  getRequestedRequests,
  getCaregivers,
  createAppointment,
} from '@/api/api'
import {
  Appointment,
  UserRole,
  PendingRequest,
  User,
  Availability,
  Caregiver,
  AppointmentTask,
} from '../../interfaces/interfaces'
import styles from './styles.module.css'
import GlobalStyles from '../globalStyle.module.css'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Alert,
  Chip,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
  Divider,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { CollapseCard, ProtectedRoute } from '@/components/index'
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

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

export default function ClientPage() {
  const [appointments, setAppointments] = useState<MergedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<User | null>(null)
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(
    null
  )
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [availabilitiesForDate, setAvailabilitiesForDate] = useState<
    Availability[]
  >([])
  const [selectedAvailability, setSelectedAvailability] =
    useState<Availability | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [appointmentTask, setAppointmentTask] = useState<string>('')

  useEffect(() => {
    // Get client data from localStorage
    const userStr =
      typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (userStr) {
      setClient(JSON.parse(userStr))
    }
  }, [])

  useEffect(() => {
    if (client) {
      fetchAppointments()
      fetchCaregivers()
    }
  }, [client])

  useEffect(() => {
    if (selectedDate && selectedCaregiver) {
      filterAvailabilitiesForDate(selectedDate)
    } else if (selectedDate && selectedCaregiver === null) {
      // selectedCaregiver === null represents "Any Caregiver" option
      // Show all availabilities from all caregivers for the selected date
      filterAllAvailabilitiesForDate(selectedDate)
    } else {
      setAvailabilitiesForDate([])
      setSelectedAvailability(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedCaregiver])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const appointmentsData = await getAppointments()
      const requestedRequestsData = await getRequestedRequests()
      const pendingRequestsData = await getPendingRequests()

      // Merge appointments with their associated change requests
      // pendingRequest: change requests initiated by this client
      // isPending: change requests initiated by caregivers for this client's appointments
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
    } finally {
      setLoading(false)
    }
  }

  const fetchCaregivers = async () => {
    try {
      setLoading(true)
      const caregiversData = await getCaregivers()
      setCaregivers(caregiversData)
      console.log('Caregivers data:', caregiversData)
    } catch (error) {
      console.error('Error fetching caregivers:', error)
      setMessage('Failed to load caregivers')
    } finally {
      setLoading(false)
    }
  }

  const filterAvailabilitiesForDate = (date: Dayjs) => {
    if (!selectedCaregiver?.availability) {
      setAvailabilitiesForDate([])
      return
    }

    const dateStr = date.format('YYYY-MM-DD')
    const filtered = selectedCaregiver.availability.filter((avail) =>
      avail.date.startsWith(dateStr)
    )
    setAvailabilitiesForDate(filtered)
  }

  const filterAllAvailabilitiesForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const allAvailabilities: Availability[] = []

    // Aggregate availabilities from all caregivers for the selected date
    caregivers.forEach((caregiver) => {
      if (caregiver.availability) {
        const filtered = caregiver.availability.filter((avail) =>
          avail.date.startsWith(dateStr)
        )
        allAvailabilities.push(...filtered)
      }
    })

    setAvailabilitiesForDate(allAvailabilities)
  }

  const getDatesWithAvailability = (): string[] => {
    if (selectedCaregiver === null) {
      // "Any Caregiver" selected - aggregate all available dates from all caregivers
      const allDates = new Set<string>()
      caregivers.forEach((caregiver) => {
        if (caregiver.availability) {
          caregiver.availability.forEach((avail) => {
            allDates.add(dayjs(avail.date).format('YYYY-MM-DD'))
          })
        }
      })
      return Array.from(allDates)
    }

    if (!selectedCaregiver?.availability) return []

    return selectedCaregiver.availability.map((avail) =>
      dayjs(avail.date).format('YYYY-MM-DD')
    )
  }

  const shouldDisableDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const availableDates = getDatesWithAvailability()
    return !availableDates.includes(dateStr)
  }

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (client === null) {
      setMessage('Client information is missing.')
      return
    }
    if (!selectedAvailability) {
      setMessage('Please select a time slot')
      return
    }
    if (selectedAvailability.availabilityId === undefined) {
      setMessage('Selected availability is invalid.')
      return
    }
    try {
      setSubmitting(true)
      setMessage('')

      const appointmentData = {
        availabilityId: selectedAvailability.availabilityId,
        clientId: client.userId,
        task: appointmentTask,
      }

      await createAppointment(appointmentData)
      setMessage('Appointment booked successfully!')
      fetchAppointments()
      setSelectedDate(null)
      setSelectedAvailability(null)
      setAppointmentTask('')
      setSubmitting(false)
    } catch (error) {
      console.error('Error creating appointment:', error)
      setMessage('Failed to book appointment. Please try again.')
      setSubmitting(false)
    }
  }

  const formatTimeSlot = (availability: Availability) => {
    return `${availability.startTime} - ${availability.endTime}`
  }

  const handleTaskChange = (event: SelectChangeEvent) => {
    setAppointmentTask(event.target.value)
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.Client]}>
      <ThemeProvider theme={darkTheme}>
        <div className={GlobalStyles.page}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <div className={GlobalStyles.pageContent}>
              <h1>Welcome {client?.name}</h1>
              <div className={styles.pageContainer}>
                <div className={styles.createAppointmentSection}>
                  <div className={styles.createAppointmentSectionLeft}>
                    <h2>Book New Appointment</h2>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      {/* Step 1: Select Caregiver */}
                      <Card sx={{ width: '100%', marginTop: 2 }}>
                        <div className={styles.caregiverSelection}>
                          <div
                            className={`${styles.caregiverCard} ${
                              selectedCaregiver === null ? styles.selected : ''
                            }`}
                            onClick={() => {
                              setSelectedCaregiver(null)
                              setSelectedDate(null)
                              setSelectedAvailability(null)
                            }}
                          >
                            <img
                              className={styles.caregiverImage}
                              src="/images/DefaultCaretaker.jpg"
                              alt="Default Caretaker"
                            />
                            <Typography variant="body2" color="text.secondary">
                              Any Caregiver
                            </Typography>
                          </div>
                          {caregivers &&
                            caregivers.length !== 0 &&
                            caregivers.map((caregiver) => (
                              <div
                                className={`${styles.caregiverCard} ${
                                  selectedCaregiver?.caregiverId ===
                                  caregiver.caregiverId
                                    ? styles.selected
                                    : ''
                                }`}
                                onClick={() => {
                                  setSelectedCaregiver(caregiver)
                                  setSelectedDate(null)
                                  setSelectedAvailability(null)
                                }}
                                key={caregiver.userId}
                              >
                                <img
                                  className={styles.caregiverImage}
                                  src={
                                    caregiver.imageUrl ||
                                    '/images/DefaultCaretaker.jpg'
                                  }
                                  alt={caregiver.name}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {caregiver.name}
                                </Typography>
                              </div>
                            ))}
                        </div>
                      </Card>
                      {/* Step 2: Select Date from Calendar */}
                      {(selectedCaregiver || selectedCaregiver === null) && (
                        <Card sx={{ width: '100%' }}>
                          <CardContent>
                            <h2>Step 2: Select a Date</h2>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              Only dates with available time slots are
                              selectable
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DateCalendar
                                value={selectedDate}
                                onChange={(newValue) => {
                                  setSelectedDate(newValue)
                                  setSelectedAvailability(null)
                                }}
                                shouldDisableDate={shouldDisableDate}
                                sx={{
                                  width: '500px',
                                  height: 'auto',
                                  margin: '0 auto',
                                  maxHeight: 'none',
                                  '& .MuiPickersSlideTransition-root': {
                                    height: '330px',
                                  },
                                  '& .MuiPickersDay-root': {
                                    fontSize: '1.2rem',
                                    width: '48px',
                                    height: '48px',
                                    '&.Mui-disabled': {
                                      color: '#666',
                                    },
                                  },
                                  '& .MuiDayCalendar-header': {
                                    '& .MuiTypography-root': {
                                      fontSize: '1.1rem',
                                      width: '48px',
                                    },
                                  },
                                  '& .MuiPickersCalendarHeader-label': {
                                    fontSize: '1.3rem',
                                  },
                                }}
                              />
                            </LocalizationProvider>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  </div>
                  <div className={styles.createAppointmentSectionRight}>
                    <h2>Select a Time Slot</h2>
                    {/* Step 3: Select Time Slot */}
                    <Card sx={{ width: '100%', marginTop: 2 }}>
                      <CardContent>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {selectedDate
                            ? `Available times for ${selectedDate.format(
                                'MMMM D, YYYY'
                              )}` + `${selectedDate.format('MMMM D, YYYY')}`
                            : 'Please select a date to see available time slots.'}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {availabilitiesForDate &&
                            availabilitiesForDate.length > 0 &&
                            availabilitiesForDate.map((availability) => (
                              <Chip
                                key={availability.availabilityId}
                                label={formatTimeSlot(availability)}
                                onClick={() =>
                                  setSelectedAvailability(availability)
                                }
                                color={
                                  selectedAvailability?.availabilityId ===
                                  availability.availabilityId
                                    ? 'primary'
                                    : 'default'
                                }
                                sx={{
                                  fontSize: '1rem',
                                  padding: '20px 10px',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor:
                                      selectedAvailability?.availabilityId ===
                                      availability.availabilityId
                                        ? undefined
                                        : '#333',
                                  },
                                }}
                              />
                            ))}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Step 4: Appointment Details */}
                    <Card sx={{ width: '100%', marginTop: 2 }}>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          Step 4: Appointment Details
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            mt: 2,
                          }}
                        >
                          <Box
                            sx={{
                              padding: 2,
                              border: '1px solid #333',
                              borderRadius: 1,
                              backgroundColor: '#2a2a2a',
                            }}
                          >
                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              gutterBottom
                            >
                              Selected Appointment
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Caregiver:{' '}
                              {selectedCaregiver?.name ||
                                'Any Available Caregiver'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Date:{' '}
                              {selectedDate?.format('dddd, MMMM D, YYYY') ||
                                'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Time: {selectedAvailability?.startTime || 'N/A'} -{' '}
                              {selectedAvailability?.endTime || 'N/A'}
                            </Typography>
                          </Box>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Appointment Task
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={appointmentTask}
                              label="Appointment Task"
                              onChange={handleTaskChange}
                            >
                              <MenuItem
                                value={
                                  AppointmentTask.AssistanceWithDailyLiving
                                }
                              >
                                Assistance With Daily Living
                              </MenuItem>
                              <MenuItem
                                value={AppointmentTask.MedicationReminders}
                              >
                                Medication Reminders
                              </MenuItem>
                              <MenuItem value={AppointmentTask.Shopping}>
                                Shopping
                              </MenuItem>
                              <MenuItem value={AppointmentTask.HouseholdChores}>
                                Household Chores
                              </MenuItem>
                              <MenuItem value={AppointmentTask.PersonalHygiene}>
                                Personal Hygiene
                              </MenuItem>
                              <MenuItem value={AppointmentTask.MealPreparation}>
                                Meal Preparation
                              </MenuItem>
                              <MenuItem value={AppointmentTask.Transportation}>
                                Transportation
                              </MenuItem>
                              <MenuItem value={AppointmentTask.Companionship}>
                                Companionship
                              </MenuItem>
                              <MenuItem
                                value={
                                  AppointmentTask.PhysicalTherapyAssistance
                                }
                              >
                                Physical Therapy Assistance
                              </MenuItem>
                              <MenuItem
                                value={
                                  AppointmentTask.MedicalAppointmentSupport
                                }
                              >
                                Medical Appointment Support
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <Divider />
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                              type="button"
                              variant="contained"
                              onClick={handleBookAppointment}
                              disabled={
                                submitting ||
                                !appointmentTask ||
                                !selectedAvailability
                              }
                              fullWidth
                            >
                              {submitting ? 'Booking...' : 'Book Appointment'}
                            </Button>
                          </Box>

                          {message && (
                            <Alert
                              severity={
                                message.includes('success')
                                  ? 'success'
                                  : 'error'
                              }
                            >
                              {message}
                            </Alert>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className={styles.appointmentSection}>
                  <h2>Your Appointments</h2>
                  <div className={styles.appointmentList}>
                    {appointments.length === 0 ? (
                      <p>No appointments scheduled.</p>
                    ) : (
                      appointments.map((appointment) => (
                        <CollapseCard
                          key={appointment.appointment.appointmentId}
                          appointment={appointment.appointment}
                          pendingRequest={appointment.pendingRequest}
                          isPending={appointment.isPending}
                          onUpdate={() => fetchAppointments()}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  )
}
