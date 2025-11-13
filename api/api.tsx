import {
  CreateAvailabilityDTO,
  UpdateAvailabilityResponse,
} from "@/app/interfaces/interfaces";

const BaseUrl = "http://localhost:5282";

export const getUser = async (userId: number) => {
  const response = await fetch(`${BaseUrl}/api/User/${userId}`, {
    method: "GET",
  });
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${BaseUrl}/api/User/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const getClientAppointments = async (clientId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/Appointment/byclient/${clientId}`,
    {
      method: "GET",
    }
  );
  return response.json();
};

export const getCaregiverAppointments = async (caregiverId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/Appointment/bycaregiver/${caregiverId}`,
    {
      method: "GET",
    }
  );
  return response.json();
};

export const getAvailabilities = async (caregiverId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/Availability/caregiver/${caregiverId}`,
    {
      method: "GET",
    }
  );
  return response.json();
};

export const createAvailability = async (
  availability: CreateAvailabilityDTO
): Promise<UpdateAvailabilityResponse> => {
  const response = await fetch(`${BaseUrl}/api/Availability/create`, {
    method: "POST",
    body: JSON.stringify(availability),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const deleteAvailability = async (availabilityId: number) => {
  const response = await fetch(
    `${BaseUrl}/api/Availability/delete/${availabilityId}`,
    {
      method: "DELETE",
    }
  );
  return response.json();
};

export const getAllAvailabilities = async () => {
  const response = await fetch(`${BaseUrl}/api/Availability`, {
    method: "GET",
  });
  return response.json();
};

export const createAppointment = async (appointmentData: {
  availabilityId: number;
  clientId: number;
  location: string;
  description: string;
}) => {
  const response = await fetch(`${BaseUrl}/api/Appointment/create`, {
    method: "POST",
    body: JSON.stringify(appointmentData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
