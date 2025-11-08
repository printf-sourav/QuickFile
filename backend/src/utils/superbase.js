import { createClient } from '@supabase/supabase-js';
import fs from 'fs';


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);


export const uploadToSupabase = async (bucket, filePath, destPath) => {
  const buffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage.from(bucket).upload(destPath, buffer);
  try { fs.unlinkSync(filePath); } catch {}
  if (error) throw error;
  return data;
};


export const getSupabaseFileURL = (bucket, filePath) => {
  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
};


export const createSupabaseSignedUrl = async (bucket, filePath, expiresInSec = 600) => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresInSec);
  if (error) throw error;
  return data?.signedUrl;
};


export const deleteFromSupabase = async (bucket, paths) => {
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
  return data;
};

export { supabase };
