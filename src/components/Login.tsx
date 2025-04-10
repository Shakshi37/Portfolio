import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, User, Lock } from 'lucide-react';
import { api } from '../context/AuthContext';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode, toggleDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Animation class for elements
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login...');
      // Use the API instance that handles credentials
      const response = await api.post('/auth/login', { username, password });
      console.log('Login successful', response.data);
      
      // On successful login, call the onLogin function
      if (response.data.accessToken) {
        console.log('Auth token received, updating context...');
        // Pass both the token and user data to the context
        onLogin(response.data.accessToken, response.data.user);
        
        // Check if cookies are set
        console.log('Cookies should be set now');
        
        // Redirect to home page
        navigate('/');
      } else {
        // This should never happen if backend is working correctly
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Response:', error.response?.data);
      
      // Handle locked account scenario specifically
      if (error.response?.status === 403 && 
          error.response?.data?.message?.includes('locked')) {
        setError(`Your account is locked. ${error.response.data.message}`);
      } 
      // Handle invalid credentials
      else if (error.response?.status === 400) {
        setError('Invalid username or password');
      }
      // Handle other errors 
      else {
        setError(
          error.response?.data?.message || 
          error.message || 
          'An error occurred during login. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
        isDarkMode 
          ? 'from-gray-900 to-gray-800 text-white' 
          : 'from-blue-50 to-indigo-100 text-gray-900'
      } transition-colors duration-300`}
    >
      {/* Theme toggle button */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-3 rounded-full transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
        }`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div 
        className={`w-full max-w-md p-8 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-800 shadow-xl shadow-gray-900/30' 
            : 'bg-white shadow-xl shadow-indigo-200/40'
        } ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} 
        transition-all duration-500 transform mx-4`}
      >
        <div className="text-center mb-8">
          <div 
            className={`inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
            }`}
          >
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ST
            </div>
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Shakshi's Portfolio
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to explore my work and experience
          </p>
        </div>
        
        {error && (
          <div className={`p-4 mb-6 rounded-lg text-sm border ${
            isDarkMode 
              ? 'bg-red-900/30 border-red-800 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                id="username"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-500'
                }`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="Enter your username"
              />
            </div>
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-600 focus:border-blue-500'
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 