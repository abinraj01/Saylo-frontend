import { Box, Button, TextField, Typography, Link as MuiLink, InputAdornment, IconButton, useTheme, Divider, Alert, CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be 50 characters or less")
        .required("Name is required"),
      email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        const response = await fetch("http://localhost:4000/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Failed to create account");
        }

        // Success! Redirect to login page
        navigate("/login", { state: { message: "Account created successfully! Please log in." } });
      } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Left Side - Image Cover */}
      <Box 
        sx={{ 
          flex: 1, 
          display: { xs: "none", md: "flex" }, 
          position: "relative",
          bgcolor: "#1a1a2e"
        }}
      >
        <Box 
          component="img" 
          src="/login_cover.png" 
          alt="Cover" 
          sx={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, transform: "scaleX(-1)" }} 
        />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)" }} />
        
        <Box sx={{ position: "relative", zIndex: 1, p: 6, display: "flex", flexDirection: "column", height: "100%", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img src="/logo.svg" alt="Saylo Logo" style={{ width: 40, height: 40, filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }} />
            <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: "-0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Saylo.
            </Typography>
          </Box>
          
          <Box sx={{ mt: "auto", maxWidth: 480 }}>
            <Typography variant="h3" fontWeight="bold" mb={2} sx={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Start your journey <br/> today.
            </Typography>
            <Typography variant="h6" fontWeight="400" sx={{ opacity: 0.9, lineHeight: 1.6, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Join thousands of communities connecting on the absolute best messaging experience built for modern creators.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Register Form */}
      <Box 
        sx={{ 
          flex: { xs: 1, md: 0.8, lg: 0.6 }, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          bgcolor: "background.paper",
          p: 4,
          maxHeight: "100vh",
          overflowY: "auto"
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Logo specifically for mobile view */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 6 }}>
            <img src="/logo.svg" alt="Saylo Logo" style={{ width: 40, height: 40 }} />
            <Typography variant="h5" fontWeight="900" sx={{
              background: theme.palette.mode === "dark" 
                ? "-webkit-linear-gradient(45deg, #a8c0ff 30%, #3f2b96 90%)"
                : "-webkit-linear-gradient(45deg, #4A00E0 30%, #8E2DE2 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Saylo
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="800" mb={1} sx={{ letterSpacing: "-0.5px" }}>
              Sign up
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a free account to get started.
            </Typography>
          </Box>

          {/* Display Error Message if Registration Fails */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: "100%" }}>
            
            <Typography variant="body2" fontWeight="600" mb={1}>Name</Typography>
            <TextField 
              fullWidth 
              id="name"
              name="name"
              placeholder="Enter your name" 
              variant="outlined" 
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#f9fafb", '& fieldset': { borderColor: theme.palette.divider } }
              }}
              sx={{ mb: 3 }}
            />

            <Typography variant="body2" fontWeight="600" mb={1}>Email</Typography>
            <TextField 
              fullWidth 
              id="email"
              name="email"
              placeholder="Enter your email" 
              variant="outlined" 
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#f9fafb", '& fieldset': { borderColor: theme.palette.divider } }
              }}
              sx={{ mb: 3 }}
            />

            <Typography variant="body2" fontWeight="600" mb={1}>Password</Typography>
            <TextField 
              fullWidth 
              id="password"
              name="password"
              placeholder="Create a password" 
              type={showPassword ? "text" : "password"} 
              variant="outlined" 
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#f9fafb", '& fieldset': { borderColor: theme.palette.divider } },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              disableElevation
              disabled={formik.isSubmitting}
              sx={{ 
                py: 1.5, 
                borderRadius: 2.5, 
                fontWeight: 700, 
                textTransform: "none", 
                fontSize: "1rem",
                bgcolor: theme.palette.mode === "dark" ? "#a8c0ff" : "#4A00E0",
                color: theme.palette.mode === "dark" ? "#000" : "#fff",
                transition: "transform 0.2s",
                '&:hover': {
                    bgcolor: theme.palette.mode === "dark" ? "#b5cbff" : "#3b00b3",
                    transform: "translateY(-1px)",
                }
              }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Get started"}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Button 
              fullWidth 
              variant="outlined" 
              size="large" 
              startIcon={<GoogleIcon />}
              disabled={formik.isSubmitting}
              sx={{ 
                py: 1.2, 
                borderRadius: 2.5, 
                fontWeight: 600, 
                textTransform: "none", 
                fontSize: "1rem",
                color: "text.primary",
                borderColor: theme.palette.divider,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                  borderColor: theme.palette.text.primary,
                }
              }}
            >
              Sign up with Google
            </Button>
          </Box>

          <Typography textAlign="center" variant="body2" color="text.secondary" mt={5}>
            Already have an account?{" "}
            <MuiLink component={Link} to="/login" underline="none" color="primary.main" fontWeight="600">
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}