/**
 * LoginPage.tsx
 * Layout: [Left: 2 mascots] [Center: Card] [Right: 1 mascot]
 * All mascots are pure CSS divs — no SVG, no images.
 *
 * Three color variants:
 *  • Yellow  (Buddy)  — left top
 *  • Teal    (Scout)  — left bottom
 *  • Pink    (Luna)   — right center
 *
 * All 6 pupils track the mouse independently.
 * All 3 mascots react to email/password focus and show/hide toggle.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Icons } from '../constants';
import '../mascot.css';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: () => void;
}

/* ─────────────────────────────────────────────────────────────
   Reusable CSSMascot component
   Each variant gets a colorClass ('yellow' | 'teal' | 'pink')
   and a name label. Pupil elements are identified by data-id
   so the shared tracking loop can query all of them at once.
───────────────────────────────────────────────────────────── */
interface MascotProps {
  colorClass: 'yellow' | 'teal' | 'pink';
  name: string;
  stateClass: string;
  mascotId: string; // unique id prefix for pupil elements
}

const CSSMascot: React.FC<MascotProps> = ({ colorClass, name, stateClass, mascotId }) => (
  <div className="mascot-wrap">
    <div className={`mascot-body ${colorClass} ${stateClass}`}>

      {/* Antenna */}
      <div className="mascot-antenna">
        <div className="mascot-antenna-ball" />
      </div>

      {/* Eyebrows */}
      <div className="mascot-eyebrow left" />
      <div className="mascot-eyebrow right" />

      {/* Left eye */}
      <div className="mascot-eye left">
        <div className="mascot-eyelid" />
        <div className="mascot-pupil" data-mascot={mascotId}>
          <div className="mascot-pupil-shine" />
        </div>
      </div>

      {/* Right eye */}
      <div className="mascot-eye right">
        <div className="mascot-eyelid" />
        <div className="mascot-pupil" data-mascot={mascotId}>
          <div className="mascot-pupil-shine" />
        </div>
      </div>

      {/* Blush */}
      <div className="mascot-blush left" />
      <div className="mascot-blush right" />

      {/* Mouth */}
      <div className="mascot-mouth">
        <div className="mascot-mouth-inner" />
      </div>

      {/* Stethoscope */}
      <div className="mascot-steth">
        <div className="mascot-steth-tube" />
        <div className="mascot-steth-head" />
      </div>

      {/* Arms */}
      <div className="mascot-arm left"><div className="mascot-hand" /></div>
      <div className="mascot-arm right"><div className="mascot-hand" /></div>
    </div>

    <p className="mascot-tag">{name}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main LoginPage
───────────────────────────────────────────────────────────── */
const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoogleLogin, onSignup }) => {
  const [isLoading, setIsLoading]       = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [showForgotView, setShowForgotView] = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Single shared stateClass for all 3 mascots — they react together
  const [mascotState, setMascotState] = useState('');
  const pupilsLockedRef = useRef(false);

  /* ── Shared pupil tracking ────────────────────────────────
     We query ALL .mascot-pupil elements on the page and move
     each one relative to its own eye socket center.
  ─────────────────────────────────────────────────────────── */
  const MAX_OFFSET = 8;

  const moveAllPupils = useCallback((cursorX: number, cursorY: number) => {
    const all = document.querySelectorAll<HTMLElement>('.mascot-pupil');
    all.forEach(pupil => {
      const socket = pupil.closest('.mascot-eye') as HTMLElement;
      if (!socket) return;
      const r = socket.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const angle = Math.atan2(cursorY - cy, cursorX - cx);
      const dist  = Math.min(MAX_OFFSET, Math.hypot(cursorX - cx, cursorY - cy) / 12);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      pupil.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (pupilsLockedRef.current) return;
      moveAllPupils(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [moveAllPupils]);

  /* Lock all pupils to a fixed offset (smooth) */
  const lockGaze = (dx: number, dy: number) => {
    pupilsLockedRef.current = true;
    const t = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    document.querySelectorAll<HTMLElement>('.mascot-pupil').forEach(p => {
      p.style.transition = 'transform 0.4s cubic-bezier(0.25,1,0.5,1)';
      p.style.transform = t;
    });
  };
  const unlockGaze = () => {
    pupilsLockedRef.current = false;
    document.querySelectorAll<HTMLElement>('.mascot-pupil').forEach(p => {
      p.style.transition = 'transform 0.07s ease-out';
    });
  };

  /* ── Field handlers ───────────────────────────────────────── */
  const onEmailFocus = () => { setMascotState('curious'); lockGaze(6, 3); };
  const onEmailBlur  = () => { setMascotState(''); unlockGaze(); };
  const onPassFocus  = () => { setMascotState('shy'); lockGaze(-8, -5); };
  const onPassBlur   = () => {
    if (!isPasswordVisible) { setMascotState(''); unlockGaze(); }
  };

  /* ── Toggle password ─────────────────────────────────────── */
  const togglePassword = () => {
    const next = !isPasswordVisible;
    setIsPasswordVisible(next);
    if (next) { setMascotState('cover-eyes shy'); lockGaze(0, 0); }
    else       { setMascotState(''); unlockGaze(); }
  };

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const res = await onLogin(email, password);
      if (!res.success) setError(res.error || 'Invalid email or password');
    } catch { setError('An unexpected error occurred.'); }
    finally   { setIsLoading(false); }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) { setError('Please enter a valid email address'); return; }
    setIsLoading(true); setError(''); setForgotSuccess('');
    try {
      const { sendPasswordResetEmail } = await import('../services/authService');
      await sendPasswordResetEmail(forgotEmail);
      setForgotSuccess(`Reset link sent to ${forgotEmail}! Check your email.`);
    } catch (err: any) { setError(err.message || 'Failed to send reset email.'); }
    finally { setIsLoading(false); }
  };

  // Background particles
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4 selection:bg-blue-500/30 relative overflow-hidden">

      {/* Background particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <motion.div key={p.id}
            className="absolute rounded-full bg-blue-400/10 blur-xl"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y:[0,-100,0], x:[0, Math.random()*50-25,0], opacity:[0.1,0.3,0.1] }}
            transition={{ duration:p.duration, repeat:Infinity, delay:p.delay, ease:'easeInOut' }}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>

      {/* ── Three-column layout ────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-center gap-8 w-full"
        style={{ maxWidth: 900 }}
      >

        {/* LEFT column — 2 mascots stacked */}
        {!showForgotView && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col items-center gap-8"
          >
            <CSSMascot
              colorClass="yellow"
              name="Buddy"
              stateClass={mascotState}
              mascotId="m1"
            />
            <CSSMascot
              colorClass="teal"
              name="Scout"
              stateClass={mascotState}
              mascotId="m2"
            />
          </motion.div>
        )}

        {/* CENTER — Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="glass-panel overflow-hidden shadow-2xl border border-white/20 flex-shrink-0"
          style={{ width: 400 }}
        >
          <div className="p-10 border-b border-slate-100/50 text-center relative overflow-hidden bg-white/40 backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 fade-in">{error}</div>
            )}
            {forgotSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-6 fade-in">{forgotSuccess}</div>
            )}

            {!showForgotView ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">

                  {/* Email */}
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Email</label>
                    <div className="relative">
                      <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        required type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={onEmailFocus} onBlur={onEmailBlur}
                        placeholder="doctor@medical.com"
                        className="input-premium pl-11 bg-white/60"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Password</label>
                    <div className="relative">
                      <Icons.Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input
                        required type={isPasswordVisible ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={onPassFocus} onBlur={onPassBlur}
                        placeholder="••••••••"
                        className="input-premium pl-11 pr-11 bg-white/60 font-mono tracking-wider"
                      />
                      <button type="button" onClick={togglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors text-base"
                        tabIndex={-1} aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      >
                        {isPasswordVisible ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/50" />
                    <span className="text-sm text-slate-500 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
                  </label>
                  <button type="button" onClick={() => setShowForgotView(true)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <motion.button type="submit" disabled={isLoading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2 overflow-hidden relative group">
                  {isLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span className="relative z-10">Sign In</span><Icons.Profile className="w-4 h-4 ml-1 relative z-10 group-hover:translate-x-1 transition-transform" /></>
                  }
                </motion.button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Or</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={r => { if (r.credential) onGoogleLogin(r.credential).then(res => { if (!res.success) setError(res.error || 'Google Login failed'); }); }}
                    onError={() => setError('Google Login window closed or failed')}
                    useOneTap theme="outline" size="large" text="continue_with" width="100%"
                  />
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                  <div className="relative">
                    <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="email" value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="doctor@medical.com" className="input-premium pl-11 bg-white/60" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button"
                    onClick={() => { setShowForgotView(false); setError(''); setForgotSuccess(''); }}
                    className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={isLoading} className="btn-primary flex-[2]">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-slate-50/80 backdrop-blur-md p-6 text-center border-t border-slate-100/50">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{' '}
              <button onClick={onSignup} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1 decoration-blue-500/30 hover:underline underline-offset-4">
                Create one
              </button>
            </p>
          </div>
        </motion.div>

        {/* RIGHT column — 1 mascot centered */}
        {!showForgotView && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col items-center justify-center"
          >
            <CSSMascot
              colorClass="pink"
              name="Luna"
              stateClass={mascotState}
              mascotId="m3"
            />
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
