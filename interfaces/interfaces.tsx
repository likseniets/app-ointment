export enum UserRole {
  Caregiver,
  Client,
  Admin,
}

export enum AppointmentTask {
  AssistanceWithDailyLiving,
  MedicationReminders,
  Shopping,
  HouseholdChores,
  PersonalHygiene,
  MealPreparation,
  Transportation,
  Companionship,
  PhysicalTherapyAssistance,
  MedicalAppointmentSupport,
}

export interface User {
  userId: number
  name: string
  role: UserRole
  adress: string
  phone: string
  email: string
  imageUrl?: string | null
}

export interface UpdateUserDTO {
  name?: string
  adress?: string
  phone?: string
  email?: string
  imageUrl?: string | null
}

export interface Caregiver extends User {
  caregiverId: number
  appointments?: Appointment[] | null
  availability?: Availability[] | null
}

export interface Client extends User {
  clientId: number
  appointments?: Appointment[] | null
}

export interface Appointment {
  appointmentId: number
  date: string // ISO 8601 date string
  caregiverId: number
  caregiver: User
  clientId: number
  client: User
  location: string
  task: string
}

export interface PendingRequest {
  changeRequestId: number
  appointmentId: number
  requestedByUserId: number
  requestedByName: string
  oldTask: AppointmentTask
  newTask?: AppointmentTask | null
  oldDateTime: string // ISO 8601 date string
  newDateTime?: string | null // ISO 8601 date string
  status: string
  requestedAt: string // ISO 8601 date string
  respondedAt?: string | null // ISO 8601 date string
  respondedByUserId?: number | null
  respondedByName?: string | null
}

export interface Availability {
  availabilityId?: number
  date: string // ISO 8601 date string
  startTime: string // Format: "HH:mm"
  endTime: string // Format: "HH:mm"
  caregiverId: number
  caregiverName?: string
}

export interface CreateAvailabilityDTO {
  date: string // ISO 8601 date string
  startTime: string // Format: "HH:mm"
  endTime: string // Format: "HH:mm"
  caregiverId: number
  slotLengthMinutes: number
}

export interface UpdateAvailabilityResponse {
  message: string
  count: number
  availabilities: Availability[]
}
