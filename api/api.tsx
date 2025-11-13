const BaseUrl = 'http://localhost:5282'

const getAppointments = async () => {
  const response = await fetch(`${BaseUrl}/api/appointments`, {
    method: 'GET',
  })
  return response.json();
}

export const getUser = async (userId: number) => {
    const response = await fetch(`${BaseUrl}/api/User/${userId}`, {
      method: 'GET',
    })
    return response.json();
  }