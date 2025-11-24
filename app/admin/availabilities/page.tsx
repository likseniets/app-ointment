'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAllAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getCaregivers,
} from '@/api/api'
import { Availability, Caregiver } from '@/interfaces/interfaces'
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

export default function AdminAvailabilitiesPage() {
  const router = useRouter()
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null)
  const [message, setMessage] = useState('')
  const [filterCaregiverId, setFilterCaregiverId] = useState<number>(0)
  const [formData, setFormData] = useState({
    caregiverId: 0,
    date: '',
    startTime: '',
    endTime: '',
    slotLengthMinutes: 60,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [availabilitiesData, caregiversData] = await Promise.all([
        getAllAvailabilities(),
        getCaregivers(),
      ])
      setAvailabilities(availabilitiesData)
      setCaregivers(caregiversData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (availability?: Availability) => {
    if (availability) {
      setEditingAvailability(availability)
      setFormData({
        caregiverId: availability.caregiverId,
        date: dayjs(availability.date).format('YYYY-MM-DD'),
        startTime: availability.startTime,
        endTime: availability.endTime,
        slotLengthMinutes: 60,
      })
    } else {
      setEditingAvailability(null)
      setFormData({
        caregiverId: 0,
        date: '',
        startTime: '',
        endTime: '',
        slotLengthMinutes: 60,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingAvailability(null)
    setMessage('')
  }

  const handleSubmit = async () => {
    try {
      if (editingAvailability && editingAvailability.availabilityId) {
        await updateAvailability(editingAvailability.availabilityId, {
          ...formData,
          date: `${formData.date}T00:00:00`,
        })
        setMessage('Availability updated successfully')
      } else {
        await createAvailability({
          caregiverId: formData.caregiverId,
          date: `${formData.date}T00:00:00`,
          startTime: formData.startTime,
          endTime: formData.endTime,
          slotLengthMinutes: formData.slotLengthMinutes,
        })
        setMessage('Availability created successfully')
      }
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error('Error saving availability:', error)
      setMessage('Failed to save availability')
    }
  }

  const handleDelete = async (availabilityId: number) => {
    if (confirm('Are you sure you want to delete this availability?')) {
      try {
        await deleteAvailability(availabilityId)
        setMessage('Availability deleted successfully')
        fetchData()
      } catch (error) {
        console.error('Error deleting availability:', error)
        setMessage('Failed to delete availability')
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
            Availability Management
          </Typography>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Add New Availability
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

        <Box sx={{ mb: 3 }}>
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
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Caregiver</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availabilities
                .filter((availability) => {
                  if (filterCaregiverId === 0) return true
                  return (
                    Number(availability.caregiverId) ===
                    Number(filterCaregiverId)
                  )
                })
                .map((availability) => (
                  <TableRow key={availability.availabilityId}>
                    <TableCell>{availability.availabilityId}</TableCell>
                    <TableCell>{availability.caregiverName}</TableCell>
                    <TableCell>
                      {dayjs(availability.date).format('MMM D, YYYY')}
                    </TableCell>
                    <TableCell>{availability.startTime}</TableCell>
                    <TableCell>{availability.endTime}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenDialog(availability)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          availability.availabilityId &&
                          handleDelete(availability.availabilityId)
                        }
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
            {editingAvailability ? 'Edit Availability' : 'Add New Availability'}
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
              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 900 }}
              />
              <TextField
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 900 }}
              />
              <FormControl fullWidth>
                <InputLabel>Time Slot Length</InputLabel>
                <Select
                  value={formData.slotLengthMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slotLengthMinutes: Number(e.target.value),
                    })
                  }
                  label="Time Slot Length"
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                  <MenuItem value={90}>90 minutes</MenuItem>
                  <MenuItem value={120}>120 minutes</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingAvailability ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}
