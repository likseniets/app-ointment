"use client";

import { useEffect, useState } from "react";
import {
  getAllAvailabilities,
  createAppointment,
  getClientAppointments,
} from "@/api/api";
import { Availability, Client, Appointment } from "../interfaces/interfaces";
import styles from "../page.module.css";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import dayjs from "dayjs";

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

export default function ClientPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvailability, setSelectedAvailability] =
    useState<Availability | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const client: Client = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availabilitiesData, appointmentsData] = await Promise.all([
        getAllAvailabilities(),
        getClientAppointments(client?.userId || 1),
      ]);
      setAvailabilities(availabilitiesData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAvailability) {
      setMessage("Please select a time slot");
      return;
    }
    if (selectedAvailability.availabilityId === undefined) {
      setMessage("Selected availability is invalid.");
      return;
    }
    try {
      setSubmitting(true);
      setMessage("");

      const appointmentData = {
        availabilityId: selectedAvailability.availabilityId,
        clientId: client?.userId || 1,
        location: location,
        description: description,
      };

      const updatedAppointments = await createAppointment(appointmentData);
      setMessage("Appointment booked successfully!");
      setAppointments(updatedAppointments);
      // Reset form
      setSelectedAvailability(null);
      setLocation("");
      setDescription("");

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error creating appointment:", error);
      setMessage("Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatAvailabilityLabel = (availability: Availability) => {
    const date = dayjs(availability.date).format("MMM DD, YYYY");
    return `${date} - ${availability.startTime} to ${availability.endTime}`;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.page}>
        <h1>Client Dashboard</h1>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
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
              <CardContent sx={{ height: "100%", overflow: "auto" }}>
                <Typography variant="h5" gutterBottom>
                  My Appointments
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
                            {appointment.caregiver.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(appointment.date).format(
                              "MMM DD, YYYY HH:mm"
                            )}{" "}
                            at {appointment.location}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {appointment.description}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Right Side - Create New Appointment */}
            <Card sx={{ height: "60vh" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Book New Appointment
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleBookAppointment}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    mt: 2,
                  }}
                >
                  <FormControl fullWidth required>
                    <InputLabel>Select Time Slot</InputLabel>
                    <Select
                      value={
                        selectedAvailability?.availabilityId?.toString() || ""
                      }
                      label="Select Time Slot"
                      onChange={(e) => {
                        const selected = availabilities.find(
                          (a) => a.availabilityId?.toString() === e.target.value
                        );
                        setSelectedAvailability(selected || null);
                      }}
                    >
                      {availabilities.map((availability) => (
                        <MenuItem
                          key={availability.availabilityId}
                          value={availability.availabilityId?.toString()}
                        >
                          {formatAvailabilityLabel(availability)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter appointment location"
                    required
                    fullWidth
                  />

                  <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the reason for your appointment"
                    required
                    multiline
                    rows={4}
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!selectedAvailability || submitting}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {submitting ? "Booking..." : "Book Appointment"}
                  </Button>

                  {message && (
                    <Alert
                      severity={
                        message.includes("success") ? "success" : "error"
                      }
                    >
                      {message}
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </div>
    </ThemeProvider>
  );
}
