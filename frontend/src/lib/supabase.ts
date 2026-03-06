/**
 * supabase.ts — Supabase client singleton
 *
 * Set these environment variables in Vercel Dashboard → Project Settings → Environment Variables:
 *   VITE_SUPABASE_URL      = https://xxxxxxxxxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJI...
 *
 * And locally in frontend/.env.local:
 *   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '⚠️  Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'to your .env.local and Vercel environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-anon-key',
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

/** Database table types */
export interface UserRow {
  username: string;
  password: string;
  fullname: string;
  role: string;
}

export interface HistoryRow {
  id?: number;
  username: string;
  timestamp: string;
  patient_id: string;
  result: string;
  confidence: number;
  explanation: string;
}

export interface PatientRow {
  id: string;
  name: string;
  age: number;
  contact: string;
  history: string;
  created_by: string;
}
