// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Pages and Components
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignupPage';
import Dashboard from './pages/DashBoard';
import ProtectedRoute from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import MyDiaryPage from './components/Mydiary';
import Public from './components/Public';
import NotificationsPopup from './components/Notifications';
import CloseCircle from './components/Closecircle';
import useUserStore from './stores/userdetails';
import MyProfile from './components/Myprofile';
import ResetPassword from './pages/resetpassword';
import ForgotPassword from './pages/forgotPassword';
import OAuthSuccess from './pages/oauthsuccess';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const setUserId = useUserStore((state) => state.setUserId);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.data) {
            setUserId(response.data._id);
          } else {
            console.error('Failed to fetch user data:', response.data.message);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUser();

    // Listen for token changes across tabs and within the app
    const syncToken = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, [setUserId]);

  return (
    <ChakraProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Redirect root path based on token presence */}
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

          {/* Public Routes */}
          <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!token ? <SignUpPage /> : <Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Additional Routes */}
          <Route path="/close-circle" element={<CloseCircle />} />
          <Route path="/public/:userId" element={<Public />} />
          <Route path="/my-diary" element={<MyDiaryPage />} />
          <Route path="/notifications" element={<NotificationsPopup />} />
          <Route path="/me" element={<MyProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
