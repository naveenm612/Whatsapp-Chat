import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Container,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonIcon from "@mui/icons-material/Person";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
      return;
    }

    const user = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      password,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();
      if (response.ok) {
        // Store user data in localStorage if the server returns it
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }
        
        setSnackbar({ open: true, message: "User signed up successfully!", severity: "success" });
        setTimeout(() => navigate("/chats"), 2000); // Delay navigation for user feedback
      } else {
        setSnackbar({ open: true, message: result.message, severity: "error" });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setSnackbar({ open: true, message: "Failed to sign up. Try again later.", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "100px",
          height: "100px",
          bgcolor: "#4f46e5",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "150px",
          height: "150px",
          bgcolor: "#4f46e5",
          zIndex: 0,
        }}
      />

      <Container
        component="main"
        maxWidth="xs"
        sx={{
          zIndex: 1,
          bgcolor: "#1c1c1c",
          borderRadius: 4,
          p: 4,
          boxShadow: 4,
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate("/")} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" color="white" sx={{ marginLeft: 1 }}>
            Back
          </Typography>
        </Box>
        <Typography component="h2" variant="h5" align="center" gutterBottom sx={{ color: "white" }}>
          Create Your Account
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: "white" }} gutterBottom>
          Already have an account?{" "}
          <Link component="button" onClick={() => navigate("/")} sx={{ color: "#4f46e5" }}>
            Log in
          </Link>
        </Typography>
        <Box component="form" noValidate onSubmit={handleSignUp}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            name="name"
            placeholder="Name"
            autoComplete="name"
            autoFocus
            sx={{ bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            sx={{ bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            id="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            sx={{ bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            sx={{ bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "#4f46e5", color: "white", borderRadius: 2 }}
          >
            Sign Up
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignUpForm;