"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  getCaregiverAppointments,
  getAvailabilities,
  createAvailability,
  deleteAvailability,
} from "../../api/api";
import {
  Appointment,
  Availability,
  Caregiver,
  CreateAvailabilityDTO,
  UpdateAvailabilityResponse,
  UserRole,
} from "../../interfaces/interfaces";
import { ProtectedRoute } from "@/components/index";
import GlobalStyle from "../globalStyle.module.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#000000",
      paper: "#1a1a1a",
    },
  },
});

export default function CaregiverPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    // Get caregiver data from localStorage
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      setCaregiver(JSON.parse(userStr));
    }
  }, []);

  const fetchUserData = async () => {
    console.log(caregiver);
    const Appointments = await getCaregiverAppointments();
    console.log(Appointments);
    const Availabilities: Availability[] = await getAvailabilities();
    console.log(Availabilities);
    setAvailabilities(Availabilities);
    setAppointments(Appointments);
  };

  const handleAddAvailability = async () => {
    try {
      if (selectedDate && startTime && endTime) {
        const availability: CreateAvailabilityDTO = {
          date: selectedDate.format("YYYY-MM-DD"),
          startTime: startTime.format("HH:mm"),
          endTime: endTime.format("HH:mm"),
          caregiverId: caregiver ? caregiver.userId : 0,
        };
        const response: UpdateAvailabilityResponse = await createAvailability(
          availability
        );
        setAvailabilities(response.availabilities);
        setSelectedDate(null);
        setStartTime(null);
        setEndTime(null);
      }
    } catch (error) {
      console.error("Error adding availability:", error);
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    const updatedAvailabilities: UpdateAvailabilityResponse =
      await deleteAvailability(id);
    setAvailabilities(updatedAvailabilities.availabilities);
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute allowedRoles={[UserRole.Caregiver]}>
      <ThemeProvider theme={darkTheme}>
        <div className={GlobalStyle.page}>
          <h1>Caregiver Dashboard</h1>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              maxWidth: "1400px",
              height: "60vh",
              margin: "0 auto",
              padding: 2,
            }}
          >
            {/* Left Side - Booked Appointments */}
            <Card sx={{ height: "60vh" }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h5" gutterBottom>
                  Booked Appointments
                </Typography>
                {appointments.length === 0 ? (
                  <Typography color="text.secondary">
                    No appointments booked yet.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mt: 2,
                      overflowY: "auto",
                    }}
                  >
                    {appointments.map((appointment) => (
                      <Box
                        key={appointment.appointmentId}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 2,
                          border: "1px solid #333",
                          borderRadius: 1,
                          backgroundColor: "#2a2a2a",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {appointment.client.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(appointment.date).format("DD.MM.YYYY HH:mm")}{" "}
                            at {appointment.location}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Right Side - Availability Management */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                height: "60vh",
              }}
            >
              {/* Add Availability Section */}
              <Card sx={{ height: "420px" }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Set Your Availability
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 2,
                      }}
                    >
                      <DatePicker
                        label="Select Date"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            onClick: (e) => {
                              e.currentTarget.querySelector("button")?.click();
                            },
                          },
                        }}
                      />
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TimePicker
                          label="Start Time"
                          value={startTime}
                          onChange={(newValue) => setStartTime(newValue)}
                          ampm={false}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              onClick: (e) => {
                                e.currentTarget
                                  .querySelector("button")
                                  ?.click();
                              },
                            },
                          }}
                        />
                        <TimePicker
                          label="End Time"
                          value={endTime}
                          onChange={(newValue) => setEndTime(newValue)}
                          ampm={false}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              onClick: (e) => {
                                e.currentTarget
                                  .querySelector("button")
                                  ?.click();
                              },
                            },
                          }}
                        />
                      </Box>
                      <Button
                        variant="contained"
                        onClick={handleAddAvailability}
                      >
                        Add Availability
                      </Button>
                    </Box>
                  </LocalizationProvider>
                </CardContent>
              </Card>

              {/* Current Availabilities */}
              <Card sx={{ height: "100%", paddingBottom: 5 }}>
                <CardContent sx={{ height: "100%" }}>
                  <Typography variant="h5" gutterBottom>
                    Your Availabilities
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mt: 2,
                      overflowY: "auto",
                      height: "100%",
                    }}
                  >
                    {availabilities &&
                      availabilities.length > 0 &&
                      availabilities.map((availability: Availability) => (
                        <Box
                          key={availability.availabilityId}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 2,
                            border: "1px solid #333",
                            borderRadius: 1,
                            backgroundColor: "#2a2a2a",
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {dayjs(availability.date).format("DD.MM.YYYY")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {availability.startTime} - {availability.endTime}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() =>
                              handleDeleteAvailability(
                                availability.availabilityId!
                              )
                            }
                          >
                            Delete
                          </Button>
                        </Box>
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  );
}
