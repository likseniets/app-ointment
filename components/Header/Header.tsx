"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { UserRole } from "@/interfaces/interfaces";
import { removeToken } from "@/utils/auth";
import style from "./Header.module.css";

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
  }, [router, pathname]);

  const isActive = (path: string) => pathname === path;

  const isCaregiver = userRole === UserRole.Caregiver;
  const isClient = userRole === UserRole.Client;
  const isAdmin = userRole === UserRole.Admin;

  const handleLogout = () => {
    removeToken();
    setUserRole(null);
    router.push("/login");
  };

  return (
    <div className={style.header}>
      <div className={style.headerContent}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {isCaregiver
            ? "Caregiver Portal"
            : isClient
            ? "Client Portal"
            : "Portal"}
        </Typography>
        <Box sx={{ display: "flex" }}>
          {isCaregiver && (
            <Button
              color="inherit"
              onClick={() => router.push("/caregiver")}
              sx={{
                backgroundColor: isActive("/caregiver")
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              Dashboard
            </Button>
          )}
          {(isCaregiver || isClient) && (
            <>
              <Button
                color="inherit"
                onClick={() => router.push("/edit-profile")}
                sx={{
                  backgroundColor: isActive("/edit-profile")
                    ? "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                Edit Profile
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 100, 100, 0.3)",
                  },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </div>
    </div>
  );
}
