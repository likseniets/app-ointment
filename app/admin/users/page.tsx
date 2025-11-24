'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllUsers, createUser, updateUser, deleteUser } from '@/api/api'
import { User, UserRole } from '@/interfaces/interfaces'
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

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    adress: '',
    role: UserRole.Client,
    password: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        adress: user.adress,
        role: user.role,
        password: '',
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        adress: '',
        role: UserRole.Client,
        password: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setMessage('')
  }

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser.userId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          adress: formData.adress,
        })
        setMessage('User updated successfully')
      } else {
        await createUser(formData)
        setMessage('User created successfully')
      }
      handleCloseDialog()
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      setMessage('Failed to save user')
    }
  }

  const handleDelete = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId)
        setMessage('User deleted successfully')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        setMessage('Failed to delete user')
      }
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return 'Admin'
      case UserRole.Caregiver:
        return 'Caregiver'
      case UserRole.Client:
        return 'Client'
      default:
        return 'Unknown'
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
            User Management
          </Typography>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Add New User
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.adress}</TableCell>
                  <TableCell>{getRoleName(user.role)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(user.userId)}
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
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
            >
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                fullWidth
                required
              />
              <TextField
                label="Address"
                value={formData.adress}
                onChange={(e) =>
                  setFormData({ ...formData, adress: e.target.value })
                }
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  disabled={editingUser !== null}
                >
                  <MenuItem value={UserRole.Client}>Client</MenuItem>
                  <MenuItem value={UserRole.Caregiver}>Caregiver</MenuItem>
                  <MenuItem value={UserRole.Admin}>Admin</MenuItem>
                </Select>
              </FormControl>
              {!editingUser && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  fullWidth
                  required
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}
