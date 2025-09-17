import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Github, Twitter } from 'lucide-react';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // New state for forgot password view
  const [emailForReset, setEmailForReset] = useState(''); // New state for reset email
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuth(); // Get the new function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error: authError } = isSignUp
      ? await signUp(username, password)
      : await signIn(username, password);

    if (authError) {
      setError(authError.message);
    } else {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(authError.message);
    } else {
      onClose();
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error: resetError } = await resetPassword(emailForReset);

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Password reset link sent! Please check your email.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isForgotPassword ? 'Forgot Password' : (isSignUp ? 'Create Account' : 'Sign In')}
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm mb-4">
            {message}
          </div>
        )}

        {isForgotPassword ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="email"
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Reset Link
            </button>
            <p className="mt-6 text-center text-sm text-gray-600">
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setMessage(null);
                }}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Back to Sign In
              </button>
            </p>
          </form>
        ) : (
          <>
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 9.5C27.016 9.5 29.845 10.518 32.18 12.359L38.455 6.084C34.61 2.454 29.508 0.5 24 0.5C15.421 0.5 8.163 4.546 4.095 11.233L10.957 15.657C12.98 12.378 17.585 9.5 24 9.5Z" fill="#EA4335"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M4.095 11.233C4.095 11.233 4.095 11.233 4.095 11.233V11.233L4.095 11.233L4.095 11.233Z" fill="url(#paint0_linear_98_38)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M43.784 20.627C43.784 19.349 43.684 18.09 43.468 16.852H24V24.5H35.876C35.253 28.026 33.242 31.066 30.36 33.003L37.16 37.33C41.341 33.52 43.784 27.973 43.784 20.627Z" fill="#4285F4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10.957 15.657L4.095 11.233C2.88 13.916 2.057 16.828 2.057 19.866C2.057 23.364 2.894 26.657 4.398 29.627L11.393 25.103C10.021 22.148 9.5 19.066 9.5 15.657H10.957Z" fill="#34A853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M30.36 33.003C28.409 34.256 26.241 35.155 24 35.155C17.585 35.155 12.02 32.485 8.165 28.188L1.365 32.515C5.433 39.202 12.691 43.248 24 43.248C30.358 43.248 35.792 41.246 39.86 37.568L30.36 33.003Z" fill="#FBBC04"/>
                <defs>
                  <linearGradient id="paint0_linear_98_38" x1="4.095" y1="11.233" x2="4.095" y2="11.233" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F9F9F9"/>
                    <stop offset="1" stopColor="#E4E4E4"/>
                  </linearGradient>
                </defs>
              </svg>
              Sign in with Google
            </button>

            <div className="relative flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
              
              <p className="mt-4 text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Forgot Password?
                </button>
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="text-blue-500 hover:text-blue-600 ml-1 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}