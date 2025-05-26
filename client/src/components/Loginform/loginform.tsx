import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Container,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const user = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();
      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        
        setSnackbarMessage("Login successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => {
          navigate("/chats");
        }, 1000);
      } else {
        setSnackbarMessage(result.message || "Login failed. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setSnackbarMessage("Failed to log in. Try again later.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
    margin: "-8px",
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
    <Typography component="h2" variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
      Welcome To ChatFlow
    </Typography>
    <Typography variant="h6" sx={{mb:5}}>Log in to continue your journey.</Typography>
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
    {/* <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ color: "#1976d2" }}>
      Log In to ChatFlow
    </Typography> */}
    <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 2 }}>
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
        placeholder="example@gmail.com"
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
        autoComplete="current-password"
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
        Log In
      </Button>
       <Typography variant="body2" align="center" color="black" gutterBottom>
              Or
            </Typography>
            <Typography variant="body2" align="center" color="black">
              Don’t have an account?{" "}
      <Link
        component="button"
        onClick={() => navigate("/signup")}
        sx={{ marginTop:"-5px", fontSize:"15px"}}
      >
        Sign Up
      </Link>
    </Typography>
    </Box>
  </Container>

  {/* Snackbar */}
  <Snackbar
    open={snackbarOpen}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  >
    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
      {snackbarMessage}
    </Alert>
  </Snackbar>
</Box>

  );
};

export default LoginForm;