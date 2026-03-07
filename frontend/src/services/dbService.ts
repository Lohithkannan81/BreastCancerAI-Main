/**
 * dbService.ts — Supabase database operations
 * Handles history and patients tables.
 * Falls back to localStorage when Supabase is not configured.
 */

import { supabase, HistoryRow, PatientRow } from '../lib/supabase';

const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

/* ─── LOCAL STORAGE FALLBACK HELPERS ─────────────────────── */
function lsGet<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function lsSet<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ─── HISTORY ─────────────────────────────────────────────── */

export async function saveHistory(record: Omit<HistoryRow, 'id'>): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('history').insert(record);
    if (error) console.error('Supabase saveHistory error:', error.message);
    return;
  }
  // localStorage fallback
  const all = lsGet<HistoryRow>('medibot_history');
  lsSet('medibot_history', [...all, { ...record, id: Date.now() }]);
}

export async function getHistory(username: string): Promise<HistoryRow[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('username', username)
      .order('timestamp', { ascending: false });
    if (error) { console.error('Supabase getHistory error:', error.message); return []; }
    return (data ?? []) as HistoryRow[];
  }
  // localStorage fallback
  return lsGet<HistoryRow>('medibot_history').filter(r => r.username === username).reverse();
}

/* ─── PATIENTS ────────────────────────────────────────────── */

export async function getPatients(username: string): Promise<PatientRow[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('created_by', username);
    if (error) { console.error('Supabase getPatients error:', error.message); return []; }
    return (data ?? []) as PatientRow[];
  }
  return lsGet<PatientRow>('medibot_patients').filter(p => p.created_by === username);
}

export async function addPatient(patient: PatientRow): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('patients').insert(patient);
    if (error) console.error('Supabase addPatient error:', error.message);
    return;
  }
  const all = lsGet<PatientRow>('medibot_patients');
  lsSet('medibot_patients', [...all, patient]);
}

export async function updatePatient(id: string, updates: Partial<PatientRow>): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('patients').update(updates).eq('id', id);
    if (error) console.error('Supabase updatePatient error:', error.message);
    return;
  }
  const all = lsGet<PatientRow>('medibot_patients');
  const updated = all.map(p => p.id === id ? { ...p, ...updates } : p);
  lsSet('medibot_patients', updated);
}
