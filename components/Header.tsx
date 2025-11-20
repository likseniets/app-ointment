"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { UserRole } from "@/interfaces/interfaces";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  const isCaregiver = userRole === UserRole.Caregiver;
  const isClient = userRole === UserRole.Client;

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {isCaregiver ? "Caregiver Portal" : isClient ? "Client Portal" : "Portal"}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {isClient && (
            <>
              <Button
                color="inherit"
                onClick={() => router.push("/client")}
                sx={{
                  backgroundColor: isActive("/client") ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => router.push("/client/create-appointment")}
                sx={{
                  backgroundColor: isActive("/client/create-appointment") ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                Book Appointment
              </Button>
            </>
          )}
          {isCaregiver && (
            <Button
              color="inherit"
              onClick={() => router.push("/caregiver")}
              sx={{
                backgroundColor: isActive("/caregiver") ? "rgba(255, 255, 255, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              Dashboard
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
