// src/pages/OAuthSuccess.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse token from URL query params
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      // Redirect to dashboard or wherever you want
      navigate('/dashboard', { replace: true });
    } else {
      // No token found, redirect to login or show error
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Logging you in...</div>;
}
