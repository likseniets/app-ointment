"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/interfaces/interfaces";
import GlobalStyle from "../globalStyle.module.css";
import {
  Button,
  Card,
  CardContent,
  Box,
  ThemeProvider,
  createTheme,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ProtectedRoute } from "@/components/index";
import { updatePassword, updateUser } from "@/api/api";

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

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setName(userData.name || "");
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setAddress(userData.adress || "");
      setImageUrl(userData.imageUrl || "");
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!user?.userId) {
        throw new Error("User ID not found");
      }

      const updatedUser: User = await updateUser(user.userId, {
        name,
        email,
        phone,
        adress: address,
        imageUrl,
      });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage("Profile updated successfully!");

      // Redirect back after 2 seconds
      setTimeout(() => {
        if (user?.role === 1) {
          router.push("/caregiver");
        } else {
          router.push("/client");
        }
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user?.role === 1) {
      router.push("/caregiver");
    } else {
      router.push("/client");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordMessage("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match!");
      setPasswordSubmitting(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters long!");
      setPasswordSubmitting(false);
      return;
    }

    try {
      const response: { message: string } = await updatePassword({
        currentPassword,
        newPassword,
      });

      setPasswordMessage(response.message);

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMessage("Failed to update password. Please try again.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <ThemeProvider theme={darkTheme}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        </ThemeProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ThemeProvider theme={darkTheme}>
        <div className={GlobalStyle.page}>
          <div className={GlobalStyle.pageContent}>
            <Box
              sx={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: 2,
              }}
            >
              <h1>Edit Profile</h1>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                }}
              >
                {/* Left Side - Update User Information */}
                <Card>
                  <CardContent>
                    <h2 style={{ marginTop: 0 }}>User Information</h2>
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        fullWidth
                      />

                      <TextField
                        label="Profile Image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        fullWidth
                        helperText="Enter a URL for your profile image"
                      />

                      {imageUrl && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            padding: 2,
                            backgroundColor: "#2a2a2a",
                            borderRadius: 1,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt="Profile preview"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={handleCancel}
                          fullWidth
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting}
                          fullWidth
                        >
                          {submitting ? "Saving..." : "Save Changes"}
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

                {/* Right Side - Change Password */}
                <Card>
                  <CardContent>
                    <h2 style={{ marginTop: 0 }}>Change Password</h2>
                    <Box
                      component="form"
                      onSubmit={handlePasswordChange}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        fullWidth
                      />

                      <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        fullWidth
                        helperText="Password must be at least 6 characters"
                      />

                      <TextField
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        fullWidth
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={passwordSubmitting}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {passwordSubmitting ? "Updating..." : "Update Password"}
                      </Button>

                      {passwordMessage && (
                        <Alert
                          severity={
                            passwordMessage.includes("success")
                              ? "success"
                              : "error"
                          }
                        >
                          {passwordMessage}
                        </Alert>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </div>
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  );
}
