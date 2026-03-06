import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoogleLogin, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotView, setShowForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setForgotSuccess('');

    try {
      const { sendPasswordResetEmail } = await import('../services/authService');
      await sendPasswordResetEmail(forgotEmail);
      setForgotSuccess(`Reset link sent to ${forgotEmail}! Check your email (or console).`);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-md w-full glass-panel overflow-hidden fade-in-up" style={{ animationDuration: '0.8s' }}>
        <div className="p-10 border-b border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">
            {showForgotView ? 'Reset Password' : 'Welcome back.'}
          </h2>
          <p className="text-slate-500 text-sm mt-3 font-light">
            {showForgotView
              ? 'Enter your email to receive a secure reset link'
              : 'Enter your credentials to access the clinical portal.'}
          </p>
        </div>

        <div className="p-10 bg-white/40">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 fade-in">
              {error}
            </div>
          )}

          {forgotSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-6 fade-in">
              {forgotSuccess}
            </div>
          )}

          {!showForgotView ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@medical.com"
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/50 transition-colors" />
                  <span className="text-sm text-slate-500 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotView(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Sign In'}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Or</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    if (credentialResponse.credential) {
                      onGoogleLogin(credentialResponse.credential).then(res => {
                        if (!res.success) {
                          setError(res.error || 'Google Login failed');
                        }
                      });
                    }
                  }}
                  onError={() => {
                    setError('Google Login window closed or failed');
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="continue_with"
                  width="100%"
                />
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="doctor@medical.com"
                  className="input-premium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotView(false);
                    setError('');
                    setForgotSuccess('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-[2]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-slate-50/80 backdrop-blur-md p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account? <button onClick={onSignup} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1">Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
