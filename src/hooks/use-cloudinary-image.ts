import { getCloudinaryUrl, getOptimizedImageUrl } from "@/config/cloudinary";
import { useMemo } from "react";

/**
 * Custom hook for handling Cloudinary images
 * @param fileName - The Cloudinary public ID or filename
 * @param options - Optimization options
 * @returns Object with image URL and utility functions
 */
export const useCloudinaryImage = (
  fileName: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    transformations?: string;
  }
) => {
  const imageUrl = useMemo(() => {
    if (!fileName) return "";

    // Clean the filename to use as public ID (remove file extensions)
    const publicId = fileName.replace(/\.(png|jpg|jpeg|gif|svg|webp)$/i, "");

    if (options?.transformations) {
      return getCloudinaryUrl(publicId, options.transformations);
    }

    if (options?.width || options?.height) {
      return getOptimizedImageUrl(
        publicId,
        options.width,
        options.height,
        options.quality,
        options.format
      );
    }

    // Default case - return basic Cloudinary URL
    return getCloudinaryUrl(publicId);
  }, [fileName, options]);

  const getResponsiveUrl = (width: number, height?: number) => {
    const publicId = fileName.replace(/\.(png|jpg|jpeg|gif|svg|webp)$/i, "");
    return getOptimizedImageUrl(
      publicId,
      width,
      height,
      options?.quality,
      options?.format
    );
  };

  return {
    src: imageUrl,
    getResponsiveUrl,
    original: `/${fileName}`, // Fallback to original path
  };
};
