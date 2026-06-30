import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Prevents anonymous users from seeing chat screens
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Prevents logged-in users from seeing Auth screens
const AuthRoute = ({ children }) => {
  const { authUser } = useAuth();
  if (authUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;