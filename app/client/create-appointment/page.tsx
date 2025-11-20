"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCaregivers,
  createAppointment,
} from "@/api/api";
import { Availability, Client, Caregiver } from "@/interfaces/interfaces";
import styles from "./styles.module.css";
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
  Chip,
} from "@mui/material";
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from "dayjs";

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

export default function CreateAppointmentPage() {
  const router = useRouter();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [availabilitiesForDate, setAvailabilitiesForDate] = useState<Availability[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const client: Client = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  useEffect(() => {
    fetchCaregivers();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedCaregiver) {
      filterAvailabilitiesForDate(selectedDate);
    } else if (selectedDate && selectedCaregiver === null) {
      // "Any Caregiver" selected - show all availabilities from all caregivers
      filterAllAvailabilitiesForDate(selectedDate);
    } else {
      setAvailabilitiesForDate([]);
      setSelectedAvailability(null);
    }
  }, [selectedDate, selectedCaregiver]);

  const fetchCaregivers = async () => {
    try {
      setLoading(true);
      const caregiversData = await getCaregivers();
      setCaregivers(caregiversData);
      console.log("Caregivers data:", caregiversData);
    } catch (error) {
      console.error("Error fetching caregivers:", error);
      setMessage("Failed to load caregivers");
    } finally {
      setLoading(false);
    }
  };

  const filterAvailabilitiesForDate = (date: Dayjs) => {
    if (!selectedCaregiver?.availability) {
      setAvailabilitiesForDate([]);
      return;
    }

    const dateStr = date.format('YYYY-MM-DD');
    const filtered = selectedCaregiver.availability.filter(
      (avail) => avail.date.startsWith(dateStr)
    );
    setAvailabilitiesForDate(filtered);
  };

  const filterAllAvailabilitiesForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const allAvailabilities: Availability[] = [];
    
    caregivers.forEach((caregiver) => {
      if (caregiver.availability) {
        const filtered = caregiver.availability.filter(
          (avail) => avail.date.startsWith(dateStr)
        );
        allAvailabilities.push(...filtered);
      }
    });
    
    setAvailabilitiesForDate(allAvailabilities);
  };

  const getDatesWithAvailability = (): string[] => {
    if (selectedCaregiver === null) {
      // "Any Caregiver" - get all dates from all caregivers
      const allDates = new Set<string>();
      caregivers.forEach((caregiver) => {
        if (caregiver.availability) {
          caregiver.availability.forEach((avail) => {
            allDates.add(dayjs(avail.date).format('YYYY-MM-DD'));
          });
        }
      });
      return Array.from(allDates);
    }
    
    if (!selectedCaregiver?.availability) return [];
    
    return selectedCaregiver.availability.map((avail) => 
      dayjs(avail.date).format('YYYY-MM-DD')
    );
  };

  const shouldDisableDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const availableDates = getDatesWithAvailability();
    return !availableDates.includes(dateStr);
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

      await createAppointment(appointmentData);
      setMessage("Appointment booked successfully!");
      
      // Redirect to client dashboard after 2 seconds
      setTimeout(() => {
        router.push("/client");
      }, 2000);
    } catch (error) {
      console.error("Error creating appointment:", error);
      setMessage("Failed to book appointment. Please try again.");
      setSubmitting(false);
    }
  };

  const formatTimeSlot = (availability: Availability) => {
    return `${availability.startTime} - ${availability.endTime}`;
  };

  return (
    <ThemeProvider theme={darkTheme}>
        <div className={styles.page}>
      <div className={styles.pageContent}>
        <h1>Book New Appointment</h1>

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
              maxWidth: "1200px",
              margin: "0 auto",
              padding: 2,
            }}
          >
            <Box
              component="form"
              onSubmit={handleBookAppointment}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Step 1: Select Caregiver */}
              <div className={styles.caregiverSelection}>
                <h1 className={styles.sectionTitle}>Select a Caregiver</h1>
                <div 
                  className={`${styles.caregiverCard} ${selectedCaregiver === null ? styles.selected : ''}`} 
                  onClick={() => {
                    setSelectedCaregiver(null);
                    setSelectedDate(null);
                    setSelectedAvailability(null);
                  }}
                >
                    <img className={styles.caregiverImage} src="/images/DefaultCaretaker.jpg" alt="Default Caretaker" />
                    <Typography variant="body2" color="text.secondary">
                      Any Caregiver
                    </Typography>
                </div>
                {caregivers && caregivers.length !== 0 && caregivers.map((caregiver) => (
                    <div 
                      className={`${styles.caregiverCard} ${selectedCaregiver?.caregiverId === caregiver.caregiverId ? styles.selected : ''}`} 
                      onClick={() => {
                        setSelectedCaregiver(caregiver);
                        setSelectedDate(null);
                        setSelectedAvailability(null);
                      }}
                      key={caregiver.userId}
                    >
                        <img className={styles.caregiverImage} src={caregiver.imageUrl || "/images/DefaultCaretaker.jpg"} alt={caregiver.name} /> 
                        <Typography variant="body2" color="text.secondary">
                          {caregiver.name}
                        </Typography>
                    </div>
                ))}
              </div>
              {/* Step 2: Select Date from Calendar */}
              {(selectedCaregiver || selectedCaregiver === null) && (
                <div className={styles.dateSelectionContainer}>
                    <Typography variant="h5" gutterBottom>
                      Step 2: Select a Date
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Only dates with available time slots are selectable
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar
                        value={selectedDate}
                        onChange={(newValue) => {
                            setSelectedDate(newValue);
                            setSelectedAvailability(null);
                        }}
                        shouldDisableDate={shouldDisableDate}
                        sx={{
                            width: '500px',
                            height: 'auto',
                            margin: '0 auto',
                            maxHeight: 'none',
                            '& .MuiPickersSlideTransition-root': {
                                height: '400px',
                            },
                            '& .MuiPickersDay-root': {
                                fontSize: '1.2rem',
                                width: '48px',
                                height: '48px',
                                '&.Mui-disabled': {
                                    color: '#666',
                                },
                            },
                            '& .MuiDayCalendar-header': {
                                '& .MuiTypography-root': {
                                    fontSize: '1.1rem',
                                    width: '48px',
                                },
                            },
                            '& .MuiPickersCalendarHeader-label': {
                                fontSize: '1.3rem',
                            },
                        }}
                        />
                    </LocalizationProvider>
                </div>
              )}

              {/* Step 3: Select Time Slot */}
              {selectedDate && availabilitiesForDate.length > 0 && (
                  <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Step 3: Select a Time Slot
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Available times for {selectedDate.format("MMMM D, YYYY")}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {availabilitiesForDate.map((availability) => (
                        <Chip
                          key={availability.availabilityId}
                          label={formatTimeSlot(availability)}
                          onClick={() => setSelectedAvailability(availability)}
                          color={selectedAvailability?.availabilityId === availability.availabilityId ? "primary" : "default"}
                          sx={{
                            fontSize: '1rem',
                            padding: '20px 10px',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: selectedAvailability?.availabilityId === availability.availabilityId 
                                ? undefined 
                                : '#333',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Appointment Details */}
              {selectedAvailability && (
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Step 4: Appointment Details
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                      <Box
                        sx={{
                          padding: 2,
                          border: "1px solid #333",
                          borderRadius: 1,
                          backgroundColor: "#2a2a2a",
                        }}
                      >
                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                          Selected Appointment
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Caregiver: {selectedCaregiver?.name || "Any Available Caregiver"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date: {selectedDate?.format("dddd, MMMM D, YYYY")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Time: {selectedAvailability.startTime} - {selectedAvailability.endTime}
                        </Typography>
                      </Box>

                      <TextField
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter appointment location"
                        required
                        fullWidth
                        helperText="Where would you like the appointment to take place?"
                      />

                      <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the reason for your appointment"
                        required
                        multiline
                        rows={6}
                        fullWidth
                        helperText="Please provide details about what you need help with"
                      />

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() => router.push("/client")}
                          fullWidth
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting}
                          fullWidth
                        >
                          {submitting ? "Booking..." : "Book Appointment"}
                        </Button>
                      </Box>

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
              )}
            </Box>
          </Box>
        )}
      </div>
      </div>
    </ThemeProvider>
  );
}
