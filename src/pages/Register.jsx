import { Box, Button, TextField, Typography, Link as MuiLink, InputAdornment, IconButton, useTheme, Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";

export default function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/");
  };

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

          <Box component="form" onSubmit={handleRegister} sx={{ width: "100%" }}>
            
            <Typography variant="body2" fontWeight="600" mb={1}>Name</Typography>
            <TextField 
              fullWidth 
              placeholder="Enter your name" 
              variant="outlined" 
              required 
              InputProps={{
                sx: { borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#f9fafb", '& fieldset': { borderColor: theme.palette.divider } }
              }}
              sx={{ mb: 3 }}
            />

            <Typography variant="body2" fontWeight="600" mb={1}>Email</Typography>
            <TextField 
              fullWidth 
              placeholder="Enter your email" 
              variant="outlined" 
              required 
              type="email"
              InputProps={{
                sx: { borderRadius: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#f9fafb", '& fieldset': { borderColor: theme.palette.divider } }
              }}
              sx={{ mb: 3 }}
            />

            <Typography variant="body2" fontWeight="600" mb={1}>Password</Typography>
            <TextField 
              fullWidth 
              placeholder="Create a password" 
              type={showPassword ? "text" : "password"} 
              variant="outlined" 
              required 
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
              Get started
            </Button>

            {/* <Button 
              fullWidth 
              variant="outlined" 
              size="large" 
              startIcon={<GoogleIcon />}
              sx={{ 
                mt: 2,
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
            </Button> */}
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