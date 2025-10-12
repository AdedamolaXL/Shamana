export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a storage path, construct the URL
  // Replace with your actual Supabase URL and bucket name
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = 'pli5t-images';
  
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;
  }
  
  // Fallback to the hardcoded URL if env variable is not available
  return `https://usntsibicvemzidzpzbi.supabase.co/storage/v1/object/public/pli5t-images/${imagePath}`;
};