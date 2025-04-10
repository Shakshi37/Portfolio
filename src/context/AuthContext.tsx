import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// Configure axios instance with better credentials support
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Required for cookies to be sent and received
  headers: {
    'Content-Type': 'application/json'
  }
});

// For debugging - log all requests and responses
api.interceptors.request.use(
  request => {
    console.log('Request:', {
      url: request.url,
      method: request.method,
      withCredentials: request.withCredentials
    });
    return request;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set up interceptor to handle token expiration
  useEffect(() => {
    let isRefreshing = false;
    let failedQueue: any[] = [];

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };

    // Response interceptor to handle 401 responses (token expired)
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If error is not 401 or the request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // Prevent multiple concurrent refresh token requests
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('Attempting to refresh token...');
          // Call refresh endpoint to get a new access token
          const refreshResponse = await api.post('/auth/refresh', {}, {
            withCredentials: true // Ensure cookies are sent
          });
          
          const { accessToken } = refreshResponse.data;
          console.log('Token refreshed successfully');
          
          // Update auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          // Process any queued requests
          processQueue(null, accessToken);
          
          // Return original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Process failed queue
          processQueue(refreshError, null);
          
          // Clear auth state
          setIsAuthenticated(false);
          setUser(null);
          setError('Session expired. Please log in again.');
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );

    // Clean up interceptor on component unmount
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Verify token on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setLoading(true);
        
        // Verify auth status by calling the verify endpoint 
        // This will work with HttpOnly cookies set by the backend
        const response = await api.get('/auth/verify');
        
        if (response.status === 200) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    
    // Set default auth header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Clear any previous errors
    setError(null);
    
    console.log('Login successful, auth state updated', { user: userData.username });
    
    // Verify cookies were set properly by checking a protected endpoint
    try {
      const verifyResponse = await api.get('/auth/verify');
      console.log('Auth verification after login:', verifyResponse.data);
    } catch (error) {
      console.warn('Auth verification after login failed:', error);
      // Don't set error state here - we just want to log for debugging
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear cookies on the server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state regardless of server response
      setIsAuthenticated(false);
      setUser(null);
      
      // Remove auth header
      delete api.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export the API instance for use in components
export { api }; 