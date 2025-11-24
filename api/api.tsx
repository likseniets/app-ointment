import {
  Availability,
  CreateAvailabilityDTO,
  UpdateAvailabilityResponse,
  UpdateUserDTO,
} from '@/interfaces/interfaces'
import { getAuthHeaders, removeToken } from '@/utils/auth'

const BaseUrl = 'http://localhost:5282'

// Helper function to handle API responses and check for 401 errors
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Unauthorized - clear token and redirect to login
    removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  return response
}

export const getUser = async () => {
  const response = await fetch(`${BaseUrl}/api/User/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const updateUser = async (userId: number, userData: UpdateUserDTO) => {
  const response = await fetch(`${BaseUrl}/api/User/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const updatePassword = async (data: {
  currentPassword: string
  newPassword: string
}) => {
  const response = await fetch(`${BaseUrl}/api/User/change-password`, {
    method: 'POST',
    body: JSON.stringify({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const getCaregivers = async () => {
  const response = await fetch(`${BaseUrl}/api/User/caregivers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const login = async (email: string, password: string) => {
  const response = await fetch(`${BaseUrl}/api/Auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.json()
}

export const getAppointments = async () => {
  const response = await fetch(`${BaseUrl}/api/Appointment/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const getPendingRequests = async () => {
  const response = await fetch(`${BaseUrl}/api/ChangeRequest/pending`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const getRequestedRequests = async () => {
  const response = await fetch(`${BaseUrl}/api/ChangeRequest/requested`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const createPendingRequest = async (data: {
  appointmentId: number
  newAvailabilityId?: string
  newTask?: string
}) => {
  const response = await fetch(`${BaseUrl}/api/ChangeRequest/create`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response
}

export const approveChangeRequest = async (changeRequestId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/ChangeRequest/approve/${changeRequestId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}

export const rejectChangeRequest = async (changeRequestId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/ChangeRequest/reject/${changeRequestId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}

export const cancelChangeRequest = async (changeRequestId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/ChangeRequest/cancel/${changeRequestId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}

export const getAvailabilities = async () => {
  const response = await fetch(`${BaseUrl}/api/Availability/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const getAvailabilityByCaregiver = async (
  caregiverId: number
): Promise<Availability[]> => {
  const response = await fetch(`${BaseUrl}/api/Availability/${caregiverId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const createAvailability = async (
  availability: CreateAvailabilityDTO
): Promise<UpdateAvailabilityResponse> => {
  const response = await fetch(`${BaseUrl}/api/Availability/create`, {
    method: 'POST',
    body: JSON.stringify(availability),
    headers: getAuthHeaders(),
  })
  await handleResponse(response)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create availability')
  }

  return response.json()
}

export const deleteAvailability = async (availabilityId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/Availability/delete/${availabilityId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}

export const getAllAvailabilities = async () => {
  const response = await fetch(`${BaseUrl}/api/Availability/all`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const createAppointment = async (appointmentData: {
  availabilityId: number
  clientId: number
  task: string
}) => {
  const response = await fetch(`${BaseUrl}/api/Appointment/create`, {
    method: 'POST',
    body: JSON.stringify(appointmentData),
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const deleteAppointment = async (appointmentId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/Appointment/delete/${appointmentId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}

// Admin API functions
export const getAllUsers = async () => {
  const response = await fetch(`${BaseUrl}/api/User/all`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const getAllAppointments = async () => {
  const response = await fetch(`${BaseUrl}/api/Appointment/all`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const createUser = async (userData: any) => {
  const response = await fetch(`${BaseUrl}/api/User/create`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const deleteUser = async (userId: number) => {
  const response = await fetch(`${BaseUrl}/api/User/delete/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(response)
  return response.json()
}

export const updateAppointment = async (
  appointmentId: number,
  appointmentData: any
) => {
  const response = await fetch(
    `${BaseUrl}/api/Appointment/update/${appointmentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}

export const updateAvailability = async (
  availabilityId: number,
  availabilityData: any
) => {
  const response = await fetch(
    `${BaseUrl}/api/Availability/update/${availabilityId}`,
    {
      method: 'PUT',
      body: JSON.stringify(availabilityData),
      headers: getAuthHeaders(),
    }
  )
  await handleResponse(response)
  return response.json()
}
