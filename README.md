# App-ointment

A comprehensive appointment booking and management system built with Next.js, designed for caregivers and clients to schedule and manage appointments efficiently.

## 🚀 Features

### Client Portal

- Browse available caregivers and their availability
- Book appointments with specific caregivers or choose "Any Caregiver"
- View and manage booked appointments
- Request and approve changes to existing appointments
- Profile management

### Caregiver Portal

- Set and manage availability schedules (date and hourly time slots)
- View and manage appointments
- Request and approve changes to existing appointments
- Edit and delete availability slots
- Profile management

### Admin Portal

- **User Management**: Create, read, update, and delete users (Clients, Caregivers, Admins)
- **Appointment Management**: View, create, update, and delete appointments with filtering by caregiver/client
- **Availability Management**: View, create, update, and delete availability slots with caregiver filtering
- Comprehensive dashboard with quick access to all management features

## 📁 Project Structure

```
app-ointment/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin portal pages
│   │   ├── appointments/         # Appointment management
│   │   ├── availabilities/       # Availability management
│   │   ├── users/                # User management
│   │   └── page.tsx             # Admin dashboard
│   ├── caregiver/               # Caregiver dashboard
│   ├── client/                  # Client dashboard
│   │   └── create-appointment/  # Appointment booking page
│   ├── edit-profile/            # Profile editing page
│   ├── login/                   # Authentication page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to login)
│   └── globals.css              # Global styles
├── api/                         # API integration layer
│   └── api.tsx                  # API functions for backend communication
├── components/                  # Reusable React components
│   ├── Header/                  # Global navigation header
│   ├── CollapseCard/            # Expandable appointment card
│   ├── ProfileCard/             # User profile display
│   └── ProtectedRoute/          # Route protection wrapper
├── interfaces/                  # TypeScript interfaces
│   └── interfaces.tsx           # Type definitions for User, Appointment, etc.
├── utils/                       # Utility functions
│   └── auth.tsx                 # Authentication utilities
├── public/                      # Static assets
│   └── images/                  # Images (default caregiver photo, etc.)
└── package.json                 # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Date/Time**: Day.js with MUI Date Pickers
- **Styling**: CSS Modules + Material-UI theming
- **State Management**: React Hooks (useState, useEffect)

## 📋 Prerequisites

- Node.js version v22.14.0 has been used under development
- npm or yarn
- Backend API server running on `http://localhost:5282`

## 🔧 Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API endpoint** (if needed)

   Edit `api/api.tsx` and update the `BaseUrl` constant:

   ```typescript
   const BaseUrl = 'http://localhost:5282' // Change to your API URL
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage Guide

### First Time Setup

1. **Access the login page** - The app automatically redirects to `/login`
2. **Login with credentials** - Use your email and password
   **_Premade users:_**
   - **Admin**: admin@example.com / password123
   - **Caregiver 1**: caregiver1@example.com / password123
   - **Caregiver 2**: caregiver2@example.com / password123
   - **Client 1**: client1@example.com / password123
   - **Client 2**: client2@example.com / password123
3. **Role-based redirect** - You'll be redirected to your dashboard based on your role:
   - Admins → `/admin`
   - Caregivers → `/caregiver`
   - Clients → `/client`

### For Clients

1. **View appointments** - See all your booked appointments on the dashboard
2. **Book new appointment**:
   - Select a caregiver (or choose "Any Caregiver")
   - Pick an available date from the calendar
   - Choose a time slot
   - Choose a task
   - Submit the booking
3. **Manage appointments** - View appointment details, request changes, or cancel

### For Caregivers

1. **Set availability**:
   - Use the date picker to select a date
   - Choose start and end times (hourly slots)
   - Click "Add Availability"
2. **Manage availability**:
   - View all your availability slots
   - Click the edit icon to modify date/time
   - Click the delete icon to remove slots
3. **Manage appointments** - View and handle appointment requests and changes

### For Admins

1. **Access admin dashboard** - Three main sections available:
   - Users
   - Appointments
   - Availabilities
2. **User Management**:
   - View all users in the system
   - Create new users (Client, Caregiver, or Admin)
   - Edit user information
   - Delete users
3. **Appointment Management**:
   - View all appointments
   - Filter by caregiver and/or client
   - Create, edit, or delete appointments
4. **Availability Management**:
   - View all caregiver availability slots
   - Filter by caregiver
   - Create, edit, or delete availability slots

### Profile Management

All users can edit their profile:

- Click "Edit Profile" in the header
- Update name, email, phone, address, and profile image
- Change password
- Click "Back" to return to your dashboard

## 🌐 API Endpoints

The application communicates with a backend API. Key endpoints include:

- **Authentication**: `/api/Auth/login`
- **Users**: `/api/User/*`
- **Appointments**: `/api/Appointment/*`
- **Availabilities**: `/api/Availability/*`
- **Change Requests**: `/api/ChangeRequest/*`

All authenticated requests include JWT tokens in headers.

## 🎨 Theme & Design

- **Dark Theme** throughout the application
- **Primary Color**: Blue (#1976d2)
- **Material Design** principles with Material-UI components
- **Responsive Layout** for various screen sizes
- **Consistent Navigation** with role-based header menu

## 🔐 Authentication

- JWT token-based authentication
- Tokens stored in localStorage
- Protected routes redirect to login if not authenticated
- Role-based access control for different user types

## 📝 Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 User Roles

1. **Client (Role: 1)**

   - Book and manage appointments
   - Request appointment changes
   - View caregiver availability

2. **Caregiver (Role: 0)**

   - Set and manage availability
   - View and manage appointments
   - Respond to change requests

3. **Admin (Role: 2)**
   - Full system access
   - User management
   - Appointment oversight
   - Availability management
