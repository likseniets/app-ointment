import { useEffect, useState } from 'react'
import {
  Appointment,
  AppointmentTask,
  Availability,
  PendingRequest,
} from '../../interfaces/interfaces'
import styles from './styles.module.css'
import {
  Card,
  CardContent,
  Typography,
  Collapse,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
  Divider,
  Button,
} from '@mui/material'
import dayjs from 'dayjs'
import {
  approveChangeRequest,
  createPendingRequest,
  getAvailabilityByCaregiver,
  rejectChangeRequest,
  cancelChangeRequest,
  deleteAppointment,
} from '@/api/api'

interface CollapseCardProps {
  appointment: Appointment
  pendingRequest?: PendingRequest
  isPending?: PendingRequest
  onUpdate: () => void
}

export default function CollapseCard({
  appointment,
  pendingRequest,
  isPending,
  onUpdate,
}: CollapseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [task, setTask] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (expanded) {
      getAvailabilities()
    }
  }, [expanded])

  const handleTaskChange = (event: SelectChangeEvent) => {
    setTask(event.target.value)
  }

  const handleTimeChange = (event: SelectChangeEvent) => {
    setTime(event.target.value)
  }

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  const getAvailabilities = async () => {
    const response = await getAvailabilityByCaregiver(
      appointment.caregiver.userId
    )
    setAvailabilities(response)
  }

  const approveRequest = async (requestId: number) => {
    await approveChangeRequest(requestId)
    onUpdate()
  }

  const rejectRequest = async (requestId: number) => {
    await rejectChangeRequest(requestId)
    onUpdate()
  }

  const cancelRequest = async (requestId: number) => {
    await cancelChangeRequest(requestId)
    onUpdate()
  }

  const deleteAppointmentHandler = async (appointmentId: number) => {
    await deleteAppointment(appointmentId)
    onUpdate()
  }

  const SubmitChange = async () => {
    try {
      await createPendingRequest({
        appointmentId: appointment.appointmentId,
        newAvailabilityId: time,
        newTask: task,
      })
      onUpdate()
    } catch (error) {
      console.error('Error submitting change request:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to submit change request. Please try again.'
      )
    }
  }

  return (
    <Card
      key={appointment.appointmentId}
      sx={{ marginBottom: 2, overflow: 'visible' }}
    >
      <CardContent>
        <div className={styles.appointmentCardContainer}>
          <div>
            <Typography variant="h6">{appointment.task}</Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs(appointment.date).format('MMMM D, YYYY h:mm A')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Caregiver: {appointment.caregiver.name}
            </Typography>
          </div>
          <div className={styles.appointmentCardContainerRight}>
            {pendingRequest && (
              <Typography color="green" sx={{ marginBottom: 1 }}>
                Change Awaiting Approval
              </Typography>
            )}
            {isPending && (
              <Typography color="orange" sx={{ marginBottom: 1 }}>
                Change Requested
              </Typography>
            )}
            <Button variant="outlined" size="small" onClick={handleExpandClick}>
              {expanded
                ? 'Cancel'
                : pendingRequest
                ? 'View Requested Change'
                : 'Request Change'}
            </Button>
          </div>
        </div>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {pendingRequest ? (
            <>
              <Typography variant="h6" gutterBottom>
                Requested Change
              </Typography>
              {pendingRequest.newTask && (
                <Typography>
                  <strong>New Task:</strong> {pendingRequest.newTask}
                </Typography>
              )}
              {pendingRequest.newDateTime && (
                <Typography>
                  <strong>New Date/Time:</strong>{' '}
                  {dayjs(pendingRequest.newDateTime).format(
                    'MMMM D, YYYY h:mm A'
                  )}
                </Typography>
              )}
              <Divider sx={{ marginY: 2 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={() => cancelRequest(pendingRequest.changeRequestId)}
              >
                Cancel Request
              </Button>
            </>
          ) : isPending ? (
            <>
              <Typography variant="h5" gutterBottom>
                Requested Change:
              </Typography>
              {isPending.newTask && (
                <Typography>
                  <strong>New Task:</strong> {isPending.newTask}
                </Typography>
              )}
              {isPending.newDateTime && (
                <Typography>
                  <strong>New Date/Time:</strong>{' '}
                  {dayjs(isPending.newDateTime).format('MMMM D, YYYY h:mm A')}
                </Typography>
              )}
              <Divider sx={{ marginY: 2 }} />
              <Button
                variant="contained"
                color="error"
                onClick={() => rejectRequest(isPending.changeRequestId)}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                sx={{ marginLeft: 2 }}
                onClick={() => approveRequest(isPending.changeRequestId)}
              >
                Accept
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ marginBottom: 2 }}>Request Change:</Typography>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Appointment Task
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={task}
                  label="Appointment Task"
                  onChange={handleTaskChange}
                >
                  <MenuItem value={AppointmentTask.AssistanceWithDailyLiving}>
                    Assistance With Daily Living
                  </MenuItem>
                  <MenuItem value={AppointmentTask.MedicationReminders}>
                    Medication Reminders
                  </MenuItem>
                  <MenuItem value={AppointmentTask.Shopping}>Shopping</MenuItem>
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
                  <MenuItem value={AppointmentTask.PhysicalTherapyAssistance}>
                    Physical Therapy Assistance
                  </MenuItem>
                  <MenuItem value={AppointmentTask.MedicalAppointmentSupport}>
                    Medical Appointment Support
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: 2 }}>
                <InputLabel id="demo-simple-select-label">
                  Change Time
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={time}
                  label="Change Time"
                  onChange={handleTimeChange}
                >
                  {availabilities &&
                    availabilities.length > 0 &&
                    availabilities.map((availability) => (
                      <MenuItem
                        key={availability.availabilityId}
                        value={availability.availabilityId}
                      >
                        {dayjs(availability.date).format('MMMM D, YYYY')} at{' '}
                        {availability.startTime} - {availability.endTime}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Divider sx={{ marginY: 2 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={SubmitChange}
              >
                Submit Change Request
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteAppointmentHandler(appointment.appointmentId)}
            sx={{ float: 'right' }}
          >
            Delete Appointment
          </Button>
        </CardContent>
      </Collapse>
    </Card>
  )
}
