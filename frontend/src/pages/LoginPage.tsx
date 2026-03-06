import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Icons } from '../constants';
import Mascot3D from '../components/Mascot3D';

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

  // Interactive UI State
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Generate random particles for background
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

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
    <div
      className="min-h-screen cinematic-gradient flex items-center justify-center p-4 selection:bg-blue-500/30 relative overflow-hidden"
    >
      {/* Animated Particles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-blue-400/10 blur-xl"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Subtle ambient glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* The Animated Mascot sits on top of the card! */}
        {!showForgotView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 z-20"
          >
            <Mascot3D
              isHiding={isPasswordVisible}
              isFloating={true}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`glass-panel overflow-hidden w-full ${!showForgotView ? 'mt-8' : ''} shadow-2xl border border-white/20`}
        >
          <div className="p-10 border-b border-slate-100/50 text-center relative overflow-hidden bg-white/40 backdrop-blur-md">
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
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">
                      Email
                    </label>
                    <div className="relative">
                      <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@medical.com"
                        className="input-premium pl-11 bg-white/60"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">
                      Password
                    </label>
                    <div className="relative">
                      <Icons.Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        required
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-premium pl-11 pr-11 bg-white/60 font-mono tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                        tabIndex={-1}
                      >
                        {isPasswordVisible ? <Icons.X size={16} /> : <Icons.Analysis size={16} />}
                      </button>
                    </div>
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

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 overflow-hidden relative group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="relative z-10">Sign In</span>
                      <Icons.Profile className="w-4 h-4 ml-1 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

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
                  <div className="relative">
                    <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="doctor@medical.com"
                      className="input-premium pl-11 bg-white/60"
                    />
                  </div>
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

          <div className="bg-slate-50/80 backdrop-blur-md p-6 text-center border-t border-slate-100/50">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account? <button onClick={onSignup} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1 decoration-blue-500/30 hover:underline underline-offset-4">Create one</button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
