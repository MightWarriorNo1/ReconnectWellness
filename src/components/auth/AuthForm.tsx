import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function AuthForm({ onSuccess, onBack }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  // Check for email confirmation on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const accessToken = urlParams.get('access_token');
    
    if (type === 'signup' && accessToken) {
      // Email confirmed, show login form
      setIsLogin(true);
      setShowEmailConfirmation(false);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password confirmation for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password, formData.fullName);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        if (!isLogin) {
          // Show email confirmation message for signup
          setUserEmail(formData.email);
          setShowEmailConfirmation(true);
        } else {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleBackToLogin = () => {
    setShowEmailConfirmation(false);
    setIsLogin(true);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
    });
    setError('');
  };

  // Show email confirmation screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Check Your Email
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a confirmation link to:
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
            <p className="font-medium text-gray-900 dark:text-white">
              {userEmail}
            </p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Click the confirmation link in your email to activate your account, then return here to sign in.
          </p>
          
          <button
            onClick={handleBackToLogin}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Sign In
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reconnect
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Welcome back' : 'Start your journey'}
          </p>
        </div>

        {error && (
          <motion.div
            className="bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-3 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    !isLogin && formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>
          )}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData(prev => ({ ...prev, confirmPassword: '' }));
              setError('');
            }}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}