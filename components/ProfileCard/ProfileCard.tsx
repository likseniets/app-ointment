/* eslint-disable @next/next/no-img-element */
import { User } from "@/interfaces/interfaces";
import styles from "./styles.module.css";
import { Button, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";

export default function ProfileCard(user: User) {
  return (
    <div className={styles.profileSection}>
      <h2>Your Profile</h2>
      {user ? (
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <div className={styles.profileContainer}>
              <img
                src={user.imageUrl || "/images/DefaultUser.jpg"}
                alt={`${user.name}'s profile`}
                className={styles.profileImage}
              />
              <div className={styles.profileDetails}>
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Address: {user.adress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {user.phone}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ marginTop: 2 }}
                  component={Link}
                  href="/edit-profile"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
