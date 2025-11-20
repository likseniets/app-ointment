"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getClientAppointments,
} from "@/api/api";
import { Client, Appointment } from "../../interfaces/interfaces";
import styles from "../page.module.css";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CircularProgress,
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
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const client: Client = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await getClientAppointments(client?.userId || 1);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
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
              maxWidth: "1400px",
              margin: "0 auto",
              padding: 2,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  My Appointments
                </Typography>
                {appointments.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary" gutterBottom>
                      No appointments booked yet.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => router.push("/client/create-appointment")}
                    >
                      Book Your First Appointment
                    </Button>
                  </Box>
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
          </Box>
        )}
      </div>
    </ThemeProvider>
  );
}
