import { createContext, useState, useEffect, useContext } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { REST_API } from "../config/defaultValues";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifies session actively by pinging the backend authMe hook
  const checkAuth = async () => {
    try {
      const response = await fetch(`${REST_API}/auth/me`, {
        credentials: "include", // Very important! Ships the HTTPOnly cookie automatically.
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        setAuthUser(data.user);
      } else {
        setAuthUser(null);
      }
    } catch (err) {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${REST_API}/logout`, {
        method: "POST",
        credentials: "include" // Send cookie back to violently invalidate it
      });
      setAuthUser(null);
    } catch (err) {
      console.error("Logout err:", err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Show a generic app-wide loader while resolving session details over the network
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
         <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
