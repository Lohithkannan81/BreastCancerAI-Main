import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { Icons } from '../constants';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get('email') || '';
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const particles = Array.from({ length: 8 }).map((_, i) => ({
        id: i, size: Math.random() * 40 + 15,
        x: Math.random() * 100, y: Math.random() * 100,
        duration: Math.random() * 15 + 10, delay: Math.random() * 5,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!email || !token) {
            setError('Invalid reset link');
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetPassword(email, token, newPassword);

            if (result) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4">
                <div className="max-w-md w-full glass-panel overflow-hidden fade-in p-10 text-center relative z-10 shadow-2xl border border-white/20">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm">
                        <Icons.Check size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Password Reset Successful!</h2>
                    <p className="text-slate-500 mb-6 font-light">Your security credentials have been successfully securely updated.</p>
                    <p className="text-xs text-slate-400 font-medium animate-pulse">Redirecting to login portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4 selection:bg-blue-500/30 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <motion.div key={p.id}
                        className="absolute rounded-full bg-blue-400/10 blur-xl"
                        style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                        animate={{ y: [0, -100, 0], opacity: [0.1, 0.25, 0.1] }}
                        transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                    />
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-panel overflow-hidden fade-in-up relative z-10 shadow-2xl border border-white/20"
                style={{ animationDuration: '0.8s' }}
            >
                <div className="p-10 border-b border-slate-100/50 relative overflow-hidden text-center bg-white/40 backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
                    <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 rotate-3 shadow-sm hover:rotate-0 transition-transform duration-500">
                        <Icons.Settings size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">Reset Password</h2>
                    <p className="text-slate-500 text-sm mt-3 font-light leading-relaxed">Enter your new secure clinical credentials below to regain access.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-white/40 backdrop-blur-md">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm fade-in"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">New Password</label>
                            <div className="relative">
                                <Icons.Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium pl-11 bg-white/60 focus:bg-white/90"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Confirm Password</label>
                            <div className="relative">
                                <Icons.Check className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium pl-11 bg-white/60 focus:bg-white/90"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Confirm Reset Update</span>
                                    <Icons.Check size={16} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full py-3 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-all hover:bg-slate-100/50 rounded-xl"
                        >
                            Cancel & Return to Login
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
