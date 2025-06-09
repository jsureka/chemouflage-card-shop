import { useCloudinaryImage } from "@/hooks/use-cloudinary-image";
import React from "react";

interface CloudinaryImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Original filename from public folder */
  fileName: string;
  /** Image width for optimization */
  width?: number;
  /** Image height for optimization */
  height?: number;
  /** Image quality (default: auto) */
  quality?: string;
  /** Image format (default: auto) */
  format?: string;
  /** Custom Cloudinary transformations */
  transformations?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Fallback to original path on error */
  enableFallback?: boolean;
}

/**
 * CloudinaryImage component that automatically handles image optimization
 * and provides fallback to original images
 */
export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  fileName,
  width,
  height,
  quality = "auto",
  format = "auto",
  transformations,
  alt,
  enableFallback = true,
  className,
  ...props
}) => {
  const { src, original } = useCloudinaryImage(fileName, {
    width,
    height,
    quality,
    format,
    transformations,
  });

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (enableFallback && e.currentTarget.src !== original) {
      console.warn(
        `Failed to load Cloudinary image: ${src}. Falling back to original.`
      );
      e.currentTarget.src = original;
    }

    // Call original onError if provided
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      loading={props.loading || "lazy"}
    />
  );
};

export default CloudinaryImage;
