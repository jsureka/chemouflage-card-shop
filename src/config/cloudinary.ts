// Cloudinary configuration and utilities

// Cloudinary cloud name from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;

// Base URL for Cloudinary image delivery
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Generate Cloudinary URL for an image
 * @param publicId - The public ID of the image in Cloudinary
 * @param transformations - Optional transformations (e.g., 'w_300,h_200,c_fill')
 * @returns Complete Cloudinary URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  transformations?: string
): string => {
  if (!publicId) return "";

  const baseUrl = CLOUDINARY_BASE_URL;
  const transformationPart = transformations ? `/${transformations}` : "";

  return `${baseUrl}${transformationPart}/${publicId}`;
};

/**
 * Generate optimized image URL with responsive transformations
 * @param publicId - The public ID of the image
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param quality - Image quality (default: auto)
 * @param format - Image format (default: auto)
 * @returns Optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: string = "auto",
  format: string = "auto"
): string => {
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  return getCloudinaryUrl(publicId, transformations.join(","));
};

/**
 * Generate Cloudinary URL for a video
 * @param publicId - The public ID of the video in Cloudinary
 * @param transformations - Optional transformations (e.g., 'q_auto,f_auto')
 * @returns Complete Cloudinary video URL
 */
export const getCloudinaryVideoUrl = (
  publicId: string,
  transformations?: string
): string => {
  if (!publicId) return "";

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;
  const transformationPart = transformations ? `/${transformations}` : "";

  return `${baseUrl}${transformationPart}/${publicId}`;
};

/**
 * Generate optimized video URL with responsive transformations
 * @param publicId - The public ID of the video
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param quality - Video quality (default: auto)
 * @param format - Video format (default: auto)
 * @returns Optimized Cloudinary video URL
 */
export const getOptimizedVideoUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: string = "auto",
  format: string = "auto"
): string => {
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  return getCloudinaryVideoUrl(publicId, transformations.join(","));
};

/**
 * Configuration object for easy access
 */
export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  baseUrl: CLOUDINARY_BASE_URL,
};

export default cloudinaryConfig;
