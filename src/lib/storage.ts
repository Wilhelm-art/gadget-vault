import { supabaseAdmin } from "./supabase";

/**
 * Uploads a file to a Supabase Storage bucket.
 * @param file The file Buffer or Blob
 * @param bucket Name of the bucket (e.g. 'products', 'kyc', 'rentals', 'deposits', 'sell-offers')
 * @param path Path inside the bucket (e.g. 'userId/ktp_front.jpg')
 * @param contentType The MIME type of the file
 * @returns The storage path of the uploaded file
 */
export async function uploadFile(
  file: Buffer | Blob,
  bucket: string,
  path: string,
  contentType: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`Supabase Storage Upload Error (bucket: ${bucket}, path: ${path}):`, error);
    throw error;
  }

  return data.path;
}

/**
 * Gets the public URL for a file in a public bucket (e.g., products).
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Generates a temporary signed URL for a file in a private bucket (e.g., kyc, deposits, rentals).
 * Safe for displaying confidential documents only to authorized users/admins.
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(`Supabase Storage Signed URL Error (bucket: ${bucket}, path: ${path}):`, error);
    throw error;
  }

  return data.signedUrl;
}

/**
 * Deletes a file from a bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`Supabase Storage Delete Error (bucket: ${bucket}, path: ${path}):`, error);
    throw error;
  }
}
