"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import { CircularProgress, Box } from "@mui/material";
import { UserRole } from "@/interfaces/interfaces";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // Optional: restrict to specific user roles
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage is ready
    const checkAuth = () => {
      // Check if user is authenticated
      const authenticated = isAuthenticated();

      if (!authenticated) {
        // Only redirect if not already on login page
        if (pathname !== "/login") {
          router.push("/login");
        }
        setIsLoading(false);
        return;
      }

      // If allowedRoles is specified, check user role
      if (allowedRoles && allowedRoles.length > 0) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log("User role:", user.role);
          if (!allowedRoles.includes(user.role)) {
            // User doesn't have the required role - redirect to their appropriate page
            if (user.role === UserRole.Caregiver && pathname !== "/caregiver") {
              router.push("/caregiver");
            } else if (
              user.role === UserRole.Client &&
              pathname !== "/client"
            ) {
              router.push("/client");
            } else {
              router.push("/login");
            }
            setIsLoading(false);
            return;
          }
        } else {
          router.push("/login");
          setIsLoading(false);
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    // Add a small timeout to prevent race conditions
    const timeoutId = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeoutId);
  }, [router, allowedRoles, pathname]);

  if (isLoading) {
    return (
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
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
