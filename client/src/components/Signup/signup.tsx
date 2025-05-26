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
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "91.3vh",
        bgcolor: "#1976d2",
        position: "relative",
        overflow: "hidden",
        padding: 4,
        margin:"-8px",
      }}
    >
      {/* Left Content */}
      <Box
        sx={{
          pl: { xs: 0, md: 4 },
          zIndex: 1,
          color: "white",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        <Box display="flex" alignItems="center" mb={2} justifyContent={{ xs: "center", md: "flex-start" }}>
          <IconButton onClick={() => navigate("/")} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" sx={{ marginLeft: 1 }}>
            Back
          </Typography>
        </Box>
        <Typography component="h2" variant="h3" gutterBottom sx={{ fontWeight: "bold" }}>
          Create Your Account
        </Typography>
        <Typography variant="h6">
          Registration is quick and easy. Fill in the details below.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2,mb:5 }}>
          Already have an account?{" "}
          <Link
            component="button"
            onClick={() => navigate("/")}
            sx={{ color: "yellow", fontWeight: "bold" }}
          >
            Log in
          </Link>
        </Typography>
      </Box>

      {/* Form Container */}
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          transform: { xs: "none", md: "rotate(-10deg)" },
          right: { xs: "auto", md: "-50px" },
          bgcolor: "white",
          borderRadius: 4,
          p: 4,
          boxShadow: 4,
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <Box component="form" noValidate onSubmit={handleSignUp}>
          <div style={{ marginBottom: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: "#1976d2",
              }}
            >
              <PersonIcon style={{ marginRight: "8px" }} />
              Name
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              placeholder="Name"
              name="name"
              autoComplete="name"
              autoFocus
              sx={{ bgcolor: "white", borderRadius: 2 }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: "#1976d2",
              }}
            >
              <EmailIcon style={{ marginRight: "8px" }} />
              Email
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Email"
              name="email"
              autoComplete="email"
              sx={{ bgcolor: "white", borderRadius: 2 }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: "#1976d2",
              }}
            >
              <VpnKeyIcon style={{ marginRight: "8px" }} />
              Password
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: "white", borderRadius: 2 }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                color: "#1976d2",
              }}
            >
              <VpnKeyIcon style={{ marginRight: "8px" }} />
              Confirm Password
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: "white", borderRadius: 2 }}
            />
          </div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: "red",
              color: "white",
              borderRadius: 2,
              textTransform: "capitalize",
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Container>

      {/* Snackbar */}
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