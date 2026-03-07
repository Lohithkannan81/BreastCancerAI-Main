/**
 * storageService.ts — Supabase Storage operations
 * Handles mammogram image uploads/downloads via the 'mammograms' bucket.
 */

import { supabase } from '../lib/supabase';

const BUCKET = 'mammograms';
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

/**
 * Upload a mammogram file to Supabase Storage.
 * Path pattern: {username}/{patientId}/{timestamp}_{filename}
 * Returns the storage path on success, or null on failure.
 */
export async function uploadMammogram(
  file: File,
  username: string,
  patientId: string
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // No storage available without Supabase — return a fake local reference
    console.warn('⚠️ Supabase not configured. Image not uploaded to cloud storage.');
    return `local/${username}/${patientId}/${file.name}`;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `${username}/${patientId}/${timestamp}_${file.name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) {
    console.error('Supabase upload error:', error.message);
    return null;
  }
  return path;
}

/**
 * Get a signed (temporary) URL for downloading a previously uploaded image.
 * The URL is valid for 1 hour.
 */
export async function getMammogramUrl(path: string): Promise<string | null> {
  if (!isSupabaseConfigured || path.startsWith('local/')) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) { console.error('Supabase signedUrl error:', error.message); return null; }
  return data?.signedUrl ?? null;
}

/**
 * List all mammograms uploaded for a given patient.
 */
export async function listMammograms(username: string, patientId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`${username}/${patientId}`, { sortBy: { column: 'created_at', order: 'desc' } });

  if (error) { console.error('Supabase list error:', error.message); return []; }
  return (data ?? []).map((f: any) => `${username}/${patientId}/${f.name}`);
}

/**
 * Delete a mammogram from storage.
 */
export async function deleteMammogram(path: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) { console.error('Supabase delete error:', error.message); return false; }
  return true;
}
