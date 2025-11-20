export enum UserRole {
  Caregiver = 1,
  Client = 2,
  Admin = 3,
}

export interface User {
  userId: number;
  name: string;
  role: UserRole;
  adress: string;
  phone: string;
  email: string;
  imageUrl?: string | null;
}

export interface Caregiver extends User {
  caregiverId: number;
  appointments?: Appointment[] | null;
  availability?: Availability[] | null;
}

export interface Client extends User {
  clientId: number;
  appointments?: Appointment[] | null;
}

export interface Appointment {
  appointmentId: number;
  date: string; // ISO 8601 date string
  caregiverId: number;
  caregiver: User;
  clientId: number;
  client: User;
  location: string;
  description: string;
}

export interface Availability {
  availabilityId?: number;
  date: string; // ISO 8601 date string
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  caregiverId: number;
}

export interface CreateAvailabilityDTO {
  date: string; // ISO 8601 date string
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  caregiverId: number;
}

export interface UpdateAvailabilityResponse {
  message: string;
  count: number;
  availabilities: Availability[];
}
