import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { Icons } from '../constants';

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
                }, 3000); // 3 seconds to let the user breathe
            } else {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        } catch (err: any) {
            console.error('Reset error:', err);
            setError('System error resetting password. Please try again.');
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
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Password Reset Successful!</h2>
                    <p className="text-slate-500 mb-6 font-light">Your security credentials have been successfully securely updated.</p>
                    <p className="text-xs text-slate-400 font-medium animate-pulse">Redirecting to login portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="max-w-md w-full glass-panel overflow-hidden fade-in-up" style={{ animationDuration: '0.8s' }}>
                <div className="p-10 border-b border-slate-100 relative overflow-hidden text-center bg-white/40">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">Reset Password</h2>
                    <p className="text-slate-500 text-sm mt-3 font-light">Enter your new secure credentials below.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6 bg-white/40">
                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm fade-in">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">New Password</label>
                            <input
                                required
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-premium"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Confirm Password</label>
                            <input
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-premium"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Confirm Reset Update'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors mt-4"
                    >
                        Cancel & Return to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
