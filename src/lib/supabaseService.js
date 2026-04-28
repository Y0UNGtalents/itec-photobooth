import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET ?? 'photos';

/**
 * Lädt ein Foto (DataURL) in den Supabase Storage hoch.
 * @param {string} dataUrl - JPEG DataURL des fertigen Layouts
 * @param {string} filename - Dateiname ohne Pfad
 * @returns {Promise<string>} Öffentliche Download-URL
 */
export async function uploadPhoto(dataUrl, filename) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload fehlgeschlagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return data.publicUrl;
}
