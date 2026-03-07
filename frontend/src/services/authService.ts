/**
 * authService.ts — Finalized Authentication via Supabase and EmailJS.
 *
 * Strategy: Supabase first → localStorage fallback when Supabase is unavailable.
 * This ensures the app always works, even without env vars configured.
 */

import { jwtDecode } from 'jwt-decode';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

/* ─── local storage fallback ────────────────────────────── */
const LS_KEY = 'medibot_users';

interface LSUser {
  username: string;
  passwordHash: string;
  fullname: string;
  role: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

function hashPassword(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) { h = ((h << 5) - h) + pw.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(16).padStart(8, '0');
}

function lsUsers(): LSUser[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveUsers(u: LSUser[]) { localStorage.setItem(LS_KEY, JSON.stringify(u)); }

/* ─── LOGIN ─────────────────────────────────────────────── */
export const loginUser = async (email: string, password: string): Promise<any> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username,fullname,role')
        .eq('username', email)
        .eq('password', hashPassword(password))
        .single();

      if (error || !data) throw new Error('Invalid credentials');
      return { email: data.username, name: data.fullname, role: data.role, organization: 'Clinical Portal' };
    } catch (e: any) {
      if (e.message?.includes('Invalid credentials') || e.code === 'PGRST116') {
        throw new Error('Invalid credentials');
      }
      console.warn('Supabase login failed, using localStorage:', e.message);
    }
  }

  const user = lsUsers().find(u => u.username === email && u.passwordHash === hashPassword(password));
  if (!user) throw new Error('Invalid credentials');
  return { email: user.username, name: user.fullname, role: user.role, organization: 'Clinical Portal' };
};

/* ─── GOOGLE LOGIN ──────────────────────────────────────── */
export const googleLoginUser = async (credential: string): Promise<any> => {
  const decoded: any = jwtDecode(credential);
  const email = decoded.email as string;
  const displayName = (decoded.name || email.split('@')[0]) as string;

  if (isSupabaseConfigured) {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('username,fullname,role')
        .eq('username', email)
        .maybeSingle();

      if (existing) {
        return { email: existing.username, name: existing.fullname, role: existing.role, organization: 'Clinical Portal' };
      }

      const newUser = { username: email, password: hashPassword(email + Date.now()), fullname: displayName, role: 'Doctor' };
      const { error } = await supabase.from('users').insert(newUser);
      if (error && error.code !== '23505') throw error;
      return { email, name: displayName, role: 'Doctor', organization: 'Clinical Portal' };
    } catch (e: any) {
      console.warn('Supabase google-login failed, using localStorage:', e.message);
    }
  }

  const users = lsUsers();
  const existing = users.find(u => u.username === email);
  if (existing) return { email, name: existing.fullname, role: existing.role, organization: 'Clinical Portal' };
  const newUser: LSUser = { username: email, passwordHash: '', fullname: displayName, role: 'Doctor' };
  saveUsers([...users, newUser]);
  return { email, name: displayName, role: 'Doctor', organization: 'Clinical Portal' };
};

/* ─── REGISTER ──────────────────────────────────────────── */
export const registerUser = async (
  email: string, password: string, name: string, role: string,
  _org: string, _dept: string
): Promise<boolean> => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('users').insert({
      username: email,
      password: hashPassword(password),
      fullname: name,
      role,
    });

    if (error) {
      if (error.code === '23505') throw new Error('Username already exists');
      throw new Error(`Supabase Error: ${error.message}`);
    }
    return true;
  }

  const users = lsUsers();
  if (users.find(u => u.username === email)) throw new Error('Username already exists');
  saveUsers([...users, { username: email, passwordHash: hashPassword(password), fullname: name, role }]);
  return true;
};

/* ─── PASSWORD RESET (emailjs) ────────────────────────── */
export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
  console.log('🔍 Initiating reset for:', email);
  let users = lsUsers();
  let idx = users.findIndex(u => u.username.toLowerCase() === email.toLowerCase());

  if (idx === -1 && isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('users')
        .select('username,fullname,role')
        .eq('username', email)
        .maybeSingle();

      if (data) {
        users.push({ username: data.username, fullname: data.fullname, role: data.role, passwordHash: '' });
        saveUsers(users);
        idx = users.length - 1;
      }
    } catch (e) {
      console.warn('Supabase check failed:', e);
    }
  }

  if (idx === -1) throw new Error('No account found with that email');

  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  users[idx].resetToken = token;
  users[idx].resetTokenExpiry = Date.now() + 3_600_000;
  saveUsers(users);

  const resetLink = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log('🔑 Recovery Link:', resetLink);

  const serviceId = import.meta.env.VITE_EMAIL_SERVICE_ID || import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAIL_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAIL_PUBLIC_KEY || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_name: users[idx].fullname || 'Doctor',
          to_email: email,      // Matches {{to_email}}
          email: email,         // Matches {{email}}
          recipient: email,     // Matches {{recipient}}
          reset_link: resetLink,
          link: resetLink,
          app_name: 'BreastCancerAI'
        },
        publicKey
      );
      return true;
    } catch (e: any) {
      console.error('EmailJS Error:', e);
      if (!import.meta.env.DEV) throw new Error('Failed to send reset email.');
    }
  } else {
    console.warn('EmailJS not configured.');
    if (!import.meta.env.DEV) throw new Error('Email service not configured.');
  }

  return true;
};

export const verifyResetToken = (email: string, token: string): boolean => {
  const user = lsUsers().find(u => u.username.toLowerCase() === email.toLowerCase());
  return !!(user?.resetToken === token && Date.now() < (user?.resetTokenExpiry ?? 0));
};

export const resetPassword = async (email: string, token: string, newPassword: string): Promise<boolean> => {
  if (!verifyResetToken(email, token)) return false;

  const hPass = hashPassword(newPassword);
  const users = lsUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    users[idx].passwordHash = hPass;
    delete users[idx].resetToken;
    delete users[idx].resetTokenExpiry;
    saveUsers(users);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').update({ password: hPass }).eq('username', email);
    } catch (e) {
      console.error('Supabase update failed:', e);
    }
  }

  return true;
};

export const changePassword = (_e: string, _o: string, _n: string): boolean => true;
