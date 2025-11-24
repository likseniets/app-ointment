'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getCaregivers,
  getAllUsers,
} from '@/api/api'
import { Appointment, User, Caregiver } from '@/interfaces/interfaces'
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import dayjs from 'dayjs'

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

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)
  const [message, setMessage] = useState('')
  const [filterCaregiverId, setFilterCaregiverId] = useState<number>(0)
  const [filterClientId, setFilterClientId] = useState<number>(0)
  const [formData, setFormData] = useState({
    caregiverId: 0,
    clientId: 0,
    date: '',
    location: '',
    task: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appointmentsData, caregiversData, usersData] = await Promise.all([
        getAppointments(),
        getCaregivers(),
        getAllUsers(),
      ])
      setAppointments(appointmentsData)
      setCaregivers(caregiversData)
      setClients(usersData.filter((u: User) => u.role === 1)) // UserRole.Client = 1
      console.log('Caregivers:', caregiversData)
      console.log('Appointments:', appointmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment)
      setFormData({
        caregiverId: appointment.caregiverId,
        clientId: appointment.clientId,
        date: appointment.date,
        location: appointment.location,
        task: appointment.task,
      })
    } else {
      setEditingAppointment(null)
      setFormData({
        caregiverId: 0,
        clientId: 0,
        date: '',
        location: '',
        task: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingAppointment(null)
    setMessage('')
  }

  const handleSubmit = async () => {
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.appointmentId, formData)
        setMessage('Appointment updated successfully')
      } else {
        await createAppointment({
          availabilityId: 0, // This would need to be selected properly
          clientId: formData.clientId,
          task: formData.task,
        })
        setMessage('Appointment created successfully')
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving appointment:', error)
      setMessage('Failed to save appointment')
    }
  }

  const handleDelete = async (appointmentId: number) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment(appointmentId)
        setMessage('Appointment deleted successfully')
        fetchData()
      } catch (error) {
        console.error('Error deleting appointment:', error)
        setMessage('Failed to delete appointment')
      }
    }
  }

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{ minHeight: '100vh', backgroundColor: 'background.default', p: 4 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin')}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Appointment Management
          </Typography>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Add New Appointment
          </Button>
        </Box>

        {message && (
          <Alert
            severity={message.includes('success') ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filter by Caregiver</InputLabel>
            <Select
              value={filterCaregiverId}
              onChange={(e) => setFilterCaregiverId(Number(e.target.value))}
              label="Filter by Caregiver"
            >
              <MenuItem value={0}>All Caregivers</MenuItem>
              {caregivers.map((caregiver) => (
                <MenuItem key={caregiver.userId} value={caregiver.userId}>
                  {caregiver.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filter by Client</InputLabel>
            <Select
              value={filterClientId}
              onChange={(e) => setFilterClientId(Number(e.target.value))}
              label="Filter by Client"
            >
              <MenuItem value={0}>All Clients</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.userId} value={client.userId}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Caregiver</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Task</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments
                .filter((appointment) => {
                  const matchesCaregiver =
                    filterCaregiverId === 0 ||
                    Number(appointment.caregiverId) ===
                      Number(filterCaregiverId)
                  const matchesClient =
                    filterClientId === 0 ||
                    Number(appointment.clientId) === Number(filterClientId)

                  if (filterCaregiverId !== 0) {
                    console.log('Filtering:', {
                      appointmentCaregiverId: appointment.caregiverId,
                      filterCaregiverId: filterCaregiverId,
                      matches: matchesCaregiver,
                    })
                  }

                  return matchesCaregiver && matchesClient
                })
                .map((appointment) => (
                  <TableRow key={appointment.appointmentId}>
                    <TableCell>{appointment.appointmentId}</TableCell>
                    <TableCell>
                      {dayjs(appointment.date).format('MMM D, YYYY HH:mm')}
                    </TableCell>
                    <TableCell>
                      {appointment.caregiver?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{appointment.client?.name || 'N/A'}</TableCell>
                    <TableCell>{appointment.location}</TableCell>
                    <TableCell>{appointment.task}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(appointment)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(appointment.appointmentId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
            >
              <FormControl fullWidth>
                <InputLabel>Caregiver</InputLabel>
                <Select
                  value={formData.caregiverId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      caregiverId: e.target.value as number,
                    })
                  }
                >
                  {caregivers.map((caregiver) => (
                    <MenuItem
                      key={caregiver.userId}
                      value={caregiver.caregiverId}
                    >
                      {caregiver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientId: e.target.value as number,
                    })
                  }
                >
                  {clients.map((client) => (
                    <MenuItem key={client.userId} value={client.userId}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Date & Time"
                type="datetime-local"
                value={
                  formData.date
                    ? dayjs(formData.date).format('YYYY-MM-DDTHH:mm')
                    : ''
                }
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Task"
                value={formData.task}
                onChange={(e) =>
                  setFormData({ ...formData, task: e.target.value })
                }
                fullWidth
                required
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingAppointment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}
