import { getStorageSettings } from './storageService';

export const uploadImage = async (file: File): Promise<string> => {
  const settings = getStorageSettings();

  // If Cloudinary is configured, use it
  if (settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', settings.cloudinaryUploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${settings.cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, falling back to local:', error);
      // Fallback to local if upload fails
    }
  }

  // Fallback: Convert to Base64 (Local Storage)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};