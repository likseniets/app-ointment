"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import GlobalStyles from "../globalStyle.module.css";
import { TextField, Button } from "@mui/material";
import { login } from "@/api/api";
import { setToken } from "@/utils/auth";
import { UserRole } from "@/interfaces/interfaces";

const textFieldSx = {
  "& .MuiInput-underline:before": { borderBottomColor: "#1976d2" },
  "& .MuiInput-underline:after": { borderBottomColor: "#1976d2" },
  "& .MuiInputLabel-root": { color: "#1976d2" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
  "& .MuiInputBase-input": { color: "white" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      // If already logged in, redirect to appropriate page
      if (parsedUser.role == UserRole.Caregiver) {
        router.push("/caregiver");
      } else if (parsedUser.role == UserRole.Client) {
        router.push("/client");
      }
    }
  }, [router]);

  const handleLogin = async (e: string, p: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await login(e, p);

      // Store the JWT token
      if (response.token) {
        setToken(response.token); // Store token in localStorage via the utility function, so it can be used in auth headers.
      }

      // Store user data
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        const isCaregiver = response.user.role == UserRole.Caregiver;
        const isClient = response.user.role == UserRole.Client;

        // Small delay to ensure localStorage is fully written
        setTimeout(() => {
          // Redirect based on user role
          if (isCaregiver) {
            router.push("/caregiver");
          } else if (isClient) {
            router.push("/client");
          }
        }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className={GlobalStyles.page}>
      <h1>Login</h1>
      <div className={styles.inputContainer}>
        <TextField
          required
          id="email-input"
          label="Email"
          type="email"
          defaultValue="Email"
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={textFieldSx}
        />
        <TextField
          required
          id="password-input"
          label="Password"
          type="password"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={textFieldSx}
        />
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        <Button
          variant="contained"
          disabled={loading}
          onClick={() => handleLogin(email, password)}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </div>
  );
}
