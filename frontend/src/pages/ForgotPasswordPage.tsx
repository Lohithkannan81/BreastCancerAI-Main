import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from '../services/authService';
import { Icons } from '../constants';
import { motion } from 'framer-motion';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4">
                <div className="max-w-md w-full glass-panel overflow-hidden fade-in p-10 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm">
                        <Icons.Check size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Check Your Email</h2>
                    <p className="text-slate-500 mb-6 font-light">
                        We've sent a secure password reset link to <span className="font-semibold text-slate-700">{email}</span>.
                        Please check your inbox (and spam folder) to proceed.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary w-full"
                    >
                        Back to Login
                    </button>
                    <p className="mt-6 text-xs text-slate-400">
                        Didn't receive the email? <button onClick={() => setSuccess(false)} className="text-blue-500 font-semibold hover:underline">Try again</button>
                    </p>
                </div>
            </div>
        );
    }

    const particles = Array.from({ length: 8 }).map((_, i) => ({
        id: i, size: Math.random() * 40 + 15,
        x: Math.random() * 100, y: Math.random() * 100,
        duration: Math.random() * 15 + 10, delay: Math.random() * 5,
    }));

    return (
        <div className="min-h-screen cinematic-gradient flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full glass-panel overflow-hidden relative z-10 shadow-2xl border border-white/20"
            >
                <div className="p-10 border-b border-slate-100/50 text-center relative overflow-hidden bg-white/40 backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
                    <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 rotate-3 shadow-sm hover:rotate-0 transition-transform duration-500">
                        <Icons.Settings size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">Reset Password</h2>
                    <p className="text-slate-500 text-sm mt-3 font-light leading-relaxed">
                        Enter your professional email address to receive a secure, one-time recovery link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-white/40 backdrop-blur-md">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                        >
                            <div className="flex gap-2">
                                <Icons.X size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        </motion.div>
                    )}

                    <div className="group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Email Address</label>
                        <div className="relative">
                            <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="doctor@medical.com"
                                className="input-premium pl-11 bg-white/60 focus:bg-white/90"
                            />
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
                                    <span>Send Security Link</span>
                                    <Icons.Check size={16} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full py-3 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-all hover:bg-slate-100/50 rounded-xl"
                        >
                            Return to Login
                        </button>
                    </div>
                </form>

                <div className="bg-slate-50/80 backdrop-blur-md p-6 text-center border-t border-slate-100/50">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Security Notice: Reset links are valid for 1 hour. <br />
                        If you didn't request this, please contact IT support.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
