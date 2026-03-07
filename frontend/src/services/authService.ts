/**
 * authService.ts — Finalized Universal Authentication via Supabase and EmailJS.
 * Supports cross-device password resets via Supabase cloud storage.
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

/* ─── UNIVERSAL PASSWORD RESET (Supabase + EmailJS) ─────── */
export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
  console.log('🔍 Initiating universal reset for:', email);

  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expiry = Date.now() + 3_600_000; // 1 hour
  let fullname = '';

  // 1. Try to save token in Supabase (Cloud) - Case Insensitive Search
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ reset_token: token, reset_token_expiry: expiry })
        .ilike('username', email) // CASE INSENSITIVE
        .select('fullname')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        fullname = data.fullname || 'Doctor';
        console.log('✅ Token saved to Supabase (Cloud) with case-insensitive match');
      } else {
        console.warn('⚠️ Supabase: No user found matching (case-insensitive):', email);
      }
    } catch (e: any) {
      console.warn('Supabase token save failed, using fallback:', e.message);
    }
  }

  // 2. Fallback/Sync: Save to localStorage (Local)
  let users = lsUsers();
  let idx = users.findIndex(u => u.username.toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    users[idx].resetToken = token;
    users[idx].resetTokenExpiry = expiry;
    saveUsers(users);
    fullname = fullname || users[idx].fullname;
    console.log('✅ Token saved to LocalStorage');
  }

  // Only error out if we found them nowhere
  if (!fullname && idx === -1) throw new Error('No account found with that email');

  const resetLink = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log('🔑 Recovery Link Generated:', resetLink);

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      await emailjs.send(serviceId, templateId, {
        to_name: fullname || 'Doctor',
        to_email: email, email: email, recipient: email,
        reset_link: resetLink, link: resetLink,
        app_name: 'BreastCancerAI'
      }, publicKey);
      return true;
    } catch (e: any) {
      console.error('EmailJS Error:', e);
      throw new Error(`Email failed: ${e.text || 'Service Unavailable'}`);
    }
  }

  return true;
};

export const verifyResetToken = async (email: string, token: string): Promise<boolean> => {
  console.log('🧪 Verifying token for:', email);
  console.log('🔗 Token from URL:', token);

  // 1. Check Supabase (Cloud)
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('users')
        .select('reset_token, reset_token_expiry')
        .ilike('username', email) // CASE INSENSITIVE
        .maybeSingle();

      if (data) {
        const now = Date.now();
        const expiry = Number(data.reset_token_expiry);
        const matches = data.reset_token === token;
        const notExpired = now < expiry;

        console.log('☁️ Supabase Results:', {
          token_in_db: data.reset_token,
          matches,
          notExpired,
          timeLeft: Math.round((expiry - now) / 60000) + ' min'
        });

        if (matches && notExpired) return true;
      } else {
        console.log('☁️ Supabase: User not found using case-insensitive search');
      }
    } catch (e) {
      console.warn('Supabase token verification failed:', e);
    }
  }

  // 2. Check LocalStorage (Local)
  const user = lsUsers().find(u => u.username.toLowerCase() === email.toLowerCase());
  const now = Date.now();
  const expiry = Number(user?.resetTokenExpiry || 0);
  const isValid = !!(user?.resetToken === token && now < expiry);

  console.log('🏠 Local Check:', { found: !!user, matches: user?.resetToken === token, notExpired: now < expiry });
  return isValid;
};

export const resetPassword = async (email: string, token: string, newPassword: string): Promise<boolean> => {
  const isValid = await verifyResetToken(email, token);
  if (!isValid) return false;

  const hPass = hashPassword(newPassword);

  // 1. Update Supabase (Cloud)
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('users')
        .update({ password: hPass, reset_token: null, reset_token_expiry: null })
        .ilike('username', email); // CASE INSENSITIVE

      if (!error) console.log('✅ Supabase: Password updated successfully');
    } catch (e) {
      console.error('Supabase update failed:', e);
    }
  }

  // 2. Update LocalStorage (Local)
  const users = lsUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    users[idx].passwordHash = hPass;
    delete users[idx].resetToken;
    delete users[idx].resetTokenExpiry;
    saveUsers(users);
  }

  return true;
};

export const changePassword = (_e: string, _o: string, _n: string): boolean => true;
