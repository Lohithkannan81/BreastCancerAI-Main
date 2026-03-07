/**
 * LoginPage.tsx
 * Layout:
 *        [🤖 Robot  — top center]
 *  [🐹 Hamster]  [Login Card]  [👻 Ghost]
 *
 * All mascots are pure CSS divs (no SVG, no images).
 * Pupils on all 3 track the mouse independently.
 * All 3 react together to form input focus / show-password events.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import '../mascot.css';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: () => void;
}

/* ─────────────────────────────────────────────────────────────
   Shared pupil tracking helper
   Finds every .mascot-pupil and moves each based on its socket center.
───────────────────────────────────────────────────────────── */
const MAX_OFFSET = 8;
function moveAllPupils(cx: number, cy: number) {
  document.querySelectorAll<HTMLElement>('.mascot-pupil').forEach(pupil => {
    const socket = pupil.closest('.robot-eye,.hamster-eye,.ghost-eye') as HTMLElement;
    if (!socket) return;
    const r = socket.getBoundingClientRect();
    const sx = r.left + r.width / 2;
    const sy = r.top + r.height / 2;
    const angle = Math.atan2(cy - sy, cx - sx);
    const dist = Math.min(MAX_OFFSET, Math.hypot(cx - sx, cy - sy) / 12);
    pupil.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
  });
}
function lockAllPupils(dx: number, dy: number) {
  document.querySelectorAll<HTMLElement>('.mascot-pupil').forEach(p => {
    p.style.transition = 'transform 0.4s cubic-bezier(0.25,1,0.5,1)';
    p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  });
}
function unlockAllPupils() {
  document.querySelectorAll<HTMLElement>('.mascot-pupil').forEach(p => {
    p.style.transition = 'transform 0.07s ease-out';
  });
}

/* ─────────────────────────────────────────────────────────────
   🤖 ROBOT MASCOT  (top)
───────────────────────────────────────────────────────────── */
const RobotMascot: React.FC<{ s: string }> = ({ s }) => (
  <div className="mascot-wrap">
    <div className={`robot-body ${s}`}>
      <div className="robot-antenna" />
      <div className="robot-eyebrow left" />
      <div className="robot-eyebrow right" />
      <div className="robot-eye left">
        <div className="robot-eyelid" />
        <div className="mascot-pupil">
          <div className="mascot-pupil-shine" />
        </div>
      </div>
      <div className="robot-eye right">
        <div className="robot-eyelid" />
        <div className="mascot-pupil">
          <div className="mascot-pupil-shine" />
        </div>
      </div>
      <div className="robot-mouth">
        <div className="robot-mouth-bar" />
        <div className="robot-mouth-bar" />
        <div className="robot-mouth-bar" />
      </div>
      <div className="robot-steth">
        <div className="robot-steth-tube" />
        <div className="robot-steth-head" />
      </div>
      <div className="robot-arm left"><div className="robot-hand" /></div>
      <div className="robot-arm right"><div className="robot-hand" /></div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   🐹 HAMSTER MASCOT  (left)
───────────────────────────────────────────────────────────── */
const HamsterMascot: React.FC<{ s: string }> = ({ s }) => (
  <div className="mascot-wrap hamster-wrap">
    <div className="hamster-ear left" />
    <div className="hamster-ear right" />
    <div className={`hamster-body ${s}`}>
      <div className="hamster-eyebrow left" />
      <div className="hamster-eyebrow right" />
      <div className="hamster-eye left">
        <div className="hamster-eyelid" />
        <div className="mascot-pupil">
          <div className="hamster-pupil-shine mascot-pupil-shine" />
        </div>
      </div>
      <div className="hamster-eye right">
        <div className="hamster-eyelid" />
        <div className="mascot-pupil">
          <div className="hamster-pupil-shine mascot-pupil-shine" />
        </div>
      </div>
      <div className="hamster-cheek left" />
      <div className="hamster-cheek right" />
      <div className="hamster-nose" />
      <div className="hamster-mouth"><div className="hamster-mouth-inner" /></div>
      <div className="hamster-steth">
        <div className="hamster-steth-tube" />
        <div className="hamster-steth-head" />
      </div>
      <div className="hamster-arm left"><div className="hamster-hand" /></div>
      <div className="hamster-arm right"><div className="hamster-hand" /></div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   👻 GHOST MASCOT  (right)
───────────────────────────────────────────────────────────── */
const GhostMascot: React.FC<{ s: string }> = ({ s }) => (
  <div className="mascot-wrap">
    <div className={`ghost-body ${s}`}>
      <div className="ghost-brow-glow left" />
      <div className="ghost-brow-glow right" />
      <div className="ghost-eye left">
        <div className="ghost-eyelid" />
        <div className="mascot-pupil">
          <div className="ghost-pupil-shine mascot-pupil-shine" />
        </div>
      </div>
      <div className="ghost-eye right">
        <div className="ghost-eyelid" />
        <div className="mascot-pupil">
          <div className="ghost-pupil-shine mascot-pupil-shine" />
        </div>
      </div>
      <div className="ghost-mouth" />
      <div className="ghost-steth">
        <div className="ghost-steth-tube" />
        <div className="ghost-steth-head" />
      </div>
      <div className="ghost-wave-row">
        <div className="ghost-wave" />
        <div className="ghost-wave" />
        <div className="ghost-wave" />
        <div className="ghost-wave" />
      </div>
      <div className="ghost-arm left" />
      <div className="ghost-arm right" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Main LoginPage
───────────────────────────────────────────────────────────── */
const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoogleLogin, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [mascotState, setMascotState] = useState(''); // shared class for all mascots
  const pupilsLockedRef = React.useRef(false);
  const navigate = useNavigate();

  /* Mouse tracking */
  const onMove = useCallback((e: MouseEvent) => {
    if (pupilsLockedRef.current) return;
    moveAllPupils(e.clientX, e.clientY);
  }, []);
  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [onMove]);

  const lock = (dx: number, dy: number) => { pupilsLockedRef.current = true; lockAllPupils(dx, dy); };
  const unlock = () => { pupilsLockedRef.current = false; unlockAllPupils(); };

  /* Field handlers */
  const onEmailFocus = () => { setMascotState('curious'); lock(6, 3); };
  const onEmailBlur = () => { setMascotState(''); unlock(); };
  const onPassFocus = () => { setMascotState('shy'); lock(-8, -5); };
  const onPassBlur = () => { if (!isPasswordVisible) { setMascotState(''); unlock(); } };

  const togglePassword = () => {
    const next = !isPasswordVisible;
    setIsPasswordVisible(next);
    if (next) { setMascotState('cover-eyes shy'); lock(0, 0); }
    else { setMascotState(''); unlock(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const res = await onLogin(email, password);
      if (!res.success) setError(res.error || 'Invalid email or password');
    } catch { setError('An unexpected error occurred.'); }
    finally { setIsLoading(false); }
  };

  const particles = Array.from({ length: 10 }).map((_, i) => ({
    id: i, size: Math.random() * 55 + 18,
    x: Math.random() * 100, y: Math.random() * 100,
    duration: Math.random() * 10 + 10, delay: Math.random() * 5,
  }));

  const s = mascotState; // shorthand

  return (
    <div className="min-h-screen cinematic-gradient flex items-center justify-center p-6 selection:bg-indigo-500/30 relative overflow-hidden">

      {/* Background particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <motion.div key={p.id}
            className="absolute rounded-full bg-indigo-400/10 blur-xl"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ y: [0, -80, 0], opacity: [0.1, 0.28, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-[90px]" />
      </div>

      {/* ── Outer flex column: top mascot row + main row ── */}
      <div className="relative z-10 flex flex-col items-center gap-6" style={{ maxWidth: 900, width: '100%' }}>

        {/* TOP ROW — Robot mascot (centered above card) */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <RobotMascot s={s} />
        </motion.div>

        {/* MAIN ROW — Hamster | Card | Ghost */}
        <div className="flex items-center justify-center gap-8 w-full">

          {/* LEFT — Hamster */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden lg:block"
          >
            <HamsterMascot s={s} />
          </motion.div>

          {/* CENTER — Login Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-panel overflow-hidden shadow-2xl border border-white/20 flex-shrink-0"
            style={{ width: 400 }}
          >
            <div className="p-10 border-b border-slate-100/50 text-center relative overflow-hidden bg-white/40 backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">
                Welcome back.
              </h2>
              <p className="text-slate-500 text-sm mt-3 font-light">
                Enter your credentials to access the clinical portal.
              </p>
            </div>

            <div className="p-10 bg-white/40">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 fade-in">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Email</label>
                    <div className="relative">
                      <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input required type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={onEmailFocus} onBlur={onEmailBlur}
                        placeholder="doctor@medical.com" className="input-premium pl-11 bg-white/60" />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Password</label>
                    <div className="relative">
                      <Icons.Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input required type={isPasswordVisible ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={onPassFocus} onBlur={onPassBlur}
                        placeholder="••••••••" className="input-premium pl-11 pr-11 bg-white/60 font-mono tracking-wider" />
                      <button type="button" onClick={togglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors text-base"
                        tabIndex={-1} aria-label={isPasswordVisible ? 'Hide' : 'Show'}>
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
                  <button type="button" onClick={() => navigate('/forgot-password')}
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
                    onError={() => setError('Google Login failed')}
                    useOneTap theme="outline" size="large" text="continue_with" width="100%"
                  />
                </div>
              </form>
            </div>

            <div className="bg-slate-50/80 backdrop-blur-md p-6 text-center border-t border-slate-100/50">
              <p className="text-sm text-slate-500 font-medium">
                Don't have an account?{' '}
                <button onClick={onSignup} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1 hover:underline underline-offset-4">
                  Create one
                </button>
              </p>
            </div>
          </motion.div>

          {/* RIGHT — Ghost */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden lg:block"
          >
            <GhostMascot s={s} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
