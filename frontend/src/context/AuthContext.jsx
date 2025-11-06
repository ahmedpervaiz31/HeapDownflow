import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );
  
  // User is now null by default, not from token
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const authApiBaseUrl = 'http://localhost:8000/api/v1/auth';
  const apiBaseUrl = 'http://localhost:8000/api/v1';

  // New function to fetch user profile
  const fetchUserProfile = async (tokens) => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access}`,
        },
      });
      const data = await response.json();
      if (response.status === 200) {
        setUser(data); // Set the full user object
        localStorage.setItem('user', JSON.stringify(data)); // Store it
      } else {
        // Fallback or handle error
        setUser(jwtDecode(tokens.access)); 
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setUser(jwtDecode(tokens.access)); // Fallback to token payload
    }
  };

  const loginUser = async (username, password) => {
    try {
      const response = await fetch(`${authApiBaseUrl}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.status === 200) {
        setAuthTokens(data);
        localStorage.setItem('authTokens', JSON.stringify(data));
        
        // Instead of decoding token, fetch the full profile
        await fetchUserProfile(data); 

        navigate('/');
      } else {
        alert('Login failed: ' + (data.detail || 'Wrong username or password.'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  const registerUser = async (username, password, password2) => {
    try {
      const response = await fetch(`${authApiBaseUrl}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, password2 }),
      });

      if (response.status === 201) {
        await loginUser(username, password);
      } else {
        const data = await response.json();
        alert('Registration failed: ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration.');
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('user'); // Also remove user from storage
    navigate('/login');
  };

  // New effect to load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (authTokens && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Done loading
  }, [authTokens]);

  const contextData = {
    user: user,
    authTokens: authTokens,
    loginUser: loginUser,
    logoutUser: logoutUser,
    registerUser: registerUser,
  };

  // Only render children when not in initial loading state
  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

